import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db/index";
import { siswa } from "@/db/schema";
import { eq, count, like, or } from "drizzle-orm";

export const getSiswasCount = createServerFn({ method: "GET" })
    .inputValidator((d: { search?: string } | undefined) => d)
    .handler(async ({ data }) => {
        const filters = data?.search ? or(
            like(siswa.nama, `%${data.search}%`),
            like(siswa.nis, `%${data.search}%`)
        ) : undefined;

        const result = await db.select({ value: count() })
            .from(siswa)
            .where(filters);

        return result[0].value;
    });

export const getSiswas = createServerFn({ method: "GET" })
    .inputValidator((d: { page?: number; pageSize?: number; search?: string } | undefined) => d)
    .handler(async ({ data }) => {
        const { page, pageSize, search } = data || {};

        const filters = search ? or(
            like(siswa.nama, `%${search}%`),
            like(siswa.nis, `%${search}%`)
        ) : undefined;

        // If no pagination params, return all records
        if (!page && !pageSize) {
            return await db.query.siswa.findMany({
                where: filters,
            });
        }

        // Otherwise apply pagination
        const offset = ((page || 1) - 1) * (pageSize || 10);
        return await db.query.siswa.findMany({
            where: filters,
            limit: pageSize || 10,
            offset: offset,
        });
    });

export const createSiswa = createServerFn({ method: "POST" })
    .inputValidator((d: {
        id?: string;
        nama: string;
        nis?: string;
        nisn?: string;
        tempatLahir?: string;
        tanggalLahir?: string;
        jenisKelamin?: string;
        agama?: string;
        alamatSiswa?: string;
        teleponSiswa?: string;
        diterimaTanggal?: string;
        namaAyah?: string;
        namaIbu?: string;
        pekerjaanAyah?: string;
        pekerjaanIbu?: string;
        namaWali?: string;
        pekerjaanWali?: string;
        status?: string
    }) => d)
    .handler(async ({ data }) => {
        return await db.insert(siswa).values({
            id: data.id as any,
            nama: data.nama,
            nis: data.nis,
            nisn: data.nisn,
            tempatLahir: data.tempatLahir,
            tanggalLahir: data.tanggalLahir,
            jenisKelamin: data.jenisKelamin,
            agama: data.agama,
            alamatSiswa: data.alamatSiswa,
            teleponSiswa: data.teleponSiswa,
            diterimaTanggal: data.diterimaTanggal,
            namaAyah: data.namaAyah,
            namaIbu: data.namaIbu,
            pekerjaanAyah: data.pekerjaanAyah,
            pekerjaanIbu: data.pekerjaanIbu,
            namaWali: data.namaWali,
            pekerjaanWali: data.pekerjaanWali,
            status: data.status || 'aktif',
        }).returning();
    });

export const updateSiswa = createServerFn({ method: "POST" })
    .inputValidator((d: {
        id: string;
        nama: string;
        nis?: string;
        nisn?: string;
        tempatLahir?: string;
        tanggalLahir?: string;
        jenisKelamin?: string;
        agama?: string;
        alamatSiswa?: string;
        teleponSiswa?: string;
        diterimaTanggal?: string;
        namaAyah?: string;
        namaIbu?: string;
        pekerjaanAyah?: string;
        pekerjaanIbu?: string;
        namaWali?: string;
        pekerjaanWali?: string;
        status?: string
    }) => d)
    .handler(async ({ data }) => {
        return await db.update(siswa)
            .set({
                nama: data.nama,
                nis: data.nis,
                nisn: data.nisn,
                tempatLahir: data.tempatLahir,
                tanggalLahir: data.tanggalLahir,
                jenisKelamin: data.jenisKelamin,
                agama: data.agama,
                alamatSiswa: data.alamatSiswa,
                teleponSiswa: data.teleponSiswa,
                diterimaTanggal: data.diterimaTanggal,
                namaAyah: data.namaAyah,
                namaIbu: data.namaIbu,
                pekerjaanAyah: data.pekerjaanAyah,
                pekerjaanIbu: data.pekerjaanIbu,
                namaWali: data.namaWali,
                pekerjaanWali: data.pekerjaanWali,
                status: data.status || 'aktif',
            })
            .where(eq(siswa.id, data.id))
            .returning();
    });

export const deleteSiswa = createServerFn({ method: "POST" })
    .inputValidator((id: string) => id)
    .handler(async ({ data: id }) => {
        return await db.delete(siswa).where(eq(siswa.id, id));
    });
