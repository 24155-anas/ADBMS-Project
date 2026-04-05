import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { toast } from 'react-toastify';

export default function RentalsManagement() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        api.get('/rentals?limit=100').then(r => setRentals(r.data.rentals || [])).catch(() => { }).finally(() => setLoading(false));
    };
    useEffect(load, []);

    const updateStatus = async (id, status) => {
        try {
            const res = await api.put(`/rentals/${id}/status`, { status });
            toast.success(res.data.message);
            load();
        } catch { }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Rentals Management</h1>
                <button onClick={load} className="btn-outline text-sm py-2">Refresh</button>
            </div>

            <div className="card overflow-hidden !p-0 border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 font-bold text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Booking Info</th>
                                <th className="px-6 py-4">Dates</th>
                                <th className="px-6 py-4">Financials</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Workflow Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {rentals.map(r => (
                                <tr key={r.rental_id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{r.customer_name}</div>
                                        <div className="text-xs text-gray-400">{r.vehicle_model} · {r.licence_plate}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-semibold">{new Date(r.start_date).toLocaleDateString()} — {new Date(r.end_date).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-primary">${r.total_amount}</div>
                                        <div className="text-[10px] text-gray-400 lowercase">incl. tax</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`badge badge-${r.status}`}>{r.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {r.status === 'pending' && (
                                                <button onClick={() => updateStatus(r.rental_id, 'active')} className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:shadow-md transition">
                                                    START TRIP
                                                </button>
                                            )}
                                            {r.status === 'active' && (
                                                <button onClick={() => updateStatus(r.rental_id, 'completed')} className="bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:shadow-md transition">
                                                    RETURN CAR
                                                </button>
                                            )}
                                            {(r.status === 'completed' || r.status === 'cancelled') && (
                                                <span className="text-[10px] text-gray-300 font-bold italic">Transaction Closed</span>
                                            )}
                                            {r.status === 'pending' && (
                                                <button onClick={() => updateStatus(r.rental_id, 'cancelled')} className="text-[10px] text-red-500 font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                                                    CANCEL
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && rentals.length === 0 && (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No rentals found in system.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
