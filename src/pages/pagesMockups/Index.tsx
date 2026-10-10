import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toBlob, toCanvas, toJpeg, toPng } from "html-to-image";
import { toast } from "sonner";
import { Box, Check, ChevronDown, CircleHelp, Copy, Download, Keyboard, Loader2, Redo2, RotateCcw, Square, Undo2, Upload } from "lucide-react";
import ControlPanel from "@/components/ControlPanel";
import MockupPreview from "@/components/MockupPreview";
import Logo from "@/components/Logo";
import VideoPanel from "@/components/VideoPanel";
import Onboarding from "@/components/Onboarding";
import { EDITOR_TOUR } from "@/lib/tour";
import ThreeStage from "@/components/three/ThreeStage";
import type { SceneApi } from "@/components/three/Scene3D";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUndoable } from "@/hooks/use-undoable";
import { BG_KEY, loadImages, syncImages, type ImageMap } from "@/lib/image-store";
import { captureScene, getFontCss, hideUi, type SceneSnapshot } from "@/lib/snapshot";
import {
  CANVAS_FORMATS,
  MAX_DEVICES,
  MAX_TEXTS,
  applyLayout,
  applyTemplate,
  createDefaultSettings,
  createDevice,
  createText,
  loadPrefs,
  loadSettings,
  readFileAsDataURL,
  savePrefs,
  saveSettings,
  uid,
  type CanvasFormat,
  type DeviceItem,
  type ExportFileFormat,
  type LayoutPreset,
  type MockupSettings,
  type TextItem,
  type EditorPrefs,
} from "@/lib/mockup";
import { cn } from "@/lib/utils";

const FILE_FORMATS: { value: ExportFileFormat; label: string; hint: string }[] = [
  { value: "png", label: "PNG", hint: "Máxima calidad" },
  { value: "jpeg", label: "JPG", hint: "Archivo más liviano" },
  { value: "webp", label: "WebP", hint: "Ideal para web" },
];

const SHORTCUTS = [
  ["Ctrl V", "Pegar captura"],
  ["Ctrl Z", "Deshacer"],
  ["Ctrl Shift Z", "Rehacer"],
  ["Ctrl D", "Duplicar selección"],
  ["Supr", "Eliminar selección"],
  ["Flechas", "Mover (Shift: más rápido)"],
  ["Esc", "Quitar selección"],
  ["Ctrl S", "Descargar"],
];

const isImageFile = (file: File | null | undefined): file is File => !!file && file.type.startsWith("image/");
const isTyping = (el: EventTarget | null) => !!(el as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable]");

const Index = () => {
  const { state: settings, set: setSettings, undo, redo, canUndo, canRedo } = useUndoable<MockupSettings>(loadSettings);
  const [images, setImages] = useState<Record<string, string>>({});
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(() => settings.devices[0]?.id ?? null);
  const [prefs, setPrefs] = useState<EditorPrefs>(loadPrefs);
  const fileFormat = prefs.fileFormat;
  const setFileFormat = (f: ExportFileFormat) => setPrefs((p) => ({ ...p, fileFormat: f }));
  const [tourOpen, setTourOpen] = useState(() => !prefs.onboarded);
  const [view, setView] = useState<"2d" | "3d">("2d");
  const [snapshot, setSnapshot] = useState<SceneSnapshot | null>(null);
  const [snapLoading, setSnapLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState<"idle" | "preview" | "recording">("idle");
  const [videoProgress, setVideoProgress] = useState(0);
  const sceneApi = useRef<SceneApi>(null);
  const storedImages = useRef<ImageMap>({});
  const imagesLoaded = useRef(false);
  const previewing = useRef(false);
  const [busy, setBusy] = useState<"export" | "copy" | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<string | null>(null);
  const dragDepth = useRef(0);

  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => savePrefs(prefs), [prefs]);

  // ── Capturas guardadas (IndexedDB) ──
  useEffect(() => {
    loadImages().then((stored) => {
      storedImages.current = stored;
      const { [BG_KEY]: bg, ...rest } = stored;
      setImages((m) => ({ ...rest, ...m }));
      if (bg) setCustomBgImage((c) => c ?? bg);
      imagesLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (!imagesLoaded.current) return;
    // Solo se guardan las imágenes de dispositivos que existen
    const ids = new Set(settings.devices.map((d) => d.id));
    const next: ImageMap = Object.fromEntries(Object.entries(images).filter(([k]) => ids.has(k)));
    if (customBgImage) next[BG_KEY] = customBgImage;
    const prev = storedImages.current;
    storedImages.current = next;
    syncImages(next, prev);
  }, [images, customBgImage, settings.devices]);

  const closeTour = useCallback(() => {
    setTourOpen(false);
    setPrefs((p) => (p.onboarded ? p : { ...p, onboarded: true }));
  }, []);

  // Si la selección deja de existir (deshacer, eliminar), se limpia
  useEffect(() => {
    if (selectedId && !settings.devices.some((d) => d.id === selectedId) && !settings.texts.some((t) => t.id === selectedId)) {
      setSelectedId(null);
    }
  }, [settings, selectedId]);

  // ── Mutaciones ──
  const update = useCallback((patch: Partial<MockupSettings>) => setSettings((s) => ({ ...s, ...patch })), [setSettings]);

  const updateItem = useCallback(
    (id: string, patch: Partial<DeviceItem> | Partial<TextItem>) =>
      setSettings((s) => ({
        ...s,
        devices: s.devices.map((d) => (d.id === id ? ({ ...d, ...patch } as DeviceItem) : d)),
        texts: s.texts.map((t) => (t.id === id ? ({ ...t, ...patch } as TextItem) : t)),
      })),
    [setSettings],
  );

  const addDevice = useCallback(() => {
    if (settings.devices.length >= MAX_DEVICES) return;
    const last = settings.devices.find((d) => d.id === selectedId) ?? settings.devices[settings.devices.length - 1];
    const device = createDevice(last ? { type: last.type, frameColor: last.frameColor } : {});
    setSettings((s) => {
      const next = { ...s, devices: [...s.devices, device] };
      return { ...next, devices: applyLayout(next, "row") };
    });
    setSelectedId(device.id);
  }, [selectedId, setSettings, settings.devices]);

  const addText = useCallback(() => {
    if (settings.texts.length >= MAX_TEXTS) return;
    const text = createText("glass", { y: Math.max(10, 86 - settings.texts.length * 12) });
    setSettings((s) => ({ ...s, texts: [...s.texts, text] }));
    setSelectedId(text.id);
  }, [setSettings, settings.texts.length]);

  const duplicate = useCallback(
    (id: string) => {
      const device = settings.devices.find((d) => d.id === id);
      const text = settings.texts.find((t) => t.id === id);
      const newId = uid();
      if (device && settings.devices.length < MAX_DEVICES) {
        setSettings((s) => ({ ...s, devices: [...s.devices, { ...device, id: newId, x: device.x + 6, y: device.y + 4 }] }));
        if (images[id]) setImages((m) => ({ ...m, [newId]: m[id] }));
        setSelectedId(newId);
      } else if (text && settings.texts.length < MAX_TEXTS) {
        setSettings((s) => ({ ...s, texts: [...s.texts, { ...text, id: newId, y: text.y - 10 }] }));
        setSelectedId(newId);
      }
    },
    [images, setSettings, settings.devices, settings.texts],
  );

  const remove = useCallback(
    (id: string) => {
      setSettings((s) => ({ ...s, devices: s.devices.filter((d) => d.id !== id), texts: s.texts.filter((t) => t.id !== id) }));
      setSelectedId((cur) => (cur === id ? null : cur));
    },
    [setSettings],
  );

  const reorder = useCallback(
    (id: string, dir: -1 | 1) =>
      setSettings((s) => {
        const move = <T extends { id: string }>(list: T[]) => {
          const i = list.findIndex((x) => x.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= list.length) return list;
          const copy = [...list];
          [copy[i], copy[j]] = [copy[j], copy[i]];
          return copy;
        };
        return { ...s, devices: move(s.devices), texts: move(s.texts) };
      }),
    [setSettings],
  );

  const handleTemplate = useCallback(
    (id: string) => {
      setSettings((s) => applyTemplate(s, id));
      setSelectedId(null);
      toast.success("Plantilla aplicada", { action: { label: "Deshacer", onClick: undo } });
    },
    [setSettings, undo],
  );

  const handleLayout = useCallback(
    (preset: LayoutPreset) => setSettings((s) => ({ ...s, devices: applyLayout(s, preset) })),
    [setSettings],
  );

  // ── Imágenes ──
  /** Reparte las imágenes entre dispositivos; si faltan, crea dispositivos nuevos */
  const handleFiles = useCallback(
    async (files: File[], targetId?: string | null) => {
      const valid = files.filter(isImageFile);
      if (!valid.length) {
        toast.error("Ese archivo no es una imagen");
        return;
      }
      const urls = await Promise.all(valid.map(readFileAsDataURL));
      const devices = [...settings.devices];
      const startId = targetId ?? (devices.some((d) => d.id === selectedId) ? selectedId : null);
      let order = devices.map((d) => d.id);
      if (startId) order = [startId, ...order.filter((x) => x !== startId)];
      else if (urls.length === 1) {
        // Primero los que aún no tienen imagen
        order = [...order.filter((x) => !images[x]), ...order.filter((x) => images[x])];
      }

      const assigned: Record<string, string> = {};
      const created: DeviceItem[] = [];
      urls.forEach((url, i) => {
        if (i < order.length) assigned[order[i]] = url;
        else if (devices.length + created.length < MAX_DEVICES) {
          const base = devices[devices.length - 1];
          const d = createDevice(base ? { type: base.type, frameColor: base.frameColor } : {});
          created.push(d);
          assigned[d.id] = url;
        }
      });

      setImages((m) => ({ ...m, ...assigned }));
      if (created.length) {
        setSettings((s) => {
          const next = { ...s, devices: [...s.devices, ...created] };
          return { ...next, devices: applyLayout(next, "row") };
        });
      }
      const placed = Object.keys(assigned).length;
      if (placed < urls.length) toast.warning(`Solo caben ${MAX_DEVICES} dispositivos por escena`);
      if (urls.length > 1) toast.success(`${placed} capturas colocadas`);
      setSelectedId(Object.keys(assigned)[0] ?? null);
    },
    [images, selectedId, setSettings, settings.devices],
  );

  const requestUpload = useCallback((deviceId: string) => {
    uploadTarget.current = deviceId;
    fileInputRef.current?.click();
  }, []);

  const handleBgImageUpload = useCallback(
    async (file: File) => {
      if (!isImageFile(file)) return;
      setCustomBgImage(await readFileAsDataURL(file));
      update({ background: "custom" });
    },
    [update],
  );

  // ── Exportar ──
  const renderOptions = useCallback(async () => {
    const target = CANVAS_FORMATS[settings.format];
    return {
      pixelRatio: 1,
      canvasWidth: target.width,
      canvasHeight: target.height,
      fontEmbedCSS: previewRef.current ? await getFontCss(previewRef.current) : undefined,
      // Oculta los controles de selección
      filter: hideUi,
    };
  }, [settings.format]);

  const handleExport = useCallback(async () => {
    const node = previewRef.current;
    if (!node || busy) return;
    setBusy("export");
    try {
      const opts = await renderOptions();
      let dataUrl: string;
      if (fileFormat === "jpeg") {
        dataUrl = await toJpeg(node, { ...opts, quality: 0.95, backgroundColor: "#ffffff" });
      } else if (fileFormat === "webp") {
        const canvas = await toCanvas(node, opts);
        dataUrl = canvas.toDataURL("image/webp", 0.95);
      } else {
        dataUrl = await toPng(node, opts);
      }
      const { width, height } = CANVAS_FORMATS[settings.format];
      const link = document.createElement("a");
      link.download = `postim-${settings.format}-${width}x${height}.${fileFormat === "jpeg" ? "jpg" : fileFormat}`;
      link.href = dataUrl;
      link.click();
      toast.success("Mockup descargado", { description: `${width} × ${height} px · ${fileFormat.toUpperCase()}` });
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("No se pudo exportar", { description: "Inténtalo de nuevo o prueba con otra imagen." });
    } finally {
      setBusy(null);
    }
  }, [busy, fileFormat, renderOptions, settings.format]);

  const handleCopy = useCallback(async () => {
    const node = previewRef.current;
    if (!node || busy) return;
    if (!("ClipboardItem" in window) || !navigator.clipboard?.write) {
      toast.error("Tu navegador no permite copiar imágenes");
      return;
    }
    setBusy("copy");
    try {
      const blob = await toBlob(node, await renderOptions());
      if (!blob) throw new Error("Empty blob");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      toast.success("Copiado al portapapeles");
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("No se pudo copiar la imagen");
    } finally {
      setBusy(null);
    }
  }, [busy, renderOptions]);

  const handleReset = () => {
    const fresh = createDefaultSettings();
    setSettings(fresh);
    setImages({});
    setSelectedId(fresh.devices[0].id);
    toast("Escena restablecida", { action: { label: "Deshacer", onClick: undo } });
  };

  // ── Vista 3D y video ──
  // Solo lo que cambia la apariencia de las texturas: girar o mover un dispositivo no requiere recapturar
  const snapshotKey = useMemo(
    () =>
      JSON.stringify({
        f: settings.format,
        bg: [settings.background, settings.bgColor, settings.grain, settings.vignette, settings.bgBlur],
        d: settings.devices.map((d) => [d.id, d.type, d.style, d.frameColor, d.innerPadding, d.borderRadius, d.imageFit, d.adjust]),
        t: settings.texts.map((t) => [t.id, t.style, t.label, t.title, t.subtitle]),
      }),
    [settings],
  );
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    if (view !== "3d") return;
    let cancelled = false;
    setSnapLoading(true);
    const t = setTimeout(async () => {
      const node = previewRef.current;
      if (!node) return;
      try {
        const snap = await captureScene(node, settingsRef.current);
        if (!cancelled) setSnapshot(snap);
      } catch (err) {
        console.error("3D snapshot failed:", err);
        if (!cancelled) toast.error("No se pudo preparar la vista 3D");
      } finally {
        if (!cancelled) setSnapLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [view, snapshotKey, images, customBgImage]);

  const downloadUrl = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  const handlePreviewVideo = async () => {
    if (!sceneApi.current) return;
    setVideoStatus("preview");
    setVideoProgress(0);
    const start = performance.now();
    previewing.current = true;
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / (prefs.video.duration * 1000));
      setVideoProgress(p);
      if (p < 1 && previewing.current) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    await sceneApi.current.play(prefs.video.preset, prefs.video.duration);
    previewing.current = false;
    setVideoStatus("idle");
  };

  const handleRecord = async () => {
    if (!sceneApi.current) return;
    setVideoStatus("recording");
    setVideoProgress(0);
    try {
      const { blob, ext } = await sceneApi.current.record({ ...prefs.video, onProgress: setVideoProgress });
      const { width, height } = CANVAS_FORMATS[settings.format];
      const url = URL.createObjectURL(blob);
      downloadUrl(url, `postim-${prefs.video.preset}-${width}x${height}.${ext}`);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      toast.success("Video descargado", { description: `${prefs.video.duration}s · ${prefs.video.fps} fps · ${ext.toUpperCase()}` });
    } catch (err) {
      console.error("Record failed:", err);
      toast.error("No se pudo grabar el video");
    } finally {
      setVideoStatus("idle");
    }
  };

  const handleCapture3D = () => {
    const url = sceneApi.current?.capture();
    if (url) {
      downloadUrl(url, `postim-3d-${settings.format}.png`);
      toast.success("Foto 3D descargada");
    }
  };

  // ── Teclado y portapapeles ──
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (isTyping(e.target)) return;
      const files = Array.from(e.clipboardData?.files ?? []).filter(isImageFile);
      if (files.length) {
        e.preventDefault();
        handleFiles(files);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || tourOpen) return;
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && key === "s") {
        e.preventDefault();
        handleExport();
      } else if (view === "3d") {
        return;
      } else if (mod && key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && key === "y") {
        e.preventDefault();
        redo();
      } else if (mod && key === "d" && selectedId) {
        e.preventDefault();
        duplicate(selectedId);
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        remove(selectedId);
      } else if (e.key === "Escape") {
        setSelectedId(null);
      } else if (selectedId && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 0.5;
        const item = settings.devices.find((d) => d.id === selectedId) ?? settings.texts.find((t) => t.id === selectedId);
        if (!item) return;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        updateItem(selectedId, { x: item.x + dx, y: item.y + dy });
      }
    };
    window.addEventListener("paste", onPaste);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("paste", onPaste);
      window.removeEventListener("keydown", onKey);
    };
  }, [duplicate, handleExport, handleFiles, redo, remove, selectedId, settings.devices, settings.texts, undo, updateItem, view, tourOpen]);

  // ── Arrastrar y soltar sobre el lienzo ──
  const dropHandlers = {
    onDragEnter: (e: React.DragEvent) => {
      if (!e.dataTransfer.types.includes("Files")) return;
      dragDepth.current += 1;
      setDragging(true);
    },
    onDragLeave: () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    },
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) handleFiles(files);
    },
  };

  const current = CANVAS_FORMATS[settings.format];
  const currentFile = FILE_FORMATS.find((f) => f.value === fileFormat)!;

  const headerBtn = "inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-35";

  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) handleFiles(files, uploadTarget.current);
          uploadTarget.current = null;
          e.target.value = "";
        }}
      />

      {/* ── Barra superior ── */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-3 sm:px-4">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden h-4 w-px bg-border md:block" />
          <div className="hidden items-center md:flex">
            <button type="button" onClick={undo} disabled={!canUndo} title="Deshacer (Ctrl+Z)" className={headerBtn}>
              <Undo2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={redo} disabled={!canRedo} title="Rehacer (Ctrl+Shift+Z)" className={headerBtn}>
              <Redo2 className="h-4 w-4" />
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" title="Atajos de teclado" className={headerBtn}>
                  <Keyboard className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 p-3">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Atajos</div>
                <div className="space-y-1.5">
                  {SHORTCUTS.map(([k, label]) => (
                    <div key={k} className="flex items-center justify-between text-[13px]">
                      <span>{label}</span>
                      <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]">{k}</kbd>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <button type="button" onClick={() => setTourOpen(true)} title="Ver tutorial" className={headerBtn}>
              <CircleHelp className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex md:hidden">
            <button type="button" onClick={undo} disabled={!canUndo} aria-label="Deshacer" className={headerBtn}>
              <Undo2 className="h-4 w-4" />
            </button>
          </div>
          <button type="button" onClick={handleReset} title="Restablecer escena" className={cn(headerBtn, "hidden sm:inline-flex")}>
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!!busy}
            title="Copiar al portapapeles"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm transition-colors hover:bg-muted disabled:opacity-50"
          >
            {busy === "copy" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Copiar</span>
          </button>

          {/* Botón dividido: descargar + elegir formato */}
          <div data-tour="export" className="flex h-9 items-stretch overflow-hidden rounded-lg bg-foreground text-background">
            <button
              type="button"
              onClick={handleExport}
              disabled={!!busy}
              title="Descargar (Ctrl+S)"
              className="inline-flex items-center gap-1.5 pl-3.5 pr-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy === "export" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Descargar</span> {currentFile.label}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="Formato de archivo" className="grid w-8 place-items-center border-l border-background/20 transition-opacity hover:opacity-80">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {FILE_FORMATS.map((f) => (
                  <DropdownMenuItem key={f.value} onSelect={() => setFileFormat(f.value)} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{f.label}</div>
                      <div className="text-xs text-muted-foreground">{f.hint}</div>
                    </div>
                    {f.value === fileFormat && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col-reverse lg:flex-row">
        {/* ── Panel de controles ── */}
        <aside data-tour="panel" className="scrollbar-thin w-full shrink-0 border-t border-border bg-background lg:w-[328px] lg:overflow-y-auto lg:border-r lg:border-t-0">
          {view === "3d" ? (
            <VideoPanel
              video={prefs.video}
              onChange={(v) => setPrefs((p) => ({ ...p, video: { ...p.video, ...v } }))}
              status={videoStatus}
              progress={videoProgress}
              ready={!!snapshot && !snapLoading}
              onPreview={handlePreviewVideo}
              onRecord={handleRecord}
              onStop={() => {
                previewing.current = false;
                sceneApi.current?.stop();
              }}
              onCapture={handleCapture3D}
              onStraighten={() =>
                setSettings((s) => ({ ...s, devices: s.devices.map((d) => ({ ...d, tiltX: 0, tiltY: 0 })) }))
              }
              onBack={() => setView("2d")}
            />
          ) : (
          <ControlPanel
            settings={settings}
            onChange={update}
            onItemChange={updateItem}
            selectedId={selectedId}
            onSelect={setSelectedId}
            images={images}
            onImageUpload={(id, file) => handleFiles([file], id)}
            onImageRemove={(id) =>
              setImages((m) => {
                const next = { ...m };
                delete next[id];
                return next;
              })
            }
            customBgImage={customBgImage}
            onBgImageUpload={handleBgImageUpload}
            onAddDevice={addDevice}
            onAddText={addText}
            onDuplicate={duplicate}
            onDelete={remove}
            onReorder={reorder}
            onApplyLayout={handleLayout}
            onApplyTemplate={handleTemplate}
          />
          )}
        </aside>

        {/* ── Lienzo ── */}
        <main className="relative flex h-[68vh] min-h-[420px] flex-1 flex-col bg-muted/40 bg-dots lg:h-auto" {...dropHandlers}>
          <div data-tour="canvas" className="min-h-0 flex-1 p-6 sm:p-10">
            <MockupPreview
              ref={previewRef}
              settings={settings}
              images={images}
              customBgImage={customBgImage}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onItemChange={updateItem}
              onRequestUpload={requestUpload}
              overlay={view === "3d" ? <ThreeStage
                    ref={sceneApi}
                    settings={settings}
                    snapshot={snapshot}
                    loading={snapLoading}
                    onTilt={(id, tiltX, tiltY) => updateItem(id, { tiltX, tiltY })}
                  /> : undefined}
            />
          </div>

          {/* Barra inferior: formato + añadir */}
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 px-3 pb-5">
            <div data-tour="view3d" className="flex items-center gap-1 rounded-full border border-border bg-background/90 p-1 shadow-sm backdrop-blur">
              {(["2d", "3d"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={videoStatus !== "idle"}
                  onClick={() => {
                    setView(v);
                    if (v === "3d") setSelectedId(null);
                  }}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
                    view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v === "2d" ? <Square className="h-3.5 w-3.5" /> : <Box className="h-3.5 w-3.5" />}
                  {v === "2d" ? "Editor" : "3D y video"}
                </button>
              ))}
            </div>
            <div data-tour="formats" className="flex items-center gap-1 rounded-full border border-border bg-background/90 p-1 shadow-sm backdrop-blur">
              {(Object.keys(CANVAS_FORMATS) as CanvasFormat[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={videoStatus !== "idle"}
                  onClick={() => update({ format: key })}
                  title={`${CANVAS_FORMATS[key].label} · ${CANVAS_FORMATS[key].width} × ${CANVAS_FORMATS[key].height}`}
                  className={cn(
                    "h-8 rounded-full px-3 font-mono text-xs transition-colors",
                    settings.format === key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {CANVAS_FORMATS[key].ratio}
                </button>
              ))}
              <span className="hidden px-2 font-mono text-[11px] text-muted-foreground sm:inline">
                {current.width} × {current.height}
              </span>
            </div>
            <div data-tour="add" className={cn("flex items-center gap-1 rounded-full border border-border bg-background/90 p-1 shadow-sm backdrop-blur", view === "3d" && "hidden")}>
              <button
                type="button"
                onClick={addDevice}
                disabled={settings.devices.length >= MAX_DEVICES}
                className="h-8 rounded-full px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                + Dispositivo
              </button>
              <button
                type="button"
                onClick={addText}
                disabled={settings.texts.length >= MAX_TEXTS}
                className="h-8 rounded-full px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                + Texto
              </button>
            </div>
          </div>

          <AnimatePresence>
            {dragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-3 z-30 grid place-items-center rounded-2xl border-2 border-dashed border-foreground/30 bg-background/70 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center gap-2 text-center text-sm font-medium">
                  <Upload className="h-5 w-5" />
                  Suelta tus imágenes aquí
                  <span className="text-xs font-normal text-muted-foreground">Cada imagen va a su propio dispositivo</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <Onboarding open={tourOpen} steps={EDITOR_TOUR} onClose={closeTour} />
    </div>
  );
};

export default Index;
