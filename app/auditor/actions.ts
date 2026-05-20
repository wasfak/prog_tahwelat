"use server";

import { dbConnect } from "@/lib/mongoose";
import { Code } from "@/models";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateCodeStatus(
  codeId: string,
  status: "pending" | "finished",
  note: string | null,
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "auditor") {
    return { error: "Unauthorized" };
  }

  await dbConnect();

  await Code.updateOne(
    { _id: codeId },
    {
      $set: {
        auditorStatus: status,
        auditorNotes: note ?? null,
        auditorUpdatedAt: new Date(),
      },
    },
  );

  revalidatePath("/auditor");
  return { ok: true };
}

export async function bulkUpdateStatus(
  codeIds: string[],
  status: "pending" | "finished",
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "auditor") {
    return { error: "Unauthorized" };
  }

  await dbConnect();

  await Code.updateMany(
    { _id: { $in: codeIds } },
    {
      $set: {
        auditorStatus: status,
        auditorUpdatedAt: new Date(),
      },
    },
  );

  revalidatePath("/auditor");
  return { ok: true };
}
