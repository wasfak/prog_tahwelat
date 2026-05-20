"use server";

import { dbConnect } from "@/lib/mongoose";
import { Branch, User } from "@/models";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

type ImportRow = { branch: string; username: string; password: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return false;
  return true;
}

// ---------- single add ----------
export async function addBranch(formData: FormData) {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const branch = (formData.get("branch") as string)?.trim();
  const username = (formData.get("username") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!branch || !username || !password)
    return { error: "All fields are required" };

  await dbConnect();

  const existingBranch = await Branch.findOne({
    name: new RegExp(`^${escapeRegex(branch)}$`, "i"),
  }).lean();
  if (existingBranch) return { error: `Branch "${branch}" already exists` };

  const existingUser = await User.findOne({ username }).lean();
  if (existingUser) return { error: `Username "${username}" already exists` };

  const branchDoc = await Branch.create({ name: branch });
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    username,
    passwordHash,
    role: "branch",
    branchId: branchDoc._id,
  });

  revalidatePath("/admin/branches");
  return { ok: true };
}

// ---------- bulk import (all-or-nothing) ----------
export async function importBranches(formData: FormData) {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { error: "File is required" };

  await dbConnect();
  const XLSX = await import("xlsx");

  const buf = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet, {
    defval: "",
  });

  if (raw.length === 0) return { error: "Excel is empty" };

  const norm = (s: string | number) => String(s ?? "").trim();

  const rows: ImportRow[] = raw.map((r) => ({
    branch: norm(r["branch"] ?? r["Branch"] ?? r["branch name"] ?? ""),
    username: norm(r["username"] ?? r["Username"] ?? r["user"] ?? ""),
    password: norm(r["password"] ?? r["Password"] ?? r["pass"] ?? ""),
  }));

  // ---- validate everything BEFORE inserting ----
  const errors: string[] = [];

  // 1. missing fields
  rows.forEach((r, i) => {
    if (!r.branch || !r.username || !r.password)
      errors.push(`Row ${i + 2}: missing branch, username, or password`);
  });

  // 2. duplicates within the file
  const seenBranch = new Set<string>();
  const seenUser = new Set<string>();
  rows.forEach((r, i) => {
    const bk = r.branch.toLowerCase();
    const uk = r.username.toLowerCase();
    if (seenBranch.has(bk))
      errors.push(`Row ${i + 2}: duplicate branch "${r.branch}" in file`);
    if (seenUser.has(uk))
      errors.push(`Row ${i + 2}: duplicate username "${r.username}" in file`);
    seenBranch.add(bk);
    seenUser.add(uk);
  });

  // 3. duplicates against the database
  const existingBranches = await Branch.find().lean<{ name: string }[]>();
  const existingUsers = await User.find().lean<{ username: string }[]>();
  const dbBranches = new Set(existingBranches.map((b) => b.name.toLowerCase()));
  const dbUsers = new Set(existingUsers.map((u) => u.username.toLowerCase()));

  rows.forEach((r, i) => {
    if (dbBranches.has(r.branch.toLowerCase()))
      errors.push(`Row ${i + 2}: branch "${r.branch}" already exists in system`);
    if (dbUsers.has(r.username.toLowerCase()))
      errors.push(`Row ${i + 2}: username "${r.username}" already exists in system`);
  });

  if (errors.length > 0) {
    return { error: "Import stopped — fix these and retry:", details: errors };
  }

  // ---- all valid: insert ----
  const branchDocs = await Branch.insertMany(
    rows.map((r) => ({ name: r.branch }))
  );

  const userDocs = await Promise.all(
    rows.map(async (r, i) => ({
      username: r.username,
      passwordHash: await bcrypt.hash(r.password, 10),
      role: "branch" as const,
      branchId: branchDocs[i]._id,
    }))
  );

  await User.insertMany(userDocs);

  revalidatePath("/admin/branches");
  return { ok: true, count: rows.length };
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}