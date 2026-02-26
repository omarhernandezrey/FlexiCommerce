'use client';

import { useState, useEffect, useCallback } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProtectedRoute } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/useToast';
import apiClient from '@/lib/api-client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  parentId?: string | null;
  productCount?: number;
  isActive: boolean;
}

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  image: '',
  parentId: '',
  isActive: true,
};

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/categories');
      setCategories(res.data.categories || res.data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : generateSlug(name),
    }));
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (cat: Category) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image || '',
      parentId: cat.parentId || '',
      isActive: cat.isActive,
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast({ message: 'Name and slug are required', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        image: form.image || undefined,
        parentId: form.parentId || undefined,
        isActive: form.isActive,
      };

      if (editingId) {
        await apiClient.put(`/categories/${editingId}`, payload);
        toast({ message: 'Category updated successfully', type: 'success' });
      } else {
        await apiClient.post('/categories', payload);
        toast({ message: 'Category created successfully', type: 'success' });
      }
      await fetchCategories();
      handleCancel();
    } catch {
      toast({ message: 'Error saving category. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This may affect associated products.`)) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast({ message: 'Category deleted', type: 'success' });
    } catch {
      toast({ message: 'Error deleting category', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await apiClient.put(`/categories/${cat.id}`, { ...cat, isActive: !cat.isActive });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c))
      );
      toast({ message: `Category ${!cat.isActive ? 'activated' : 'deactivated'}`, type: 'success' });
    } catch {
      toast({ message: 'Error updating category status', type: 'error' });
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rootCategories = filtered.filter((c) => !c.parentId);
  const parentOptions = categories.filter((c) => !c.parentId);

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-primary">Categories</h1>
            <p className="text-primary/50 text-sm mt-0.5">{categories.length} categories total</p>
          </div>
          {!showForm && (
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
            >
              <MaterialIcon name="add" className="text-base" />
              New Category
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-primary/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-extrabold text-primary text-lg">
                {editingId ? 'Edit Category' : 'New Category'}
              </h2>
              <button onClick={handleCancel} className="text-primary/40 hover:text-primary transition-colors">
                <MaterialIcon name="close" className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    placeholder="e.g. Electronics"
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    required
                    placeholder="e.g. electronics"
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of this category..."
                  className="w-full px-3 py-2 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Image URL</label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Parent Category</label>
                  <select
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">None (root category)</option>
                    {parentOptions.filter((p) => p.id !== editingId).map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="size-4 accent-primary"
                />
                <span className="text-sm font-semibold text-primary">Active (visible in storefront)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCancel} className="flex-1 py-2.5 border-2 border-primary text-primary font-bold rounded-xl text-sm hover:bg-primary/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <MaterialIcon name="hourglass_bottom" className="text-base" />}
                  {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-base" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 border border-primary/10 rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Categories Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-primary/10 p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-primary/10 p-16 text-center">
            <MaterialIcon name="category" className="text-5xl text-primary/20 mb-4" />
            <h3 className="font-extrabold text-primary text-lg mb-2">
              {searchTerm ? 'No categories match your search' : 'No categories yet'}
            </h3>
            {!searchTerm && (
              <button onClick={openAddForm} className="mt-4 inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors">
                <MaterialIcon name="add" className="text-base" />
                Create First Category
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left px-5 py-3 text-xs font-bold text-primary/40 uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-primary/40 uppercase tracking-wider hidden sm:table-cell">Slug</th>
                  <th className="text-center px-5 py-3 text-xs font-bold text-primary/40 uppercase tracking-wider hidden md:table-cell">Products</th>
                  <th className="text-center px-5 py-3 text-xs font-bold text-primary/40 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-primary/40 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filtered.map((cat) => {
                  const subCats = categories.filter((c) => c.parentId === cat.id);
                  return (
                    <>
                      <tr key={cat.id} className="hover:bg-primary/2 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {cat.image ? (
                              <img src={cat.image} alt={cat.name} className="size-10 rounded-lg object-cover" />
                            ) : (
                              <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <MaterialIcon name="category" className="text-primary text-base" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-primary text-sm">{cat.name}</p>
                              {cat.description && (
                                <p className="text-xs text-primary/40 line-clamp-1 mt-0.5 max-w-xs">{cat.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="font-mono text-xs text-primary/60 bg-primary/5 px-2 py-1 rounded">
                            {cat.slug}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center hidden md:table-cell">
                          <span className="text-sm font-bold text-primary/70">
                            {cat.productCount ?? '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleToggleActive(cat)}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
                              cat.isActive
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-primary/5 text-primary/50 hover:bg-primary/10'
                            }`}
                          >
                            <span className={`size-1.5 rounded-full ${cat.isActive ? 'bg-green-500' : 'bg-primary/30'}`} />
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditForm(cat)}
                              className="size-8 flex items-center justify-center rounded-lg hover:bg-primary/5 text-primary/40 hover:text-primary transition-colors"
                              title="Edit"
                            >
                              <MaterialIcon name="edit" className="text-base" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id, cat.name)}
                              disabled={deletingId === cat.id}
                              className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-primary/40 hover:text-red-500 transition-colors disabled:opacity-40"
                              title="Delete"
                            >
                              <MaterialIcon name="delete" className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Subcategories */}
                      {subCats.map((sub) => (
                        <tr key={sub.id} className="bg-primary/2 hover:bg-primary/5 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3 pl-8">
                              <MaterialIcon name="subdirectory_arrow_right" className="text-primary/30 text-sm" />
                              <span className="font-semibold text-primary/80 text-sm">{sub.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 hidden sm:table-cell">
                            <span className="font-mono text-xs text-primary/50 bg-primary/5 px-2 py-1 rounded">{sub.slug}</span>
                          </td>
                          <td className="px-5 py-3 text-center hidden md:table-cell">
                            <span className="text-sm text-primary/50">{sub.productCount ?? '—'}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sub.isActive ? 'bg-green-50 text-green-700' : 'bg-primary/5 text-primary/40'}`}>
                              {sub.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEditForm(sub)} className="size-8 flex items-center justify-center rounded-lg hover:bg-primary/5 text-primary/40 hover:text-primary transition-colors">
                                <MaterialIcon name="edit" className="text-base" />
                              </button>
                              <button onClick={() => handleDelete(sub.id, sub.name)} disabled={deletingId === sub.id} className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-primary/40 hover:text-red-500 transition-colors disabled:opacity-40">
                                <MaterialIcon name="delete" className="text-base" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
