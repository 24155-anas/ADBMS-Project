import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';

export default function AdminDashboard() {
    const [summary, setSummary] = useState({ active_users: 0, available_vehicles: 0, active_rides: 0, total_revenue: 0 });

    useEffect(() => {
        api.get('/analytics/summary').then(r => setSummary(r.data)).catch(() => { });
    }, []);

    const stats = [
        { title: 'Active Users', value: summary.active_users, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Available Vehicles', value: summary.available_vehicles, icon: '🚗', color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Ongoing Rides', value: summary.active_rides, icon: '📍', color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: 'Total Revenue', value: `$${summary.total_revenue?.toLocaleString()}`, icon: '💰', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    ];

    const actions = [
        { name: 'Manage Users', path: '/admin/users', icon: '👤' },
        { name: 'Vehicle Inventory', path: '/admin/vehicles', icon: '🚘' },
        { name: 'Rental Bookings', path: '/admin/rentals', icon: '📅' },
        { name: 'Analytics & Reports', path: '/admin/analytics', icon: '📈' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
            <h1 className="text-3xl font-bold">Admin Console</h1>

            {/* KPI Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(s => (
                    <div key={s.title} className="card flex items-center gap-4">
                        <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center text-2xl`}>{s.icon}</div>
                        <div>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{s.title}</div>
                            <div className="text-2xl font-bold">{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Quick Links */}
                <div className="card h-full">
                    <h2 className="text-xl font-bold mb-6">Management Sections</h2>
                    <div className="grid gap-3">
                        {actions.map(a => (
                            <Link key={a.name} to={a.path} className="flex items-center gap-4 p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition font-semibold">
                                <span className="text-xl">{a.icon}</span>
                                {a.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* System Health / Info */}
                <div className="card bg-gray-900 text-white h-full relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-4">System Status</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                                <span className="opacity-60">API Gateway</span>
                                <span className="text-green-400 flex items-center gap-2">● Healthy</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                                <span className="opacity-60">Database Cluster</span>
                                <span className="text-green-400 flex items-center gap-2">● Healthy</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="opacity-60">Socket Handler</span>
                                <span className="text-green-400 flex items-center gap-2">● Online</span>
                            </div>
                        </div>
                        <div className="mt-8">
                            <Link to="/admin/analytics" className="btn-primary w-full justify-center text-sm">View Full Analytics</Link>
                        </div>
                    </div>
                    <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
                </div>
            </div>
        </div>
    );
}
