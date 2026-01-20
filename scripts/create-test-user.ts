import { auth } from "../src/lib/auth";

async function createTestUser() {
    try {
        console.log("Creating test user...");
        const user = await auth.api.signUpEmail({
            body: {
                email: "test@example.com",
                password: "simkes123",
                name: "Test User",
                username: "testuser"
            }
        });
        console.log("User created:", JSON.stringify(user, null, 2));
    } catch (error: any) {
        console.error("Error creating user:", error);
        if (error.message) console.error("Message:", error.message);
        if (error.detail) console.error("Detail:", error.detail);
    }
}

createTestUser();
