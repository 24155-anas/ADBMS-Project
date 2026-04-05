import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { toast } from 'react-toastify';

export default function MyActivity() {
    const [rentals, setRentals] = useState([]);
    const [carpools, setCarpools] = useState([]);
    const [tab, setTab] = useState('rentals');
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        Promise.all([
            api.get('/rentals'),
            api.get('/carpools/my-bookings')
        ]).then(([rentRes, carpRes]) => {
            setRentals(rentRes.data.rentals || []);
            setCarpools(carpRes.data.bookings || []);
        }).catch(() => {
            toast.error("Failed to load activity.");
        }).finally(() => setLoading(false));
    };

    useEffect(load, []);

    const cancelCarpool = async (id) => {
        if (!confirm("Are you sure you want to opt out of this carpool?")) return;
        try {
            await api.put(`/carpools/bookings/${id}/cancel`);
            toast.success("Opted out of carpool successfully.");
            load();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to cancel booking.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 font-outfit">My Activity</h1>
                <p className="text-gray-500 mt-2">Manage your current rentals and carpool bookings.</p>
            </header>

            <div className="flex gap-4 border-b border-gray-200">
                {['rentals', 'carpools'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`pb-3 px-6 font-bold text-sm capitalize transition-all ${tab === t
                                ? 'border-b-4 border-primary text-primary'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {t === 'rentals' ? '🚗 Car Rentals' : '👥 Carpooling'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading activity…</div>
            ) : tab === 'rentals' ? (
                <div className="space-y-4">
                    {rentals.length === 0 ? (
                        <div className="card text-center py-20">
                            <p className="text-gray-500">No rentals found.</p>
                        </div>
                    ) : (
                        rentals.map(r => (
                            <div key={r.rental_id} className="card relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-l-8 border-primary">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-outfit font-bold text-xl">{r.vehicle_model}</h3>
                                            <span className={`badge badge-${r.status}`}>{r.status}</span>
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <span>📅 {new Date(r.start_date).toLocaleDateString()}</span>
                                            <span>→</span>
                                            <span>{new Date(r.end_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-xs text-gray-400">Plate: <span className="font-mono text-gray-600">{r.licence_plate}</span></div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary">${r.total_amount}</div>
                                        <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Total Paid</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {carpools.length === 0 ? (
                        <div className="card text-center py-20">
                            <p className="text-gray-500">No carpool bookings found.</p>
                        </div>
                    ) : (
                        carpools.map(c => (
                            <div key={c.booking_id} className="card relative overflow-hidden hover:shadow-xl transition-all duration-300 border-l-8 border-secondary">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-outfit font-bold text-xl">{c.origin} → {c.destination}</h3>
                                            <span className={`badge badge-${c.status}`}>{c.status}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            ⏰ <span className="font-bold">{new Date(c.departure_time).toLocaleString()}</span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Passenger: <span className="font-semibold text-gray-700">{c.driver_name}</span> · {c.seats_booked} seat(s)
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <div className="text-2xl font-bold text-secondary">${c.seats_booked * c.price_per_seat}</div>
                                        {c.status !== 'cancelled' && c.offer_status === 'open' && (
                                            <button
                                                onClick={() => cancelCarpool(c.booking_id)}
                                                className="text-xs font-bold text-red-500 hover:text-red-700 underline uppercase tracking-tighter"
                                            >
                                                Opt out
                                            </button>
                                        )}
                                        {c.offer_status === 'completed' && <span className="text-[10px] text-green-600 font-bold uppercase">Trip Done</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
