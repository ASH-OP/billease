// src/Pages/RetailerAnalytics.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, Radar, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Activity, Loader2, Clock, Users, Sparkles, X, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import { retailerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RetailerAnalytics = () => {
    const navigate = useNavigate();
    const { isRetailerAuth } = useAuth();
    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // AI Insights State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAdviceModal, setShowAdviceModal] = useState(false);
    const [aiAdvice, setAiAdvice] = useState('');

    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#eab308'];

    useEffect(() => {
        if (isRetailerAuth) {
            fetchData();
        } else {
            // Let the interceptor or auth context handle redirect or wait
            // But valid to show loading or redirect if we know for sure not auth
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRetailerAuth]);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Use retailerApi
            const response = await retailerApi.get('/retailer/bills');
            const data = response.data;

            setBills(Array.isArray(data) ? data : []);

        } catch (error) {
            console.error("Error:", error);
            if (error.response?.status === 401) {
                navigate('/retailerLogin');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- DATA PROCESSING ---
    const analyticsData = useMemo(() => {
        if (bills.length === 0) return null;

        // 1. Basics
        const totalRevenue = bills.reduce((acc, bill) => acc + (bill.grandTotal || 0), 0);
        const totalOrders = bills.length;
        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        // 2. Sales Trend & Traffic
        const salesDataMap = {};
        const trafficMap = {};
        const hoursMap = new Array(24).fill(0);
        const customerFrequency = {};

        bills.forEach(bill => {
            const date = bill.billDate;
            if (!salesDataMap[date]) salesDataMap[date] = 0;
            salesDataMap[date] += bill.grandTotal;

            if (!trafficMap[date]) trafficMap[date] = { revenue: 0, count: 0 };
            trafficMap[date].revenue += bill.grandTotal;
            trafficMap[date].count += 1;

            if (bill.createdAt) {
                const hour = new Date(bill.createdAt).getHours();
                hoursMap[hour] += 1;
            }

            const email = bill.customer?.email || "Unknown";
            customerFrequency[email] = (customerFrequency[email] || 0) + 1;
        });

        const parseBillDate = (d) => {
            const parts = d.split(' ');
            if (parts.length !== 3) return new Date(d);
            const m = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
            return new Date(parseInt(parts[2]), m[parts[1]], parseInt(parts[0]));
        };

        const salesTrendData = Object.keys(salesDataMap).map(date => ({ date, revenue: salesDataMap[date] }))
            .sort((a, b) => parseBillDate(a.date) - parseBillDate(b.date));

        const trafficData = Object.keys(trafficMap).map(date => ({ date, revenue: trafficMap[date].revenue, orders: trafficMap[date].count }))
            .sort((a, b) => parseBillDate(a.date) - parseBillDate(b.date));

        const peakHoursData = hoursMap.map((count, hour) => ({
            hour: `${hour}:00`,
            orders: count
        }));

        let newCustomers = 0;
        let returningCustomers = 0;
        Object.values(customerFrequency).forEach(count => {
            if (count === 1) newCustomers++;
            else returningCustomers++;
        });
        const loyaltyData = [
            { name: 'New Customers', value: newCustomers },
            { name: 'Returning Customers', value: returningCustomers }
        ];

        const productCountMap = {};
        bills.forEach(bill => {
            if (Array.isArray(bill.items)) {
                bill.items.forEach(item => {
                    const name = item.name || item.itemName || "Unknown";
                    if (!productCountMap[name]) productCountMap[name] = 0;
                    productCountMap[name] += (item.quantity || 1);
                });
            }
        });
        const topProductsData = Object.keys(productCountMap)
            .map(name => ({ name, sales: productCountMap[name] }))
            .sort((a, b) => b.sales - a.sales).slice(0, 5);

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyActivityMap = new Array(7).fill(0);
        bills.forEach(bill => {
            const d = parseBillDate(bill.billDate);
            if (!isNaN(d)) weeklyActivityMap[d.getDay()] += bill.grandTotal;
        });
        const weeklyRadarData = daysOfWeek.map((day, idx) => ({ subject: day, A: weeklyActivityMap[idx], fullMark: Math.max(...weeklyActivityMap) || 100 }));

        return {
            totalRevenue, totalOrders, avgOrderValue,
            salesTrendData, trafficData, peakHoursData, loyaltyData,
            topProductsData, weeklyRadarData
        };
    }, [bills]);

    // --- AI HANDLER ---
    const handleGetInsights = async () => {
        if (!analyticsData) return;
        setIsAnalyzing(true);
        const toastId = toast.loading("Consulting AI Analyst...");

        try {
            const summaryPayload = {
                revenue: analyticsData.totalRevenue,
                orders: analyticsData.totalOrders,
                avgOrderValue: analyticsData.avgOrderValue,
                topProducts: analyticsData.topProductsData.map(p => p.name),
                newVsReturning: analyticsData.loyaltyData,
                recentTrend: analyticsData.salesTrendData.slice(-5)
            };

            const response = await retailerApi.post('/retailer/bills/analyze', { summary: summaryPayload });

            if (response.data.success) {
                setAiAdvice(response.data.advice);
                setShowAdviceModal(true);
                toast.success("Analysis Ready!", { id: toastId });
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error("AI Error:", error);
            toast.error("AI service currently unavailable.", { id: toastId });
        } finally {
            setIsAnalyzing(false);
        }
    };

    // --- RENDER HELPERS ---
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg z-50">
                    <p className="text-sm font-bold text-gray-700 mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {Number(entry.value).toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500 w-10 h-10" /></div>;
    if (!analyticsData) return <div className="h-screen flex flex-col items-center justify-center text-gray-500"><p>No data available.</p><button onClick={() => navigate('/retailerDashboard')} className="mt-4 text-orange-600 underline">Go Back</button></div>;

    const { totalRevenue, totalOrders, avgOrderValue, salesTrendData, peakHoursData, loyaltyData, topProductsData, weeklyRadarData } = analyticsData;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans animate-in fade-in duration-500 relative">
            <div className="max-w-7xl mx-auto pb-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button onClick={() => navigate('/retailerDashboard')} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors border border-gray-200">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Store Analytics</h1>
                            <p className="text-sm text-gray-500">Performance Metrics & AI Insights</p>
                        </div>
                    </div>
                    {/* AI Button - Styled Orange/Modern */}
                    <button
                        onClick={handleGetInsights}
                        disabled={isAnalyzing}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70"
                    >
                        {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5 text-white" />}
                        {isAnalyzing ? "Analyzing..." : "Get AI Growth Strategy"}
                    </button>
                </div>

                {/* 1. Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <MetricCard icon={DollarSign} title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="orange" />
                    <MetricCard icon={ShoppingCart} title="Total Transactions" value={totalOrders} color="blue" />
                    <MetricCard icon={TrendingUp} title="Average Order Value" value={`₹${avgOrderValue.toLocaleString()}`} color="green" />
                </div>

                {/* 2. Main Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Activity size={18} className="text-orange-500" /> Revenue Growth</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesTrendData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} /><stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><Clock size={18} className="text-blue-500" /> Peak Hours</h3>
                        <p className="text-xs text-gray-500 mb-4">When do customers shop the most?</p>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={peakHoursData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={2} />
                                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                                    <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><Users size={18} className="text-green-500" /> Customer Loyalty</h3>
                        <p className="text-xs text-gray-500 mb-4">New vs. Returning Customers</p>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={loyaltyData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {loyaltyData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Pattern</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={weeklyRadarData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                    <Radar name="Sales" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Best Sellers</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProductsData} layout="vertical" margin={{ left: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                                    <Bar dataKey="sales" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- AI INSIGHTS MODAL (Styled Orange/Modern) --- */}
            {showAdviceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border-t-4 border-orange-500">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Bot className="text-white w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">AI Growth Strategy</h2>
                                    <p className="text-orange-100 text-xs">Powered by Gemini 2.0 Flash</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAdviceModal(false)} className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"><X size={24} /></button>
                        </div>

                        {/* Content Area with Styling for AI HTML */}
                        <div className="p-8 overflow-y-auto bg-orange-50/30 flex-1">
                            <div className="ai-content prose prose-orange max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: aiAdvice }} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
                            <button onClick={() => setShowAdviceModal(false)} className="px-6 py-2.5 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition shadow-lg hover:shadow-xl">Close Recommendation</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom CSS for AI Response Styling */}
            <style jsx global>{`
                .ai-content h3 {
                    color: #ea580c; /* Orange-600 */
                    font-size: 1.125rem;
                    font-weight: 700;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    display: flex;
                    align-items: center;
                }
                .ai-content p {
                    color: #374151; /* Gray-700 */
                    margin-bottom: 1rem;
                    line-height: 1.6;
                    font-size: 0.95rem;
                }
                .ai-content ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin-bottom: 1.5rem;
                    color: #4b5563; /* Gray-600 */
                }
                .ai-content li {
                    margin-bottom: 0.5rem;
                }
                .ai-content strong {
                    color: #1f2937; /* Gray-800 */
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

// Simple Helper Component
const MetricCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
        <div className={`p-4 rounded-xl bg-${color}-50 text-${color}-600`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
);

export default RetailerAnalytics;