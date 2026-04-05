import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { toast } from 'react-toastify';

export default function VehiclesCrud() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ model: '', licence_plate: '', seats: 4, hourly_rate: 5.0, vehicle_type: 'Sedan', is_available: true });
    const [editingId, setEditingId] = useState(null);

    const load = () => {
        api.get('/vehicles?limit=100').then(r => setVehicles(r.data.vehicles || [])).catch(() => { });
    };
    useEffect(load, []);

    const resetForm = () => {
        setForm({ model: '', licence_plate: '', seats: 4, hourly_rate: 5.0, vehicle_type: 'Sedan', is_available: true });
        setEditingId(null);
        setShowForm(false);
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        Object.keys(form).forEach(k => {
            if (k === 'image' && !form[k]) return;
            data.append(k, form[k]);
        });
        try {
            if (editingId) await api.put(`/vehicles/${editingId}`, data);
            else await api.post('/vehicles', data);
            toast.success(`Vehicle ${editingId ? 'updated' : 'added'}!`);
            resetForm();
            load();
        } catch { } finally { setLoading(false); }
    };

    const edit = (v) => {
        setForm({ ...v });
        setEditingId(v.vehicle_id);
        setShowForm(true);
    };

    const remove = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await api.delete(`/vehicles/${id}`);
            toast.success('Vehicle deleted.');
            load();
        } catch { }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Vehicle Inventory</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2">
                    {showForm ? 'Cancel' : '+ Add New Vehicle'}
                </button>
            </div>

            {showForm && (
                <div className="card shadow-md animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                    <form onSubmit={submit} className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="label">Model Name</label>
                            <input className="input" placeholder="e.g. Toyota Corolla" required value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Licence Plate</label>
                            <input className="input" placeholder="ABC-123" required value={form.licence_plate} onChange={e => setForm(p => ({ ...p, licence_plate: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Type</label>
                            <select className="input" value={form.vehicle_type} onChange={e => setForm(p => ({ ...p, vehicle_type: e.target.value }))}>
                                {['Sedan', 'SUV', 'Bike', 'Van'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Hourly Rate ($)</label>
                            <input className="input" type="number" step="0.5" required value={form.hourly_rate} onChange={e => setForm(p => ({ ...p, hourly_rate: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Seats</label>
                            <input className="input" type="number" min="1" required value={form.seats} onChange={e => setForm(p => ({ ...p, seats: e.target.value }))} />
                        </div>
                        <div className="flex items-end pb-3">
                            <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary" checked={form.is_available} onChange={e => setForm(p => ({ ...p, is_available: e.target.checked }))} />
                                Available for booking
                            </label>
                        </div>
                        <div>
                            <label className="label">Vehicle Image</label>
                            <input type="file" className="input" accept="image/*" onChange={e => setForm(p => ({ ...p, image: e.target.files[0] }))} />
                        </div>
                        <div className="md:col-span-3 text-right">
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? 'Saving…' : editingId ? 'Update Vehicle' : 'Add Vehicle'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vehicles.map(v => (
                    <div key={v.vehicle_id} className="card group">
                        <div className="flex justify-between items-start mb-3">
                            {v.image_url ? (
                                <img src={`${api.defaults.baseURL.replace('/api/v1', '')}${v.image_url}`} alt={v.model} className="w-16 h-12 object-cover rounded-lg shadow-sm" />
                            ) : (
                                <div className="w-10 h-10 bg-primary/5 text-primary rounded-lg flex items-center justify-center text-xl">🚘</div>
                            )}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => edit(v)} className="p-2 hover:bg-gray-100 rounded-lg text-sm">✏️</button>
                                <button onClick={() => remove(v.vehicle_id)} className="p-2 hover:bg-red-50 rounded-lg text-sm text-red-500">🗑️</button>
                            </div>
                        </div>
                        <div className="font-bold">{v.model}</div>
                        <div className="text-xs text-gray-400 mb-4">{v.licence_plate} · {v.vehicle_type}</div>
                        <div className="flex items-center justify-between border-t pt-3 mt-auto">
                            <span className="text-sm font-bold">${v.hourly_rate}<span className="text-gray-400 font-normal">/hr</span></span>
                            <span className={`badge ${v.is_available ? 'badge-active' : 'badge-rejected'}`}>{v.is_available ? 'Available' : 'Rented/Booked'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}
