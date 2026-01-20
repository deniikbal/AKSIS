import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db/index";
import { dokumen } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { deleteFileFromDrive } from "./drive";

export const getDokumens = createServerFn({ method: "GET" })
    .inputValidator((d: { uploaderId?: string, kelasId?: string, kategori?: string }) => d)
    .handler(async ({ data }) => {
        return await db.query.dokumen.findMany({
            where: (dok, { eq, and }) => {
                const conditions = [];
                if (data.uploaderId) conditions.push(eq(dok.uploaderId, data.uploaderId));
                if (data.kelasId) conditions.push(eq(dok.kelasId, data.kelasId));
                if (data.kategori) conditions.push(eq(dok.kategori, data.kategori));
                return and(...conditions);
            },
            with: {
                uploader: true,
                kelas: true,
            },
            orderBy: [desc(dokumen.createdAt)],
        });
    });

/**
 * Mendapatkan semua dokumen untuk admin (dengan informasi guru)
 */
export const getAdminDokumens = createServerFn({ method: "GET" })
    .handler(async () => {
        return await db.query.dokumen.findMany({
            with: {
                uploader: true,
                kelas: true,
            },
            orderBy: [desc(dokumen.createdAt)],
        });
    });

export const saveDokumenMetadata = createServerFn({ method: "POST" })
    .inputValidator((d: {
        nama: string;
        deskripsi?: string;
        driveFileId: string;
        driveUrl: string;
        mimeType?: string;
        ukuran?: number;
        uploaderId: string;
        kelasId?: string;
        kategori?: string;
    }) => d)
    .handler(async ({ data }) => {
        return await db.insert(dokumen)
            .values({
                nama: data.nama,
                deskripsi: data.deskripsi,
                driveFileId: data.driveFileId,
                driveUrl: data.driveUrl,
                mimeType: data.mimeType,
                ukuran: data.ukuran,
                uploaderId: data.uploaderId,
                kelasId: data.kelasId as any,
                kategori: data.kategori,
            })
            .returning();
    });

export const deleteDokumen = createServerFn({ method: "POST" })
    .inputValidator((id: string) => id)
    .handler(async ({ data: id }) => {
        const dok = await db.query.dokumen.findFirst({
            where: eq(dokumen.id, id),
        });

        if (dok) {
            // Hapus dari Drive
            try {
                await deleteFileFromDrive(dok.driveFileId);
            } catch (error) {
                console.error("Failed to delete from Drive:", error);
                // Kita tetap lanjut hapus dari DB jika file di Drive sudah tidak ada
            }

            // Hapus dari DB
            await db.delete(dokumen).where(eq(dokumen.id, id));
            return { success: true, id };
        }

        throw new Error("Document not found");
    });
