// src/components/BillGrid.jsx
import React from 'react';
import { UploadCloud, Calendar, IndianRupee, Image } from 'lucide-react';

const tagColors = [
  'bg-orange-500', 'bg-indigo-500', 'bg-emerald-500',
  'bg-violet-500', 'bg-rose-500', 'bg-sky-500',
];

const BillGrid = ({ bills, isLoading, error, onBillClick }) => {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            <div className="h-1.5 bg-gray-200 w-full" />
            <div className="h-52 bg-gray-100" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-50 border border-red-100 rounded-2xl max-w-lg mx-auto">
        <p className="text-base font-semibold text-red-700 mb-1">Failed to load bills</p>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!bills || bills.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UploadCloud size={28} className="text-indigo-400" />
        </div>
        <p className="text-gray-700 font-semibold text-lg">No bills yet</p>
        <p className="text-gray-400 text-sm mt-1">Upload a receipt to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {bills.map((bill, index) => {
        const tagColor = tagColors[index % tagColors.length];
        const total = bill.items?.reduce((s, i) => s + (Number(i.cost) || 0), 0) || 0;
        const dateStr = bill.purchaseDate
          ? new Date(bill.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : '—';
        const initials = bill.shopName?.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

        return (
          <div
            key={bill._id}
            onClick={() => onBillClick && onBillClick(bill)}
            role="button"
            tabIndex={0}
            onKeyPress={e => e.key === 'Enter' && onBillClick && onBillClick(bill)}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          >
            {/* Top accent bar */}
            <div className={`h-1.5 w-full ${tagColor}`} />

            {/* Image / Placeholder */}
            {bill.billImageUrl ? (
              <div className="h-44 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 p-3">
                <img
                  src={bill.billImageUrl}
                  alt={`Bill for ${bill.billName}`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-100">
                <div className={`w-14 h-14 rounded-2xl ${tagColor} bg-opacity-15 flex items-center justify-center mb-2`}>
                  <span className={`text-xl font-black ${tagColor.replace('bg-', 'text-')}`}>{initials}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Image size={11} /> No image
                </span>
              </div>
            )}

            {/* Card body */}
            <div className="p-4">
              <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-orange-600 transition-colors" title={bill.billName}>
                {bill.billName || bill.shopName || 'Untitled Bill'}
              </h3>
              {bill.shopName && bill.billName !== bill.shopName && (
                <p className="text-xs text-gray-400 font-medium truncate mt-0.5">{bill.shopName}</p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                  <Calendar size={11} />
                  {dateStr}
                </span>
                {total > 0 && (
                  <span className="flex items-center gap-0.5 text-sm font-black text-gray-800">
                    <IndianRupee size={12} />
                    {total.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BillGrid;