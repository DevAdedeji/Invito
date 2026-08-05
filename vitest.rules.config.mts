import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["tests/rules/**/*.test.ts"],
        // The emulator is a single shared instance; parallel suites would clash
        // over the same documents.
        fileParallelism: false,
        testTimeout: 20000,
        hookTimeout: 20000,
    },
});
