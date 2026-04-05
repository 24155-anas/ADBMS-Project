import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';

export default function VehiclesList() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        setLoading(true);
        api.get('/vehicles?limit=50').then(r => setVehicles(r.data.vehicles || [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const filtered = vehicles.filter(v => !filter || v.vehicle_type === filter);

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-3xl font-bold">Browse Vehicles</h1>
                <select className="input w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="">All types</option>
                    {['Sedan', 'SUV', 'Bike', 'Van'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading vehicles…</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">No vehicles found.</div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(v => (
                        <div key={v.vehicle_id} className="card hover:shadow-lg transition group">
                            <div className="bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl h-36 flex items-center justify-center text-5xl mb-4 group-hover:scale-105 transition-transform overflow-hidden">
                                {v.image_url ? (
                                    <img src={`${api.defaults.baseURL.replace('/api/v1', '')}${v.image_url}`} alt={v.model} className="w-full h-full object-cover" />
                                ) : (
                                    <span>🚗</span>
                                )}
                            </div>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold">{v.model}</h3>
                                <span className={`badge ${v.is_available ? 'badge-active' : 'badge-rejected'}`}>{v.is_available ? 'Available' : 'Unavailable'}</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{v.vehicle_type} · {v.seats} seats · {v.licence_plate}</p>
                            <div className="border-t pt-3 flex items-center justify-between">
                                <span className="text-primary font-bold">${v.hourly_rate}<span className="text-xs text-gray-400">/hr</span></span>
                                {v.is_available
                                    ? <Link to={`/customer/rentals/new/${v.vehicle_id}`} className="btn-primary text-sm py-2 px-3">Rent Now →</Link>
                                    : <span className="text-sm text-gray-400">Not available</span>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
