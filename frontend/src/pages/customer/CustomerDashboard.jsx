import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import carpoolIcon from '../../assets/car_pool_seats.png';
import rideIcon from '../../assets/ride_booking.png';

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ rentals: 0, rides: 0, carpools: 0 });

    useEffect(() => {
        Promise.all([
            api.get('/rentals?limit=1').catch(() => ({ data: {} })),
            api.get('/rides?limit=1').catch(() => ({ data: {} })),
        ]).then(([rent, rideR]) => {
            setStats({ rentals: rent.data.rentals?.length || 0, rides: rideR.data.rides?.length || 0 });
        });
    }, []);

    const modules = [
        { title: 'Car Rentals', icon: '🚗', desc: 'Browse and book vehicles for hourly or daily rental.', path: '/customer/vehicles', cta: 'Browse vehicles' },
        { title: 'Carpooling', img: carpoolIcon, desc: 'Find shared rides and split the cost with others.', path: '/customer/carpool', cta: 'Browse carpools' },
        { title: 'Ride Booking', img: rideIcon, desc: 'Book an instant on-demand ride with a nearby driver.', path: '/customer/rides', cta: 'Request a ride' },
        { title: 'My Activity', icon: '📋', desc: 'View your active, upcoming, and past rentals & carpools.', path: '/customer/activity', cta: 'View history' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, {user?.full_name?.split(' ')[0]} 👋</h1>
                    <p className="text-gray-500 mt-1">What would you like to do today?</p>
                </div>
                <Link to="/profile" className="btn-outline text-sm py-2 px-4">Edit profile</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                {modules.map(m => (
                    <div key={m.title} className="card hover:shadow-md transition group">
                        {m.img ? (
                            <img src={m.img} alt={m.title} className="w-16 h-16 object-contain mb-4" />
                        ) : (
                            <div className="text-4xl mb-4">{m.icon}</div>
                        )}
                        <h2 className="text-xl font-bold mb-2">{m.title}</h2>
                        <p className="text-gray-500 text-sm mb-6">{m.desc}</p>
                        <Link to={m.path} className="btn-primary text-sm">{m.cta} →</Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
