import { hashPassword } from "better-auth/crypto";

async function getHash() {
    const hash = await hashPassword("simkes123");
    console.log(hash);
}

getHash();
