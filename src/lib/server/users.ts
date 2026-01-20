import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db/index";
import { user, account } from "@/db/schema";
import { eq, ilike, or, desc } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { createHash } from "crypto";

// Get all users with search
export const getUsers = createServerFn({ method: "GET" })
    .inputValidator((data?: { search?: string }) => data)
    .handler(async ({ data }: { data?: { search?: string } }) => {
        const session = await getSession();
        if (!session?.user?.id) throw new Error("Unauthorized");
        if ((session.user as any).role !== 'admin') throw new Error("Forbidden");

        if (data?.search) {
            const search = `%${data.search}%`;
            return await db.select().from(user)
                .where(or(
                    ilike(user.name, search),
                    ilike(user.email, search),
                    ilike(user.username, search)
                ))
                .orderBy(desc(user.createdAt));
        }

        return await db.select().from(user).orderBy(desc(user.createdAt));
    });

// Update user role
export const updateUserRole = createServerFn({ method: "POST" })
    .inputValidator((data: { userId: string; role: 'admin' | 'guru' | 'pembina' }) => data)
    .handler(async ({ data }: { data: { userId: string; role: 'admin' | 'guru' | 'pembina' } }) => {
        const session = await getSession();
        if (!session?.user?.id) throw new Error("Unauthorized");
        if ((session.user as any).role !== 'admin') throw new Error("Forbidden");

        await db.update(user)
            .set({ role: data.role, updatedAt: new Date() })
            .where(eq(user.id, data.userId));

        return { success: true };
    });

// Reset user password
export const resetUserPassword = createServerFn({ method: "POST" })
    .inputValidator((data: { userId: string; newPassword: string }) => data)
    .handler(async ({ data }: { data: { userId: string; newPassword: string } }) => {
        const session = await getSession();
        if (!session?.user?.id) throw new Error("Unauthorized");
        if ((session.user as any).role !== 'admin') throw new Error("Forbidden");

        // Generate salt and hash password
        const salt = createHash('sha256').update(Math.random().toString()).digest('hex').slice(0, 16);
        const hashedPassword = createHash('sha256').update(data.newPassword + salt).digest('hex');

        // Update the account password
        const userAccount = await db.query.account.findFirst({
            where: eq(account.userId, data.userId)
        });

        if (userAccount) {
            await db.update(account)
                .set({ password: hashedPassword, updatedAt: new Date() })
                .where(eq(account.id, userAccount.id));

            // Update salt in user table
            await db.update(user)
                .set({ salt, updatedAt: new Date() })
                .where(eq(user.id, data.userId));
        }

        return { success: true };
    });

// Toggle user active status
export const toggleUserActive = createServerFn({ method: "POST" })
    .inputValidator((data: { userId: string; isActive: boolean }) => data)
    .handler(async ({ data }: { data: { userId: string; isActive: boolean } }) => {
        const session = await getSession();
        if (!session?.user?.id) throw new Error("Unauthorized");
        if ((session.user as any).role !== 'admin') throw new Error("Forbidden");

        await db.update(user)
            .set({ isActive: data.isActive, updatedAt: new Date() })
            .where(eq(user.id, data.userId));

        return { success: true };
    });
