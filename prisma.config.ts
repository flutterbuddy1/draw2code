// @ts-nocheck
// prisma.config.ts
import { defineConfig, env } from "prisma/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

export default defineConfig({
    // agar tumhara schema default path par hai to:
    schema: "prisma/schema.prisma",

    // yahan database URL aayega
    datasource: {
        url: env("DATABASE_URL"),
    },
});
