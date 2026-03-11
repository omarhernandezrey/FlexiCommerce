'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

interface Props {
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

// Output logo size (fijo, alta resolución)
const OUT_W = 480;
const OUT_H = 160;
const MIN_SCALE = 0.3;
const MAX_SCALE = 5;

// Calcula el tamaño del canvas preview según el ancho disponible en el modal
function getPreviewSize() {
  if (typeof window === 'undefined') return { w: 320, h: 107 };
  const available = Math.min(window.innerWidth - 80, 360); // 80px = padding del modal
  return { w: available, h: Math.round(available / 3) };
}

function draw(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  outW: number,
  outH: number,
  scale: number,
  pos: { x: number; y: number },
  refW: number,
  refH: number,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = outW;
  canvas.height = outH;
  ctx.clearRect(0, 0, outW, outH);
  const rx = outW / refW;
  const ry = outH / refH;
  const sw = img.width * scale * rx;
  const sh = img.height * scale * ry;
  const x = (outW - sw) / 2 + pos.x * rx;
  const y = (outH - sh) / 2 + pos.y * ry;
  ctx.drawImage(img, x, y, sw, sh);
}

export function LogoCropModal({ onClose, onSave }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgTransparent, setBgTransparent] = useState(false);
  const [prevSize, setPrevSize] = useState(getPreviewSize);

  // Recalcular tamaño en resize
  useEffect(() => {
    const handler = () => setPrevSize(getPreviewSize());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen (JPG, PNG, SVG, WebP)');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('La imagen debe ser menor a 3MB');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        const { w: pw, h: ph } = getPreviewSize();
        const fitScale = Math.min(pw / img.width, ph / img.height);
        setScale(fitScale);
        setPos({ x: 0, y: 0 });
        setImageSrc(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Redraw on changes
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !canvasRef.current) return;
    draw(canvasRef.current, img, prevSize.w, prevSize.h, scale, pos, prevSize.w, prevSize.h);
  }, [scale, pos, imageSrc, prevSize]);

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragRef.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  };
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    const { mx, my, px, py } = dragRef.current;
    setPos({ x: px + (e.clientX - mx), y: py + (e.clientY - my) });
  }, [dragging]);
  const onMouseUp = useCallback(() => setDragging(false), []);
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  // Touch drag
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    dragRef.current = { mx: t.clientX, my: t.clientY, px: pos.x, py: pos.y };
  };
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const t = e.touches[0];
    const { mx, my, px, py } = dragRef.current;
    setPos({ x: px + (t.clientX - mx), y: py + (t.clientY - my) });
  }, [dragging]);
  const onTouchEnd = useCallback(() => setDragging(false), []);
  useEffect(() => {
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => { window.removeEventListener('touchmove', onTouchMove); window.removeEventListener('touchend', onTouchEnd); };
  }, [onTouchMove, onTouchEnd]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(prev => Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev + (e.deltaY > 0 ? -0.05 : 0.05))));
  };

  const handleApply = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement('canvas');
    draw(canvas, img, OUT_W, OUT_H, scale, pos, prevSize.w, prevSize.h);
    const dataUrl = bgTransparent
      ? canvas.toDataURL('image/png')
      : (() => {
          // Add white background for non-transparent output
          const c2 = document.createElement('canvas');
          c2.width = OUT_W; c2.height = OUT_H;
          const ctx2 = c2.getContext('2d')!;
          ctx2.fillStyle = '#ffffff';
          ctx2.fillRect(0, 0, OUT_W, OUT_H);
          ctx2.drawImage(canvas, 0, 0);
          return c2.toDataURL('image/png');
        })();
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-extrabold text-primary">Ajustar Logo</h2>
            <p className="text-xs text-primary/50 mt-0.5">Arrastra y usa la rueda del mouse para hacer zoom</p>
          </div>
          <button onClick={onClose} className="size-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <MaterialIcon name="close" className="text-gray-600 text-lg" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {imageSrc ? (
            <>
              {/* Crop area */}
              <div
                className="relative rounded-xl overflow-hidden mx-auto border border-primary/20 select-none"
                style={{ width: prevSize.w, height: prevSize.h, background: bgTransparent ? 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 16px 16px' : '#f8fafc' }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                onWheel={onWheel}
              >
                <canvas
                  ref={canvasRef}
                  style={{ width: prevSize.w, height: prevSize.h, display: 'block', cursor: dragging ? 'grabbing' : 'grab' }}
                />
                {/* Corner guides */}
                <div className="absolute inset-0 pointer-events-none border-2 border-primary/30 rounded-xl" />
              </div>

              {/* Zoom slider */}
              <div className="flex items-center gap-3">
                <MaterialIcon name="zoom_out" className="text-primary/40 text-xl" />
                <input
                  type="range"
                  min={MIN_SCALE * 100}
                  max={MAX_SCALE * 100}
                  value={Math.round(scale * 100)}
                  onChange={(e) => setScale(Number(e.target.value) / 100)}
                  className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer"
                />
                <MaterialIcon name="zoom_in" className="text-primary/40 text-xl" />
              </div>

              {/* Background option */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bgTransparent}
                  onChange={(e) => setBgTransparent(e.target.checked)}
                  className="rounded accent-primary"
                />
                <span className="text-xs text-primary/60 font-medium">Fondo transparente (PNG)</span>
              </label>

              <button
                onClick={() => { setImageSrc(null); imgRef.current = null; }}
                className="text-xs text-primary/40 hover:text-primary underline underline-offset-2 transition-colors"
              >
                Elegir otra imagen
              </button>
            </>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-primary/20 rounded-2xl p-10 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) loadFile(f); }}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MaterialIcon name="image" className="text-primary/40 text-4xl" />
              </div>
              <div className="text-center">
                <p className="font-bold text-primary text-sm">Haz clic para seleccionar</p>
                <p className="text-xs text-primary/40 mt-1">o arrastra y suelta aquí</p>
                <p className="text-[10px] text-primary/30 mt-2">SVG, PNG, JPG, WebP · Máx. 3MB</p>
              </div>
              <div className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg pointer-events-none">
                Seleccionar imagen
              </div>
            </div>
          )}

          {error && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <MaterialIcon name="error" className="text-red-500 text-base shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ''; }} />
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border-2 border-primary/20 text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors text-sm">
            Cancelar
          </button>
          {!imageSrc ? (
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm flex items-center justify-center gap-2">
              <MaterialIcon name="upload" className="text-base" />
              Elegir imagen
            </button>
          ) : (
            <button onClick={handleApply} className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm flex items-center justify-center gap-2">
              <MaterialIcon name="check_circle" className="text-base" />
              Aplicar Logo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
