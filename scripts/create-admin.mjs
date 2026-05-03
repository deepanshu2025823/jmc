// One-off admin creator. Reads ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD from env.
// Usage: node --env-file=.env scripts/create-admin.mjs
//        or: ADMIN_EMAIL=... ADMIN_NAME=... ADMIN_PASSWORD=... node --env-file=.env scripts/create-admin.mjs
//
// Idempotent: upserts on email — if user already exists, name/password/role get updated.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
const name = process.env.ADMIN_NAME?.trim();
const password = process.env.ADMIN_PASSWORD;

if (!email || !name || !password) {
  console.error("Missing env: ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD all required.");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name, password: hashed, role: "ADMIN" },
    update: { name, password: hashed, role: "ADMIN" },
  });

  console.log("✓ Admin upserted:");
  console.log("  id:    ", user.id);
  console.log("  email: ", user.email);
  console.log("  name:  ", user.name);
  console.log("  role:  ", user.role);
} catch (err) {
  console.error("✗ Failed:", err);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
