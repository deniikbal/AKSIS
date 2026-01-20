"use server"

import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db/index";
import { kelas } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getKelas = createServerFn({ method: "GET" })
    .handler(async () => {
        return await db.query.kelas.findMany({
            with: {
                waliKelas: true,
                anggota: {
                    with: {
                        siswa: true,
                    },
                },
            },
        });
    });

export const createKelas = createServerFn({ method: "POST" })
    .inputValidator((d: {
        id?: string;
        nama: string;
        tingkat?: string;
        tahunAjaran?: string;
        waliKelasId?: string;
        sekolahId?: string;
        semesterId?: string;
        jurusanId?: string;
        jenisRombel?: string;
        namaJurusanSp?: string;
        kurikulumId?: string;
    }) => d)
    .handler(async ({ data }) => {
        return await db.insert(kelas).values({
            id: data.id as any,
            nama: data.nama,
            tingkat: data.tingkat,
            tahunAjaran: data.tahunAjaran,
            waliKelasId: data.waliKelasId as any,
            sekolahId: data.sekolahId,
            semesterId: data.semesterId,
            jurusanId: data.jurusanId,
            jenisRombel: data.jenisRombel,
            namaJurusanSp: data.namaJurusanSp,
            kurikulumId: data.kurikulumId,
        }).returning();
    });

export const updateKelas = createServerFn({ method: "POST" })
    .inputValidator((d: {
        id: string;
        nama: string;
        tingkat?: string;
        tahunAjaran?: string;
        waliKelasId?: string;
        sekolahId?: string;
        semesterId?: string;
        jurusanId?: string;
        jenisRombel?: string;
        namaJurusanSp?: string;
        kurikulumId?: string;
    }) => d)
    .handler(async ({ data }) => {
        return await db.update(kelas)
            .set({
                nama: data.nama,
                tingkat: data.tingkat,
                tahunAjaran: data.tahunAjaran,
                waliKelasId: data.waliKelasId as any,
                sekolahId: data.sekolahId,
                semesterId: data.semesterId,
                jurusanId: data.jurusanId,
                jenisRombel: data.jenisRombel,
                namaJurusanSp: data.namaJurusanSp,
                kurikulumId: data.kurikulumId,
            })
            .where(eq(kelas.id, data.id))
            .returning();
    });

export const deleteKelas = createServerFn({ method: "POST" })
    .inputValidator((id: string) => id)
    .handler(async ({ data: id }) => {
        return await db.delete(kelas).where(eq(kelas.id, id));
    });

export const getWaliKelasData = createServerFn({ method: "GET" })
    .inputValidator((userId: string) => userId)
    .handler(async ({ data: userId }) => {
        // Try 1: Find teacher by userId in guru table
        let teacher = await db.query.guru.findFirst({
            where: (guru, { eq }) => eq(guru.userId, userId),
        });

        // Try 2: If not found, check if user record has ptkId
        if (!teacher) {
            const userRecord = await db.query.user.findFirst({
                where: (u, { eq }) => eq(u.id, userId),
            });

            if (userRecord?.ptkId) {
                teacher = await db.query.guru.findFirst({
                    where: (guru, { eq }) => eq(guru.id, userRecord.ptkId as any),
                });
            }
        }

        if (!teacher) return null;

        return await db.query.kelas.findFirst({
            where: (kelas, { eq }) => eq(kelas.waliKelasId, teacher.id),
            with: {
                anggota: {
                    with: {
                        siswa: {
                            with: {
                                anggotaKelas: {
                                    with: {
                                        kelas: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    });
