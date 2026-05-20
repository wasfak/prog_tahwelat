"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateBranchRow } from "./actions";
import { toast } from "sonner";
import { Search, Check } from "lucide-react";

type Row = {
  id: string;
  date: string;
  code: string;
  productName: string;
  fromBranch: string;
  toBranch: string;
  quantity: number;
  branchStatus: "pending" | "finished";
  branchNotes: string;
};

export function BranchTable({ rows }: { rows: Row[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "finished">("all");
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.id, r.branchNotes])),
  );
  const [statuses, setStatuses] = useState<
    Record<string, "pending" | "finished">
  >(() => Object.fromEntries(rows.map((r) => [r.id, r.branchStatus])));
  const [saving, setSaving] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter !== "all" && statuses[r.id] !== filter) return false;
      if (
        search &&
        !`${r.code} ${r.productName} ${r.fromBranch}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [rows, search, filter, statuses]);

  async function save(id: string, status: "pending" | "finished") {
    setStatuses((p) => ({ ...p, [id]: status }));
    setSaving(id);
    const res = await updateBranchRow(id, status, notes[id] || null);
    setSaving(null);
    if (res?.error) toast.error(res.error);
    else toast.success("Saved");
  }

  async function saveNote(id: string) {
    setSaving(id);
    const res = await updateBranchRow(id, statuses[id], notes[id] || null);
    setSaving(null);
    if (res?.error) toast.error(res.error);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search code, name, from..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "finished"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "bg-sky-600 hover:bg-sky-700 capitalize"
                  : "capitalize"
              }
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-200">
              <tr>
                <th className="text-left font-medium text-slate-600 px-4 py-3">
                  Date
                </th>
                <th className="text-left font-medium text-slate-600 px-4 py-3">
                  Code
                </th>
                <th className="text-left font-medium text-slate-600 px-4 py-3">
                  Name
                </th>
                <th className="text-left font-medium text-slate-600 px-4 py-3">
                  From
                </th>
                <th className="text-left font-medium text-slate-600 px-4 py-3">
                  To
                </th>
                <th className="text-left font-medium text-slate-600 px-4 py-3">
                  Qty
                </th>
                <th className="text-left font-medium text-slate-600 px-4 py-3">
                  My note
                </th>
                <th className="text-left font-medium text-slate-600 px-4 py-3">
                  Done
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    No items
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const done = statuses[r.id] === "finished";
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/50 transition ${
                        done ? "bg-emerald-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {r.date}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-slate-900">
                        {r.code}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {r.productName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {r.fromBranch}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{r.toBranch}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">
                        {r.quantity}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={notes[r.id] ?? ""}
                          onChange={(e) =>
                            setNotes((p) => ({ ...p, [r.id]: e.target.value }))
                          }
                          onBlur={() => saveNote(r.id)}
                          placeholder="Add note..."
                          className="h-8 text-xs w-40"
                          disabled={saving === r.id}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant={done ? "default" : "outline"}
                          onClick={() =>
                            save(r.id, done ? "pending" : "finished")
                          }
                          disabled={saving === r.id}
                          className={
                            done
                              ? "bg-emerald-600 hover:bg-emerald-700 h-8"
                              : "h-8"
                          }
                        >
                          <Check className="size-3.5 mr-1" />
                          {done ? "Done" : "Mark done"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
