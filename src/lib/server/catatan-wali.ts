import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db/index";
import { catatanWaliKelas } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getCatatanWali = createServerFn({ method: "GET" })
    .inputValidator((d: { kelasId: string, semesterId?: string, tahunAjaran?: string }) => d)
    .handler(async ({ data }) => {
        return await db.query.catatanWaliKelas.findMany({
            where: (catatan, { eq, and }) => {
                const conditions = [eq(catatan.kelasId, data.kelasId)];
                if (data.semesterId) conditions.push(eq(catatan.semesterId, data.semesterId));
                if (data.tahunAjaran) conditions.push(eq(catatan.tahunAjaran, data.tahunAjaran));
                return and(...conditions);
            },
            with: {
                siswa: true
            }
        });
    });

export const upsertCatatanWali = createServerFn({ method: "POST" })
    .inputValidator((d: {
        id?: string;
        siswaId: string;
        waliKelasId: string;
        kelasId: string;
        semesterId: string;
        tahunAjaran: string;
        catatan: string;
    }) => d)
    .handler(async ({ data }) => {
        if (data.id) {
            return await db.update(catatanWaliKelas)
                .set({
                    catatan: data.catatan,
                    updatedAt: new Date(),
                })
                .where(eq(catatanWaliKelas.id, data.id))
                .returning();
        } else {
            return await db.insert(catatanWaliKelas)
                .values({
                    siswaId: data.siswaId,
                    waliKelasId: data.waliKelasId,
                    kelasId: data.kelasId,
                    semesterId: data.semesterId,
                    tahunAjaran: data.tahunAjaran,
                    catatan: data.catatan,
                })
                .returning();
        }
    });

export const deleteCatatanWali = createServerFn({ method: "POST" })
    .inputValidator((id: string) => id)
    .handler(async ({ data: id }) => {
        return await db.delete(catatanWaliKelas).where(eq(catatanWaliKelas.id, id));
    });
