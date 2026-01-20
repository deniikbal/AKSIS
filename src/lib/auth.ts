import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index";
import * as schema from "../db/schema";
import { username } from "better-auth/plugins"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        }
    }),
    emailAndPassword: {
        enabled: true
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "guru"
            },
            username: {
                type: "string"
            },
            ptkId: {
                type: "string"
            },
            isActive: {
                type: "boolean",
                defaultValue: true
            },
            theme: {
                type: "string",
                defaultValue: "sma-theme"
            },
            warnaHeader: {
                type: "string"
            },
            warnaSide: {
                type: "string"
            }
        }
    },
    plugins: [
        username()
    ]
});

export type Auth = typeof auth;
