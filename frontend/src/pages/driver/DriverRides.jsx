import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-toastify';

export default function DriverRides() {
    const { user, token } = useAuth();
    const [available, setAvailable] = useState([]);
    const [activeRide, setActiveRide] = useState(null);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);

    const load = () => {
        api.get('/ride-requests/available').then(r => setAvailable(r.data.requests || [])).catch(() => { });
        api.get('/rides?status=active').then(r => setActiveRide(r.data.rides?.[0] || null)).catch(() => { });
    };

    useEffect(() => {
        load();
        const socket = io('/', { auth: { token, userId: user.userId, role: 'driver' } });
        socketRef.current = socket;

        socket.on('ride_request:new', (request) => {
            toast.info(`New ride request nearby!`);
            setAvailable(prev => [request, ...prev]);
        });

        return () => socket.disconnect();
    }, [token, user.userId]);

    const acceptRequest = async (id) => {
        setLoading(true);
        try {
            await api.put(`/ride-requests/${id}/accept`);
            toast.success('Request accepted! Ride is now active.');
            load();
        } catch { } finally { setLoading(false); }
    };

    const rejectRequest = async (id) => {
        try {
            await api.put(`/ride-requests/${id}/reject`);
            toast.info('Request ignored.');
            setAvailable(prev => prev.filter(r => r.request_id !== id));
        } catch { }
    };

    const completeRide = async (id) => {
        try {
            await api.put(`/rides/${id}/complete`);
            toast.success('Ride completed! Drive safe.');
            load();
        } catch { }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
            <h1 className="text-3xl font-bold">Manage Rides</h1>

            {/* Active Ride Section */}
            {activeRide ? (
                <div className="card border-2 border-primary shadow-lg bg-primary/5">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-primary">Active Ride In Progress 🚗</h2>
                        <span className="badge badge-active animate-pulse">DRIVING</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Customer</div>
                                <div className="font-bold text-lg">{activeRide.customer_name}</div>
                            </div>
                            <div className="flex gap-8">
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Pickup</div>
                                    <div className="text-sm font-medium">{activeRide.pickup_location}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Dropoff</div>
                                    <div className="text-sm font-medium">{activeRide.dropoff_location}</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-end items-end gap-4">
                            <div className="text-2xl font-bold">${activeRide.fare}</div>
                            <button onClick={() => completeRide(activeRide.ride_id)} className="btn-primary w-full sm:w-auto">Complete Ride</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card text-center py-12 border-dashed">
                    <div className="text-4xl mb-4">📭</div>
                    <h2 className="text-lg font-bold text-gray-400">No active ride right now</h2>
                    <p className="text-sm text-gray-400">Available requests will appear below.</p>
                </div>
            )}

            {/* Incoming Requests Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Incoming Requests</h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-green-500">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                        LIVE
                    </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {available.map(r => (
                        <div key={r.request_id} className="card border border-gray-100 hover:border-primary/20 transition group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{r.customer_name}</div>
                                    <div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleTimeString()}</div>
                                </div>
                                <div className="font-bold text-primary">${r.fare_estimate || 500}</div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-xs">🟢</span>
                                    <div className="text-xs text-gray-600 font-medium leading-tight line-clamp-1">{r.pickup_location}</div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-xs">🔴</span>
                                    <div className="text-xs text-gray-600 font-medium leading-tight line-clamp-1">{r.dropoff_location}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button disabled={loading || !!activeRide} onClick={() => acceptRequest(r.request_id)} className="flex-1 btn-primary text-xs py-2 disabled:bg-gray-200">Accept</button>
                                <button onClick={() => rejectRequest(r.request_id)} className="btn-outline text-xs py-2 px-4 hover:border-red-500 hover:text-red-500">Ignore</button>
                            </div>
                        </div>
                    ))}
                    {available.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400">
                            Waiting for new requests…
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
