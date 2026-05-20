import { dbConnect } from "@/lib/mongoose";
import { Code, Batch } from "@/models";
import { auth } from "@/auth";
import { AuditorTable } from "./auditor-table";

type LeanCode = {
  _id: unknown;
  code: string;
  productName: string;
  fromBranchRaw: string | null;
  toBranchRaw: string | null;
  quantity: number;
  tarsed: string | null;
  auditorStatus: "pending" | "finished";
  auditorNotes: string | null;
  auditorUpdatedAt: Date | null;
  batchId: unknown;
};

type LeanBatch = {
  _id: unknown;
  name: string;
  createdAt: Date;
};

export default async function AuditorPage() {
  await auth();
  await dbConnect();

  const submittedBatches = await Batch.find({ batchStatus: "submitted" }).lean<
    LeanBatch[]
  >();

  const batchIds = submittedBatches.map((b) => b._id);
  const batchMap = new Map(
    submittedBatches.map((b) => [
      String(b._id),
      { name: b.name, date: b.createdAt.toISOString() },
    ]),
  );

  const codeDocs = await Code.find({ batchId: { $in: batchIds } })
    .sort({ createdAt: -1 })
    .lean<LeanCode[]>();

  const codes = codeDocs.map((c) => ({
    id: String(c._id),
    code: c.code,
    productName: c.productName,
    fromBranch: c.fromBranchRaw ?? "",
    toBranch: c.toBranchRaw ?? "",
    quantity: c.quantity,
    tarsed: c.tarsed ?? "",
    auditorStatus: c.auditorStatus,
    auditorNotes: c.auditorNotes ?? "",
    batchId: String(c.batchId),
    batchName: batchMap.get(String(c.batchId))?.name ?? "",
    batchDate: batchMap.get(String(c.batchId))?.date ?? "",
  }));

  const batches = submittedBatches.map((b) => ({
    id: String(b._id),
    name: b.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Review Codes
        </h1>
        <p className="text-slate-500 mt-1">
          {codes.length} rows across {batches.length} submitted batches
        </p>
      </div>
      <AuditorTable codes={codes} batches={batches} />
    </div>
  );
}
