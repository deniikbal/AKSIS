import { createServerFn } from "@tanstack/react-start";
import { auth } from "./auth";
import { getRequest } from "@tanstack/react-start/server";

export const getSession = createServerFn({ method: "GET" })
    .handler(async () => {
        const request = getRequest();
        if (!request) return null;
        return await auth.api.getSession({
            headers: request.headers,
        });
    });
