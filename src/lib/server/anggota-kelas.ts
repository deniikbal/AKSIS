import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db/index";
import { anggotaKelas } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getAnggotaKelas = createServerFn({ method: "GET" })
    .handler(async () => {
        return await db.query.anggotaKelas.findMany({
            with: {
                siswa: true,
                kelas: true,
            }
        });
    });

export const addAnggotaKelas = createServerFn({ method: "POST" })
    .inputValidator((d: { id?: string; siswaId: string; kelasId: string; semesterId?: string }) => d)
    .handler(async ({ data }) => {
        return await db.insert(anggotaKelas).values({
            id: data.id as any,
            siswaId: data.siswaId as any,
            kelasId: data.kelasId as any,
            semesterId: data.semesterId,
        }).returning();
    });

export const addAnggotaKelasBatch = createServerFn({ method: "POST" })
    .inputValidator((d: Array<{ id?: string; siswaId: string; kelasId: string; semesterId?: string }>) => d)
    .handler(async ({ data }) => {
        return await db.insert(anggotaKelas).values(data as any[]).returning();
    });

export const removeAnggotaKelas = createServerFn({ method: "POST" })
    .inputValidator((id: string) => id)
    .handler(async ({ data: id }) => {
        return await db.delete(anggotaKelas).where(eq(anggotaKelas.id, id));
    });
