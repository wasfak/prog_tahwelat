"use server";

import { dbConnect } from "@/lib/mongoose";
import { Code } from "@/models";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateBranchRow(
  codeId: string,
  status: "pending" | "finished",
  note: string | null,
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "branch") {
    return { error: "Unauthorized" };
  }

  await dbConnect();

  // critical: only allow updating a row that belongs to THIS branch
  // and is auditor-finished — prevents tampering with other branches' rows
  const result = await Code.updateOne(
    {
      _id: codeId,
      toBranchId: session.user.branchId,
      auditorStatus: "finished",
    },
    {
      $set: {
        branchStatus: status,
        branchNotes: note ?? null,
        branchUpdatedAt: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    return { error: "Row not found or not allowed" };
  }

  revalidatePath("/branch");
  return { ok: true };
}
