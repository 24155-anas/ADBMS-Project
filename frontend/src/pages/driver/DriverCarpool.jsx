import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { toast } from 'react-toastify';

export default function DriverCarpool() {
    const [offers, setOffers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ vehicle_id: '', origin: '', destination: '', departure_time: '', available_seats: 1, price_per_seat: 100 });

    const load = () => {
        api.get('/carpools/mine').then(r => setOffers(r.data.offers || [])).catch(() => { });
        api.get('/vehicles?limit=50').then(r => setVehicles(r.data.vehicles || [])).catch(() => { });
    };
    useEffect(load, []);

    const createOffer = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/carpools', form);
            toast.success('Carpool offer created!');
            setForm({ vehicle_id: '', origin: '', destination: '', departure_time: '', available_seats: 1, price_per_seat: 100 });
            load();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to create offer.");
        } finally { setLoading(false); }
    };

    const completeTrip = async (id) => {
        try {
            await api.put(`/carpools/${id}/complete`);
            toast.success('Trip marked as completed!');
            load();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to complete trip.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-12">
            <div>
                <h1 className="text-3xl font-bold mb-8">Manage Carpools</h1>
                <div className="card">
                    <h2 className="text-xl font-bold mb-6">Create New Offer</h2>
                    <form onSubmit={createOffer} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="label">Vehicle</label>
                                <select className="input" required value={form.vehicle_id} onChange={e => setForm(p => ({ ...p, vehicle_id: e.target.value }))}>
                                    <option value="">Select vehicle</option>
                                    {vehicles.map(v => <option key={v.vehicle_id} value={v.vehicle_id}>{v.model} ({v.licence_plate})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Origin</label>
                                <input className="input" placeholder="Start location" required value={form.origin} onChange={e => setForm(p => ({ ...p, origin: e.target.value }))} />
                            </div>
                            <div>
                                <label className="label">Destination</label>
                                <input className="input" placeholder="End location" required value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="label">Departure date/time</label>
                                <input className="input" type="datetime-local" required value={form.departure_time} onChange={e => setForm(p => ({ ...p, departure_time: e.target.value }))} />
                            </div>
                            <div>
                                <label className="label">Available seats</label>
                                <input className="input" type="number" min={1} required value={form.available_seats} onChange={e => setForm(p => ({ ...p, available_seats: e.target.value }))} />
                            </div>
                            <div>
                                <label className="label">Price per seat</label>
                                <input className="input" type="number" min={0} required value={form.price_per_seat} onChange={e => setForm(p => ({ ...p, price_per_seat: e.target.value }))} />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">Create Offer</button>
                    </form>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold">My Active Offers</h2>
                {offers.length === 0 ? (
                    <div className="card text-center py-12 text-gray-400">No active offers yet. Create one to share the ride.</div>
                ) : (
                    <div className="space-y-4">
                        {offers.map(o => (
                            <div key={o.carpool_id} className="card">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="font-bold text-lg">{o.origin} → {o.destination}</div>
                                        <div className="text-sm text-gray-500">{new Date(o.departure_time).toLocaleString()}</div>
                                    </div>
                                    <span className={`badge badge-${o.status === 'open' ? 'active' : o.status}`}>{o.status}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6 border-y py-3 border-gray-50">
                                    <div className="flex items-center gap-2"><span>💺</span> {o.available_seats} seats free</div>
                                    <div className="flex items-center gap-2"><span>💰</span> ${o.price_per_seat}/seat</div>
                                    <div className="flex items-center gap-2"><span>🚗</span> {o.licence_plate}</div>
                                </div>
                                {(o.status === 'open' || o.status === 'full') && (
                                    <div className="flex gap-4">
                                        <button onClick={() => completeTrip(o.carpool_id)} className="btn-primary text-xs py-1.5 px-4 bg-green-600 border-none hover:bg-green-700">Complete Trip</button>
                                        <button className="text-sm text-gray-400 font-bold hover:underline">Cancel Offer</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
