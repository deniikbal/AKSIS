"use server"

import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db/index";
import { attendance } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";

interface SingleAttendanceRecord {
    siswaId: string;
    kelasId: string;
    tanggal: string; // YYYY-MM-DD format
    status: 'hadir' | 'izin' | 'sakit' | 'alfa';
    keterangan?: string;
}

// Helper to create a date that preserves the Jakarta date when stored
function createJakartaDate(dateString: string): Date {
    // Parse YYYY-MM-DD and create date at 12:00 Jakarta time (05:00 UTC)
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 5, 0, 0, 0));
    return date;
}

// Save attendance for a single student (auto-save on click)
export const saveSingleAttendance = createServerFn({ method: "POST" })
    .inputValidator((data: SingleAttendanceRecord) => data)
    .handler(async ({ data }: { data: SingleAttendanceRecord }) => {
        const session = await getSession();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const tanggalDate = createJakartaDate(data.tanggal);

        // Date range for the same day
        const startOfDay = createJakartaDate(data.tanggal);
        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(endOfDay.getHours() + 23);

        // Check if attendance already exists
        const existing = await db.query.attendance.findFirst({
            where: (att, { eq, and, gte, lte }) => and(
                eq(att.siswaId, data.siswaId),
                eq(att.kelasId, data.kelasId),
                gte(att.tanggal, startOfDay),
                lte(att.tanggal, endOfDay)
            )
        });

        if (existing) {
            // Update existing record
            await db.update(attendance)
                .set({
                    status: data.status,
                    keterangan: data.keterangan || null,
                    pembinaId: session.user.id,
                    updatedAt: new Date()
                })
                .where(eq(attendance.id, existing.id));

            return { success: true, action: 'updated', status: data.status };
        } else {
            // Insert new record
            await db.insert(attendance).values({
                siswaId: data.siswaId,
                kelasId: data.kelasId,
                tanggal: tanggalDate,
                status: data.status,
                keterangan: data.keterangan || null,
                pembinaId: session.user.id
            });

            return { success: true, action: 'created', status: data.status };
        }
    });

// Get attendance for a class on a specific date
export const getClassAttendance = createServerFn({ method: "GET" })
    .inputValidator((data: { kelasId: string, tanggal: string }) => data)
    .handler(async ({ data }: { data: { kelasId: string, tanggal: string } }) => {
        const startOfDay = createJakartaDate(data.tanggal);
        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(endOfDay.getHours() + 23);

        return await db.query.attendance.findMany({
            where: (att, { eq, and, gte, lte }) => and(
                eq(att.kelasId, data.kelasId),
                gte(att.tanggal, startOfDay),
                lte(att.tanggal, endOfDay)
            ),
            with: {
                siswa: true
            }
        });
    });
