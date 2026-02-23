'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

export default function OrdersPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchId, setSearchId] = useState('');
  const [dateRange, setDateRange] = useState('all');

  const orders = [
    {
      id: 'FCM-2024-001234',
      date: '17 Feb 2024',
      total: '$299.00',
      status: 'delivered',
      items: 1,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGsRLZqCj7FPTBBjxRBIsAeCWi9IS2fOgBb2GtswkIb91SPBGd67oY_qXeVNoLs7hxAHHKLkm62G8xRgmoQkPpuq9R196SIDVxGNaMuFjgga0h4mZtpp6UJ7fLI9vFIYumBkt6P0jaXsGtkRlV5MgVDKzZ564IOgSSPeFkbHLtotiT1inZGj1NcudW1L_f8bJidqpsWVXE9N0dCy8hyXOqggp-4W7MS2tUQpBnlznJ4cTgrmyAvVVIgtq3118P9cs-U8l_uWZD6pc',
    },
    {
      id: 'FCM-2024-001233',
      date: '15 Feb 2024',
      total: '$189.50',
      status: 'shipping',
      items: 1,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXTpVfxs1db62dokgKW758D77TDsVrhik1b_aLd5Ye3ogBXIo1XStPxpPoknzerd4ofRur1xQRSQvBrmSCsc0kprITAkRNjKvMbEH-6bXmBnzSt9h1Fym9uxPBvTJOiIp0FKH0IHFhjvXLqiKGIxwsKqp1xn0h15lbyR8THDHy8yGkqmZt9lRaaeuM0244zooz2tK5pLu8E2WY0RypRMtT_3_SBKAqBSuX7Rxu99KljBMAoT0vODTpz3_s_bLVYjjIv99WRTpQskk',
    },
    {
      id: 'FCM-2024-001232',
      date: '10 Feb 2024',
      total: '$120.00',
      status: 'pending',
      items: 2,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3STeNq8civLDlVuPkmcTIQ4SDguNu93vf1LqpN1q4q-I2_Ko_hjWygl9plMApINyRVzOeWPmjmfoNBLH6Zg1hb_O5Ns03-I6A9938zh2TTXfwdCOZAviCeCRhPKXZTaOokCxgbsEekLITcAsWOSR29RwNeru0mUDeOAJSj7YGEOKdTKLz5Kr7mX2IJ3z0HsKqieOn47XbSTb2j9mBJbQ8A9eI4rJdwrw-2uQaj5F-61WjYBKdmDOZorXciPE3JuF38UIDNCfxvWw',
    },
  ];

  const statusConfig = {
    pending: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
    shipping: { label: 'Shipped', color: 'bg-yellow-100 text-yellow-700' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600' },
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch = searchId === '' || o.id.toLowerCase().includes(searchId.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="spacing-section">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-primary">Order History</h1>
          <p className="text-primary/60 text-sm mt-1">{orders.length} orders total</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm font-bold text-primary hover:bg-primary/5 transition-colors">
          <MaterialIcon name="download" className="text-base" />
          Export CSV
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-xl border border-primary/10 p-4 spacing-section">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MaterialIcon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-base"
              />
              <input
                type="text"
                placeholder="Search by Order ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-9 pr-4 h-10 border border-primary/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Date Range */}
            <div className="relative">
              <MaterialIcon
                name="calendar_today"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-base pointer-events-none"
              />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none pl-9 pr-8 h-10 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="30d">Last 30 days</option>
                <option value="3m">Last 3 months</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <MaterialIcon
                name="expand_more"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none text-base"
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Processing' },
              { value: 'shipping', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setFilterStatus(status.value)}
                className={`px-4 h-10 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                  filterStatus === status.value
                    ? 'bg-primary text-white'
                    : 'border border-primary/10 text-primary/60 hover:border-primary/30 hover:text-primary'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="spacing-section">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig];
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-primary/10 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-primary/10 flex-shrink-0">
                    <img
                      src={order.image}
                      alt="Order"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <p className="font-extrabold text-primary text-sm">{order.id}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-primary/40">{order.date}</p>
                    <p className="text-xs text-primary/60 mt-1">
                      {order.items} item{order.items !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Total and Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                    <p className="text-xl font-extrabold text-primary">{order.total}</p>
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors text-sm whitespace-nowrap"
                    >
                      View Details
                      <MaterialIcon name="arrow_forward" className="text-base" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-primary/10">
          <MaterialIcon name="shopping_bag" className="text-primary/20 text-6xl mb-4" />
          <p className="text-primary font-bold mb-2">No orders found</p>
          <p className="text-primary/40 text-sm mb-6">Try adjusting your filters</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <MaterialIcon name="storefront" className="text-base" />
            Start Shopping
          </Link>
        </div>
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
          <p className="text-sm text-primary/40">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm font-semibold text-primary/60 hover:border-primary/30 hover:text-primary transition-colors">
              <MaterialIcon name="chevron_left" className="text-base" />
              Previous
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`size-9 rounded-lg text-sm font-bold transition-colors ${
                  page === 1
                    ? 'bg-primary text-white'
                    : 'border border-primary/10 text-primary hover:bg-primary/5'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm font-semibold text-primary hover:border-primary/30 transition-colors">
              Next
              <MaterialIcon name="chevron_right" className="text-base" />
            </button>
          </div>
        </div>
      )}

      {/* Support Banner */}
      <div className="bg-primary/5 rounded-xl border border-primary/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <MaterialIcon name="support_agent" className="text-primary text-2xl" />
          </div>
          <div>
            <p className="font-extrabold text-primary">Need help with an order?</p>
            <p className="text-sm text-primary/60">Our support team is available 24/7</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-colors text-sm">
            Visit Help Center
          </button>
          <button className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm">
            Chat with Support
          </button>
        </div>
      </div>
    </div>
  );
}
