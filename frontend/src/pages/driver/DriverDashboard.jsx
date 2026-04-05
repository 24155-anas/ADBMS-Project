import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DriverDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ activeRides: 0, carpools: 0, earnings: 0 });

    useEffect(() => {
        Promise.all([
            api.get('/rides?status=active').catch(() => ({ data: {} })),
            api.get('/carpools?limit=50').catch(() => ({ data: {} })),
        ]).then(([rides, carpools]) => {
            setStats({
                activeRides: rides.data.rides?.length || 0,
                carpools: (carpools.data.carpools || []).filter(c => c.driver_id === user.userId).length,
            });
        });
    }, [user.userId]);

    const cards = [
        { title: 'Ride Requests', icon: '📍', desc: 'View and accept incoming on-demand ride requests.', path: '/driver/rides', cta: 'Go to Rides' },
        { title: 'Carpool Management', icon: '👥', desc: 'Create and manage your shared carpool offers.', path: '/driver/carpool', cta: 'Manage Carpools' },
        { title: 'Earnings', icon: '💰', desc: 'View your total earnings and payment history.', path: '/profile', cta: 'View Profile' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Driver Dashboard</h1>
                    <p className="text-gray-500 mt-1">Ready to hit the road, {user?.full_name?.split(' ')[0]}?</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Active Rides</div>
                        <div className="font-bold text-xl">{stats.activeRides}</div>
                    </div>
                    <div className="text-right border-l pl-4">
                        <div className="text-sm text-gray-400">My Carpools</div>
                        <div className="font-bold text-xl">{stats.carpools}</div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {cards.map(c => (
                    <div key={c.title} className="card hover:shadow-md transition">
                        <div className="text-4xl mb-4">{c.icon}</div>
                        <h2 className="text-xl font-bold mb-2">{c.title}</h2>
                        <p className="text-gray-500 text-sm mb-6">{c.desc}</p>
                        <Link to={c.path} className="btn-primary text-sm">{c.cta} →</Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
