import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const name = process.env.INITIAL_ADMIN_NAME?.trim();
const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.INITIAL_ADMIN_PASSWORD;

if (!connectionString || !name || !email || !password) throw new Error("DATABASE_URL and all INITIAL_ADMIN_* variables are required.");
if (name.length < 2 || name.length > 100) throw new Error("Initial admin name is invalid.");
if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Initial admin email is invalid.");
if (password.length < 12 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) throw new Error("Initial admin password must contain 12 to 128 characters with upper/lowercase, a number and symbol.");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
try {
  const existingCount = await db.adminUser.count();
  if (existingCount > 0) {
    console.log("An administrator already exists. No changes were made.");
  } else {
    await db.adminUser.create({ data: { name, email, passwordHash: await hash(password, 12), role: "SUPER_ADMIN" } });
    console.log("Initial administrator created successfully.");
  }
} finally {
  await db.$disconnect();
}
