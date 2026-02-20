import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    X, Printer, Download, ShoppingBag, Calendar,
    User, Phone, Mail, MapPin, Loader2, Shield, Receipt
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const RetailerBillModal = ({ bill, isOpen, onClose }) => {
    const invoiceRef = useRef();
    const [isGenerating, setIsGenerating] = useState(false);
    const navigate = useNavigate();

    if (!isOpen || !bill) return null;

    // --- Download PDF ---
    const handleDownloadPDF = async () => {
        const element = invoiceRef.current;
        if (!element) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${bill.billNumber}.pdf`);
            toast.success("Invoice downloaded!");
        } catch (error) {
            console.error("PDF Error:", error);
            toast.error("Failed to generate PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Claim Warranty: normalize data for WarrantyClaimPage ---
    const handleClaimWarranty = (item) => {
        onClose(); // close modal first
        const normalizedBill = {
            ...bill,
            billName: bill.shopName || 'Store Bill',
            purchaseDate: bill.billDate,
            items: (bill.items || []).map(i => ({
                ...i,
                itemName: i.name,
                cost: i.total,
            })),
        };
        const normalizedItem = {
            ...item,
            itemName: item.name,
            cost: item.total,
        };
        navigate('/warranty-claim', {
            state: {
                billData: normalizedBill,
                preSelectedItem: normalizedItem,
            }
        });
    };

    // --- Warranty expiry helper ---
    const getWarrantyInfo = (item) => {
        if (!item.warrantyMonths || item.warrantyMonths <= 0) return null;
        const today = new Date();
        let expiryDate;
        if (item.warrantyExpiryDate) {
            expiryDate = new Date(item.warrantyExpiryDate);
        } else {
            expiryDate = new Date(bill.billDate);
            expiryDate.setMonth(expiryDate.getMonth() + item.warrantyMonths);
        }
        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        const status = daysLeft <= 0 ? 'expired' : daysLeft <= 30 ? 'soon' : 'active';
        return {
            expiryDate: expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            daysLeft,
            status
        };
    };

    const handlePrint = () => {
        const element = invoiceRef.current;
        if (!element) return;

        const printWindow = window.open('', '_blank', 'width=800,height=900');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${bill.billNumber}</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; }
                    body { background: #fff; padding: 32px; color: #1a1a1a; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px 14px; text-align: left; font-size: 13px; }
                    thead th { background: #f5f5f5; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; color: #555; border-bottom: 1px solid #e0e0e0; }
                    tbody tr { border-bottom: 1px solid #f0f0f0; }
                    .total-row { background: #ea580c; color: #fff; font-weight: 700; font-size: 15px; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #ea580c; }
                    .shop-name { font-size: 24px; font-weight: 800; color: #ea580c; }
                    .invoice-meta { text-align: right; font-size: 13px; color: #555; }
                    .invoice-meta p { margin-bottom: 4px; }
                    .section { background: #f9fafb; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
                    .section h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 12px; }
                    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
                    .info-label { font-size: 10px; color: #9ca3af; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
                    .info-value { font-size: 14px; font-weight: 600; color: #111; }
                    .footer-note { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 32px; padding-top: 20px; border-top: 1px solid #f0f0f0; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="shop-name">${bill.shopName || 'Retail Store'}</div>
                        <div style="color:#888;font-size:13px;margin-top:4px;">Authorized Retail Partner</div>
                    </div>
                    <div class="invoice-meta">
                        <p><strong>INVOICE</strong></p>
                        <p style="font-family:monospace;">${bill.billNumber}</p>
                        <p>${bill.billDate}</p>
                    </div>
                </div>

                <div class="section">
                    <h4>Billed To</h4>
                    <div class="grid3">
                        <div>
                            <div class="info-label">Customer Name</div>
                            <div class="info-value">${bill.customer?.name || '—'}</div>
                        </div>
                        <div>
                            <div class="info-label">Phone Number</div>
                            <div class="info-value">${bill.customer?.phone || '—'}</div>
                        </div>
                        <div>
                            <div class="info-label">Email Address</div>
                            <div class="info-value" style="word-break:break-all;">${bill.customer?.email || '—'}</div>
                        </div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Item Description</th>
                            <th>Brand</th>
                            <th class="text-center">Qty</th>
                            <th class="text-right">Price</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(bill.items || []).map(item => `
                            <tr>
                                <td><strong>${item.name}</strong>${item.warrantyMonths > 0 ? `<br/><small style="color:#16a34a;">🛡 ${item.warrantyMonths}m warranty</small>` : ''}</td>
                                <td style="color:#666;">${item.company || '—'}</td>
                                <td class="text-center">${item.quantity}</td>
                                <td class="text-right">₹${item.price?.toLocaleString('en-IN') || 0}</td>
                                <td class="text-right"><strong>₹${item.total?.toLocaleString('en-IN') || 0}</strong></td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="4" style="text-align:right;padding-right:20px;">Grand Total</td>
                            <td class="text-right">₹${bill.grandTotal?.toLocaleString('en-IN')}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="footer-note">
                    Thank you for your purchase! &nbsp;·&nbsp; This is a system-generated invoice.
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    };

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 print:p-0"
            style={{ background: 'rgba(10, 15, 30, 0.85)' }}
            onClick={onClose}
        >
            {/* ── FLOATING CLOSE BUTTON — outside card, always visible ── */}
            <button
                onClick={onClose}
                style={{ position: 'fixed', top: '16px', right: '20px', zIndex: 100000 }}
                className="print:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white shadow-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-150 active:scale-95"
                title="Close (Esc)"
            >
                <X size={14} strokeWidth={3} /> Close
            </button>

            {/* Modal Card */}
            <div
                className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden print:max-h-none print:rounded-none print:shadow-none print:w-full"
                style={{ maxHeight: '90vh', animation: 'modalPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)', marginTop: '0' }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── HEADER BANNER ── */}
                <div
                    className="relative flex items-center justify-between px-8 py-5 print:hidden"
                    style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)' }}
                >
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 bg-white" style={{ transform: 'translate(30%, -30%)' }} />
                    <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 bg-white" style={{ transform: 'translate(-30%, 30%)' }} />

                    <div className="relative flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Receipt size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-orange-200 text-xs font-semibold uppercase tracking-widest">Invoice Details</p>
                            <h2 className="text-white font-bold text-lg leading-tight">{bill.billNumber}</h2>
                        </div>
                    </div>

                    <div className="relative text-right pr-12">
                        <p className="text-orange-200 text-xs font-medium">Billed Amount</p>
                        <p className="text-white text-2xl font-bold">₹{bill.grandTotal?.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {/* ── SCROLLABLE INVOICE BODY ── */}
                <div ref={invoiceRef} className="flex-1 overflow-y-auto bg-gray-50 print:overflow-visible print:h-auto" style={{ willChange: 'transform', WebkitOverflowScrolling: 'touch' }}>

                    {/* Print-only header */}
                    <div className="hidden print:flex justify-between items-start p-8 border-b border-gray-200 mb-4">
                        <div className="flex items-center gap-3 text-orange-600 font-bold text-3xl">
                            <ShoppingBag size={30} />
                            {bill.shopName || "Retail Store"}
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-800 text-xl">INVOICE</p>
                            <p className="font-mono text-gray-500 text-sm">{bill.billNumber}</p>
                            <p className="text-gray-500 text-sm mt-1">{bill.billDate}</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">

                        {/* Shop Info Card */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                    <ShoppingBag size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Store</p>
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{bill.shopName || "Retail Store"}</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                                <Calendar size={13} className="text-orange-400 flex-shrink-0" />
                                <span className="font-medium">{bill.billDate}</span>
                            </div>
                        </div>

                        {/* Customer Info Grid */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Billed To</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Name */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                                        <User size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Name</p>
                                        <p className="font-semibold text-gray-800 text-sm truncate">{bill.customer?.name}</p>
                                    </div>
                                </div>
                                {/* Phone */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-500 flex-shrink-0">
                                        <Phone size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Phone</p>
                                        <p className="font-semibold text-gray-800 text-sm">{bill.customer?.phone || '—'}</p>
                                    </div>
                                </div>
                                {/* Email */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 flex-shrink-0">
                                        <Mail size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Email</p>
                                        <p className="font-semibold text-gray-800 text-sm break-all">{bill.customer?.email || '—'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="grid grid-cols-12 bg-gray-50 px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                                <div className="col-span-5">Item</div>
                                <div className="col-span-2 text-center">Qty</div>
                                <div className="col-span-2 text-right">Price</div>
                                <div className="col-span-3 text-right">Total</div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {bill.items?.map((item, index) => (
                                    <div key={index} className="px-5 py-3.5 hover:bg-orange-50/40 transition-colors">
                                        {/* Row 1: name + badges + qty/price/total */}
                                        <div className="grid grid-cols-12 items-start text-sm">
                                            <div className="col-span-5 pr-3">
                                                <p className="font-semibold text-gray-800 leading-tight">{item.name}</p>
                                                {item.company && (
                                                    <p className="text-[11px] text-gray-400 mt-0.5">{item.company}</p>
                                                )}
                                                {item.warrantyMonths > 0 && (() => {
                                                    const wInfo = getWarrantyInfo(item);
                                                    const colors = {
                                                        active: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                                                        soon: 'text-amber-700 bg-amber-50 border-amber-200',
                                                        expired: 'text-red-600 bg-red-50 border-red-200'
                                                    };
                                                    return (
                                                        <div className="mt-1.5 space-y-1">
                                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold border px-2 py-0.5 rounded-full ${colors[wInfo.status]}`}>
                                                                <Shield size={8} /> {item.warrantyMonths}m warranty
                                                            </span>
                                                            <div className={`text-[10px] font-semibold ${wInfo.status === 'expired' ? 'text-red-500' : wInfo.status === 'soon' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                                {wInfo.status === 'expired'
                                                                    ? `Expired on ${wInfo.expiryDate}`
                                                                    : `Expires: ${wInfo.expiryDate} · ${wInfo.daysLeft}d left`}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            <div className="col-span-2 text-center text-gray-600 font-medium">{item.quantity}</div>
                                            <div className="col-span-2 text-right text-gray-600">₹{item.price?.toLocaleString('en-IN')}</div>
                                            <div className="col-span-3 text-right font-bold text-gray-800">₹{item.total?.toLocaleString('en-IN')}</div>
                                        </div>
                                        {/* Row 2: Claim Warranty CTA */}
                                        {item.warrantyMonths > 0 && (() => {
                                            const wInfo = getWarrantyInfo(item);
                                            if (wInfo.status === 'expired') {
                                                return (
                                                    <div className="mt-2">
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                                                            <Shield size={11} /> Warranty Expired
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div className="mt-2.5">
                                                    <button
                                                        onClick={() => handleClaimWarranty(item)}
                                                        className="print:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all hover:scale-[1.03] active:scale-95 shadow-sm shadow-emerald-200"
                                                    >
                                                        <Shield size={11} /> Claim Warranty
                                                    </button>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ))}
                            </div>

                            {/* Grand Total */}
                            <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-orange-600 to-red-700">
                                <span className="text-orange-100 text-sm font-bold uppercase tracking-widest">Grand Total</span>
                                <span className="text-white text-2xl font-bold">₹{bill.grandTotal?.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Thank-you note */}
                        <p className="text-center text-xs text-gray-400 py-1">
                            Thank you for your purchase! · This is a system-generated invoice.
                        </p>
                    </div>
                </div>

                {/* ── FOOTER ACTIONS ── */}
                <div className="print:hidden px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        <X size={15} /> Close
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                            <Printer size={15} /> Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:translate-y-[-1px] transition-all disabled:opacity-60"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />}
                            {isGenerating ? "Saving..." : "Download PDF"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Animation keyframes */}
            <style>{`
                @keyframes modalPop {
                    0% { opacity: 0; transform: scale(0.92) translateY(12px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>,
        document.body
    );
};

export default RetailerBillModal;