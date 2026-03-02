import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, Search, LogOut, Coffee, X, ArrowRight, Clock, RefreshCw, CreditCard, ChevronRight } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';

interface OrderData {
    short_id: string;
    items: any[];
    total: number;
    status: string;
    created_at: string;
}

export default function OwnerPortal() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Dashboard States
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [filterStatus, setFilterStatus] = useState<'pending' | 'paid'>('pending');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Right Pane States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Poll for orders every 10s
    useEffect(() => {
        if (!isAuthenticated) return;
        fetchRecentOrders(false);
        const interval = setInterval(() => fetchRecentOrders(false), 10000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'ping', pin })
            });
            if (res.status === 401) {
                setErrorMsg('Invalid PIN.');
            } else {
                setIsAuthenticated(true);
            }
        } catch (err) {
            setErrorMsg('Connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRecentOrders = async (showRefreshUi = true) => {
        if (showRefreshUi) setIsRefreshing(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'fetch_recent_orders', pin })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setOrders(data.orders);
                // Hint for RLS issue if needed:
                if (data.orders.length === 0 && errorMsg === '') {
                    // It's possible the DB is just empty, but silently we ensure no crash.
                }
            } else {
                if (showRefreshUi) setErrorMsg(data.error || 'Failed to fetch tracking list.');
            }
        } catch (err) {
            if (showRefreshUi) setErrorMsg('Connection error.');
        } finally {
            if (showRefreshUi) setIsRefreshing(false);
        }
    };

    const fetchOrder = async (queryId: string) => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'fetch_order', pin, short_id: queryId })
            });
            const data = await res.json();

            if (res.ok && data.success && data.order) {
                setSelectedOrder(data.order);
                setSearchTerm('');
            } else {
                setErrorMsg(data.error || 'Order not found. Check SUPABASE_SERVICE_ROLE_KEY if this persists.');
                setSelectedOrder(null);
            }
        } catch (err) {
            setErrorMsg('Failed to fetch the order.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim().length > 0) {
            fetchOrder(searchTerm.trim());
        }
    };

    const markAsPaid = async (targetOrder: OrderData) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_paid', pin, short_id: targetOrder.short_id })
            });
            if (res.ok) {
                // Instantly update selected & list
                setSelectedOrder({ ...targetOrder, status: 'paid' });
                setOrders(prev => prev.map(o => o.short_id === targetOrder.short_id ? { ...o, status: 'paid' } : o));
            } else {
                const data = await res.json();
                setErrorMsg(data.error || 'Failed to update order.');
            }
        } catch (err) {
            setErrorMsg('Connection error during update.');
        } finally {
            setIsLoading(false);
        }
    };

    // QR Code Scanner initialization
    const startScanner = () => {
        setIsScanning(true);
        setSelectedOrder(null);
        setErrorMsg('');

        setTimeout(() => {
            const el = document.getElementById("qr-reader");
            if (el && !scannerRef.current) {
                const scanner = new Html5QrcodeScanner(
                    "qr-reader",
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                        videoConstraints: { facingMode: "environment" }
                    },
                    false
                );

                scanner.render((decodedText) => {
                    if (scannerRef.current) {
                        scannerRef.current.clear();
                        scannerRef.current = null;
                    }
                    setIsScanning(false);
                    fetchOrder(decodedText);
                }, () => { });

                scannerRef.current = scanner;
            }
        }, 300); // Wait for AnimatePresence mount
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    const filteredOrders = orders.filter(o => o.status === filterStatus);

    const formatTime = (ts: string) => {
        return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    // Render Login
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-1/4 left-10 w-64 h-64 bg-[var(--color-bg-secondary)] rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none" />
                <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-[var(--color-accent)] rounded-full blur-[100px] opacity-10 mix-blend-multiply pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-[var(--color-bg-primary)] p-8 rounded-3xl shadow-xl border border-[var(--color-border)] z-10"
                >
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-[var(--color-text-primary)] rounded-full flex items-center justify-center -rotate-12">
                            <Coffee className="text-[var(--color-bg-primary)]" size={32} />
                        </div>
                    </div>
                    <h1 className="text-[28px] font-display font-bold text-center text-[var(--color-text-primary)] mb-2">Staff Portal</h1>
                    <p className="text-center text-[var(--color-text-secondary)] mb-8 font-sans">Secure dashboard access.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter PIN (Demo: 7788)"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] focus:border-[var(--color-accent)] outline-none text-[16px] text-center tracking-widest font-mono text-[var(--color-text-primary)]"
                            autoFocus
                        />
                        {errorMsg && <p className="text-red-500 text-sm text-center font-medium">{errorMsg}</p>}
                        <button
                            type="submit"
                            disabled={isLoading || pin.length < 4}
                            className="w-full py-4 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
                        >
                            {isLoading ? 'Verifying...' : 'Access Dashboard'}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] md:h-screen bg-[#F9F7F5] flex flex-col font-sans md:overflow-hidden">
            {/* Topbar */}
            <header className="h-[72px] bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--color-accent)] rounded-lg flex items-center justify-center text-white">
                        <Coffee size={20} />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-[18px] text-[var(--color-text-primary)] leading-tight">Roastly HQ</h1>
                        <p className="text-[12px] font-medium text-gray-500">Order Management System</p>
                    </div>
                </div>
                <button onClick={() => { setIsAuthenticated(false); setPin(''); clearInterval(1); }} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors font-semibold text-sm">
                    <LogOut size={16} /> Logout
                </button>
            </header>

            <div className="flex-1 flex flex-col-reverse md:flex-row md:overflow-hidden">

                {/* Left Panel: Feed */}
                <aside className="w-full md:w-[380px] h-[500px] md:h-auto bg-white border-t md:border-t-0 md:border-r border-gray-200 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative shrink-0">
                    <div className="p-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[20px] font-display font-bold text-gray-900">Live Feed</h2>
                            <button onClick={() => fetchRecentOrders(true)} className={`p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-all ${isRefreshing ? 'animate-spin' : ''}`}>
                                <RefreshCw size={18} />
                            </button>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button onClick={() => setFilterStatus('pending')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${filterStatus === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                Pending ({orders.filter(o => o.status === 'pending').length})
                            </button>
                            <button onClick={() => setFilterStatus('paid')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${filterStatus === 'paid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                Completed
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50/50">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center mt-10 opacity-50">
                                <Search size={32} className="mx-auto mb-3" />
                                <p className="font-medium text-sm">No {filterStatus} orders found.</p>
                            </div>
                        ) : (
                            filteredOrders.map(o => (
                                <div
                                    key={o.short_id}
                                    onClick={() => { setIsScanning(false); setSelectedOrder(o); }}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedOrder?.short_id === o.short_id ? 'bg-[var(--color-bg-primary)] border-[var(--color-accent)] ring-1 ring-[var(--color-accent)] shadow-sm' : 'bg-white border-gray-200'}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="font-display font-bold text-xl tracking-tight text-gray-900">{o.short_id}</span>
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                                            <Clock size={12} /> {formatTime(o.created_at)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="text-sm font-medium text-gray-500">{o.items.reduce((acc, curr) => acc + curr.qty, 0)} items</p>
                                        <p className="font-bold text-[var(--color-text-primary)]">${o.total.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Right Panel: Content Area */}
                <main className="flex-1 flex flex-col bg-[#F9F7F5] relative shrink-0 min-h-[400px] md:min-h-0 md:overflow-hidden">

                    {/* Error Toast */}
                    <AnimatePresence>
                        {errorMsg && (
                            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-full font-semibold shadow-xl flex items-center gap-3">
                                <span>{errorMsg}</span>
                                <button onClick={() => setErrorMsg('')}><X size={18} className="opacity-70 hover:opacity-100" /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="p-8 h-full flex flex-col items-center justify-center relative">

                        {/* Empty State / Lookup */}
                        {!selectedOrder && !isScanning && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl text-center">
                                <div className="w-24 h-24 bg-[var(--color-accent)]/10 rounded-full flex items-center justify-center mx-auto mb-8 text-[var(--color-accent)]">
                                    <Search size={40} />
                                </div>
                                <h2 className="text-[32px] font-display font-bold text-gray-900 mb-2">Find an Order</h2>
                                <p className="text-gray-500 mb-10">Select an order from the feed, or search manually.</p>

                                <form onSubmit={handleSearchSubmit} className="relative mb-8 shadow-sm">
                                    <input
                                        id="order-search"
                                        type="text"
                                        placeholder="Enter 4-digit code (e.g. ABCD)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                                        maxLength={10}
                                        className="w-full px-6 py-5 rounded-2xl border border-gray-200 bg-white focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-[22px] font-mono tracking-[0.2em] text-center text-gray-900 placeholder:tracking-normal placeholder:font-sans placeholder:text-[16px] transition-all"
                                    />
                                    <button type="submit" disabled={isLoading || searchTerm.length < 4} className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--color-text-primary)] text-white p-3 rounded-xl disabled:opacity-50 hover:bg-black transition-colors">
                                        {isLoading ? <span className="animate-spin flex text-xl">◌</span> : <ChevronRight size={24} />}
                                    </button>
                                </form>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-px bg-gray-200 flex-1" />
                                    <span className="text-gray-400 font-medium text-xs px-2 tracking-widest uppercase">OR</span>
                                    <div className="h-px bg-gray-200 flex-1" />
                                </div>

                                <button onClick={startScanner} className="w-full py-5 rounded-2xl bg-white border border-gray-200 text-[var(--color-text-primary)] font-bold text-[16px] flex justify-center items-center gap-3 hover:border-[var(--color-text-primary)] hover:shadow-md transition-all group">
                                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[var(--color-text-primary)] group-hover:text-white transition-colors">
                                        <Camera size={20} />
                                    </div>
                                    Scan Customer QR Code
                                </button>
                            </motion.div>
                        )}

                        {/* Scanner Full-Frame */}
                        {isScanning && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-4 md:inset-8 bg-black rounded-3xl shadow-2xl flex flex-col overflow-hidden z-20">
                                <div className="bg-white/10 backdrop-blur-md p-4 md:p-6 flex justify-between items-center z-10 shrink-0">
                                    <h3 className="font-display font-medium text-lg md:text-xl text-white flex items-center gap-3"><Camera size={20} /> Point camera at QR</h3>
                                    <button onClick={stopScanner} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"><X size={24} /></button>
                                </div>
                                <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                                    <div id="qr-reader" className="w-full max-w-2xl h-full [&_video]:object-cover" />
                                </div>
                            </motion.div>
                        )}

                        {/* Order Detail View */}
                        {selectedOrder && !isScanning && (
                            <motion.div key={selectedOrder.short_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-full">

                                <div className="p-8 border-b border-gray-100 flex-shrink-0 bg-gray-50/50">
                                    <button onClick={() => setSelectedOrder(null)} className="flex items-center text-gray-500 hover:text-gray-900 font-semibold text-sm mb-6 transition-colors group px-2 py-1 -ml-2 rounded-lg hover:bg-gray-100">
                                        <X className="mr-2" size={16} /> Close Order
                                    </button>

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[12px] uppercase tracking-widest font-bold text-gray-400 mb-1">Receipt Code</p>
                                            <h2 className="text-[48px] font-mono tracking-wider font-bold text-[var(--color-text-primary)] leading-none mb-2">{selectedOrder.short_id}</h2>
                                            <p className="text-sm font-semibold text-gray-500 flex items-center gap-1.5"><Clock size={14} /> {formatTime(selectedOrder.created_at)}</p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${selectedOrder.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200 shadow-inner' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                            {selectedOrder.status === 'paid' ? '✔ FINISHED' : 'PENDING PAYMENT'}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 overflow-y-auto space-y-4">
                                    <h3 className="font-display font-bold text-lg text-gray-900 mb-4 border-b border-gray-100 pb-2">Order Line Items</h3>
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between gap-4 py-1">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center font-bold text-sm border border-gray-200">{item.qty}</div>
                                                <p className="font-semibold text-gray-800 text-lg">{item.name}</p>
                                            </div>
                                            <p className="font-semibold text-gray-600">${(item.price * item.qty).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-8 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                                    <div className="flex justify-between items-center text-[28px] mb-8">
                                        <span className="font-sans font-bold text-gray-500">Total Due</span>
                                        <span className="font-display font-bold text-[var(--color-text-primary)]">${selectedOrder.total.toFixed(2)}</span>
                                    </div>

                                    {selectedOrder.status !== 'paid' ? (
                                        <button
                                            onClick={() => markAsPaid(selectedOrder)}
                                            disabled={isLoading}
                                            className="w-full py-5 bg-[var(--color-text-primary)] hover:bg-[#2A2A2A] text-white rounded-2xl shadow-[0_8px_24px_rgba(44,40,37,0.2)] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isLoading ? <span className="animate-spin text-xl">◌</span> : <CreditCard size={24} />}
                                            <span className="font-bold text-lg">Accept Payment & Finish</span>
                                        </button>
                                    ) : (
                                        <div className="w-full py-5 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center justify-center gap-2 shadow-inner">
                                            <CheckCircle size={24} />
                                            <span className="font-bold text-lg">Paid & Processed</span>
                                        </div>
                                    )}
                                </div>

                            </motion.div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
