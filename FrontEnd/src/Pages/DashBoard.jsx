// src/Pages/DashBoard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaPlus, FaSearch, FaReceipt, FaStore, FaTimes, FaCloudUploadAlt, FaShieldAlt } from 'react-icons/fa';
import { Receipt, UploadCloud, Store, TrendingUp, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import AddBillPhotoInfo from '../components/AddBillPhotoInfo';
import BillGrid from '../components/BillGrid';
import BillDetailModal from '../components/BillDetailModal';
import CustomerDigitalBills from '../components/CustomerDigitalBills';
import LoadingSpinner from '../components/LoadingSpinner';

// Services & Context
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { isCustomerAuth: isAuthenticated, customerUser } = useAuth();

  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [storeStats, setStoreStats] = useState({ storeBillCount: 0, warrantyItemCount: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchBills = useCallback(async () => {
    if (!isAuthenticated) { setBills([]); return; }
    setIsLoading(true);
    try {
      const response = await api.get('/bills/getBills');
      if (response.data?.success) {
        setBills(response.data.bills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else { setBills([]); }
    } catch (err) {
      console.error("Error fetching bills:", err);
      setError("Could not load your bills.");
    } finally { setIsLoading(false); }
  }, [isAuthenticated]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const filteredBills = useMemo(() => {
    if (!searchTerm.trim()) return bills;
    const lowerTerm = searchTerm.toLowerCase();
    return bills.filter(bill =>
      bill.billName?.toLowerCase().includes(lowerTerm) ||
      bill.shopName?.toLowerCase().includes(lowerTerm)
    );
  }, [bills, searchTerm]);

  const handleBillAdded = (newBill) => { setBills(prev => [newBill, ...prev]); setIsAddModalOpen(false); };
  const handleBillClick = (bill) => { setSelectedBill(bill); setIsDetailModalOpen(true); };
  const handleCloseDetail = () => { setIsDetailModalOpen(false); setTimeout(() => setSelectedBill(null), 300); };
  const handleUpdateBill = (updatedBill) => { setBills(prev => prev.map(b => b._id === updatedBill._id ? updatedBill : b)); };
  const handleDeleteBill = (id) => { setBills(prev => prev.filter(b => b._id !== id)); setIsDetailModalOpen(false); };
  const handleStoreStats = useCallback((stats) => { setStoreStats(stats); }, []);

  const firstName = customerUser?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className={`min-h-screen w-full bg-gray-50 transition-opacity duration-700 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #ea580c 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative max-w-screen-xl mx-auto px-6 lg:px-8 py-10">
          {/* Top row: greeting + add button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-1 flex items-center gap-2">
                <Sparkles size={13} /> {greeting}
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                {firstName}'s <span className="text-orange-400">Bills Hub</span>
              </h1>
              <p className="text-indigo-200 text-sm mt-2">All your purchases and receipts in one place</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={!isAuthenticated}
              className="flex items-center gap-2.5 px-6 py-3 bg-white text-orange-600 font-bold rounded-2xl shadow-xl hover:shadow-orange-200/50 hover:-translate-y-px transition-all text-sm active:translate-y-0 disabled:opacity-50"
            >
              <FaPlus /> Upload a Bill
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            {[
              { icon: <UploadCloud size={18} />, label: 'Uploaded Bills', value: bills.length, color: 'from-indigo-500/30 to-indigo-600/20' },
              { icon: <Store size={18} />, label: 'Store Bills', value: storeStats.storeBillCount, color: 'from-orange-500/30 to-orange-600/20' },
              { icon: <FaShieldAlt size={14} />, label: 'Warranties Active', value: storeStats.warrantyItemCount, color: 'from-emerald-500/30 to-emerald-600/20' },
            ].map((stat, i) => (
              <div key={i} className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-white`}>
                <div className="flex items-center gap-2 text-white/70 text-[11px] font-semibold uppercase tracking-wide mb-2">
                  {stat.icon} {stat.label}
                </div>
                <div className="text-2xl font-black">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
            <input
              type="text"
              placeholder="Search by shop name, item, bill number, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-12 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all backdrop-blur-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                <FaTimes size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* SECTION 1: Digital Store Bills */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
              <Store size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 leading-tight">Digital Store Bills</h2>
              <p className="text-xs text-gray-500">Bills sent to you directly by retailers</p>
            </div>
            <div className="ml-auto h-px flex-1 bg-gradient-to-r from-orange-200 to-transparent max-w-xs hidden sm:block" />
          </div>
          <CustomerDigitalBills searchTerm={searchTerm} onStatsUpdate={handleStoreStats} />
        </section>

        {/* SECTION 2: Uploaded Bills */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <UploadCloud size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 leading-tight">Your Uploaded Bills</h2>
              <p className="text-xs text-gray-500">Photos and receipts you've added manually</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                {filteredBills.length} bills
              </span>
            </div>
          </div>

          {isLoading && (
            <div className="py-16 flex justify-center">
              <LoadingSpinner />
            </div>
          )}

          {!isLoading && filteredBills.length > 0 && (
            <BillGrid bills={filteredBills} isLoading={false} onBillClick={handleBillClick} />
          )}

          {!isLoading && filteredBills.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UploadCloud size={28} className="text-indigo-400" />
              </div>
              {searchTerm ? (
                <>
                  <p className="text-gray-600 font-semibold text-lg">No uploaded bills match</p>
                  <p className="text-gray-400 text-sm mt-1 mb-4">"{searchTerm}"</p>
                  <button onClick={() => setSearchTerm('')}
                    className="text-orange-500 hover:text-orange-600 text-sm font-semibold hover:underline">
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 font-semibold text-lg">No bills uploaded yet</p>
                  <p className="text-gray-400 text-sm mt-1 mb-5">Upload a photo of any receipt to keep track of it</p>
                  <button onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-orange-200">
                    <FaPlus size={12} /> Upload Your First Bill
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddBillPhotoInfo
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleBillAdded}
        />
      )}

      {selectedBill && (
        <BillDetailModal
          isOpen={isDetailModalOpen}
          bill={selectedBill}
          onClose={handleCloseDetail}
          onUpdate={handleUpdateBill}
          onDelete={handleDeleteBill}
        />
      )}
    </div>
  );
};

export default Dashboard;