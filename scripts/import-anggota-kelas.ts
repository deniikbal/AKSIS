import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { anggotaKelas, siswa, kelas } from '../src/db/schema.ts';
import { sql } from 'drizzle-orm';

config({ path: ['.env.local', '.env'] });

async function importAnggotaKelas() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    const db = drizzle(pool);

    try {
        const jsonPath = join(process.cwd(), 'tabel_anggotakelas.json');
        const rawData = readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(rawData);

        console.log(`Loaded ${data.length} records from JSON.`);

        // 1. Fetch valid IDs to avoid FK violations
        const existingStudents = await db.select({ id: siswa.id }).from(siswa);
        const existingClasses = await db.select({ id: kelas.id }).from(kelas);
        const studentIds = new Set(existingStudents.map(s => s.id));
        const classIds = new Set(existingClasses.map(c => c.id));

        console.log(`Reference match: ${studentIds.size} students, ${classIds.size} classes found in DB.`);

        // 2. Filter data
        const validData = data.filter((item: any) =>
            studentIds.has(item.peserta_didik_id) &&
            classIds.has(item.rombongan_belajar_id)
        );

        console.log(`Filtered valid records: ${validData.length} (Skipped ${data.length - validData.length} due to missing references)`);

        // 3. Batch Insert
        const BATCH_SIZE = 1000;
        for (let i = 0; i < validData.length; i += BATCH_SIZE) {
            const batchRows = validData.slice(i, i + BATCH_SIZE).map((item: any) => ({
                id: item.anggota_rombel_id,
                siswaId: item.peserta_didik_id,
                kelasId: item.rombongan_belajar_id,
                semesterId: item.semester_id,
            }));

            console.log(`Importing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batchRows.length} records)...`);

            try {
                await db.insert(anggotaKelas).values(batchRows).onConflictDoUpdate({
                    target: anggotaKelas.id,
                    set: {
                        siswaId: sql`EXCLUDED.siswa_id`,
                        kelasId: sql`EXCLUDED.kelas_id`,
                        semesterId: sql`EXCLUDED.semester_id`,
                    }
                });
            } catch (e) {
                console.error(`Error in batch starting at ${i}:`, e);
            }
        }

        console.log('Anggota Kelas import completed successfully!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Fatal error importing anggota kelas:', error);
        await pool.end();
        process.exit(1);
    }
}

importAnggotaKelas();
