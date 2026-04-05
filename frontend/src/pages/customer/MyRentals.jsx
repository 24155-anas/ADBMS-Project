import { useState, useEffect } from 'react';
import api from '../../api/client.js';

export default function MyRentals() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/rentals').then(r => setRentals(r.data.rentals || [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">My Rentals</h1>
                <p className="text-gray-500 mt-1">Track your car pickup and return status.</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading your history…</div>
            ) : rentals.length === 0 ? (
                <div className="card text-center py-20">
                    <div className="text-4xl mb-4">🚗</div>
                    <p className="text-gray-500">You haven't rented any cars yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {rentals.map(r => (
                        <div key={r.rental_id} className="card flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition border-l-4 border-l-primary">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-lg">{r.vehicle_model}</span>
                                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    📅 {new Date(r.start_date).toLocaleDateString()} — {new Date(r.end_date).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-400 font-mono">ID: #{r.rental_id} · Plate: {r.licence_plate}</div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="text-xl font-bold text-primary">${r.total_amount}</div>
                                {r.status === 'pending' && (
                                    <div className="text-[10px] text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">WAITTING FOR PICKUP</div>
                                )}
                                {r.status === 'active' && (
                                    <div className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100 animate-pulse">DRIVING NOW</div>
                                )}
                                {r.status === 'completed' && (
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Returned</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
