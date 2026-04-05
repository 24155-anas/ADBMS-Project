import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-toastify';

export default function RideRequest() {
    const { user, token } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ pickup_location: '', dropoff_location: '' });
    const socketRef = useRef(null);

    const load = () => {
        api.get('/drivers/available').then(r => setDrivers(r.data.drivers || [])).catch(() => { });
        api.get('/ride-requests/mine').then(r => setRequests(r.data.requests || [])).catch(() => { });
    };

    useEffect(() => {
        load();
        // Connect socket
        const socket = io('/', { auth: { token, userId: user.userId, role: 'customer' } });
        socketRef.current = socket;

        socket.on('ride_request:updated', (data) => {
            const { rideRequest } = data;
            toast.info(`Ride request #${rideRequest.request_id} is now ${rideRequest.status}!`);
            load();
        });

        return () => socket.disconnect();
    }, [token, user.userId]);

    const requestRide = async (e) => {
        e.preventDefault();
        if (!form.pickup_location || !form.dropoff_location) return;
        setLoading(true);
        try {
            await api.post('/ride-requests', { ...form, fare_estimate: 500 + Math.floor(Math.random() * 500) });
            toast.success('Ride requested! Waiting for drivers...');
            setForm({ pickup_location: '', dropoff_location: '' });
            load();
        } catch { } finally { setLoading(false); }
    };

    const cancelRequest = async (id) => {
        try {
            await api.put(`/ride-requests/${id}/cancel`);
            toast.success('Request cancelled.');
            load();
        } catch { }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <h1 className="text-3xl font-bold">Ride Booking</h1>

                {/* Request Form */}
                <div className="card bg-primary text-white">
                    <h2 className="text-xl font-bold mb-4">Request a Ride</h2>
                    <form onSubmit={requestRide} className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium opacity-80 mb-1">Pickup location</label>
                            <input className="input bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-white/40" placeholder="Enter pickup address" value={form.pickup_location} onChange={e => setForm(p => ({ ...p, pickup_location: e.target.value }))} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium opacity-80 mb-1">Dropoff location</label>
                            <input className="input bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-white/40" placeholder="Enter destination" value={form.dropoff_location} onChange={e => setForm(p => ({ ...p, dropoff_location: e.target.value }))} required />
                        </div>
                        <div className="sm:col-span-2 text-right">
                            <button type="submit" disabled={loading} className="bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition sm:w-auto w-full">
                                {loading ? 'Requesting…' : 'Request Ride Now'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Available Drivers Simulation */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Drivers Near You</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {drivers.map((d, i) => (
                            <div key={i} className="card flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">👨‍✈️</div>
                                <div className="flex-1">
                                    <div className="font-bold">{d.full_name}</div>
                                    <div className="text-xs text-gray-500">{d.vehicle_model} · {d.eta_minutes} min away</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-yellow-500">★ {d.rating}</div>
                                </div>
                            </div>
                        ))}
                        {drivers.length === 0 && <div className="text-gray-400 p-4">No drivers available right now.</div>}
                    </div>
                </div>

                {/* History / Active Requests */}
                <div>
                    <h2 className="text-xl font-bold mb-4">My Request History</h2>
                    <div className="space-y-4">
                        {requests.map(r => (
                            <div key={r.request_id} className="card flex items-center justify-between">
                                <div>
                                    <div className="font-semibold text-sm">{r.pickup_location} → {r.dropoff_location}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(r.created_at).toLocaleString()} · Est. Fare: ${r.fare_estimate}
                                        {r.driver_name && <span className="text-primary ml-2">Assigned: {r.driver_name}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                                    {r.status === 'pending' && (
                                        <button onClick={() => cancelRequest(r.request_id)} className="text-xs text-red-500 hover:underline">Cancel</button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {requests.length === 0 && <div className="text-gray-400 p-4">No requests yet.</div>}
                    </div>
                </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
                <div className="card bg-blue-50 border-blue-100">
                    <h3 className="font-bold text-blue-800 mb-2">How it works</h3>
                    <ul className="text-sm text-blue-700 space-y-3">
                        <li className="flex gap-2"><span>1.</span> Enter your details and request.</li>
                        <li className="flex gap-2"><span>2.</span> Local drivers will be notified instantly.</li>
                        <li className="flex gap-2"><span>3.</span> Once accepted, your ride begins!</li>
                    </ul>
                </div>
                <div className="card">
                    <h3 className="font-bold mb-2">Safety first</h3>
                    <p className="text-sm text-gray-500">All drivers are verified and vehicles are inspected regularly to ensure a premium experience.</p>
                </div>
            </div>
        </div>
    );
}
