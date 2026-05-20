import { dbConnect } from "@/lib/mongoose";
import { Code, Batch } from "@/models";
import { auth } from "@/auth";
import { BranchTable } from "./branch-table";

type LeanCode = {
  _id: unknown;
  code: string;
  productName: string;
  fromBranchRaw: string | null;
  toBranchRaw: string | null;
  quantity: number;
  branchStatus: "pending" | "finished";
  branchNotes: string | null;
  batchId: unknown;
};

type LeanBatch = { _id: unknown; createdAt: Date };

export default async function BranchPage() {
  const session = await auth();
  await dbConnect();

  const branchId = session!.user.branchId;

  if (!branchId) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-12 text-center">
        <p className="text-slate-500">
          Your account isn&apos;t linked to a branch. Contact admin.
        </p>
      </div>
    );
  }

  // only auditor-finished rows where this branch is the destination
  const codeDocs = await Code.find({
    toBranchId: branchId,
    auditorStatus: "finished",
  })
    .sort({ createdAt: -1 })
    .lean<LeanCode[]>();

  // batch dates
  const batchIds = [...new Set(codeDocs.map((c) => String(c.batchId)))];
  const batches = (await Batch.find({
    _id: { $in: batchIds },
  }).lean()) as LeanBatch[];
  const dateByBatch = new Map(
    batches.map((b: LeanBatch) => [String(b._id), b.createdAt.toISOString()]),
  );

  const rows = codeDocs.map((c) => ({
    id: String(c._id),
    date: dateByBatch.get(String(c.batchId))?.slice(0, 10) ?? "",
    code: c.code,
    productName: c.productName,
    fromBranch: c.fromBranchRaw ?? "",
    toBranch: c.toBranchRaw ?? "",
    quantity: c.quantity,
    branchStatus: c.branchStatus,
    branchNotes: c.branchNotes ?? "",
  }));

  const pending = rows.filter((r) => r.branchStatus === "pending").length;
  const done = rows.filter((r) => r.branchStatus === "finished").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Incoming transfers
        </h1>
        <p className="text-slate-500 mt-1">
          {rows.length} items · {pending} pending · {done} done
        </p>
      </div>
      <BranchTable rows={rows} />
    </div>
  );
}
