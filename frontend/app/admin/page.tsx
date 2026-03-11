'use client';

import { useEffect, useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useOrdersAdmin } from '@/hooks/useOrdersAdmin';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { LogoCropModal } from '@/components/ui/LogoCropModal';
import { useToast } from '@/hooks/useToast';
import apiClient from '@/lib/api-client';
import Link from 'next/link';

interface PageSection {
  id: string;
  title: string;
  icon: string;
  meta: string;
  enabled: boolean;
}

export default function AdminDashboard() {
  const { products, fetchAll: fetchProducts } = useProducts();
  const { orders, fetchAll: fetchOrders } = useOrdersAdmin();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [savedLogoUrl, setSavedLogoUrl] = useState<string | null>(null);
  const [showLogoCrop, setShowLogoCrop] = useState(false);
  const [storeName, setStoreName] = useState('FlexiCommerce');
  const [primaryColor, setPrimaryColor] = useState('#0F1729');
  const [accentColor, setAccentColor] = useState('#6366F1');
  const [pageSections, setPageSections] = useState<PageSection[]>([
    {
      id: '1',
      title: 'Sección Slider Principal',
      icon: 'view_carousel',
      meta: '3 diapositivas · Reproducción automática',
      enabled: true,
    },
    {
      id: '2',
      title: 'Cuadrícula de Colecciones Destacadas',
      icon: 'grid_view',
      meta: '8 artículos · Solo escritorio',
      enabled: true,
    },
    {
      id: '3',
      title: 'Banner Promocional',
      icon: 'campaign',
      meta: 'Oferta Flash · Oculto',
      enabled: false,
    },
    {
      id: '4',
      title: 'Suscripción al Boletín',
      icon: 'email',
      meta: 'Popup + Bloque de pie de página',
      enabled: true,
    },
  ]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [editSectionMeta, setEditSectionMeta] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [applyingGlobally, setApplyingGlobally] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    // Cargar logo y configuración de branding guardada
    apiClient.get('/api/admin/settings')
      .then((res) => {
        const data = (res.data as any)?.data ?? res.data;
        if (data?.logoUrl) setSavedLogoUrl(data.logoUrl);
        if (data?.storeName) setStoreName(data.storeName);
        if (data?.primaryColor) setPrimaryColor(data.primaryColor);
        if (data?.accentColor) setAccentColor(data.accentColor);
        if (data?.font) setSelectedFont(data.font);
        if (typeof data?.maintenanceMode === 'boolean') setMaintenanceMode(data.maintenanceMode);
      })
      .catch(() => {});
  }, [fetchProducts, fetchOrders]);

  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const todayOrders = orders.filter((o) => {
    const today = new Date();
    const orderDate = new Date(o.createdAt || '');
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newSections = [...pageSections];
      const draggedSection = newSections[draggedIndex];
      newSections.splice(draggedIndex, 1);
      newSections.splice(dragOverIndex, 0, draggedSection);
      setPageSections(newSections);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const toggleSectionVisibility = (id: string) => {
    setPageSections((prevSections) =>
      prevSections.map((section) =>
        section.id === id ? { ...section, enabled: !section.enabled } : section
      )
    );
  };

  const handleEditSection = (section: PageSection) => {
    setEditingSectionId(section.id);
    setEditSectionTitle(section.title);
    setEditSectionMeta(section.meta);
  };

  const handleSaveSection = () => {
    if (!editSectionTitle.trim()) return;
    setPageSections((prev) =>
      prev.map((s) =>
        s.id === editingSectionId ? { ...s, title: editSectionTitle.trim(), meta: editSectionMeta.trim() } : s
      )
    );
    setEditingSectionId(null);
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    const icons = ['view_carousel', 'grid_view', 'campaign', 'email', 'stars', 'local_offer'];
    const newSection: PageSection = {
      id: `section-${Date.now()}`,
      title: newSectionTitle.trim(),
      icon: icons[pageSections.length % icons.length],
      meta: 'Nueva sección · Sin configurar',
      enabled: true,
    };
    setPageSections((prev) => [...prev, newSection]);
    setNewSectionTitle('');
    setAddingSection(false);
    toast({ message: 'Sección agregada. Haz clic en "Editor Completo" para configurarla.', type: 'success' });
  };

  const handleApplyGlobally = async () => {
    setApplyingGlobally(true);
    try {
      const logoToSave = logoPreview || savedLogoUrl || '';
      await apiClient.put('/api/admin/settings', {
        storeName,
        primaryColor,
        accentColor,
        font: selectedFont,
        maintenanceMode,
        logoUrl: logoToSave,
      });
      if (logoPreview) setSavedLogoUrl(logoPreview);
      toast({ message: 'Marca aplicada globalmente', type: 'success' });
    } catch {
      toast({ message: 'Error al aplicar. Configuración guardada localmente.', type: 'error' });
    } finally {
      setApplyingGlobally(false);
    }
  };

  const stats = [
    {
      label: 'Ventas Totales',
      value: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalRevenue),
      icon: 'trending_up',
      change: `${orders.length} órdenes`,
      changePositive: true,
      bg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Productos en Catálogo',
      value: products.length,
      icon: 'inventory_2',
      change: `${products.filter((p: any) => (p.stock ?? 0) === 0).length} sin stock`,
      changePositive: products.filter((p: any) => (p.stock ?? 0) === 0).length === 0,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Órdenes Pendientes',
      value: pendingOrders,
      icon: 'pending_actions',
      change: `${todayOrders} hoy`,
      changePositive: false,
      bg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Panel de Control CMS</h1>
          <p className="text-primary/60 text-sm mt-1">Centro de control FlexiCommerce</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-primary/60 font-medium">Todos los sistemas operativos</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-xl p-6 border border-primary/5`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`size-10 bg-white rounded-lg flex items-center justify-center ${stat.iconColor}`}>
                <MaterialIcon name={stat.icon} className="text-xl" />
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  stat.changePositive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-primary/60 font-medium mb-1">{stat.label}</p>
            <p className="text-3xl font-extrabold text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Page Builder + Store Branding */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page Builder */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between p-6 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
            <div>
              <h2 className="font-extrabold text-primary text-lg flex items-center gap-2">
                <MaterialIcon name="dashboard_customize" className="text-primary" />
                Constructor de Página: Inicio
              </h2>
              <p className="text-xs text-primary/40 mt-1">Arrastra secciones para reordenar • Clic para editar</p>
            </div>
            <Link
              href="/admin/cms"
              className="text-sm font-bold text-primary border border-primary rounded-lg px-4 py-2 hover:bg-primary hover:text-white transition-all duration-200"
            >
              Editor Completo
            </Link>
          </div>

          <div className="p-5 space-y-3">
            {pageSections.map((section, idx) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={() => handleDragOver(idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-move group ${
                  draggedIndex === idx
                    ? 'border-primary/50 bg-primary/20 opacity-50'
                    : dragOverIndex === idx
                    ? 'border-primary bg-primary/10 scale-105'
                    : section.enabled
                    ? 'border-primary/10 bg-primary/5 hover:bg-primary/10 hover:border-primary/20'
                    : 'border-primary/5 bg-gray-50 opacity-60'
                }`}
              >
                <MaterialIcon
                  name="drag_handle"
                  className={`text-2xl flex-shrink-0 transition-colors ${
                    draggedIndex === idx ? 'text-primary/60' : 'text-primary/30 group-hover:text-primary/50'
                  }`}
                />
                <div className={`size-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  section.enabled ? 'bg-primary text-white' : 'bg-primary/20 text-primary/40'
                }`}>
                  <MaterialIcon name={section.icon} className="text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  {editingSectionId === section.id ? (
                    <div className="flex flex-col gap-1">
                      <input
                        value={editSectionTitle}
                        onChange={(e) => setEditSectionTitle(e.target.value)}
                        className="w-full px-2 py-1 border border-primary/30 rounded text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Título de sección"
                        autoFocus
                      />
                      <input
                        value={editSectionMeta}
                        onChange={(e) => setEditSectionMeta(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Meta / descripción"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="font-bold text-primary text-sm">{section.title}</p>
                      <p className="text-xs text-primary/40">{section.meta}</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  {editingSectionId === section.id ? (
                    <>
                      <button
                        onClick={handleSaveSection}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingSectionId(null)}
                        className="px-3 py-1.5 border border-primary/10 rounded-lg text-xs font-bold hover:bg-primary/5 transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditSection(section)}
                        className="size-10 rounded-lg border border-primary/10 flex items-center justify-center text-primary/40 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                      >
                        <MaterialIcon name="edit" className="text-lg" />
                      </button>
                      <button
                        onClick={() => toggleSectionVisibility(section.id)}
                        className={`size-10 rounded-lg border flex items-center justify-center transition-all ${
                          section.enabled
                            ? 'border-success/30 text-success hover:bg-success/5 hover:border-success/50'
                            : 'border-primary/10 text-primary/40 hover:border-primary/30 hover:bg-primary/5'
                        }`}
                      >
                        <MaterialIcon name={section.enabled ? 'visibility' : 'visibility_off'} className="text-lg" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {addingSection ? (
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border-2 border-primary/30 mt-2">
                <MaterialIcon name="add_circle" className="text-primary text-xl shrink-0" />
                <input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') setAddingSection(false); }}
                  className="flex-1 px-3 py-1.5 border border-primary/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Nombre de sección..."
                  autoFocus
                />
                <button onClick={handleAddSection} disabled={!newSectionTitle.trim()} className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-40">Agregar</button>
                <button onClick={() => { setAddingSection(false); setNewSectionTitle(''); }} className="px-3 py-1.5 border border-primary/10 rounded-lg text-xs font-bold hover:bg-primary/5 transition-colors">Cancelar</button>
              </div>
            ) : (
              <button
                onClick={() => setAddingSection(true)}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-primary/20 text-primary/60 rounded-xl hover:border-primary/40 hover:text-primary transition-all text-sm font-bold mt-2 group"
              >
                <MaterialIcon name="add_circle" className="text-lg group-hover:scale-110 transition-transform" />
                Agregar Nueva Sección
              </button>
            )}
          </div>
        </div>

        {/* Store Branding Panel */}
        <div className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
            <h2 className="font-extrabold text-primary text-lg flex items-center gap-2">
              <MaterialIcon name="palette" className="text-primary" />
              Marca de la Tienda
            </h2>
            <p className="text-xs text-primary/40 mt-1">Personaliza la apariencia de tu tienda</p>
          </div>

          <div className="p-5 space-y-5">
            {/* Nombre de la Tienda */}
            <div>
              <p className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-2">Nombre de la Tienda</p>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ej: Mi Tienda Online"
                className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              />
              <p className="text-[10px] text-primary/30 mt-1">Se muestra en el navbar del ecommerce</p>
            </div>

            {/* Logo Upload con Crop */}
            <div>
              <p className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-3">Logo de la Tienda</p>
              {(logoPreview || savedLogoUrl) ? (
                <div className="rounded-xl border-2 border-primary/20 overflow-hidden bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview || savedLogoUrl!}
                    alt="Logo"
                    className="w-full h-20 object-contain p-2"
                  />
                  <div className="flex border-t border-primary/10">
                    <button
                      onClick={() => setShowLogoCrop(true)}
                      className="flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/5 transition-colors"
                    >
                      <MaterialIcon name="edit" className="text-sm" />
                      Editar
                    </button>
                    <div className="w-px bg-primary/10" />
                    <button
                      onClick={() => { setLogoPreview(null); setSavedLogoUrl(null); }}
                      className="flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <MaterialIcon name="delete" className="text-sm" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogoCrop(true)}
                  className="w-full border-2 border-dashed border-primary/20 rounded-xl p-5 flex flex-col items-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <MaterialIcon name="add_photo_alternate" className="text-primary/30 text-3xl" />
                  <p className="text-xs font-bold text-primary/50">Subir y ajustar logo</p>
                  <p className="text-[10px] text-primary/30">SVG, PNG, JPG · Máx. 3MB</p>
                </button>
              )}</div>
            {showLogoCrop && (
              <LogoCropModal
                onClose={() => setShowLogoCrop(false)}
                onSave={(dataUrl) => { setLogoPreview(dataUrl); setSavedLogoUrl(dataUrl); setShowLogoCrop(false); }}
              />
            )}

            {/* Primary Color Picker */}
            <div>
              <p className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-3">Color Primario</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="size-12 rounded-lg cursor-pointer border border-primary/10 hover:border-primary/30 transition-colors"
                  title="Click to pick color"
                />
                <div className="flex-1">
                  <code className="text-sm font-bold text-primary bg-primary/5 px-3 py-2 rounded-lg block">
                    {primaryColor}
                  </code>
                </div>
              </div>
            </div>

            {/* Accent Color Picker */}
            <div>
              <p className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-3">Color de Acento</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="size-12 rounded-lg cursor-pointer border border-primary/10 hover:border-primary/30 transition-colors"
                  title="Click to pick color"
                />
                <div className="flex-1">
                  <code className="text-sm font-bold text-primary bg-primary/5 px-3 py-2 rounded-lg block">
                    {accentColor}
                  </code>
                </div>
              </div>
            </div>

            {/* Font */}
            <div>
              <p className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-3">Fuente Global</p>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white hover:border-primary/20 transition-colors"
              >
                <option>Inter</option>
                <option>Montserrat</option>
                <option>Playfair Display</option>
                <option>Roboto</option>
              </select>
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
              <div>
                <p className="text-sm font-bold text-primary">Modo Mantenimiento</p>
                <p className="text-xs text-primary/40">Ocultar tienda a los visitantes</p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  maintenanceMode ? 'bg-red-500' : 'bg-primary/20'
                }`}
              >
                <span
                  className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                    maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleApplyGlobally}
              disabled={applyingGlobally}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {applyingGlobally && <MaterialIcon name="sync" className="text-base animate-spin" />}
              {applyingGlobally ? 'Aplicando...' : 'Aplicar Globalmente'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/products"
          className="bg-white rounded-xl border border-primary/10 p-5 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="size-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <MaterialIcon name="inventory_2" className="text-2xl text-orange-600" />
          </div>
          <div>
            <h2 className="font-extrabold text-primary">Administrar Productos</h2>
            <p className="text-sm text-primary/60">{products.length} productos en catálogo</p>
          </div>
          <MaterialIcon name="arrow_forward" className="text-primary/30 ml-auto" />
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white rounded-xl border border-primary/10 p-5 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="size-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <MaterialIcon name="shopping_cart" className="text-2xl text-blue-600" />
          </div>
          <div>
            <h2 className="font-extrabold text-primary">Ver Órdenes</h2>
            <p className="text-sm text-primary/60">{orders.length} órdenes en total</p>
          </div>
          <MaterialIcon name="arrow_forward" className="text-primary/30 ml-auto" />
        </Link>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-primary/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-primary">Órdenes Recientes</h2>
            <Link href="/admin/orders" className="text-sm font-bold text-primary hover:text-primary/70 flex items-center gap-1">
              Ver todas <MaterialIcon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
          {orders.slice(0, 5).length === 0 ? (
            <div className="text-center py-8">
              <MaterialIcon name="receipt_long" className="text-primary/20 text-4xl mb-3" />
              <p className="text-primary/40 text-sm">Sin órdenes aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2.5 border-b border-primary/5 last:border-0"
                >
                  <div>
                    <p className="font-bold text-primary text-sm">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-primary/40">
                      {new Date(order.createdAt || '').toLocaleDateString('es-CO')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {({'pending': 'Pendiente', 'processing': 'Procesando', 'delivered': 'Entregado', 'cancelled': 'Cancelado', 'shipped': 'Enviado'} as Record<string,string>)[order.status] ?? order.status}
                    </span>
                    <p className="font-extrabold text-primary text-sm">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(order.total))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-primary/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-primary">Mejores Productos</h2>
            <Link href="/admin/products" className="text-sm font-bold text-primary hover:text-primary/70 flex items-center gap-1">
              Ver todos <MaterialIcon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
          {products.slice(0, 5).length === 0 ? (
            <div className="text-center py-8">
              <MaterialIcon name="inventory_2" className="text-primary/20 text-4xl mb-3" />
              <p className="text-primary/40 text-sm">Sin productos aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((product, idx) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 py-2.5 border-b border-primary/5 last:border-0"
                >
                  <span className="text-xs font-extrabold text-primary/30 w-4">{idx + 1}</span>
                  <div className="flex-1">
                    <p className="font-bold text-primary text-sm">{product.name}</p>
                    <p className="text-xs text-primary/40">Stock: {product.stock}</p>
                  </div>
                  <p className="font-extrabold text-primary text-sm">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(product.price))}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
