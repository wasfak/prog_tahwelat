"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadBatch } from "./actions";
import { toast } from "sonner";
import { Upload, FileSpreadsheet } from "lucide-react";

export function UploadCard() {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await uploadBatch(form);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
      return;
    }
    toast.success(`Uploaded ${res.count} rows`);
    (e.target as HTMLFormElement).reset();
    setFileName(null);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400" />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center ring-1 ring-emerald-100">
            <Upload className="size-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Upload new batch</h2>
            <p className="text-sm text-slate-500">
              Select an Excel file. It will be saved as a draft.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Batch name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. January transfer week 2"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Excel file</Label>
            <label
              htmlFor="file"
              className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 transition cursor-pointer"
            >
              <FileSpreadsheet className="size-7 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">
                {fileName ?? "Click to choose .xlsx file"}
              </span>
              <span className="text-xs text-slate-400">
                Required columns: code, name, from branch, to branch, how many, tarsed
              </span>
            </label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".xlsx,.xls"
              required
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20"
          >
            {loading ? "Uploading..." : "Upload as draft"}
          </Button>
        </form>
      </div>
    </div>
  );
}