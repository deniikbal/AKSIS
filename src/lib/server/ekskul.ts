import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db/index";
import { kelasEkskul } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getKelasEkskul = createServerFn({ method: "GET" })
    .handler(async () => {
        return await db.query.kelasEkskul.findMany({
            with: {
                kelas: true,
            }
        });
    });

export const createKelasEkskul = createServerFn({ method: "POST" })
    .inputValidator((d: {
        id?: string;
        kelasId: string;
        ekskulId?: string;
        namaEkskul?: string;
        skEkskul?: string;
        tglSkEkskul?: string;
        jamKegiatanPerMinggu?: string;
    }) => d)
    .handler(async ({ data }) => {
        return await db.insert(kelasEkskul).values({
            id: data.id as any,
            kelasId: data.kelasId as any,
            ekskulId: data.ekskulId,
            namaEkskul: data.namaEkskul,
            skEkskul: data.skEkskul,
            tglSkEkskul: data.tglSkEkskul,
            jamKegiatanPerMinggu: data.jamKegiatanPerMinggu,
        }).returning();
    });

export const deleteKelasEkskul = createServerFn({ method: "POST" })
    .inputValidator((id: string) => id)
    .handler(async ({ data: id }) => {
        return await db.delete(kelasEkskul).where(eq(kelasEkskul.id, id));
    });
