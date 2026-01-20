import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { kelas } from '../src/db/schema.ts';

config({ path: ['.env.local', '.env'] });

async function importKelas() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    const db = drizzle(pool);

    try {
        const jsonPath = join(process.cwd(), 'tabel_kelas.json');
        const rawData = readFileSync(jsonPath, 'utf8');
        const kelasData = JSON.parse(rawData);

        console.log(`Loaded ${kelasData.length} classes from JSON.`);

        for (const k of kelasData) {
            console.log(`Importing class: ${k.nm_kelas} (${k.rombongan_belajar_id})`);

            await db.insert(kelas).values({
                id: k.rombongan_belajar_id,
                nama: k.nm_kelas,
                tingkat: k.tingkat_pendidikan_id,
                semesterId: k.semester_id,
                jurusanId: k.jurusan_id,
                kurikulumId: k.kurikulum_id,
                waliKelasId: k.ptk_id,
                jenisRombel: k.jenis_rombel,
            }).onConflictDoUpdate({
                target: kelas.id,
                set: {
                    nama: k.nm_kelas,
                    tingkat: k.tingkat_pendidikan_id,
                    semesterId: k.semester_id,
                    jurusanId: k.jurusan_id,
                    kurikulumId: k.kurikulum_id,
                    waliKelasId: k.ptk_id,
                    jenisRombel: k.jenis_rombel,
                }
            });
        }

        console.log('Kelas import completed successfully!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error importing kelas:', error);
        await pool.end();
        process.exit(1);
    }
}

importKelas();
