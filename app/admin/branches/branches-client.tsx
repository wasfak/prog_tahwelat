"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addBranch, importBranches } from "./actions";
import { toast } from "sonner";
import { Upload, Plus, FileSpreadsheet, AlertCircle } from "lucide-react";

export function ImportCard() {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    try {
      const form = new FormData(e.currentTarget);
      const res = await importBranches(form);
      if (res?.error) {
        toast.error(res.error);
        if (res.details) setErrors(res.details);
        return;
      }
      toast.success(`Imported ${res.count} branches`);
      (e.target as HTMLFormElement).reset();
      setFileName(null);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center ring-1 ring-blue-100">
          <Upload className="size-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Bulk import</h2>
          <p className="text-sm text-slate-500">
            Excel with columns: branch, username, password
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label
          htmlFor="import-file"
          className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-300 transition cursor-pointer"
        >
          <FileSpreadsheet className="size-7 text-blue-600" />
          <span className="text-sm font-medium text-slate-700">
            {fileName ?? "Click to choose .xlsx file"}
          </span>
        </label>
        <Input
          id="import-file"
          name="file"
          type="file"
          accept=".xlsx,.xls"
          required
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Importing..." : "Import branches"}
        </Button>
      </form>

      {errors.length > 0 && (
        <div className="mt-4 rounded-xl bg-red-50 ring-1 ring-red-200 p-4">
          <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-2">
            <AlertCircle className="size-4" />
            Import failed — nothing was saved
          </div>
          <ul className="text-xs text-red-600 space-y-1 max-h-48 overflow-y-auto">
            {errors.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function AddBranchCard() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const res = await addBranch(form);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Branch created");
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center ring-1 ring-emerald-100">
          <Plus className="size-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Add single branch</h2>
          <p className="text-sm text-slate-500">Create one branch + its login</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="branch">Branch name</Label>
          <Input id="branch" name="branch" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" required autoComplete="off" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" required autoComplete="off" />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? "Creating..." : "Create branch"}
        </Button>
      </form>
    </div>
  );
}