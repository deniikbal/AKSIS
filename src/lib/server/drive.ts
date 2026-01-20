import { createServerFn } from "@tanstack/react-start";
import { saveDokumenMetadata } from "./dokumen";


/**
 * Mendapatkan akses token yang valid menggunakan OAuth 2.0 Refresh Token
 */
async function getAuthClient() {
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("OAuth 2.0 credentials (ID, Secret, or Refresh Token) are missing in environment variables.");
    }

    const { OAuth2Client } = await import("google-auth-library").then(m => m.default || m);

    const oauth2Client = new OAuth2Client(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    return oauth2Client;
}

/**
 * Upload file ke folder Google Drive menggunakan REST API (Multipart/Related)
 */
export async function uploadFileToDrive(file: File, folderId?: string) {
    console.log("Starting uploadFileToDrive (OAuth 2.0) for file:", file.name);

    const auth = await getAuthClient();
    const tokenResponse = await auth.getAccessToken();
    const token = tokenResponse.token;

    if (!token) {
        throw new Error("Failed to retrieve Google Drive access token.");
    }

    const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;
    console.log("Target Folder ID:", targetFolderId);

    const metadata = {
        name: file.name,
        parents: targetFolderId ? [targetFolderId] : [],
    };

    // Construct multipart/related body manually
    const boundary = "-------314159265358979323846";
    const delimiter = `--${boundary}`;
    const closeDelimiter = `--${boundary}--`;

    const arrayBuffer = await file.arrayBuffer();

    // Metadata part
    const metadataPart = [
        delimiter,
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify(metadata),
        ''
    ].join('\r\n');

    // Media part header
    const mediaPartHeader = [
        delimiter,
        `Content-Type: ${file.type || 'application/octet-stream'}`,
        '',
        ''
    ].join('\r\n');

    // Combine into a single Blob
    const multipartBody = new Blob([
        metadataPart,
        mediaPartHeader,
        new Uint8Array(arrayBuffer),
        '\r\n' + closeDelimiter
    ], { type: `multipart/related; boundary=${boundary}` });

    console.log("Sending multipart/related request to Google Drive API...");
    const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,mimeType,size&supportsAllDrives=true",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: multipartBody,
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Google Drive API Error Response:", errorText);
        throw new Error(`Google Drive Upload Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log("Google Drive Upload Success. File ID:", result.id);

    // BARU: Pasang izin agar file bisa dilihat oleh siapa saja yang punya link
    // Ini menyelesaikan masalah "You need access"
    try {
        console.log("Setting public view permission for file:", result.id);
        const permResponse = await fetch(
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

        if (!permResponse.ok) {
            const permError = await permResponse.text();
            console.warn("Failed to set public permission:", permError);
        } else {
            console.log("Public view permission set successfully.");
        }
    } catch (e) {
        console.warn("Error while setting permission:", e);
    }

    return result;
}

/**
 * Server Function untuk memproses upload dari Frontend (FormData)
 */
export const processFileUpload = createServerFn({ method: "POST" })
    .inputValidator((formData: FormData) => formData)
    .handler(async ({ data: formData }) => {
        console.log("processFileUpload received form data");
        const file = formData.get("file") as File;
        const deskripsi = formData.get("deskripsi") as string;
        const kategori = formData.get("kategori") as string;
        const uploaderId = formData.get("uploaderId") as string;

        if (!file) {
            console.error("No file found in FormData");
            throw new Error("No file uploaded");
        }

        console.log("Processing file:", file.name, "Size:", file.size);

        // 1. Upload ke Google Drive
        let driveData;
        try {
            driveData = await uploadFileToDrive(file);
        } catch (error: any) {
            console.error("Fatal error during Drive upload:", error);
            throw error;
        }

        console.log("Saving metadata to database for file:", file.name);
        // 2. Simpan metadata ke Database
        const dbResult = await saveDokumenMetadata({
            data: {
                nama: file.name,
                deskripsi: deskripsi,
                driveFileId: driveData.id!,
                driveUrl: driveData.webViewLink!,
                mimeType: driveData.mimeType!,
                ukuran: parseInt(driveData.size || "0"),
                uploaderId: uploaderId,
                kategori: kategori,
            }
        });

        console.log("Database result saved successfully");
        return dbResult;
    });

/**
 * Hapus file dari Google Drive menggunakan REST API
 */
export async function deleteFileFromDrive(fileId: string) {
    const auth = await getAuthClient();
    const tokenResponse = await auth.getAccessToken();
    const token = tokenResponse.token;

    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok && response.status !== 404) {
        const errorText = await response.text();
        throw new Error(`Google Drive Delete Error: ${errorText}`);
    }
}
