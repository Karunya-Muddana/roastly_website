import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, Search, LogOut, Coffee, X, ArrowRight } from 'lucide-react';
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

    // Scanner / Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [order, setOrder] = useState<OrderData | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const scannerElementRef = useRef<HTMLDivElement>(null);

    // Auto-focus logic for search
    useEffect(() => {
        if (isAuthenticated && !isScanning && !order) {
            document.getElementById('order-search')?.focus();
        }
    }, [isAuthenticated, isScanning, order]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            // A simple ping to the admin endpoint with NO short_id to test auth
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'ping', pin })
            });
            const data = await res.json();

            // Expected to fail 'invalid action' if PIN is correct, 'Unauthorized' if wrong
            if (res.status === 401) {
                setErrorMsg('Invalid PIN. Please try again.');
            } else {
                setIsAuthenticated(true);
            }
        } catch (err) {
            setErrorMsg('Connection error. Try again.');
        } finally {
            setIsLoading(false);
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

            if (res.ok && data.success) {
                setOrder(data.order);
                setSearchTerm('');
            } else {
                setErrorMsg(data.error || 'Order not found.');
                setOrder(null);
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

    const markAsPaid = async () => {
        if (!order) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_paid', pin, short_id: order.short_id })
            });
            const data = await res.json();
            if (res.ok) {
                // Locally update state to show immediately
                setOrder({ ...order, status: 'paid' });
            } else {
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
        setOrder(null);
        setErrorMsg('');

        setTimeout(() => {
            if (scannerElementRef.current && !scannerRef.current) {
                const scanner = new Html5QrcodeScanner(
                    "qr-reader",
                    { fps: 10, qrbox: { width: 250, height: 250 }, formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] },
                    /* verbose= */ false
                );

                scanner.render((decodedText) => {
                    // Success callback
                    scanner.clear(); // stop scanning on success
                    setIsScanning(false);
                    fetchOrder(decodedText); // Expecting something like "ROASTLY-ABCD"
                }, (error) => {
                    // Ignore scan errors/noise
                });

                scannerRef.current = scanner;
            }
        }, 100); // slight delay for mounting DOM
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    // Render Login
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-6 relative overflow-hidden">
                {/* Visual decorations matching the brand */}
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
                    <h1 className="text-[28px] font-display font-bold text-center text-[var(--color-text-primary)] mb-2">Owner Portal</h1>
                    <p className="text-center text-[var(--color-text-secondary)] mb-8 font-sans">Secure access for staff only.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                placeholder="Enter PIN (Demo: 7788)"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] focus:border-[var(--color-accent)] outline-none text-[16px] text-center tracking-widest font-mono text-[var(--color-text-primary)]"
                                autoFocus
                            />
                        </div>
                        {errorMsg && <p className="text-red-500 text-sm text-center font-medium">{errorMsg}</p>}
                        <button
                            type="submit"
                            disabled={isLoading || pin.length < 4}
                            className="w-full py-4 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-bold disabled:opacity-50 hover:opacity-90 transition-opacity flex justify-center items-center"
                        >
                            {isLoading ? 'Verifying...' : 'Access Portal'}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-[var(--color-bg-primary)] flex flex-col items-center p-4 sm:p-8 pt-24 font-sans relative">
            <button onClick={() => { setIsAuthenticated(false); setPin(''); setOrder(null); }} className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                <LogOut size={24} />
            </button>

            <div className="w-full max-w-2xl text-center mb-10">
                <h1 className="text-[32px] sm:text-[40px] font-display font-bold text-[var(--color-text-primary)] mb-2">Order Dashboard</h1>
                <p className="text-[var(--color-text-secondary)]">Search or scan digital order slips to process payments.</p>
            </div>

            <AnimatePresence mode="wait">
                {/* 1. Dashboard Default View - Search & Scan */}
                {!order && !isScanning && (
                    <motion.div key="search" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-[var(--color-bg-secondary)] rounded-3xl p-6 sm:p-10 border border-[var(--color-border)] shadow-sm">
                        <form onSubmit={handleSearchSubmit} className="relative mb-8">
                            <input
                                id="order-search"
                                type="text"
                                placeholder="Enter 4-digit code (e.g. ABCD)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                                maxLength={10}
                                className="w-full px-6 py-5 rounded-2xl border border-[var(--color-border)] bg-white focus:border-[var(--color-accent)] outline-none text-[20px] font-mono tracking-widest text-center text-[var(--color-text-primary)] placeholder:tracking-normal placeholder:font-sans placeholder:text-[16px] shadow-inner"
                            />
                            <button type="submit" disabled={isLoading || searchTerm.length < 4} className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] p-3 rounded-xl disabled:opacity-50">
                                {isLoading ? <span className="animate-spin text-xl">◌</span> : <Search size={20} />}
                            </button>
                        </form>

                        {errorMsg && <p className="text-red-500 text-center mb-6 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{errorMsg}</p>}

                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-[1px] bg-[var(--color-border)] flex-1" />
                            <span className="text-[var(--color-text-secondary)] font-medium text-sm px-2">OR</span>
                            <div className="h-[1px] bg-[var(--color-border)] flex-1" />
                        </div>

                        <button onClick={startScanner} className="w-full py-5 rounded-2xl border-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)] font-bold text-[16px] flex justify-center items-center gap-3 hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)] transition-all">
                            <Camera size={24} /> Scan Customer QR Code
                        </button>
                    </motion.div>
                )}

                {/* 2. Scanner View */}
                {isScanning && (
                    <motion.div key="scanner" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-border)] flex flex-col">
                        <div className="p-4 bg-[var(--color-text-primary)] flex justify-between items-center text-white">
                            <h3 className="font-display font-medium text-lg flex items-center gap-2"><Camera size={20} /> Scan QR Code</h3>
                            <button onClick={stopScanner} className="hover:bg-red-500/20 p-2 rounded-full transition-colors"><X size={24} /></button>
                        </div>
                        <div className="p-2 sm:p-6 bg-black">
                            <div id="qr-reader" ref={scannerElementRef} className="w-full rounded-2xl overflow-hidden" style={{ border: 'none' }}></div>
                        </div>
                        <div className="p-4 text-center bg-[var(--color-bg-primary)]">
                            <p className="text-[14px] text-[var(--color-text-secondary)]">Align the customer's QR code within the frame.</p>
                        </div>
                    </motion.div>
                )}

                {/* 3. Order Details View */}
                {order && !isScanning && (
                    <motion.div key="order" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl flex flex-col md:flex-row gap-6">
                        {/* Order Info Panel */}
                        <div className="flex-1 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[var(--color-border)]">
                            <button onClick={() => setOrder(null)} className="flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium text-sm mb-6 transition-colors group">
                                <ArrowRight className="mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" size={16} /> Back to Search
                            </button>

                            <div className="flex justify-between items-end mb-8 border-b border-[var(--color-border)] pb-6">
                                <div>
                                    <p className="text-[13px] uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] mb-1">Order #</p>
                                    <h2 className="text-[40px] font-display font-bold text-[var(--color-text-primary)] leading-none -tracking-[0.02em]">{order.short_id}</h2>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${order.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                    {order.status === 'paid' ? 'PAID & FINISHED' : 'PENDING PAYMENT'}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-[var(--color-bg-secondary)] p-3 rounded-2xl border border-[var(--color-border)]">
                                        <div className="w-10 h-10 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] rounded-full flex items-center justify-center font-bold">{item.qty}x</div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-[var(--color-text-primary)] text-[16px]">{item.name}</p>
                                        </div>
                                        <p className="font-medium text-[var(--color-text-secondary)] text-[16px]">${(item.price * item.qty).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center text-[24px]">
                                <span className="font-sans font-medium text-[var(--color-text-secondary)]">Total</span>
                                <span className="font-display font-bold text-[var(--color-text-primary)]">${order.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Action Panel */}
                        <div className="w-full md:w-80 flex flex-col gap-4">
                            {order.status !== 'paid' ? (
                                <button
                                    onClick={markAsPaid}
                                    disabled={isLoading}
                                    className="w-full h-32 bg-[var(--color-text-primary)] hover:bg-[#2A2A2A] text-white rounded-3xl shadow-lg flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {isLoading ? <span className="animate-spin text-2xl">◌</span> : <CheckCircle size={32} />}
                                    <span className="font-bold text-lg">Mark as Paid</span>
                                </button>
                            ) : (
                                <div className="w-full h-32 bg-green-50 border border-green-200 text-green-700 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-inner">
                                    <CheckCircle size={32} />
                                    <span className="font-bold text-lg">Transaction Complete</span>
                                </div>
                            )}

                            <button onClick={() => setOrder(null)} className="w-full py-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl font-semibold text-[var(--color-text-primary)] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                                Clear / Next Order
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
