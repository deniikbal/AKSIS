import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined" ? window.location.origin : process.env.BETTER_AUTH_URL,
    plugins: [
        usernameClient()
    ]
})

export type Session = typeof authClient.$Infer.Session
export type User = Session["user"] & {
    role: "admin" | "guru";
    username: string;
    ptkId: string;
    isActive: boolean;
    theme: string;
    warnaHeader: string;
    warnaSide: string;
}
