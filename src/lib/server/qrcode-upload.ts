import { createServerFn } from "@tanstack/react-start";
import { getAuthClient } from "./drive";
import QRCode from "qrcode";
import { db } from "@/db/index";
import { anggotaKelas, siswa } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Mendapatkan atau membuat folder di Google Drive
 */
async function getOrCreateFolder(folderName: string, parentId?: string) {
    const auth = await getAuthClient();
    const tokenResponse = await auth.getAccessToken();
    const token = tokenResponse.token;

    if (!token) throw new Error("Failed to get Google Drive token");

    // Cari folder
    // Menggunakan escape untuk nama folder jika mengandung single quote
    const escapedName = folderName.replace(/'/g, "\\'");
    const q = `name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false${parentId ? ` and '${parentId}' in parents` : ""}`;

    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    if (!response.ok) {
        const err = await response.text();
        console.error(`[QR-UP] Gagal mencari folder: ${err}`);
        throw new Error(`Drive Search Error: ${err}`);
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
        return data.files[0].id;
    }

    console.log(`[QR-UP] Folder '${folderName}' tidak ditemukan, membuat baru...`);

    // Buat folder jika tidak ada
    const createResponse = await fetch(
        "https://www.googleapis.com/drive/v3/files?supportsAllDrives=true",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: folderName,
                mimeType: "application/vnd.google-apps.folder",
                parents: parentId ? [parentId] : [],
            }),
        }
    );

    if (!createResponse.ok) {
        const err = await createResponse.text();
        console.error(`[QR-UP] Gagal membuat folder: ${err}`);
        throw new Error(`Drive Create Error: ${err}`);
    }

    const folder = await createResponse.json();
    console.log(`[QR-UP] Folder baru dibuat dengan ID: ${folder.id}`);
    return folder.id;
}

/**
 * Upload buffer sebagai file ke Google Drive
 */
async function uploadBufferToDrive(buffer: Buffer, fileName: string, mimeType: string, folderId: string) {
    const auth = await getAuthClient();
    const tokenResponse = await auth.getAccessToken();
    const token = tokenResponse.token;

    if (!token) throw new Error("Failed to get Google Drive token");

    const metadata = {
        name: fileName,
        parents: [folderId],
    };

    const boundary = "-------314159265358979323846";
    const delimiter = `--${boundary}`;
    const closeDelimiter = `--${boundary}--`;

    const metadataPart = [
        delimiter,
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify(metadata),
        ''
    ].join('\r\n');

    const mediaPartHeader = [
        delimiter,
        `Content-Type: ${mimeType}`,
        '',
        ''
    ].join('\r\n');

    const multipartBody = new Blob([
        metadataPart,
        mediaPartHeader,
        new Uint8Array(buffer),
        '\r\n' + closeDelimiter
    ], { type: `multipart/related; boundary=${boundary}` });

    const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink&supportsAllDrives=true",
        {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: multipartBody,
        }
    );

    const result = await response.json();

    // Set permission agar bisa dilihat publik
    try {
        await fetch(
            `https://www.googleapis.com/drive/v3/files/${result.id}/permissions?supportsAllDrives=true`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    role: "reader",
                    type: "anyone",
                }),
            }
        );
    } catch (e) {
        console.warn("Failed to set permission for QR Code:", e);
    }

    return result;
}

export const generateClassQRCodes = createServerFn({ method: "POST" })
    .inputValidator((d: { kelasId: string, kelasNama: string }) => d)
    .handler(async ({ data }) => {
        const { kelasId, kelasNama } = data;
        console.log(`[QR-UP] Memulai generate QR untuk kelas: ${kelasNama} (${kelasId})`);

        try {
            // 1. Dapatkan daftar siswa
            console.log("[QR-UP] QUERY: Mencari siswa di DB...");
            const students = await db.select({
                id: siswa.id,
                nama: siswa.nama,
                nis: siswa.nis
            })
                .from(anggotaKelas)
                .innerJoin(siswa, eq(anggotaKelas.siswaId, siswa.id))
                .where(eq(anggotaKelas.kelasId, kelasId));

            console.log(`[QR-UP] Ditemukan ${students.length} siswa.`);
            if (students.length === 0) return { success: false, message: "Tidak ada siswa di kelas ini" };

            // 2. Siapkan folder di Drive & Dapatkan Token sekali saja
            console.log("[QR-UP] DRIVE: Menyiapkan folder & Token...");
            const auth = await getAuthClient();
            const tokenResponse = await auth.getAccessToken();
            const token = tokenResponse.token;
            if (!token) throw new Error("Failed to get Google Drive token");

            const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
            console.log(`[QR-UP] Root Folder ID: ${rootFolderId}`);

            // Buat folder basis & folder kelas secara sekuensial (karena hierarki)
            const qrCodesBaseFolderId = await getOrCreateFolderWithToken("QR-Codes", token, rootFolderId);
            const classFolderId = await getOrCreateFolderWithToken(kelasNama, token, qrCodesBaseFolderId);

            // 3. Generate dan Upload secara PARALEL
            console.log("[QR-UP] Memulai proses paralel...");

            const uploadPromises = students.map(async (student) => {
                if (!student.nis) {
                    return { siswa: student.nama, status: "skipped", reason: "NIS kosong" };
                }

                try {
                    // Generate QR Code as Buffer (Sangat cepat, bisa paralel)
                    const qrBuffer = await QRCode.toBuffer(student.nis, {
                        errorCorrectionLevel: 'H',
                        margin: 4,
                        scale: 10,
                    });

                    const safeStudentName = (student.nama || "Siswa").replace(/[/\\?%*:|"<>]/g, '-');
                    const fileName = `${safeStudentName}_${student.nis}.png`;

                    // Upload menggunakan token yang sudah ada
                    const driveFile = await uploadBufferToDriveWithToken(qrBuffer, fileName, "image/png", classFolderId, token);

                    return {
                        siswa: student.nama,
                        status: "success",
                        driveId: driveFile.id
                    };
                } catch (error: any) {
                    console.error(`[QR-UP] Gagal: ${student.nama} ->`, error.message);
                    return {
                        siswa: student.nama,
                        status: "error",
                        error: error.message
                    };
                }
            });

            const results = await Promise.all(uploadPromises);
            const successCount = results.filter(r => r.status === "success").length;

            console.log(`[QR-UP] Selesai. Total sukses: ${successCount}/${students.length}`);
            return {
                success: true,
                total: students.length,
                successCount,
                results: results
            };
        } catch (globalError: any) {
            console.error("[QR-UP] FATAL ERROR:", globalError);
            return {
                success: false,
                message: globalError.message || "Unknown server error",
                stack: globalError.stack
            };
        }
    });

/**
 * Helper: Mendapatkan atau membuat folder dengan token yang sudah ada
 */
async function getOrCreateFolderWithToken(folderName: string, token: string, parentId?: string) {
    const escapedName = folderName.replace(/'/g, "\\'");
    const q = `name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false${parentId ? ` and '${parentId}' in parents` : ""}`;

    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) throw new Error(`Search Error: ${await response.text()}`);

    const data = await response.json();
    if (data.files && data.files.length > 0) return data.files[0].id;

    const createResponse = await fetch(
        "https://www.googleapis.com/drive/v3/files?supportsAllDrives=true",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: folderName,
                mimeType: "application/vnd.google-apps.folder",
                parents: parentId ? [parentId] : [],
            }),
        }
    );

    if (!createResponse.ok) throw new Error(`Create Error: ${await createResponse.text()}`);
    const folder = await createResponse.json();
    return folder.id;
}

/**
 * Helper: Upload buffer dengan token yang sudah ada
 */
async function uploadBufferToDriveWithToken(buffer: Buffer, fileName: string, mimeType: string, folderId: string, token: string) {
    const metadata = { name: fileName, parents: [folderId] };
    const boundary = "-------314159265358979323846";
    const delimiter = `--${boundary}`;
    const closeDelimiter = `--${boundary}--`;

    const metadataPart = [
        delimiter,
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify(metadata),
        ''
    ].join('\r\n');

    const mediaPartHeader = [
        delimiter,
        `Content-Type: ${mimeType}`,
        '',
        ''
    ].join('\r\n');

    const multipartBody = new Blob([
        metadataPart,
        mediaPartHeader,
        new Uint8Array(buffer),
        '\r\n' + closeDelimiter
    ], { type: `multipart/related; boundary=${boundary}` });

    const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink&supportsAllDrives=true",
        {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: multipartBody,
        }
    );

    if (!response.ok) throw new Error(`Upload Error: ${await response.text()}`);
    const result = await response.json();

    // Set permission paralel (optional, tapi di sini kita tunggu sebentar)
    await fetch(
        `https://www.googleapis.com/drive/v3/files/${result.id}/permissions?supportsAllDrives=true`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ role: "reader", type: "anyone" }),
        }
    );

    return result;
}
