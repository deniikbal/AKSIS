import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { siswa } from '../src/db/schema';
import { eq, or } from 'drizzle-orm';

config({ path: ['.env.local', '.env'] });

async function importSiswa() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    const db = drizzle(pool);

    try {
        const jsonPath = join(process.cwd(), 'tabel_siswa.json');
        const rawData = readFileSync(jsonPath, 'utf8');
        const siswaData = JSON.parse(rawData);

        console.log(`Loaded ${siswaData.length} students from JSON.`);

        for (const s of siswaData) {
            const studentId = s.peserta_didik_id;
            const studentNis = s.nis;

            console.log(`Importing student: ${s.nm_siswa} (${studentNis || 'No NIS'})`);

            try {
                // We use onConflictDoUpdate on ID
                // If there's a conflict on NIS (unique constraint), Postgres will still error unless we handle it.
                // Given the scale, we'll try to find by ID first, then update if exists, otherwise insert.
                // If insert fails due to NIS, we'll log it and continue.

                await db.insert(siswa).values({
                    id: studentId,
                    nis: studentNis,
                    nisn: s.nisn,
                    nama: s.nm_siswa,
                    tempatLahir: s.tempat_lahir,
                    tanggalLahir: s.tanggal_lahir,
                    jenisKelamin: s.jenis_kelamin,
                    agama: s.agama,
                    alamatSiswa: s.alamat_siswa,
                    teleponSiswa: s.telepon_siswa,
                    diterimaTanggal: s.diterima_tanggal,
                    namaAyah: s.nm_ayah,
                    namaIbu: s.nm_ibu,
                    pekerjaanAyah: s.pekerjaan_ayah,
                    pekerjaanIbu: s.pekerjaan_ibu,
                    namaWali: s.nm_wali,
                    pekerjaanWali: s.pekerjaan_wali,
                    status: 'aktif',
                }).onConflictDoUpdate({
                    target: siswa.id,
                    set: {
                        nis: studentNis,
                        nisn: s.nisn,
                        nama: s.nm_siswa,
                        tempatLahir: s.tempat_lahir,
                        tanggalLahir: s.tanggal_lahir,
                        jenisKelamin: s.jenis_kelamin,
                        agama: s.agama,
                        alamatSiswa: s.alamat_siswa,
                        teleponSiswa: s.telepon_siswa,
                        diterimaTanggal: s.diterima_tanggal,
                        namaAyah: s.nm_ayah,
                        namaIbu: s.nm_ibu,
                        pekerjaanAyah: s.pekerjaan_ayah,
                        pekerjaanIbu: s.pekerjaan_ibu,
                        namaWali: s.nm_wali,
                        pekerjaanWali: s.pekerjaan_wali,
                    }
                });
            } catch (innerError: any) {
                if (innerError.message.includes('unique constraint') && innerError.message.includes('nis')) {
                    console.warn(`Skipping student ${s.nm_siswa} due to duplicate NIS: ${studentNis}`);
                } else {
                    console.error(`Error importing ${s.nm_siswa}:`, innerError.message);
                }
            }
        }

        console.log('Siswa import process finished!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Fatal error during import:', error);
        await pool.end();
        process.exit(1);
    }
}

importSiswa();
