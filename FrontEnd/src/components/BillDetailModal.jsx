import React, { useState, useEffect } from 'react';

import toast from 'react-hot-toast';
import {
    FaEdit, FaTrash, FaTimes, FaSave, FaUndo, FaPlus, FaMinus,
    FaImage, FaFilePdf, FaSpinner, FaMapMarkerAlt,
    FaShieldAlt, FaStore, FaCalendarAlt, FaUser, FaPhone, FaEnvelope
} from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BillDetailModal = ({ bill, isOpen, onClose, onUpdate, onDelete, isEditable = true }) => {
    const { customerUser: user } = useAuth();

    // --- State ---
    const [isEditing, setIsEditing] = useState(false);
    const [editableBillData, setEditableBillData] = useState({
        billName: '', shopName: '', purchaseDate: '', billImageUrl: null,
        items: [], _id: null, shopPhoneNumber: '', shopAddress: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // --- Animation & Init ---
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setShowModal(true), 50);
            return () => clearTimeout(timer);
        } else {
            setShowModal(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (bill && isOpen) {
            const formattedDate = bill.purchaseDate ? new Date(bill.purchaseDate).toISOString().split('T')[0] : '';
            setEditableBillData({
                ...bill,
                purchaseDate: formattedDate,
                // Ensure items is a copy
                items: bill.items ? JSON.parse(JSON.stringify(bill.items)) : [],
                shopPhoneNumber: bill.shopPhoneNumber || '',
                shopAddress: bill.shopAddress || ''
            });

            // Reset edit state
            if (!isEditing || (editableBillData._id !== bill._id)) {
                setSelectedFile(null);
                setPreviewUrl(null);
                setIsDirty(false);
            }
        }
        // eslint-disable-next-line
    }, [bill?._id, isOpen]);

    // --- Helpers ---
    const [isDirty, setIsDirty] = useState(false);

    // Preview Handler
    useEffect(() => {
        if (!selectedFile) { setPreviewUrl(null); return; }
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    // --- Handlers ---
    const handleChange = (e) => {
        setEditableBillData({ ...editableBillData, [e.target.name]: e.target.value });
        setIsDirty(true);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...editableBillData.items];
        newItems[index][field] = value;
        setEditableBillData({ ...editableBillData, items: newItems });
        setIsDirty(true);
    };

    const handleAddItem = () => {
        setEditableBillData(prev => ({
            ...prev,
            items: [...prev.items, { itemName: '', cost: '' }]
        }));
        setIsDirty(true);
    };

    const handleRemoveItem = (index) => {
        if (editableBillData.items.length <= 1) return toast.error("Keep at least one item.");
        setEditableBillData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
        setIsDirty(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setIsDirty(true);
        }
    };

    // --- Actions ---
    const handleEditToggle = () => {
        if (isEditing) {
            // Reset if cancelling
            const formattedDate = bill.purchaseDate ? new Date(bill.purchaseDate).toISOString().split('T')[0] : '';
            setEditableBillData({ ...bill, purchaseDate: formattedDate });
            setSelectedFile(null);
            setIsDirty(false);
        }
        setIsEditing(!isEditing);
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this bill permanently?")) return;
        setIsLoading(true);
        try {
            await api.delete(`/bills/deleteBills/${bill._id}`);
            toast.success("Bill deleted");
            onDelete(bill._id);
            handleCloseAnimation();
        } catch (err) {
            toast.error("Delete failed");
        } finally { setIsLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData();

        // Only append what changed or is needed
        formData.append('billName', editableBillData.billName);
        formData.append('shopName', editableBillData.shopName);
        formData.append('purchaseDate', editableBillData.purchaseDate);
        formData.append('shopPhoneNumber', editableBillData.shopPhoneNumber);
        formData.append('shopAddress', editableBillData.shopAddress);

        // Format items correctly for backend
        const itemsToSend = editableBillData.items.map(i => ({
            itemName: i.itemName,
            cost: Number(i.cost)
        }));
        formData.append('items', JSON.stringify(itemsToSend));

        if (selectedFile) formData.append('billPhoto', selectedFile);

        try {
            const response = await api.patch(`/bills/updateBills/${bill._id}`, formData);
            toast.success("Bill updated!");
            onUpdate(response.data.bill);
            setIsEditing(false);
        } catch (err) {
            toast.error("Update failed");
        } finally { setIsLoading(false); }
    };

    const handleCloseAnimation = () => { setShowModal(false); setTimeout(onClose, 300); };
    if (!isOpen && !showModal) return null;

    // --- Render Helpers ---
    const displayImage = previewUrl || editableBillData.billImageUrl;
    const isPdf = selectedFile?.type?.includes('pdf') || displayImage?.endsWith('.pdf');
    const totalAmount = editableBillData.items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

    return (
        <div className={`fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 transition-opacity duration-200 ${showModal ? 'opacity-100' : 'opacity-0'}`} onClick={handleCloseAnimation}>

            <div className={`bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex overflow-hidden transition-[opacity,transform] duration-200 ${showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>

                {/* --- LEFT SIDE: BILL IMAGE / PREVIEW --- */}
                <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col hidden md:flex relative">
                    <div className="flex-1 flex items-center justify-center p-6 bg-gray-100/50 overflow-hidden relative">
                        {displayImage ? (
                            isPdf ? (
                                <div className="text-center text-gray-500 hover:text-gray-700 transition-colors">
                                    <FaFilePdf size={60} className="mx-auto mb-3 text-red-500 drop-shadow-md" />
                                    <a href={displayImage} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">Open PDF Document</a>
                                </div>
                            ) : (
                                <img src={displayImage} alt="Bill" className="max-w-full max-h-full object-contain shadow-lg rounded-lg border border-gray-200" />
                            )
                        ) : (
                            <div className="text-center text-gray-400">
                                <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-3">
                                    <FaImage size={32} className="opacity-40" />
                                </div>
                                <p className="text-sm font-medium">No image uploaded</p>
                            </div>
                        )}

                        {/* Edit Image Overlay */}
                        {isEditing && (
                            <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer text-white opacity-0 hover:opacity-100 transition-opacity duration-200">
                                <div className="transform group-hover:scale-110 transition-transform duration-300">
                                    <FaImage size={36} className="mb-2 mx-auto" />
                                    <span className="font-bold text-sm tracking-wide">Change Image</span>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
                            </label>
                        )}
                    </div>
                    <div className="py-3 px-6 bg-white border-t border-gray-200 text-center">
                        <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">ID: {bill?._id?.slice(-8)}</p>
                    </div>
                </div>

                {/* --- RIGHT SIDE: DETAILS FORM --- */}
                <div className="flex-1 flex flex-col bg-white w-full">

                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 bg-white z-10 sticky top-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                <FaStore size={10} /> {isEditing ? "Edit Shop Details" : "Retailer Info"}
                            </div>
                            <button onClick={handleCloseAnimation} className="text-gray-400 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-all duration-200">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <div className="pl-1">
                            {isEditing ? (
                                <input name="shopName" value={editableBillData.shopName} onChange={handleChange} className="text-3xl font-extrabold text-gray-800 w-full bg-transparent border-b-2 border-orange-100 focus:border-orange-500 focus:outline-none transition-colors px-1 pb-1 placeholder-gray-300" placeholder="Shop Name" autoFocus />
                            ) : (
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">{editableBillData.shopName}</h2>
                            )}
                            {isEditing ? (
                                <input name="billName" value={editableBillData.billName} onChange={handleChange} className="mt-2 text-base text-gray-600 w-full bg-transparent border-b border-gray-200 focus:border-gray-400 focus:outline-none px-1 pb-1 placeholder-gray-300" placeholder="Description (e.g., Monthly Groceries)" />
                            ) : (
                                <p className="text-base text-gray-500 font-medium mt-1">{editableBillData.billName}</p>
                            )}
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8">

                        {/* Billed To & Invoice Meta Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            {/* Billed To */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Billed To
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            <FaUser size={12} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium">Customer Name</p>
                                            <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                            <FaEnvelope size={12} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium">Email Address</p>
                                            <p className="text-sm font-bold text-gray-800 break-all">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                            <FaPhone size={12} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium">Phone Number</p>
                                            <p className="text-sm font-bold text-gray-800">{user?.phoneNumber || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Invoice Details */}
                            <div className="md:text-right">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 md:justify-end">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Invoice Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Purchase Date</p>
                                        {isEditing ? (
                                            <input type="date" name="purchaseDate" value={editableBillData.purchaseDate} onChange={handleChange} className="text-sm font-bold bg-white border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-orange-200 outline-none w-full md:w-auto" />
                                        ) : (
                                            <p className="text-lg font-bold text-gray-800 flex items-center md:justify-end gap-2">
                                                <FaCalendarAlt className="text-gray-300 text-sm" />
                                                {editableBillData.purchaseDate ? new Date(editableBillData.purchaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Shop Address</p>
                                        {isEditing ? (
                                            <textarea name="shopAddress" value={editableBillData.shopAddress} onChange={handleChange} className="text-sm w-full bg-white border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-orange-200 outline-none resize-none" rows="2" placeholder="Enter Full Address" />
                                        ) : (
                                            <div className="text-sm text-gray-600 font-medium leading-relaxed flex items-start md:justify-end gap-2 group cursor-pointer hover:text-orange-600 transition-colors">
                                                <span className="text-right">{editableBillData.shopAddress || 'Address not available'}</span>
                                                {editableBillData.shopAddress && <FaMapMarkerAlt className="text-orange-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="grid grid-cols-12 bg-gray-50/80 px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <div className="col-span-7">Item Details</div>
                                <div className="col-span-5 text-right">Cost</div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {editableBillData.items.map((item, idx) => {
                                    let warrantyText = null;
                                    let warrantyColor = "text-gray-400";

                                    // Use stored warrantyExpiryDate if present (uploaded bills with warranty set by user)
                                    // Fallback to warrantyMonths for retailer bills loaded in this modal
                                    let expiryDate = null;
                                    if (item.warrantyExpiryDate) {
                                        expiryDate = new Date(item.warrantyExpiryDate);
                                    } else if (item.warrantyMonths > 0 && editableBillData.purchaseDate) {
                                        expiryDate = new Date(editableBillData.purchaseDate);
                                        expiryDate.setMonth(expiryDate.getMonth() + item.warrantyMonths);
                                    }

                                    if (expiryDate) {
                                        const today = new Date();
                                        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                                        const expiryLabel = expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                                        if (diffDays > 0) {
                                            const monthsLeft = Math.floor(diffDays / 30);
                                            const daysLeft = diffDays % 30;
                                            const timeLabel = monthsLeft >= 12
                                                ? `~${(monthsLeft / 12).toFixed(1)} yrs`
                                                : monthsLeft > 0 ? `${monthsLeft}m ${daysLeft}d` : `${diffDays}d`;
                                            warrantyText = `${timeLabel} left · Expires ${expiryLabel}`;
                                            warrantyColor = diffDays <= 30
                                                ? "text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"
                                                : "text-green-600 bg-green-50 px-2 py-0.5 rounded-full";
                                        } else {
                                            warrantyText = `Warranty Expired on ${expiryLabel}`;
                                            warrantyColor = "text-red-500 bg-red-50 px-2 py-0.5 rounded-full";
                                        }
                                    }

                                    return (
                                        <div key={idx} className="grid grid-cols-12 px-6 py-4 text-sm items-center hover:bg-gray-50/50 transition-colors group">
                                            <div className="col-span-7 pr-4">
                                                {isEditing ? (
                                                    <input value={item.itemName} onChange={e => handleItemChange(idx, 'itemName', e.target.value)} className="w-full border-b border-gray-300 focus:border-orange-500 bg-transparent py-1 outline-none font-medium text-gray-800" placeholder="Item Name" />
                                                ) : (
                                                    <div>
                                                        <span className="font-semibold text-gray-800 block text-base">{item.itemName}</span>
                                                        {warrantyText && (
                                                            <div className={`text-[10px] font-bold mt-1 inline-flex items-center gap-1 ${warrantyColor}`}>
                                                                <FaShieldAlt size={8} /> {warrantyText}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-span-5 text-right flex items-center justify-end gap-3">
                                                {isEditing ? (
                                                    <>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-gray-400 font-medium">₹</span>
                                                            <input type="number" value={item.cost} onChange={e => handleItemChange(idx, 'cost', e.target.value)} className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-right font-bold text-gray-800 focus:ring-2 focus:ring-orange-200 outline-none" placeholder="0" />
                                                        </div>
                                                        <button onClick={() => handleRemoveItem(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><FaTrash size={12} /></button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-700 font-bold text-base">₹{Number(item.cost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Add Item Button */}
                            {isEditing && (
                                <button onClick={handleAddItem} className="w-full py-3 text-center text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 border-t border-dashed border-orange-200">
                                    <div className="w-5 h-5 rounded-full bg-orange-200 flex items-center justify-center text-white"><FaPlus size={10} /></div>
                                    Add New Item
                                </button>
                            )}

                            {/* Footer Total */}
                            <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                                <span className="text-sm font-bold uppercase tracking-widest text-gray-300">Total Amount</span>
                                <span className="text-2xl font-bold tracking-tight">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                    </div>

                    {/* Fixed Footer Actions */}
                    <div className="p-5 border-t border-gray-100 bg-white z-20 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
                        {!isEditing ? (
                            <>
                                <div className="flex-1">
                                    {isEditable && (
                                        <button onClick={handleDelete} className="flex items-center gap-2 text-red-500 hover:text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-50 text-sm font-bold transition-all opacity-80 hover:opacity-100">
                                            <FaTrash size={14} /> <span className="hidden sm:inline">Delete Bill</span>
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-4 w-full sm:w-auto">
                                    {isEditable && (
                                        <button onClick={handleEditToggle} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-bold hover:border-gray-300 hover:bg-gray-50 text-sm transition-all transform active:scale-95">
                                            <FaEdit /> Edit
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <button onClick={handleEditToggle} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors text-sm">
                                    Cancel
                                </button>
                                <div className="flex gap-3">
                                    <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:shadow-xl transition-all text-sm disabled:opacity-70 transform active:scale-95">
                                        {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Changes
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillDetailModal;