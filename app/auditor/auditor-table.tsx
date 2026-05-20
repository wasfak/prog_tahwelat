"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCodeStatus, bulkUpdateStatus } from "./actions";
import { toast } from "sonner";
import { Search, CheckCheck, RotateCcw } from "lucide-react";

type Code = {
  id: string;
  code: string;
  productName: string;
  fromBranch: string;
  toBranch: string;
  quantity: number;
  tarsed: string;
  auditorStatus: "pending" | "finished";
  auditorNotes: string;
  batchId: string;
  batchName: string;
  batchDate: string;
};

type Props = {
  codes: Code[];
  batches: { id: string; name: string }[];
};

export function AuditorTable({ codes, batches }: Props) {
  const [search, setSearch] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(codes.map((c) => [c.id, c.auditorNotes])),
  );
  const [statuses, setStatuses] = useState<
    Record<string, "pending" | "finished">
  >(() => Object.fromEntries(codes.map((c) => [c.id, c.auditorStatus])));
  const [saving, setSaving] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);

  const filtered = useMemo(() => {
    return codes.filter((c) => {
      if (
        search &&
        !Object.values(c).join(" ").toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (filterBatch && c.batchId !== filterBatch) return false;
      if (filterStatus && c.auditorStatus !== filterStatus) return false;
      if (
        filterFrom &&
        !c.fromBranch.toLowerCase().includes(filterFrom.toLowerCase())
      )
        return false;
      if (
        filterTo &&
        !c.toBranch.toLowerCase().includes(filterTo.toLowerCase())
      )
        return false;
      return true;
    });
  }, [codes, search, filterBatch, filterStatus, filterFrom, filterTo]);

  const allSelected =
    filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((c) => next.add(c.id));
        return next;
      });
    }
  }

  async function handleStatusChange(
    id: string,
    status: "pending" | "finished",
  ) {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    setSaving(id);
    const res = await updateCodeStatus(id, status, notes[id] || null);
    setSaving(null);
    if (res?.error) toast.error(res.error);
    else toast.success("Status updated");
  }

  async function handleNoteBlur(id: string) {
    setSaving(id);
    const res = await updateCodeStatus(id, statuses[id], notes[id] || null);
    setSaving(null);
    if (res?.error) toast.error(res.error);
  }

  async function handleBulkFinish() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setBulkSaving(true);
    const res = await bulkUpdateStatus(ids, "finished");
    setBulkSaving(false);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    setStatuses((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = "finished"));
      return next;
    });
    setSelected(new Set());
    toast.success(`${ids.length} rows marked finished`);
  }

  async function handleBulkPending() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setBulkSaving(true);
    const res = await bulkUpdateStatus(ids, "pending");
    setBulkSaving(false);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    setStatuses((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = "pending"));
      return next;
    });
    setSelected(new Set());
    toast.success(`${ids.length} rows marked pending`);
  }

  return (
    <div className="space-y-4">
      {/* filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search anything..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={filterBatch}
          onChange={(e) => setFilterBatch(e.target.value)}
        >
          <option value="">All batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="finished">Finished</option>
        </select>
        <Input
          placeholder="From branch..."
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
        />
        <Input
          placeholder="To branch..."
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
        />
      </div>

      {/* bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 ring-1 ring-violet-200">
          <span className="text-sm font-medium text-violet-700">
            {selected.size} selected
          </span>
          <Button
            size="sm"
            onClick={handleBulkFinish}
            disabled={bulkSaving}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <CheckCheck className="size-3.5 mr-1.5" />
            Mark finished
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleBulkPending}
            disabled={bulkSaving}
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Mark pending
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* table */}
      <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="text-left font-medium text-slate-600 px-4 py-3">
                  Date
                </th>
                <th className="text-left font-medium text-slate-600 px-4 py-3">
                  Batch
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
                  Tarsed
                </th>
                <th className="text-left font-medium text-slate-600 px-4 py-3">
                  Notes
                </th>
                <th className="text-left font-medium text-slate-600 px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    No rows match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50/50 transition ${
                      selected.has(c.id) ? "bg-violet-50/40" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => {
                          setSelected((prev) => {
                            const next = new Set(prev);
                            next.has(c.id) ? next.delete(c.id) : next.add(c.id);
                            return next;
                          });
                        }}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {c.batchDate.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {c.batchName}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">
                      {c.code}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {c.productName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.fromBranch}</td>
                    <td className="px-4 py-3 text-slate-600">{c.toBranch}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono">
                      {c.quantity}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.tarsed}</td>
                    <td className="px-4 py-3">
                      <Input
                        value={notes[c.id] ?? ""}
                        onChange={(e) =>
                          setNotes((prev) => ({
                            ...prev,
                            [c.id]: e.target.value,
                          }))
                        }
                        onBlur={() => handleNoteBlur(c.id)}
                        placeholder="Add note..."
                        className="h-8 text-xs w-36"
                        disabled={saving === c.id}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={statuses[c.id]}
                        onChange={(e) =>
                          handleStatusChange(
                            c.id,
                            e.target.value as "pending" | "finished",
                          )
                        }
                        disabled={saving === c.id}
                        className={`h-8 rounded-lg border px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                          statuses[c.id] === "finished"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="finished">Finished</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          Showing {filtered.length} of {codes.length} rows
        </div>
      </div>
    </div>
  );
}
