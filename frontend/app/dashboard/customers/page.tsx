'use client';

import React, { useState } from 'react';
import { DashboardSidebar, DashboardHeader } from '@/components/dashboard/Sidebar';
import { ChartContainer, DataTable } from '@/components/dashboard/Cards';
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';

const mockCustomers = [
  {
    id: 'CUST-001',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '555-0001',
    city: 'México City',
    orders: 5,
    spent: '$1,245.99',
    joined: '2024-01-15',
    status: 'Activo',
  },
  {
    id: 'CUST-002',
    name: 'María García',
    email: 'maria@example.com',
    phone: '555-0002',
    city: 'Guadalajara',
    orders: 12,
    spent: '$3,850.50',
    joined: '2023-11-20',
    status: 'VIP',
  },
  {
    id: 'CUST-003',
    name: 'Carlos López',
    email: 'carlos@example.com',
    phone: '555-0003',
    city: 'Monterrey',
    orders: 3,
    spent: '$645.75',
    joined: '2024-02-01',
    status: 'Activo',
  },
  {
    id: 'CUST-004',
    name: 'Ana Rodríguez',
    email: 'ana@example.com',
    phone: '555-0004',
    city: 'Cancún',
    orders: 1,
    spent: '$95.25',
    joined: '2024-02-10',
    status: 'Nuevo',
  },
  {
    id: 'CUST-005',
    name: 'Pedro Martínez',
    email: 'pedro@example.com',
    phone: '555-0005',
    city: 'Puebla',
    orders: 0,
    spent: '$0.00',
    joined: '2024-02-12',
    status: 'Inactivo',
  },
];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    'VIP': 'bg-purple-100 text-purple-800',
    'Activo': 'bg-green-100 text-green-800',
    'Nuevo': 'bg-blue-100 text-blue-800',
    'Inactivo': 'bg-gray-100 text-gray-800',
  };

  const customerStats = [
    {
      label: 'Total de Clientes',
      value: mockCustomers.length,
      color: 'blue',
    },
    {
      label: 'VIP',
      value: mockCustomers.filter((c) => c.status === 'VIP').length,
      color: 'purple',
    },
    {
      label: 'Nuevos (7 días)',
      value: mockCustomers.filter((c) => c.status === 'Nuevo').length,
      color: 'green',
    },
    {
      label: 'Inactivos',
      value: mockCustomers.filter((c) => c.status === 'Inactivo').length,
      color: 'red',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1 lg:ml-64">
        <DashboardHeader />

        <main className="p-6 lg:p-8">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Clientes</h2>
            <p className="text-gray-600 mt-1">Gestiona tu base de clientes</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-8">
            {customerStats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente por nombre, email o teléfono..."
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
                <option value="all">Todos</option>
                <option value="VIP">VIP</option>
                <option value="Activo">Activo</option>
                <option value="Nuevo">Nuevo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Customers List */}
          <ChartContainer title={`Clientes (${filteredCustomers.length})`}>
            <div className="space-y-3">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColors[customer.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {customer.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{customer.city}</span>
                      </div>
                      <div className="text-right md:text-left">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Gastado</p>
                        <p className="font-semibold text-gray-900">{customer.spent}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      <span>📦 {customer.orders} pedidos</span>
                      <span>📅 Unido: {customer.joined}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 md:mt-0">
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
                </div>
              ))}
            </div>
          </ChartContainer>
        </main>
      </div>
    </div>
  );
}
