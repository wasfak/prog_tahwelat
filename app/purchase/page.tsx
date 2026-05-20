import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { Batch, Code } from "@/models";
import { BatchesTable } from "./batches-table";
import { UploadCard } from "./upload-card";

type LeanBatch = {
  _id: unknown;
  name: string;
  batchStatus: "draft" | "submitted";
  createdAt: Date;
  submittedAt: Date | null;
};

type CountResult = {
  _id: unknown;
  count: number;
};

export default async function PurchasePage() {
  const session = await auth();
  await dbConnect();

  const batchDocs = await Batch.find({ uploadedBy: session!.user.id })
    .sort({ createdAt: -1 })
    .lean<LeanBatch[]>();

  const counts = await Code.aggregate<CountResult>([
    { $match: { batchId: { $in: batchDocs.map((b) => b._id) } } },
    { $group: { _id: "$batchId", count: { $sum: 1 } } },
  ]);

  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  const myBatches = batchDocs.map((b) => ({
    id: String(b._id),
    name: b.name,
    status: b.batchStatus,
    uploadedAt: b.createdAt.toISOString(),
    submittedAt: b.submittedAt ? b.submittedAt.toISOString() : null,
    codeCount: countMap.get(String(b._id)) ?? 0,
  }));

  const drafts = myBatches.filter((b) => b.status === "draft").length;
  const submitted = myBatches.filter((b) => b.status === "submitted").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="text-slate-500 mt-1">
          Upload a new batch or submit a draft to the auditor.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total batches" value={myBatches.length} tone="slate" />
        <StatCard label="Drafts" value={drafts} tone="amber" />
        <StatCard label="Submitted" value={submitted} tone="emerald" />
      </div>
      <UploadCard />
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Your batches
        </h2>
        <BatchesTable batches={myBatches} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "amber" | "emerald";
}) {
  const tones = {
    slate: "from-slate-50 to-slate-100/50 text-slate-900 ring-slate-200",
    amber: "from-amber-50 to-orange-50/60 text-amber-900 ring-amber-200",
    emerald: "from-emerald-50 to-teal-50/60 text-emerald-900 ring-emerald-200",
  };
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${tones[tone]} ring-1 p-5 shadow-sm`}
    >
      <div className="text-sm font-medium opacity-70">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
