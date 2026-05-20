"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { submitBatch } from "./actions";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";

type Batch = {
  id: string;
  name: string;
  status: "draft" | "submitted";
  uploadedAt: string;
  submittedAt: string | null;
  codeCount: number;
};

export function BatchesTable({ batches }: { batches: Batch[] }) {
  const [pending, setPending] = useState<string | null>(null);

  async function handleSubmit(id: string) {
    setPending(id);
    const res = await submitBatch(id);
    setPending(null);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Batch submitted to auditor");
  }

  if (batches.length === 0) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-12 text-center">
        <p className="text-slate-500">
          No batches yet. Upload one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/70 border-b border-slate-200">
          <tr>
            <th className="text-left font-medium text-slate-600 px-5 py-3">
              Name
            </th>
            <th className="text-left font-medium text-slate-600 px-5 py-3">
              Rows
            </th>
            <th className="text-left font-medium text-slate-600 px-5 py-3">
              Uploaded
            </th>
            <th className="text-left font-medium text-slate-600 px-5 py-3">
              Status
            </th>
            <th className="text-right font-medium text-slate-600 px-5 py-3">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {batches.map((b) => (
            <tr key={b.id} className="hover:bg-slate-50/50 transition">
              <td className="px-5 py-3.5 font-medium text-slate-900">
                {b.name}
              </td>
              <td className="px-5 py-3.5 text-slate-600 font-mono">
                {b.codeCount}
              </td>
              <td className="px-5 py-3.5 text-slate-500">
                {b.uploadedAt.slice(0, 10)}
              </td>
              <td className="px-5 py-3.5">
                {b.status === "draft" ? (
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200"
                  >
                    Draft
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                    <CheckCircle2 className="size-3 mr-1" />
                    Submitted
                  </Badge>
                )}
              </td>
              <td className="px-5 py-3.5 text-right">
                {b.status === "draft" ? (
                  <Button
                    size="sm"
                    onClick={() => handleSubmit(b.id)}
                    disabled={pending === b.id}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="size-3.5 mr-1.5" />
                    {pending === b.id ? "Sending..." : "Submit"}
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">
                    {b.submittedAt && b.submittedAt.slice(0, 10)}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
