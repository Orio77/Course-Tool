import { PrismaClient } from "@prisma/client";
import "server-only";

declare global {
    var cashedPrisma: PrismaClient;
}

export let prisma: PrismaClient;
if (process.env.NODE_ENV == "production") {
    prisma = new PrismaClient();
}
else {
    if (!global.cashedPrisma) {
        global.cashedPrisma = new PrismaClient();
    }
    prisma = global.cashedPrisma;
}