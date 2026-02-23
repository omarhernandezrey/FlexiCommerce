'use client';

import { useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

const CMS_SECTIONS = [
  {
    id: 'hero',
    title: 'Hero Slider Section',
    subtitle: '3 Slides • Auto-play active',
    icon: 'imagesmode',
    color: 'bg-indigo-50 text-indigo-600',
    visible: true,
  },
  {
    id: 'grid',
    title: 'Featured Collections Grid',
    subtitle: '8 Items • Desktop only',
    icon: 'grid_view',
    color: 'bg-emerald-50 text-emerald-600',
    visible: true,
  },
  {
    id: 'banner',
    title: 'Promo Banner Bar',
    subtitle: 'Flash Sale Countdown • Top Position',
    icon: 'ads_click',
    color: 'bg-orange-50 text-orange-600',
    visible: false,
  },
  {
    id: 'newsletter',
    title: 'Newsletter Subscription',
    subtitle: 'Popup + Footer Block',
    icon: 'mail',
    color: 'bg-blue-50 text-blue-600',
    visible: true,
  },
];

const FONT_OPTIONS = ['Inter (Default)', 'Montserrat', 'Playfair Display', 'Roboto'];

export default function CMSDashboardPage() {
  const [sections, setSections] = useState(CMS_SECTIONS);
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleVisibility = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background-light p-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            label: 'Total Sales',
            value: '$128,430.00',
            sub: '+12.5% from last month',
            subColor: 'text-emerald-600',
            subIcon: 'trending_up',
            icon: 'payments',
          },
          {
            label: 'Active Stores',
            value: '42',
            sub: 'Healthy status',
            subColor: 'text-emerald-600',
            subIcon: 'check_circle',
            icon: 'storefront',
          },
          {
            label: 'Pending Orders',
            value: '156',
            sub: '12 urgent requests',
            subColor: 'text-amber-600',
            subIcon: 'schedule',
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
              <h2 className="text-xl font-bold text-slate-900">Page Builder: Homepage</h2>
              <p className="text-sm text-slate-500">Manage sections and layout of your store landing page.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                Preview
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                {saved ? 'Saved!' : 'Save Changes'}
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

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900">{section.title}</h4>
                  <p className="text-xs text-slate-500 uppercase tracking-tighter mt-0.5">{section.subtitle}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleVisibility(section.id)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title={section.visible ? 'Hide Section' : 'Show Section'}
                  >
                    <MaterialIcon
                      name={section.visible ? 'visibility' : 'visibility_off'}
                      className="text-xl"
                    />
                  </button>
                  <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Section */}
            <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
              <MaterialIcon name="add_circle" className="text-xl" />
              Add New Section
            </button>
          </div>
        </div>

        {/* Store Branding Panel - Right Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sticky top-6">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MaterialIcon name="style" className="text-primary text-xl" />
              Store Branding
            </h3>

            <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Store Logo</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="size-10 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                    <MaterialIcon name="upload_file" className="text-slate-400 text-xl" />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">Click to upload or drag logo file</p>
                  <p className="text-[8px] text-slate-400 mt-1">SVG, PNG or JPG (max 2MB)</p>
                </div>
              </div>

              {/* Brand Colors */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Brand Colors</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded bg-primary border border-white shadow-sm"></div>
                      <span className="text-xs font-medium">Primary</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      #0F1729
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded bg-indigo-500 border border-white shadow-sm"></div>
                      <span className="text-xs font-medium">Accent</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      #6366F1
                    </span>
                  </div>
                  <button className="w-full py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                    Edit Palette
                  </button>
                </div>
              </div>

              {/* Typography */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Global Font</label>
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
                    <p className="text-xs font-bold text-slate-900">Maintenance Mode</p>
                    <p className="text-[10px] text-slate-500">Hide store from public</p>
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

              <button className="w-full py-3 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                Apply Globally
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
