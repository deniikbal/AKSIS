import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db/index";
import { guru } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getGurus = createServerFn({ method: "GET" })
    .handler(async () => {
        return await db.query.guru.findMany();
    });

export const createGuru = createServerFn({ method: "POST" })
    .inputValidator((d: {
        id?: string;
        nama: string;
        nip?: string;
        jenisPtkId?: string;
        jenisKelamin?: string;
        tempatLahir?: string;
        tanggalLahir?: string;
        nuptk?: string;
        alamatJalan?: string;
        statusKeaktifanId?: string;
        softDelete?: string;
        telepon?: string;
    }) => d)
    .handler(async ({ data }) => {
        return await db.insert(guru).values({
            id: data.id as any,
            nama: data.nama,
            nip: data.nip,
            jenisPtkId: data.jenisPtkId,
            jenisKelamin: data.jenisKelamin,
            tempatLahir: data.tempatLahir,
            tanggalLahir: data.tanggalLahir,
            nuptk: data.nuptk,
            alamatJalan: data.alamatJalan,
            statusKeaktifanId: data.statusKeaktifanId,
            softDelete: data.softDelete,
            telepon: data.telepon,
        }).returning();
    });

export const updateGuru = createServerFn({ method: "POST" })
    .inputValidator((d: {
        id: string;
        nama: string;
        nip?: string;
        jenisPtkId?: string;
        jenisKelamin?: string;
        tempatLahir?: string;
        tanggalLahir?: string;
        nuptk?: string;
        alamatJalan?: string;
        statusKeaktifanId?: string;
        softDelete?: string;
        telepon?: string;
    }) => d)
    .handler(async ({ data }) => {
        return await db.update(guru)
            .set({
                nama: data.nama,
                nip: data.nip,
                jenisPtkId: data.jenisPtkId,
                jenisKelamin: data.jenisKelamin,
                tempatLahir: data.tempatLahir,
                tanggalLahir: data.tanggalLahir,
                nuptk: data.nuptk,
                alamatJalan: data.alamatJalan,
                statusKeaktifanId: data.statusKeaktifanId,
                softDelete: data.softDelete,
                telepon: data.telepon,
            })
            .where(eq(guru.id, data.id))
            .returning();
    });

export const deleteGuru = createServerFn({ method: "POST" })
    .inputValidator((id: string) => id)
    .handler(async ({ data: id }) => {
        return await db.delete(guru).where(eq(guru.id, id));
    });
