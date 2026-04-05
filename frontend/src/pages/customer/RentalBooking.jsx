import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-toastify';

export default function RentalBooking() {
    const { vehicleId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [form, setForm] = useState({ start_date: '', end_date: '', payment_method: 'cash' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get(`/vehicles/${vehicleId}`).then(r => setVehicle(r.data.vehicle)).catch(() => { });
    }, [vehicleId]);

    const days = form.start_date && form.end_date ? Math.max(1, Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / (1000 * 60 * 60 * 24))) : 0;
    const total = vehicle ? (vehicle.hourly_rate * 24 * days).toFixed(2) : 0;

    const submit = async (e) => {
        e.preventDefault();
        if (!days) { toast.error('Please select a valid date range.'); return; }
        setLoading(true);
        try {
            await api.post('/rentals', { vehicle_id: vehicleId, ...form, total_amount: total });
            toast.success('Rental booked successfully!');
            navigate('/customer/vehicles');
        } catch { } finally { setLoading(false); }
    };

    return (
        <div className="max-w-lg mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-6">Book Vehicle</h1>
            {vehicle ? (
                <div className="card mb-6 flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-3xl">🚗</div>
                    <div>
                        <div className="font-bold text-lg">{vehicle.model}</div>
                        <div className="text-sm text-gray-500">{vehicle.vehicle_type} · ${vehicle.hourly_rate}/hr</div>
                    </div>
                </div>
            ) : <div className="h-24 bg-gray-100 rounded-2xl animate-pulse mb-6"></div>}
            <div className="card">
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="label">Start date</label>
                        <input className="input" type="date" required min={new Date().toISOString().split('T')[0]} value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label">End date</label>
                        <input className="input" type="date" required min={form.start_date || new Date().toISOString().split('T')[0]} value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label">Payment method</label>
                        <select className="input" value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                        </select>
                    </div>
                    {days > 0 && (
                        <div className="bg-blue-50 rounded-xl p-4 flex justify-between">
                            <span className="font-medium">{days} day{days !== 1 ? 's' : ''}</span>
                            <span className="font-bold text-primary text-lg">${total}</span>
                        </div>
                    )}
                    <button type="submit" disabled={loading || !vehicle} className="btn-primary w-full justify-center disabled:opacity-60">{loading ? 'Booking…' : 'Confirm booking'}</button>
                </form>
            </div>
        </div>
    );
}
