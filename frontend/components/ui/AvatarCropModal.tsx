'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

interface Props {
  currentAvatar?: string | null;
  onClose: () => void;
  onSave: (croppedDataUrl: string) => Promise<void>;
}

const CROP_SIZE = 280;
const MIN_SCALE = 0.5;
const MAX_SCALE = 4;

function drawToCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  outputSize: number,
  scale: number,
  position: { x: number; y: number },
  referenceSize: number,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = outputSize;
  canvas.height = outputSize;
  ctx.clearRect(0, 0, outputSize, outputSize);
  const ratio = outputSize / referenceSize;
  const scaledW = img.width * scale * ratio;
  const scaledH = img.height * scale * ratio;
  const x = (outputSize - scaledW) / 2 + position.x * ratio;
  const y = (outputSize - scaledH) / 2 + position.y * ratio;
  ctx.drawImage(img, x, y, scaledW, scaledH);
}

export function AvatarCropModal({ currentAvatar, onClose, onSave }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewLgRef = useRef<HTMLCanvasElement>(null);
  const previewSmRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragOriginRef = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Cargar imagen ─────────────────────────────────────────────────────────
  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen válido (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen debe ser menor a 10MB');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        const minDim = Math.min(img.width, img.height);
        const fitScale = CROP_SIZE / minDim;
        setScale(fitScale);
        setPosition({ x: 0, y: 0 });
        setImageSrc(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  // ── Redibujado reactivo de los 3 canvas ───────────────────────────────────
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (canvasRef.current) drawToCanvas(canvasRef.current, img, CROP_SIZE, scale, position, CROP_SIZE);
    if (previewLgRef.current) drawToCanvas(previewLgRef.current, img, 100, scale, position, CROP_SIZE);
    if (previewSmRef.current) drawToCanvas(previewSmRef.current, img, 48, scale, position, CROP_SIZE);
  }, [scale, position, imageSrc]);

  // ── Arrastre ratón ────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragOriginRef.current = { mx: e.clientX, my: e.clientY, px: position.x, py: position.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    const { mx, my, px, py } = dragOriginRef.current;
    setPosition({ x: px + (e.clientX - mx), y: py + (e.clientY - my) });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ── Arrastre táctil ───────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    dragOriginRef.current = { mx: t.clientX, my: t.clientY, px: position.x, py: position.y };
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const t = e.touches[0];
    const { mx, my, px, py } = dragOriginRef.current;
    setPosition({ x: px + (t.clientX - mx), y: py + (t.clientY - my) });
  }, [dragging]);

  const handleTouchEnd = useCallback(() => setDragging(false), []);

  useEffect(() => {
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  // ── Zoom con rueda ────────────────────────────────────────────────────────
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    setScale(prev => Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev + delta)));
  };

  // ── Generar imagen final y subir ──────────────────────────────────────────
  const handleApply = async () => {
    const img = imgRef.current;
    if (!img) return;
    setSaving(true);
    try {
      const outputSize = 400;
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      const ratio = outputSize / CROP_SIZE;
      const scaledW = img.width * scale * ratio;
      const scaledH = img.height * scale * ratio;
      const x = (outputSize - scaledW) / 2 + position.x * ratio;
      const y = (outputSize - scaledH) / 2 + position.y * ratio;
      ctx.drawImage(img, x, y, scaledW, scaledH);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      await onSave(dataUrl);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-extrabold text-primary">Editar foto de perfil</h2>
            <p className="text-xs text-primary/50 mt-0.5">Ajusta y recorta tu foto a la perfección</p>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <MaterialIcon name="close" className="text-gray-600 text-lg" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 p-6 overflow-y-auto">

          {/* Panel izquierdo: crop */}
          <div className="flex flex-col items-center gap-4 flex-1">
            {imageSrc ? (
              <>
                <p className="text-xs font-semibold text-primary/40 uppercase tracking-wide">
                  Arrastra · Rueda para zoom
                </p>

                {/* Zona de recorte */}
                <div
                  className="relative select-none bg-gray-100 rounded-sm"
                  style={{ width: CROP_SIZE, height: CROP_SIZE }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onWheel={handleWheel}
                >
                  <canvas
                    ref={canvasRef}
                    style={{
                      width: CROP_SIZE,
                      height: CROP_SIZE,
                      cursor: dragging ? 'grabbing' : 'grab',
                      display: 'block',
                    }}
                  />
                  {/* Overlay oscuro con ventana circular */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)', borderRadius: '50%' }}
                  />
                  {/* Borde blanco del círculo */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ borderRadius: '50%', border: '2px solid rgba(255,255,255,0.75)' }}
                  />
                </div>

                {/* Slider zoom */}
                <div className="w-full max-w-xs flex items-center gap-3">
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

                <button
                  onClick={() => { setImageSrc(null); imgRef.current = null; }}
                  className="text-xs text-primary/40 hover:text-primary underline underline-offset-2 transition-colors"
                >
                  Elegir otra imagen
                </button>
              </>
            ) : (
              /* Zona selección de archivo */
              <div
                className="w-full flex flex-col items-center justify-center gap-4 border-2 border-dashed border-primary/20 rounded-2xl p-10 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt="Foto actual"
                    className="w-20 h-20 rounded-full object-cover border-4 border-primary/10 mb-1"
                  />
                ) : (
                  <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    <MaterialIcon name="person" className="text-primary/30 text-4xl" />
                  </div>
                )}
                <div className="text-center">
                  <p className="font-bold text-primary text-sm">Haz clic para seleccionar</p>
                  <p className="text-xs text-primary/40 mt-1">o arrastra y suelta aquí</p>
                  <p className="text-[10px] text-primary/30 mt-2">JPG, PNG, WEBP · Máx. 10MB</p>
                </div>
                <div className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg pointer-events-none">
                  Seleccionar imagen
                </div>
              </div>
            )}
          </div>

          {/* Panel derecho: vistas previas */}
          {imageSrc && (
            <div className="flex flex-col items-center gap-5 min-w-[120px]">
              <p className="text-xs font-semibold text-primary/40 uppercase tracking-wide">Vista previa</p>

              {/* 100px */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="rounded-full overflow-hidden border-4 border-primary/10" style={{ width: 100, height: 100 }}>
                  <canvas ref={previewLgRef} style={{ display: 'block', width: 100, height: 100 }} />
                </div>
                <p className="text-[10px] text-primary/40">Perfil</p>
              </div>

              {/* 48px */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="rounded-full overflow-hidden border-2 border-primary/10" style={{ width: 48, height: 48 }}>
                  <canvas ref={previewSmRef} style={{ display: 'block', width: 48, height: 48 }} />
                </div>
                <p className="text-[10px] text-primary/40">Header</p>
              </div>

              <div className="mt-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-1.5">
                  <MaterialIcon name="check_circle" className="text-green-500 text-sm" />
                  <p className="text-[10px] font-semibold text-green-700">Formato circular</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <MaterialIcon name="error" className="text-red-500 text-base shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border-2 border-primary/20 text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors text-sm"
          >
            Cancelar
          </button>
          {!imageSrc ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <MaterialIcon name="upload" className="text-base" />
              Elegir foto
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><MaterialIcon name="sync" className="text-base animate-spin" /> Guardando...</>
              ) : (
                <><MaterialIcon name="check_circle" className="text-base" /> Aplicar foto</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
