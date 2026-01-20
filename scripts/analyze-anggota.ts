import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { siswa, kelas } from '../src/db/schema.ts';

config({ path: ['.env.local', '.env'] });

async function analyze() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    const db = drizzle(pool);

    try {
        const existingStudents = await db.select({ id: siswa.id }).from(siswa);
        const existingClasses = await db.select({ id: kelas.id }).from(kelas);

        const studentIds = new Set(existingStudents.map(s => s.id));
        const classIds = new Set(existingClasses.map(c => c.id));

        const jsonPath = join(process.cwd(), 'tabel_anggotakelas.json');
        const rawData = readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(rawData);

        let missingStudentsCount = 0;
        let missingClassesCount = 0;
        const uniqueMissingStudents = new Set();
        const uniqueMissingClasses = new Set();

        for (const item of data) {
            if (!studentIds.has(item.peserta_didik_id)) {
                missingStudentsCount++;
                uniqueMissingStudents.add(item.peserta_didik_id);
            }
            if (!classIds.has(item.rombongan_belajar_id)) {
                missingClassesCount++;
                uniqueMissingClasses.add(item.rombongan_belajar_id);
            }
        }

        const results = {
            summary: {
                studentsInDb: studentIds.size,
                classesInDb: classIds.size,
                recordsInJson: data.length,
            },
            analysis: {
                recordsMissingStudent: missingStudentsCount,
                uniqueMissingStudents: uniqueMissingStudents.size,
                recordsMissingClass: missingClassesCount,
                uniqueMissingClasses: uniqueMissingClasses.size,
                validRecords: data.length - missingStudentsCount - missingClassesCount,
            },
            sampleMissingStudents: Array.from(uniqueMissingStudents).slice(0, 10),
            sampleMissingClasses: Array.from(uniqueMissingClasses).slice(0, 10),
        };

        const outputPath = join(process.cwd(), 'analysis_results.json');
        writeFileSync(outputPath, JSON.stringify(results, null, 2));

        console.log(`Analysis saved to analysis_results.json`);
        await pool.end();
    } catch (error) {
        console.error('Analysis failed:', error);
        await pool.end();
    }
}

analyze();
