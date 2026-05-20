"use server";

import { dbConnect } from "@/lib/mongoose";
import { Batch, Code, Branch } from "@/models";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function uploadBatch(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "purchase") {
    return { error: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  const name = (formData.get("name") as string)?.trim();

  if (!file || !name) return { error: "File and name are required" };

  await dbConnect();

  const XLSX = await import("xlsx");
  const buf = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(
    sheet,
    { defval: "" },
  );

  if (rows.length === 0) return { error: "Excel is empty" };

  const allBranches =
    await Branch.find().lean<{ _id: unknown; name: string }[]>();
  const byName = new Map(
    allBranches.map((b) => [b.name.trim().toLowerCase(), b._id]),
  );

  const norm = (s: string | number) => String(s ?? "").trim();
  const lower = (s: string | number) => norm(s).toLowerCase();

  const batch = await Batch.create({ name, uploadedBy: session.user.id });

  const codeRows = rows.map((r) => {
    const fromRaw = norm(
      r["from branch"] ?? r["From Branch"] ?? r["from"] ?? "",
    );
    const toRaw = norm(r["to branch"] ?? r["To Branch"] ?? r["to"] ?? "");
    const qtyRaw = r["how many"] ?? r["How Many"] ?? r["quantity"] ?? 0;

    return {
      batchId: batch._id,
      code: norm(r["code"] ?? r["Code"] ?? ""),
      productName: norm(r["name"] ?? r["Name"] ?? r["product"] ?? ""),
      fromBranchRaw: fromRaw || null,
      toBranchRaw: toRaw || null,
      fromBranchId: byName.get(lower(fromRaw)) ?? null,
      toBranchId: byName.get(lower(toRaw)) ?? null,
      quantity: parseInt(String(qtyRaw)) || 0,
      tarsed: norm(r["tarsed"] ?? r["Tarsed"] ?? "") || null,
    };
  });

  await Code.insertMany(codeRows);

  revalidatePath("/purchase");
  return { ok: true, batchId: String(batch._id), count: codeRows.length };
}

export async function submitBatch(batchId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "purchase") {
    return { error: "Unauthorized" };
  }

  await dbConnect();

  await Batch.updateOne(
    { _id: batchId, uploadedBy: session.user.id },
    { $set: { batchStatus: "submitted", submittedAt: new Date() } },
  );

  revalidatePath("/purchase");
  return { ok: true };
}
