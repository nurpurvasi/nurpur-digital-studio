import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  FileVideo,
  Grid3x3,
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  Loader2,
  Pencil,
  Replace,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  createMediaUploadUrl,
  deleteMedia,
  getIsAdmin,
  listMedia,
  MEDIA_FOLDERS,
  renameMedia,
  type MediaFolder,
} from "@/lib/cms.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/media")({
  head: () => ({
    meta: [
      { title: "Media Library — NurpurVasi Digitals" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MediaLibraryPage,
});

const FOLDER_LABELS: Record<MediaFolder, string> = {
  logos: "Logos",
  hero: "Hero",
  portfolio: "Portfolio",
  gallery: "Gallery",
  services: "Services",
  team: "Team",
  testimonials: "Testimonials",
  general: "General",
};

type MediaItem = {
  name: string;
  path: string;
  size: number;
  contentType: string;
  createdAt: string | null;
  url: string;
};

type UploadTask = {
  id: string;
  name: string;
  progress: number;
  error?: string;
  done: boolean;
};

function formatBytes(b: number) {
  if (!b) return "—";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(b) / Math.log(k)));
  return `${(b / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

function isVideo(ct: string, name: string) {
  return ct.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(name);
}

function MediaLibraryPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const checkAdmin = useServerFn(getIsAdmin);
  const listFn = useServerFn(listMedia);
  const deleteFn = useServerFn(deleteMedia);
  const renameFn = useServerFn(renameMedia);
  const createUpload = useServerFn(createMediaUploadUrl);

  const adminCheck = useQuery({ queryKey: ["admin-check"], queryFn: () => checkAdmin() });

  const [folder, setFolder] = useState<MediaFolder>("general");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [renameFor, setRenameFor] = useState<MediaItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ paths: string[] } | null>(null);
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<MediaItem | null>(null);

  const listQuery = useQuery({
    queryKey: ["media", folder],
    queryFn: async () => (await listFn({ data: { folder } })).items as MediaItem[],
    enabled: !!adminCheck.data?.isAdmin,
  });

  const items = useMemo(() => {
    const arr = listQuery.data ?? [];
    if (!search.trim()) return arr;
    const q = search.toLowerCase();
    return arr.filter((i) => i.name.toLowerCase().includes(q));
  }, [listQuery.data, search]);

  useEffect(() => {
    setSelected([]);
  }, [folder]);

  const uploadFile = useCallback(
    async (file: File, overwritePath?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setTasks((t) => [...t, { id, name: file.name, progress: 0, done: false }]);
      try {
        const { path, uploadUrl } = await createUpload({
          data: {
            filename: file.name,
            contentType: file.type || "application/octet-stream",
            folder,
            overwritePath,
          },
        });

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          if (file.type) xhr.setRequestHeader("Content-Type", file.type);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              setTasks((t) => t.map((x) => (x.id === id ? { ...x, progress: pct } : x)));
            }
          };
          xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)));
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(file);
        });

        setTasks((t) => t.map((x) => (x.id === id ? { ...x, progress: 100, done: true } : x)));
        setTimeout(() => setTasks((t) => t.filter((x) => x.id !== id)), 1500);
        void path;
      } catch (e) {
        setTasks((t) =>
          t.map((x) => (x.id === id ? { ...x, error: e instanceof Error ? e.message : "Upload failed", done: true } : x)),
        );
      }
    },
    [createUpload, folder],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      if (!arr.length) return;
      await Promise.all(arr.map((f) => uploadFile(f)));
      qc.invalidateQueries({ queryKey: ["media", folder] });
    },
    [uploadFile, qc, folder],
  );

  async function doDelete(paths: string[]) {
    await deleteFn({ data: { paths } });
    setSelected([]);
    setConfirmDelete(null);
    qc.invalidateQueries({ queryKey: ["media", folder] });
  }

  async function doRename() {
    if (!renameFor || !renameValue.trim()) return;
    await renameFn({ data: { path: renameFor.path, newName: renameValue.trim() } });
    setRenameFor(null);
    qc.invalidateQueries({ queryKey: ["media", folder] });
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      /* ignore */
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (adminCheck.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f8fc]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!adminCheck.data?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f8fc] p-6 text-center">
        <div>
          <p className="text-sm text-muted-foreground">You don't have admin access.</p>
          <button onClick={signOut} className="mt-3 text-xs font-medium text-primary hover:underline">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f7f8fc] text-foreground"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
      }}
    >
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <Link to="/admin" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to Studio</span>
          </Link>
          <div className="ml-2 leading-tight">
            <div className="text-sm font-semibold tracking-tight">Media Library</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{FOLDER_LABELS[folder]}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-full border border-border bg-white p-1 sm:flex">
              <button
                onClick={() => setView("grid")}
                className={`grid h-7 w-7 place-items-center rounded-full ${view === "grid" ? "bg-foreground text-background" : "text-muted-foreground"}`}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`grid h-7 w-7 place-items-center rounded-full ${view === "list" ? "bg-foreground text-background" : "text-muted-foreground"}`}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={() => inputRef.current?.click()}
              className="btn-primary !px-4 !py-2 text-xs"
            >
              <Upload className="h-3.5 w-3.5" /> Upload
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-border bg-white p-2 lg:sticky lg:top-24">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {MEDIA_FOLDERS.map((f) => (
              <button
                key={f}
                onClick={() => setFolder(f)}
                className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition ${
                  folder === f ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span className="whitespace-nowrap">{FOLDER_LABELS[f]}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="rounded-3xl border border-border bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files…"
                className="w-full rounded-full border border-border bg-background pl-9 pr-4 py-2 text-sm outline-none focus:border-ring"
              />
            </div>
            {selected.length > 0 && (
              <>
                <span className="text-xs text-muted-foreground">{selected.length} selected</span>
                <button
                  onClick={() => setConfirmDelete({ paths: selected })}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </>
            )}
          </div>

          {/* Dropzone */}
          <button
            onClick={() => inputRef.current?.click()}
            className={`mb-4 flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-4 py-8 text-xs transition ${
              dragOver ? "border-primary bg-primary/5 text-primary" : "border-border bg-background/50 text-muted-foreground hover:border-ring"
            }`}
          >
            <Upload className="h-5 w-5" />
            <div className="font-medium">Drop files here or click to upload</div>
            <div className="text-[10px] text-muted-foreground/70">Images & videos • Uploads to <span className="font-semibold">{FOLDER_LABELS[folder]}</span></div>
          </button>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              const target = replaceTarget.current;
              e.target.value = "";
              if (!f || !target) return;
              await uploadFile(f, target.path);
              qc.invalidateQueries({ queryKey: ["media", folder] });
            }}
          />

          {/* Tasks */}
          {tasks.length > 0 && (
            <div className="mb-4 space-y-2">
              {tasks.map((t) => (
                <div key={t.id} className="rounded-2xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium">{t.name}</span>
                    <span className={`ml-3 shrink-0 ${t.error ? "text-red-600" : "text-muted-foreground"}`}>
                      {t.error ? t.error : t.done ? "Done" : `${t.progress}%`}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all ${t.error ? "bg-red-500" : "bg-primary"}`}
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty / loading */}
          {listQuery.isLoading ? (
            <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background/50 p-10 text-center text-sm text-muted-foreground">
              No files yet in <span className="font-semibold">{FOLDER_LABELS[folder]}</span>. Upload your first file above.
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {items.map((item) => (
                <MediaCard
                  key={item.path}
                  item={item}
                  selected={selected.includes(item.path)}
                  onToggle={() =>
                    setSelected((s) => (s.includes(item.path) ? s.filter((p) => p !== item.path) : [...s, item.path]))
                  }
                  onPreview={() => setPreview(item)}
                  onCopy={() => copyUrl(item.url)}
                  copied={copied === item.url}
                  onRename={() => {
                    setRenameFor(item);
                    setRenameValue(item.name);
                  }}
                  onReplace={() => {
                    replaceTarget.current = item;
                    replaceInputRef.current?.click();
                  }}
                  onDelete={() => setConfirmDelete({ paths: [item.path] })}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="w-8 p-3"></th>
                    <th className="p-3 text-left font-medium">Name</th>
                    <th className="hidden p-3 text-left font-medium sm:table-cell">Size</th>
                    <th className="hidden p-3 text-left font-medium md:table-cell">Type</th>
                    <th className="p-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const video = isVideo(item.contentType, item.name);
                    return (
                      <tr key={item.path} className="border-t border-border hover:bg-muted/30">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selected.includes(item.path)}
                            onChange={() =>
                              setSelected((s) =>
                                s.includes(item.path) ? s.filter((p) => p !== item.path) : [...s, item.path],
                              )
                            }
                          />
                        </td>
                        <td className="p-3">
                          <button onClick={() => setPreview(item)} className="flex items-center gap-3 text-left">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {video ? (
                                <div className="grid h-full w-full place-items-center text-muted-foreground">
                                  <FileVideo className="h-4 w-4" />
                                </div>
                              ) : (
                                <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                              )}
                            </div>
                            <span className="truncate font-medium">{item.name}</span>
                          </button>
                        </td>
                        <td className="hidden p-3 text-xs text-muted-foreground sm:table-cell">{formatBytes(item.size)}</td>
                        <td className="hidden p-3 text-xs text-muted-foreground md:table-cell">{item.contentType || "—"}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            <IconBtn title="Copy URL" onClick={() => copyUrl(item.url)}>
                              {copied === item.url ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                            </IconBtn>
                            <IconBtn title="Rename" onClick={() => { setRenameFor(item); setRenameValue(item.name); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </IconBtn>
                            <IconBtn title="Replace" onClick={() => { replaceTarget.current = item; replaceInputRef.current?.click(); }}>
                              <Replace className="h-3.5 w-3.5" />
                            </IconBtn>
                            <IconBtn title="Delete" onClick={() => setConfirmDelete({ paths: [item.path] })}>
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </IconBtn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Preview modal */}
      {preview && (
        <Modal onClose={() => setPreview(null)}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{preview.name}</div>
              <div className="text-xs text-muted-foreground">{formatBytes(preview.size)} · {preview.contentType || "file"}</div>
            </div>
            <button onClick={() => setPreview(null)} className="rounded-full p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 max-h-[60vh] overflow-hidden rounded-2xl bg-muted">
            {isVideo(preview.contentType, preview.name) ? (
              <video src={preview.url} controls className="mx-auto max-h-[60vh]" />
            ) : (
              <img src={preview.url} alt={preview.name} className="mx-auto max-h-[60vh] object-contain" />
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={() => copyUrl(preview.url)} className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-muted">
              {copied === preview.url ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <LinkIcon className="h-3.5 w-3.5" />} Copy URL
            </button>
            <button
              onClick={() => { setRenameFor(preview); setRenameValue(preview.name); setPreview(null); }}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-muted"
            ><Pencil className="h-3.5 w-3.5" /> Rename</button>
            <button
              onClick={() => { replaceTarget.current = preview; setPreview(null); replaceInputRef.current?.click(); }}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-muted"
            ><Replace className="h-3.5 w-3.5" /> Replace</button>
            <button
              onClick={() => { setConfirmDelete({ paths: [preview.path] }); setPreview(null); }}
              className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
            ><Trash2 className="h-3.5 w-3.5" /> Delete</button>
          </div>
        </Modal>
      )}

      {/* Rename modal */}
      {renameFor && (
        <Modal onClose={() => setRenameFor(null)}>
          <div className="text-sm font-semibold">Rename file</div>
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-ring"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setRenameFor(null)} className="rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium hover:bg-muted">Cancel</button>
            <button onClick={doRename} className="btn-primary !px-4 !py-1.5 text-xs">Save</button>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)}>
          <div className="text-sm font-semibold">Delete {confirmDelete.paths.length > 1 ? `${confirmDelete.paths.length} files` : "file"}?</div>
          <div className="mt-2 text-xs text-muted-foreground">This cannot be undone. References on the site will break if the file is used somewhere.</div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setConfirmDelete(null)} className="rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium hover:bg-muted">Cancel</button>
            <button
              onClick={() => doDelete(confirmDelete.paths)}
              className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function IconBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button title={title} aria-label={title} onClick={onClick} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
      {children}
    </button>
  );
}

function MediaCard({
  item, selected, onToggle, onPreview, onCopy, copied, onRename, onReplace, onDelete,
}: {
  item: MediaItem;
  selected: boolean;
  onToggle: () => void;
  onPreview: () => void;
  onCopy: () => void;
  copied: boolean;
  onRename: () => void;
  onReplace: () => void;
  onDelete: () => void;
}) {
  const video = isVideo(item.contentType, item.name);
  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-white transition ${selected ? "border-primary ring-2 ring-primary/30" : "border-border"}`}>
      <button onClick={onPreview} className="block aspect-square w-full bg-muted">
        {video ? (
          <div className="grid h-full w-full place-items-center text-muted-foreground"><FileVideo className="h-8 w-8" /></div>
        ) : (
          <img src={item.url} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
        )}
      </button>
      <label className="absolute left-2 top-2 z-10 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-white/90 shadow ring-1 ring-black/5">
        <input type="checkbox" checked={selected} onChange={onToggle} className="h-3 w-3" />
      </label>
      <div className="p-2">
        <div className="truncate text-xs font-medium">{item.name}</div>
        <div className="text-[10px] text-muted-foreground">{formatBytes(item.size)}</div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
        <IconBtnDark title="Copy URL" onClick={onCopy}>{copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}</IconBtnDark>
        <IconBtnDark title="Rename" onClick={onRename}><Pencil className="h-3.5 w-3.5" /></IconBtnDark>
        <IconBtnDark title="Replace" onClick={onReplace}><Replace className="h-3.5 w-3.5" /></IconBtnDark>
        <IconBtnDark title="Delete" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></IconBtnDark>
      </div>
    </div>
  );
}

function IconBtnDark({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button title={title} aria-label={title} onClick={onClick} className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-foreground hover:bg-white">
      {children}
    </button>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
