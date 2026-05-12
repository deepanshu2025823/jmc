"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  bulkImportProducts,
  type BulkImportResult,
} from "@/actions/product";
import { cn } from "@/lib/utils";

const SAMPLE_CSV = `name,slug,description,price,stock,category,imageUrl,images
JMC Lemon Facewash,jmc-lemon-facewash,Brightening citrus cleanser,499,50,Cleansers,https://example.com/lemon.jpg,
JMC Glow Serum,jmc-glow-serum,Vitamin C radiance serum,1299,30,Serums,https://example.com/serum.jpg,https://example.com/serum-2.jpg|https://example.com/serum-3.jpg
JMC Night Cream,,Deep hydration overnight,899,40,Moisturizers,,`;

type Mode = "upsert" | "create";

export function ImportProductsClient() {
  const [csvText, setCsvText] = useState("");
  const [filename, setFilename] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("upsert");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<BulkImportResult | null>(null);

  const handleFile = (file: File) => {
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result || ""));
      setResult(null);
    };
    reader.onerror = () => toast.error("Could not read file");
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!csvText.trim()) {
      toast.error("Paste or upload a CSV first");
      return;
    }
    setResult(null);
    startTransition(async () => {
      const res = await bulkImportProducts(csvText, { mode });
      setResult(res);
      if (res.success) {
        toast.success(
          `Imported ${res.created} new + ${res.updated} updated`
        );
      } else if (res.error && res.total === 0) {
        toast.error(res.error);
      } else {
        toast.error(`${res.failed} row${res.failed === 1 ? "" : "s"} failed`);
      }
    });
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jmc-products-sample.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const rowCountPreview =
    csvText.trim().split("\n").length > 0
      ? Math.max(0, csvText.trim().split("\n").length - 1)
      : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="h-9 w-9 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Bulk Import Products
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Upload a CSV file or paste content below. Add or update products in
            one go.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6">
            <label className="flex flex-col items-center justify-center text-center cursor-pointer gap-3 py-6 hover:bg-zinc-50 transition-colors rounded-xl">
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <div className="h-14 w-14 rounded-full bg-[#F9F6F0] flex items-center justify-center">
                <UploadCloud className="h-6 w-6 text-[#B59461]" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">
                  Click to upload CSV
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  or paste content into the box below
                </p>
              </div>
              {filename && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                  <FileSpreadsheet className="h-3.5 w-3.5" /> {filename}
                </div>
              )}
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                CSV content
              </label>
              <span className="text-xs text-zinc-500">
                {rowCountPreview} data row{rowCountPreview === 1 ? "" : "s"}
              </span>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setResult(null);
              }}
              placeholder="name,price,stock,category…"
              rows={12}
              className="w-full font-mono text-xs px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/30 focus:border-zinc-900 focus:bg-white focus:outline-none resize-y"
            />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex rounded-xl bg-zinc-100 p-1">
              <button
                type="button"
                onClick={() => setMode("upsert")}
                className={cn(
                  "h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                  mode === "upsert"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                Upsert by slug
              </button>
              <button
                type="button"
                onClick={() => setMode("create")}
                className={cn(
                  "h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                  mode === "create"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                Create only
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={downloadSample}
                className="h-10 rounded-full border-zinc-200"
              >
                <Download className="h-4 w-4 mr-2" /> Sample CSV
              </Button>
              <Button
                type="button"
                onClick={handleImport}
                disabled={pending || !csvText.trim()}
                className="h-10 rounded-full bg-zinc-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest px-6"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Importing…
                  </>
                ) : (
                  <>Import products</>
                )}
              </Button>
            </div>
          </div>
        </div>

        <aside className="space-y-4 text-xs">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              CSV Format
            </p>
            <ul className="mt-3 space-y-2 text-zinc-700 leading-relaxed">
              <li>
                <strong>Required:</strong>{" "}
                <code className="font-mono text-zinc-900">name</code>,{" "}
                <code className="font-mono text-zinc-900">price</code>
              </li>
              <li>
                <strong>Optional:</strong>{" "}
                <code className="font-mono">slug</code>,{" "}
                <code className="font-mono">description</code>,{" "}
                <code className="font-mono">stock</code>,{" "}
                <code className="font-mono">category</code>,{" "}
                <code className="font-mono">imageUrl</code>,{" "}
                <code className="font-mono">images</code>
              </li>
              <li>
                Slug auto-derived from name if blank. Must be unique.
              </li>
              <li>
                <code className="font-mono">images</code> — separate multiple
                URLs with <code>|</code> (pipe).
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Modes
            </p>
            <ul className="mt-3 space-y-2 text-zinc-700 leading-relaxed">
              <li>
                <strong>Upsert</strong> — existing slugs get updated, new ones
                created. Safe for re-runs.
              </li>
              <li>
                <strong>Create only</strong> — fails on duplicate slugs.
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {result && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-bold text-zinc-900 text-lg">Import results</h2>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {result.created} created
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {result.updated} updated
              </span>
              {result.failed > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-rose-700 font-bold">
                  <XCircle className="h-3.5 w-3.5" />
                  {result.failed} failed
                </span>
              )}
            </div>
          </div>

          {result.error && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              {result.error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-zinc-50">
                <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500">
                  <th className="px-3 py-2 font-bold w-12">Row</th>
                  <th className="px-3 py-2 font-bold">Name</th>
                  <th className="px-3 py-2 font-bold">Slug</th>
                  <th className="px-3 py-2 font-bold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {result.rows.slice(0, 50).map((r) => (
                  <tr key={`${r.row}-${r.slug}`}>
                    <td className="px-3 py-2 text-zinc-500 font-mono">{r.row}</td>
                    <td className="px-3 py-2 text-zinc-700">{r.name || "—"}</td>
                    <td className="px-3 py-2 font-mono text-zinc-500">
                      {r.slug || "—"}
                    </td>
                    <td className="px-3 py-2">
                      {r.status === "created" && (
                        <span className="text-emerald-700 font-bold">Created</span>
                      )}
                      {r.status === "updated" && (
                        <span className="text-blue-700 font-bold">Updated</span>
                      )}
                      {r.status === "error" && (
                        <span className="text-rose-700 font-bold">
                          {r.error || "Error"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.rows.length > 50 && (
              <p className="text-[11px] text-zinc-500 mt-2 text-center">
                Showing first 50 of {result.rows.length} rows.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
