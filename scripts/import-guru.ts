import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { guru } from '../src/db/schema.ts';

config({ path: ['.env.local', '.env'] });

async function importGuru() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    const db = drizzle(pool);

    try {
        const jsonPath = join(process.cwd(), 'tabel_ptk.json');
        const rawData = readFileSync(jsonPath, 'utf8');
        const ptkData = JSON.parse(rawData);

        console.log(`Loaded ${ptkData.length} records from JSON.`);

        for (const p of ptkData) {
            console.log(`Importing guru: ${p.nama} (${p.ptk_id})`);

            await db.insert(guru).values({
                id: p.ptk_id,
                nama: p.nama,
                nip: p.nip,
                jenisPtkId: p.jenis_ptk_id,
                jenisKelamin: p.jenis_kelamin,
                tempatLahir: p.tempat_lahir,
                tanggalLahir: p.tanggal_lahir,
                nuptk: p.nuptk,
                alamatJalan: p.alamat_jalan,
                statusKeaktifanId: p.status_keaktifan_id,
                softDelete: p.soft_delete,
            }).onConflictDoUpdate({
                target: guru.id,
                set: {
                    nama: p.nama,
                    nip: p.nip,
                    jenisPtkId: p.jenis_ptk_id,
                    jenisKelamin: p.jenis_kelamin,
                    tempatLahir: p.tempat_lahir,
                    tanggalLahir: p.tanggal_lahir,
                    nuptk: p.nuptk,
                    alamatJalan: p.alamat_jalan,
                    statusKeaktifanId: p.status_keaktifan_id,
                    softDelete: p.soft_delete,
                }
            });
        }

        console.log('Guru import completed successfully!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error importing guru:', error);
        await pool.end();
        process.exit(1);
    }
}

importGuru();
