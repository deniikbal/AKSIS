import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { kelasEkskul } from '../src/db/schema.ts';

config({ path: ['.env.local', '.env'] });

async function importEkskul() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    const db = drizzle(pool);

    try {
        const jsonPath = join(process.cwd(), 'tabel_kelas_ekskul.json');
        const rawData = readFileSync(jsonPath, 'utf8');
        const ekskulData = JSON.parse(rawData);

        console.log(`Loaded ${ekskulData.length} records from JSON.`);

        for (const e of ekskulData) {
            console.log(`Importing: ${e.nm_ekskul} for class ${e.rombongan_belajar_id}`);

            await db.insert(kelasEkskul).values({
                id: e.id_kelas_ekskul,
                kelasId: e.rombongan_belajar_id,
                id_ekskul: e.id_ekskul,
                nama: e.nm_ekskul,
                sk: e.sk_ekskul,
                tglSk: e.tgl_sk_ekskul,
                jamMinggu: e.jam_kegiatan_per_minggu,
            }).onConflictDoUpdate({
                target: kelasEkskul.id,
                set: {
                    kelasId: e.rombongan_belajar_id,
                    id_ekskul: e.id_ekskul,
                    nama: e.nm_ekskul,
                    sk: e.sk_ekskul,
                    tglSk: e.tgl_sk_ekskul,
                    jamMinggu: e.jam_kegiatan_per_minggu,
                }
            });
        }

        console.log('Kelas Ekskul import completed successfully!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error importing kelas ekskul:', error);
        await pool.end();
        process.exit(1);
    }
}

importEkskul();
