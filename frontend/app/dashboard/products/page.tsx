'use client';

import React, { useState } from 'react';
import { DashboardSidebar, DashboardHeader } from '@/components/dashboard/Sidebar';
import { ChartContainer, DataTable } from '@/components/dashboard/Cards';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Filter,
} from 'lucide-react';

const mockProducts = [
  {
    id: 'PROD-001',
    name: 'Laptop Pro 15"',
    category: 'Electrónica',
    price: '$1,299.99',
    stock: 45,
    sales: 234,
    status: 'Activo',
    image: '🖥️',
  },
  {
    id: 'PROD-002',
    name: 'Mouse Inalámbrico',
    category: 'Accesorios',
    price: '$29.99',
    stock: 342,
    sales: 1205,
    status: 'Activo',
    image: '🖱️',
  },
  {
    id: 'PROD-003',
    name: 'Teclado Mecánico',
    category: 'Accesorios',
    price: '$99.99',
    stock: 128,
    sales: 856,
    status: 'Activo',
    image: '⌨️',
  },
  {
    id: 'PROD-004',
    name: 'Monitor 27"',
    category: 'Electrónica',
    price: '$349.99',
    stock: 35,
    sales: 342,
    status: 'Activo',
    image: '🖥️',
  },
  {
    id: 'PROD-005',
    name: 'Webcam HD',
    category: 'Accesorios',
    price: '$89.99',
    stock: 8,
    sales: 156,
    status: 'Bajo Stock',
    image: '📷',
  },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    'Activo': 'bg-green-100 text-green-800',
    'Inactivo': 'bg-red-100 text-red-800',
    'Bajo Stock': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1 lg:ml-64">
        <DashboardHeader />

        <main className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Productos</h2>
              <p className="text-gray-600 mt-1">Gestiona tu catálogo de productos</p>
            </div>
            <button className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold">
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Bajo Stock">Bajo Stock</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <ChartContainer title={`Productos (${filteredProducts.length})`}>
            <DataTable
              columns={[
                {
                  key: 'image',
                  label: '',
                  render: (value) => <span className="text-2xl">{value}</span>,
                },
                { key: 'name', label: 'Nombre' },
                { key: 'category', label: 'Categoría' },
                { key: 'price', label: 'Precio' },
                {
                  key: 'stock',
                  label: 'Stock',
                  render: (value) => (
                    <span className={value < 50 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                      {value} {value < 50 && '⚠️'}
                    </span>
                  ),
                },
                { key: 'sales', label: 'Ventas' },
                {
                  key: 'status',
                  label: 'Estado',
                  render: (value) => (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[value] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {value}
                    </span>
                  ),
                },
                {
                  key: 'id',
                  label: 'Acciones',
                  render: () => (
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ),
                },
              ]}
              data={filteredProducts}
            />
          </ChartContainer>
        </main>
      </div>
    </div>
  );
}
