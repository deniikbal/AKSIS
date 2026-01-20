import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { siswa } from '../src/db/schema.ts';

config({ path: ['.env.local', '.env'] });

async function analyzeSiswa() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    const db = drizzle(pool);

    try {
        const jsonPath = join(process.cwd(), 'tabel_siswa.json');
        const rawData = readFileSync(jsonPath, 'utf8');
        const jsonData = JSON.parse(rawData);

        const existingStudents = await db.select({ id: siswa.id, nis: siswa.nis }).from(siswa);
        const dbIds = new Set(existingStudents.map(s => s.id));
        const dbNis = new Set(existingStudents.map(s => s.nis).filter(Boolean));

        console.log(`JSON Records: ${jsonData.length}`);
        console.log(`DB Records: ${existingStudents.length}`);

        const uniqueJsonIds = new Set(jsonData.map((s: any) => s.peserta_didik_id));
        const uniqueJsonNis = new Set(jsonData.map((s: any) => s.nis).filter(Boolean));

        console.log(`Unique IDs in JSON: ${uniqueJsonIds.size}`);
        console.log(`Unique NIS in JSON: ${uniqueJsonNis.size}`);

        const idConflicts = jsonData.length - uniqueJsonIds.size;
        const nisConflicts = jsonData.length - uniqueJsonNis.size;

        console.log(`ID Duplicates in JSON: ${idConflicts}`);
        console.log(`NIS Duplicates in JSON: ${nisConflicts}`);

        const missingFromDb = jsonData.filter((s: any) => !dbIds.has(s.peserta_didik_id));
        console.log(`Students in JSON but not in DB: ${missingFromDb.length}`);

        if (missingFromDb.length > 0) {
            console.log("Sample missing students (first 5):");
            console.log(missingFromDb.slice(0, 5).map((s: any) => ({ id: s.peserta_didik_id, nis: s.nis, nama: s.nm_siswa })));
        }

        // Now check anggota-kelas against BOTH JSON and DB
        const anggotaPath = join(process.cwd(), 'tabel_anggotakelas.json');
        const anggotaData = JSON.parse(readFileSync(anggotaPath, 'utf8'));

        const missingInSiswaJson = anggotaData.filter((a: any) => !uniqueJsonIds.has(a.peserta_didik_id));
        console.log(`Associations referencing IDs NOT in tabel_siswa.json: ${missingInSiswaJson.length} (Unique: ${new Set(missingInSiswaJson.map((x: any) => x.peserta_didik_id)).size})`);

        await pool.end();
    } catch (error) {
        console.error('Analysis failed:', error);
        await pool.end();
    }
}

analyzeSiswa();
