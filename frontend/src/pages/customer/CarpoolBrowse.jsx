import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CarpoolBrowse() {
    const { user } = useAuth();
    const [offers, setOffers] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [tab, setTab] = useState('browse');
    const [loading, setLoading] = useState(false);
    const [seats, setSeats] = useState({});

    const load = () => {
        api.get('/carpools?status=open&limit=50').then(r => setOffers(r.data.offers || [])).catch(() => { });
        api.get('/carpools/my-bookings').then(r => setMyBookings(r.data.bookings || [])).catch(() => { });
    };
    useEffect(load, []);

    const bookSeat = async (carpoolId) => {
        const s = parseInt(seats[carpoolId] || 1);
        setLoading(true);
        try {
            await api.post('/carpools/book', { carpool_id: carpoolId, seats_booked: s });
            toast.success('Carpool seat booked!');
            load();
        } catch (err) {
            toast.error(err.response?.data?.error || "Booking failed.");
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
            <h1 className="text-3xl font-bold">Carpool</h1>
            <div className="flex gap-2 border-b border-gray-200">
                {['browse', 'bookings'].map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`pb-3 px-4 font-semibold text-sm capitalize transition ${tab === t ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
                ))}
            </div>
            {tab === 'browse' && (
                offers.length === 0
                    ? <div className="text-center py-16 text-gray-400">No open carpool offers right now.</div>
                    : <div className="grid md:grid-cols-2 gap-6">
                        {offers.map(o => (
                            <div key={o.carpool_id} className="card hover:shadow-md transition">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="font-bold text-lg">{o.origin} → {o.destination}</div>
                                        <div className="text-sm text-gray-500">{new Date(o.departure_time).toLocaleString()}</div>
                                    </div>
                                    <span className="badge badge-active">{o.status}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                    <span>💺 {o.available_seats} seats left</span>
                                    <span>💰 ${o.price_per_seat}/seat</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="number" min={1} max={o.available_seats} className="input w-20" value={seats[o.carpool_id] || 1} onChange={e => setSeats(p => ({ ...p, [o.carpool_id]: e.target.value }))} />
                                    <button className="btn-primary text-sm py-2" disabled={loading} onClick={() => bookSeat(o.carpool_id)}>Book seat</button>
                                </div>
                            </div>
                        ))}
                    </div>
            )}
            {tab === 'bookings' && (
                myBookings.length === 0
                    ? <div className="text-center py-16 text-gray-400">No carpool bookings yet.</div>
                    : <div className="space-y-4">
                        {myBookings.map(b => (
                            <div key={b.booking_id} className="card flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">{b.origin} → {b.destination}</div>
                                    <div className="text-sm text-gray-500">{new Date(b.departure_time).toLocaleString()} · {b.seats_booked} seat(s)</div>
                                </div>
                                <span className={`badge badge-${b.status}`}>{b.status}</span>
                            </div>
                        ))}
                    </div>
            )}
        </div>
    );
}
