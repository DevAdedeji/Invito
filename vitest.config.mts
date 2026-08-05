import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
    test: {
        environment: "node",
        // Rules tests need the Firestore emulator, so they run from a separate
        // config via `npm run test:rules`.
        include: ["lib/**/*.test.ts"],
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL(".", import.meta.url)),
        },
    },
});
