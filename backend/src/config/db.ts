// import { PrismaClient } from "@prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";

// export const prisma = new PrismaClient({
//     adapter: new PrismaPg({
//         connectionString: process.env.DATABASE_URL,
//     }),
    
// });
// console.log("Connected to postgresql successfully");

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

export const prisma = new PrismaClient({
  adapter,
});

console.log("Connected to postgresql successfully");