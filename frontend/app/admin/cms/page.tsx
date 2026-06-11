'use client';

import { useState, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { LogoCropModal } from '@/components/ui/LogoCropModal';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/useToast';
import type { CmsSections, BenefitItem } from '@/hooks/useCmsHomepage';

const FONT_OPTIONS = ['Inter (Predeterminada)', 'Montserrat', 'Playfair Display', 'Roboto'];

const BENEFIT_ICON_OPTIONS = [
  'local_shipping', 'autorenew', 'verified_user', 'support_agent',
  'star', 'favorite', 'bolt', 'workspace_premium', 'shield',
  'payments', 'storefront', 'loyalty', 'thumb_up', 'eco',
];

const DEFAULT_SECTIONS: CmsSections = {
  hero: { visible: true, subtitle: 'Descubre productos exclusivos con la mejor calidad y los mejores precios', cta: 'Explorar Tienda', ctaLink: '/products' },
  categories: { visible: true, title: 'Explorar Categorías', subtitle: 'Encuentra lo que buscas' },
  products: { visible: true, title: 'Productos Destacados', subtitle: 'Seleccionados para ti' },
  benefits: {
    visible: true,
    title: '¿Por qué comprar aquí?',
    subtitle: 'Nos comprometemos a ofrecerte la mejor experiencia de compra online con beneficios reales.',
    items: [
      { icon: 'local_shipping', title: 'Envío Rápido', desc: 'Envíos a todo el país. Gratis en compras superiores.' },
      { icon: 'autorenew', title: 'Devoluciones Fáciles', desc: 'Hasta 30 días para devolver o cambiar tu compra.' },
      { icon: 'verified_user', title: 'Pago 100% Seguro', desc: 'Transacciones encriptadas y múltiples métodos de pago.' },
      { icon: 'support_agent', title: 'Soporte Dedicado', desc: 'Atención al cliente disponible para ayudarte siempre.' },
    ],
  },
  newsletter: { visible: true, title: 'Únete a Nuestro Boletín', subtitle: 'Recibe ofertas exclusivas, acceso anticipado a novedades y beneficios solo para miembros' },
};

export default function CMSPage() {
  const [sections, setSections] = useState<CmsSections>(DEFAULT_SECTIONS);
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showLogoCrop, setShowLogoCrop] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { toasts, toast } = useToast();

  // Cargar settings al montar
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/api/admin/cms/settings');
        const data = (res.data as any)?.data ?? res.data;
        if (data.sections) {
          setSections({
            hero: { ...DEFAULT_SECTIONS.hero, ...data.sections.hero },
            categories: { ...DEFAULT_SECTIONS.categories, ...data.sections.categories },
            products: { ...DEFAULT_SECTIONS.products, ...data.sections.products },
            benefits: {
              ...DEFAULT_SECTIONS.benefits,
              ...data.sections.benefits,
              items: Array.isArray(data.sections.benefits?.items) && data.sections.benefits.items.length > 0
                ? data.sections.benefits.items
                : DEFAULT_SECTIONS.benefits.items,
            },
            newsletter: { ...DEFAULT_SECTIONS.newsletter, ...data.sections.newsletter },
          });
        }
        if (data.font) setSelectedFont(data.font);
        if (typeof data.maintenanceMode === 'boolean') setMaintenanceMode(data.maintenanceMode);
      } catch { /* use defaults */ }
      try {
        const storeRes = await apiClient.get('/api/admin/settings');
        const storeData = (storeRes.data as any)?.data ?? storeRes.data;
        if (storeData?.logoUrl) setLogoUrl(storeData.logoUrl);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        apiClient.post('/api/admin/cms/settings', {
          sections,
          font: selectedFont,
          maintenanceMode,
        }),
        logoUrl !== null && apiClient.put('/api/admin/settings', { logoUrl }),
      ]);
      toast({ message: 'Configuración guardada exitosamente', type: 'success' });
    } catch {
      toast({ message: 'Error al guardar configuración', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (key: keyof CmsSections) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], visible: !prev[key].visible },
    }));
  };

  const updateSection = <K extends keyof CmsSections>(key: K, field: string, value: any) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const updateBenefitItem = (index: number, field: keyof BenefitItem, value: string) => {
    setSections((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        items: prev.benefits.items.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const addBenefitItem = () => {
    setSections((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        items: [...prev.benefits.items, { icon: 'star', title: '', desc: '' }],
      },
    }));
  };

  const removeBenefitItem = (index: number) => {
    setSections((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        items: prev.benefits.items.filter((_, i) => i !== index),
      },
    }));
  };

  const SECTION_CONFIG = [
    { key: 'hero' as const, label: 'Banner Principal', icon: 'imagesmode', color: 'bg-indigo-50 text-indigo-600' },
    { key: 'categories' as const, label: 'Categorías', icon: 'grid_view', color: 'bg-emerald-50 text-emerald-600' },
    { key: 'products' as const, label: 'Productos Destacados', icon: 'storefront', color: 'bg-orange-50 text-orange-600' },
    { key: 'benefits' as const, label: 'Beneficios', icon: 'verified_user', color: 'bg-blue-50 text-blue-600' },
    { key: 'newsletter' as const, label: 'Newsletter', icon: 'mail', color: 'bg-pink-50 text-pink-600' },
  ];

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background-light p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background-light p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MaterialIcon name="web" className="text-primary text-2xl" />
            Editor de Página Principal
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configura el contenido y la apariencia de tu tienda</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open('/', '_blank')}
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Secciones del Homepage */}
        <div className="flex-1 space-y-3">
          {SECTION_CONFIG.map(({ key, label, icon, color }) => {
            const section = sections[key];
            const isExpanded = expandedSection === key;

            return (
              <div key={key} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {/* Section Header */}
                <div className="p-4 flex items-center gap-4">
                  <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <MaterialIcon name={icon} className="text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900">{label}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {section.visible ? 'Visible en la tienda' : 'Oculta'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSection(key)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title={section.visible ? 'Ocultar' : 'Mostrar'}
                    >
                      <MaterialIcon name={section.visible ? 'visibility' : 'visibility_off'} className="text-xl" />
                    </button>
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : key)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1"
                    >
                      <MaterialIcon name={isExpanded ? 'expand_less' : 'edit'} className="text-sm" />
                      {isExpanded ? 'Cerrar' : 'Editar'}
                    </button>
                  </div>
                </div>

                {/* Section Editor */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
                    {/* Hero Editor */}
                    {key === 'hero' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Subtítulo del Hero</label>
                          <textarea
                            value={sections.hero.subtitle}
                            onChange={(e) => updateSection('hero', 'subtitle', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Texto del Botón (CTA)</label>
                            <input
                              value={sections.hero.cta}
                              onChange={(e) => updateSection('hero', 'cta', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Enlace del Botón</label>
                            <input
                              value={sections.hero.ctaLink}
                              onChange={(e) => updateSection('hero', 'ctaLink', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                              placeholder="/products"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Categories / Products Editor (same structure) */}
                    {(key === 'categories' || key === 'products') && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Título</label>
                          <input
                            value={(section as any).title}
                            onChange={(e) => updateSection(key, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Subtítulo</label>
                          <input
                            value={(section as any).subtitle}
                            onChange={(e) => updateSection(key, 'subtitle', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    )}

                    {/* Benefits Editor */}
                    {key === 'benefits' && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Título de la Sección</label>
                            <input
                              value={sections.benefits.title}
                              onChange={(e) => updateSection('benefits', 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Subtítulo</label>
                            <input
                              value={sections.benefits.subtitle}
                              onChange={(e) => updateSection('benefits', 'subtitle', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-slate-600">Beneficios ({sections.benefits.items.length})</label>
                          {sections.benefits.items.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-lg border border-slate-200 p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
                                <select
                                  value={item.icon}
                                  onChange={(e) => updateBenefitItem(idx, 'icon', e.target.value)}
                                  className="px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                  {BENEFIT_ICON_OPTIONS.map((ic) => (
                                    <option key={ic} value={ic}>{ic}</option>
                                  ))}
                                </select>
                                <MaterialIcon name={item.icon} className="text-primary text-lg" />
                                <div className="flex-1" />
                                <button
                                  onClick={() => removeBenefitItem(idx)}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Eliminar"
                                >
                                  <MaterialIcon name="close" className="text-sm" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  value={item.title}
                                  onChange={(e) => updateBenefitItem(idx, 'title', e.target.value)}
                                  placeholder="Título"
                                  className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <input
                                  value={item.desc}
                                  onChange={(e) => updateBenefitItem(idx, 'desc', e.target.value)}
                                  placeholder="Descripción"
                                  className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                              </div>
                            </div>
                          ))}
                          {sections.benefits.items.length < 6 && (
                            <button
                              onClick={addBenefitItem}
                              className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1"
                            >
                              <MaterialIcon name="add" className="text-sm" />
                              Agregar Beneficio
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {/* Newsletter Editor */}
                    {key === 'newsletter' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Título</label>
                          <input
                            value={sections.newsletter.title}
                            onChange={(e) => updateSection('newsletter', 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Subtítulo</label>
                          <input
                            value={sections.newsletter.subtitle}
                            onChange={(e) => updateSection('newsletter', 'subtitle', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar — Marca de la Tienda */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sticky top-6">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MaterialIcon name="style" className="text-primary text-xl" />
              Marca de la Tienda
            </h3>

            <div className="space-y-6">
              {/* Logo Upload */}
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
                    <p className="text-[9px] text-slate-400 mt-1">SVG, PNG, JPG</p>
                  </button>
                )}
              </div>
              {showLogoCrop && (
                <LogoCropModal
                  onClose={() => setShowLogoCrop(false)}
                  onSave={(dataUrl) => { setLogoUrl(dataUrl); setShowLogoCrop(false); }}
                />
              )}

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
                <p className="text-[10px] text-slate-400 mt-1">Se aplica a toda la tienda al guardar</p>
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
                {maintenanceMode && (
                  <p className="text-[10px] text-amber-600 font-medium mt-2 flex items-center gap-1">
                    <MaterialIcon name="warning" className="text-xs" />
                    La tienda no será visible para los clientes
                  </p>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <MaterialIcon name="sync" className="text-base animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar Todo'}
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
