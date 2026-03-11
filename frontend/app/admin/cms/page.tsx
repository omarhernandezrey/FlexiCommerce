'use client';

import { useState, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { LogoCropModal } from '@/components/ui/LogoCropModal';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/useToast';
import { useProducts } from '@/hooks/useProducts';
import { useOrdersAdmin } from '@/hooks/useOrdersAdmin';

const CMS_SECTIONS = [
  {
    id: 'hero',
    title: 'Sección Hero con Slider',
    subtitle: '3 Diapositivas • Reproducción automática activa',
    icon: 'imagesmode',
    color: 'bg-indigo-50 text-indigo-600',
    visible: true,
  },
  {
    id: 'grid',
    title: 'Cuadrícula de Colecciones Destacadas',
    subtitle: '8 Elementos • Solo escritorio',
    icon: 'grid_view',
    color: 'bg-emerald-50 text-emerald-600',
    visible: true,
  },
  {
    id: 'banner',
    title: 'Barra de Banner Promocional',
    subtitle: 'Cuenta regresiva de oferta • Posición superior',
    icon: 'ads_click',
    color: 'bg-orange-50 text-orange-600',
    visible: false,
  },
  {
    id: 'newsletter',
    title: 'Suscripción al Boletín',
    subtitle: 'Popup + Bloque de pie de página',
    icon: 'mail',
    color: 'bg-blue-50 text-blue-600',
    visible: true,
  },
];

const FONT_OPTIONS = ['Inter (Default)', 'Montserrat', 'Playfair Display', 'Roboto'];

const SECTION_ICONS = ['imagesmode', 'grid_view', 'ads_click', 'mail', 'stars', 'local_offer', 'video_library', 'article'];
const SECTION_COLORS = [
  'bg-indigo-50 text-indigo-600',
  'bg-emerald-50 text-emerald-600',
  'bg-orange-50 text-orange-600',
  'bg-blue-50 text-blue-600',
  'bg-pink-50 text-pink-600',
  'bg-violet-50 text-violet-600',
];

export default function CMSDashboardPage() {
  const [sections, setSections] = useState(CMS_SECTIONS);
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showLogoCrop, setShowLogoCrop] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const { toasts, toast } = useToast();
  const { products, fetchAll: fetchProducts } = useProducts();
  const { orders, fetchAll: fetchOrders } = useOrdersAdmin();

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  // Load CMS settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiClient.get('/api/admin/cms/settings');
        const data = (res.data as any)?.data ?? res.data;
        if (data.sections) {
          setSections((prev) =>
            prev.map((s) => {
              const saved = data.sections.find((saved: { id: string; visible: boolean }) => saved.id === s.id);
              return saved ? { ...s, visible: saved.visible } : s;
            })
          );
        }
        if (data.font) setSelectedFont(data.font);
        if (typeof data.maintenanceMode === 'boolean') setMaintenanceMode(data.maintenanceMode);
      } catch { /* ignore */ }
      try {
        const storeRes = await apiClient.get('/api/admin/settings');
        const storeData = (storeRes.data as any)?.data ?? storeRes.data;
        if (storeData?.logoUrl) setLogoUrl(storeData.logoUrl);
      } catch {
        // Backend endpoint may not exist yet — use defaults silently
      }
    };
    loadSettings();
  }, []);

  const toggleVisibility = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const handleEditSection = (section: typeof sections[number]) => {
    setEditingId(section.id);
    setEditTitle(section.title);
    setEditSubtitle(section.subtitle);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    setSections((prev) =>
      prev.map((s) => s.id === editingId ? { ...s, title: editTitle.trim(), subtitle: editSubtitle.trim() } : s)
    );
    setEditingId(null);
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    const id = `section-${Date.now()}`;
    const iconIndex = sections.length % SECTION_ICONS.length;
    const colorIndex = sections.length % SECTION_COLORS.length;
    setSections((prev) => [
      ...prev,
      {
        id,
        title: newSectionTitle.trim(),
        subtitle: 'Nueva sección • Sin configurar',
        icon: SECTION_ICONS[iconIndex],
        color: SECTION_COLORS[colorIndex],
        visible: true,
      },
    ]);
    setNewSectionTitle('');
    setAddingSection(false);
    toast({ message: 'Sección agregada. Guarda para conservar los cambios.', type: 'success' });
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        apiClient.post('/api/admin/cms/settings', {
          sections: sections.map((s) => ({ id: s.id, visible: s.visible })),
          font: selectedFont,
          maintenanceMode,
        }),
        logoUrl !== null && apiClient.put('/api/admin/settings', { logoUrl }),
      ]);
      toast({ message: 'Configuración del CMS guardada exitosamente', type: 'success' });
    } catch {
      toast({ message: 'Error al guardar. Cambios guardados localmente.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background-light p-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            label: 'Ventas Totales',
            value: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalRevenue),
            sub: `${orders.length} órdenes en total`,
            subColor: 'text-emerald-600',
            subIcon: 'trending_up',
            icon: 'payments',
          },
          {
            label: 'Productos en Catálogo',
            value: String(products.length),
            sub: `${products.filter((p) => (p.stock ?? 0) === 0).length} sin stock`,
            subColor: 'text-emerald-600',
            subIcon: 'check_circle',
            icon: 'storefront',
          },
          {
            label: 'Órdenes Pendientes',
            value: String(pendingOrders),
            sub: pendingOrders > 0 ? `${pendingOrders} requieren atención` : 'Sin pendientes',
            subColor: pendingOrders > 0 ? 'text-amber-600' : 'text-emerald-600',
            subIcon: pendingOrders > 0 ? 'schedule' : 'check_circle',
            icon: 'pending_actions',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              <p className={`text-xs font-medium flex items-center gap-1 mt-1 ${stat.subColor}`}>
                <MaterialIcon name={stat.subIcon} className="text-sm" />
                {stat.sub}
              </p>
            </div>
            <div className="size-12 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
              <MaterialIcon name={stat.icon} className="text-xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Page Builder - Main Canvas */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Constructor de Páginas: Inicio</h2>
              <p className="text-sm text-slate-500">Administra las secciones y el diseño de la página principal de tu tienda.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePreview}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <MaterialIcon name="open_in_new" className="text-base" />
                Vista Previa
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <MaterialIcon name="sync" className="text-base animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>

          {/* CMS Section Cards */}
          <div className="space-y-3">
            {sections.map((section) => (
              <div
                key={section.id}
                className="group bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-primary/30 transition-all"
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing p-2 opacity-40 group-hover:opacity-100 transition-opacity">
                  <MaterialIcon name="drag_indicator" className="text-slate-400 text-xl" />
                </div>

                {/* Icon */}
                <div className={`size-12 rounded-lg flex items-center justify-center shrink-0 ${section.color}`}>
                  <MaterialIcon name={section.icon} className="text-xl" />
                </div>

                {/* Info / Inline Edit */}
                <div className="flex-1 min-w-0">
                  {editingId === section.id ? (
                    <div className="flex flex-col gap-1.5">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 border border-primary/30 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Título de la sección"
                        autoFocus
                      />
                      <input
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Subtítulo / descripción"
                      />
                    </div>
                  ) : (
                    <>
                      <h4 className="text-sm font-semibold text-slate-900">{section.title}</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-tighter mt-0.5">{section.subtitle}</p>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {editingId === section.id ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleVisibility(section.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title={section.visible ? 'Ocultar Sección' : 'Mostrar Sección'}
                      >
                        <MaterialIcon
                          name={section.visible ? 'visibility' : 'visibility_off'}
                          className="text-xl"
                        />
                      </button>
                      <button
                        onClick={() => handleEditSection(section)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                      >
                        Editar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Add New Section */}
            {addingSection ? (
              <div className="bg-white border-2 border-primary/30 rounded-xl p-4 flex items-center gap-3">
                <MaterialIcon name="add_circle" className="text-primary text-xl shrink-0" />
                <input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') setAddingSection(false); }}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Nombre de la nueva sección..."
                  autoFocus
                />
                <button
                  onClick={handleAddSection}
                  disabled={!newSectionTitle.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  Agregar
                </button>
                <button
                  onClick={() => { setAddingSection(false); setNewSectionTitle(''); }}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingSection(true)}
                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                <MaterialIcon name="add_circle" className="text-xl" />
                Agregar Nueva Sección
              </button>
            )}
          </div>
        </div>

        {/* Store Branding Panel - Right Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sticky top-6">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MaterialIcon name="style" className="text-primary text-xl" />
              Marca de la Tienda
            </h3>

            <div className="space-y-6">
              {/* Logo Upload con Crop */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Logo de la Tienda</label>
                {logoUrl ? (
                  <div className="rounded-xl border-2 border-slate-200 overflow-hidden bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo" className="w-full h-16 object-contain p-2" />
                    <div className="flex border-t border-slate-200">
                      <button onClick={() => setShowLogoCrop(true)} className="flex-1 py-1.5 flex items-center justify-center gap-1 text-[11px] font-bold text-primary hover:bg-slate-50 transition-colors">
                        <MaterialIcon name="edit" className="text-xs" />
                        Editar
                      </button>
                      <div className="w-px bg-slate-200" />
                      <button onClick={() => setLogoUrl(null)} className="flex-1 py-1.5 flex items-center justify-center gap-1 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                        <MaterialIcon name="delete" className="text-xs" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLogoCrop(true)}
                    className="w-full border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-primary/30 transition-all"
                  >
                    <div className="size-10 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                      <MaterialIcon name="add_photo_alternate" className="text-slate-400 text-xl" />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">Subir y ajustar logo</p>
                    <p className="text-[9px] text-slate-400 mt-1">SVG, PNG, JPG · Máx. 3MB</p>
                  </button>
                )}
              </div>
              {showLogoCrop && (
                <LogoCropModal
                  onClose={() => setShowLogoCrop(false)}
                  onSave={(dataUrl) => { setLogoUrl(dataUrl); setShowLogoCrop(false); }}
                />
              )}

              {/* Brand Colors */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Colores de Marca</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded bg-primary border border-white shadow-sm"></div>
                      <span className="text-xs font-medium">Primario</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      #0F1729
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded bg-indigo-500 border border-white shadow-sm"></div>
                      <span className="text-xs font-medium">Acento</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      #6366F1
                    </span>
                  </div>
                  <button className="w-full py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                    Editar Paleta
                  </button>
                </div>
              </div>

              {/* Typography */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fuente Global</label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font}>{font}</option>
                  ))}
                </select>
              </div>

              {/* Maintenance Mode */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Modo Mantenimiento</p>
                    <p className="text-[10px] text-slate-500">Ocultar tienda al público</p>
                  </div>
                  <button
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                      maintenanceMode ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out mt-0.5 ${
                        maintenanceMode ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <MaterialIcon name="sync" className="text-base animate-spin" />}
                {saving ? 'Guardando...' : 'Aplicar Globalmente'}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 pointer-events-auto ${
              t.type === 'success' ? 'bg-emerald-600 text-white' :
              t.type === 'error' ? 'bg-red-600 text-white' :
              'bg-primary text-white'
            }`}
          >
            <MaterialIcon
              name={t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}
              className="text-base shrink-0"
            />
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
