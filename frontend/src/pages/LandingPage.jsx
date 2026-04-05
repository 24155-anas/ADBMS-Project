import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/logo.png';

const STEPS = [
    { icon: '📍', title: 'Choose Location', desc: 'Choose your location and find the best car for you.' },
    { icon: '📅', title: 'Pick-up Date', desc: 'Select your pick-up date and time to book your car.' },
    { icon: '🚗', title: 'Book Your Car', desc: 'Book your car and we will deliver it directly to you.' },
];
const WHY = [
    { icon: '🔒', title: 'Best price guaranteed', desc: "Find a lower price? We'll refund 100% of the difference." },
    { icon: '👤', title: 'Experienced driver', desc: "Don't have a driver? We have many experienced drivers for you." },
    { icon: '📦', title: '24-hour car delivery', desc: 'Book your car anytime and we will deliver it directly to you.' },
    { icon: '💬', title: '24/7 technical support', desc: 'Have a question? Contact ApexRides support any time.' },
];
const BRANDS = ['HONDA', 'JAGUAR', 'NISSAN', 'VOLVO', 'AUDI', 'ACURA'];
const TESTIMONIALS = [
    { name: 'Charlie Johnson', location: 'New York, US', rating: 5, text: 'I feel very secure when using ApexRides services. The customer care team is very enthusiastic and the driver is always on time.' },
    { name: 'Sarah Wilson', location: 'Los Angeles, US', rating: 4, text: "I have been using your services for 2 years. Your service is great, I will continue to use your service." },
];

export default function LandingPage() {
    const { isAuth, user } = useAuth();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        api.get('/vehicles?limit=4').then(r => setVehicles(r.data.vehicles || [])).catch(() => { });
    }, []);

    const dashboardPath = user?.roles?.includes('admin') ? '/admin'
        : user?.roles?.includes('driver') ? '/driver' : '/customer';

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-12 pb-20 px-4">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2 space-y-6">
                        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            Find, book and<br />rent a car <span className="text-primary underline decoration-wavy decoration-primary/40">Easily</span>
                        </h1>
                        <p className="text-lg text-gray-500 max-w-md">Get a car wherever and whenever you need it — rentals, carpooling, or on-demand rides.</p>
                        <div className="flex gap-4 flex-wrap">
                            {isAuth
                                ? <Link to={dashboardPath} className="btn-primary text-base px-8 py-4">Go to Dashboard →</Link>
                                : <>
                                    <Link to="/signup" className="btn-primary text-base px-8 py-4">Get started</Link>
                                    <Link to="/signin" className="btn-outline text-base px-8 py-4">Sign in</Link>
                                </>
                            }
                        </div>
                    </div>
                    <div className="lg:w-1/2 flex justify-center">
                        <div className="relative w-full max-w-lg">
                            <div className="absolute inset-0 bg-blue-200/30 rounded-full blur-3xl scale-110" />
                            <img src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=700&q=80" alt="Sports car" className="relative w-full object-cover rounded-3xl shadow-2xl" />
                        </div>
                    </div>
                </div>

                {/* Quick Search Bar */}
                <div className="max-w-4xl mx-auto mt-12">
                    <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 flex items-center gap-3 border-r border-gray-200 pr-4">
                            <span className="text-xl">📍</span>
                            <div>
                                <div className="text-xs text-gray-400 font-medium">Location</div>
                                <input className="text-sm font-medium outline-none placeholder-gray-400 w-full" placeholder="Search your location" />
                            </div>
                        </div>
                        <div className="flex-1 flex items-center gap-3 border-r border-gray-200 pr-4">
                            <span className="text-xl">📅</span>
                            <div>
                                <div className="text-xs text-gray-400 font-medium">Pickup date</div>
                                <input type="date" className="text-sm font-medium outline-none w-full" />
                            </div>
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                            <span className="text-xl">📅</span>
                            <div>
                                <div className="text-xs text-gray-400 font-medium">Return date</div>
                                <input type="date" className="text-sm font-medium outline-none w-full" />
                            </div>
                        </div>
                        <Link to="/customer/vehicles" className="btn-primary whitespace-nowrap">Search</Link>
                    </div>
                </div>
            </section>

            {/* Brand logos */}
            <section className="py-10 bg-white border-y border-gray-100">
                <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-10">
                    {BRANDS.map(b => (
                        <span key={b} className="text-xl font-black tracking-widest text-gray-300 hover:text-gray-500 transition">{b}</span>
                    ))}
                </div>
            </section>

            {!isAuth && (
                <section id="how-it-works" className="py-20 px-4 bg-gray-50">
                    <div className="max-w-5xl mx-auto text-center">
                        <span className="inline-block bg-blue-100 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">HOW IT WORKS</span>
                        <h2 className="text-4xl font-bold text-gray-900 mb-12">Rent with following 3 working steps</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {STEPS.map((s, i) => (
                                <div key={i} className="card text-center hover:shadow-md transition group">
                                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:bg-primary/10 transition">{s.icon}</div>
                                    <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                                    <p className="text-sm text-gray-500">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Popular vehicles */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block bg-blue-100 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">POPULAR RENTAL DEALS</span>
                        <h2 className="text-4xl font-bold text-gray-900">Most popular cars rental deals</h2>
                    </div>
                    {vehicles.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {vehicles.map(v => (
                                <div key={v.vehicle_id} className="card hover:shadow-lg transition group">
                                    <div className="bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl h-40 flex items-center justify-center mb-4 overflow-hidden">
                                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🚗</span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{v.model}</h3>
                                    <div className="flex items-center gap-1 text-yellow-500 text-sm mb-3">
                                        {'★'.repeat(4)}<span className="text-gray-400 ml-1">4.{Math.floor(Math.random() * 9)} stars</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                        <span>👥 {v.seats} seats</span><span>⚙️ {v.vehicle_type}</span>
                                    </div>
                                    <div className="border-t pt-3 flex items-center justify-between">
                                        <div><span className="text-xs text-gray-400">Price</span><br /><span className="text-primary font-bold text-lg">${v.hourly_rate}/hr</span></div>
                                        <Link to={`/customer/vehicles`} className="btn-primary text-sm py-2 px-4">Rent Now →</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[{ m: 'Jaguar XE L P250', r: 4.8, p: 1800 }, { m: 'Audi R8', r: 4.6, p: 2100 }, { m: 'BMW M3', r: 4.5, p: 1600 }, { m: 'Lamborghini Huracán', r: 4.3, p: 2300 }].map((c, i) => (
                                <div key={i} className="card hover:shadow-lg transition group">
                                    <div className="bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl h-40 flex items-center justify-center mb-4">
                                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🚗</span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{c.m}</h3>
                                    <div className="flex items-center gap-1 text-yellow-500 text-sm mb-3">
                                        {'★'.repeat(Math.floor(c.r))}<span className="text-gray-400 ml-1">{c.r} ({(Math.random() * 2000 + 500).toFixed(0)} reviews)</span>
                                    </div>
                                    <div className="border-t pt-3 flex items-center justify-between">
                                        <div><span className="text-xs text-gray-400">Price</span><br /><span className="text-primary font-bold text-lg">${c.p}<span className="text-sm">/day</span></span></div>
                                        <Link to="/customer/vehicles" className="btn-primary text-sm py-2 px-4">Rent Now →</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="text-center mt-10">
                        <Link to="/customer/vehicles" className="btn-outline">Show all vehicles →</Link>
                    </div>
                </div>
            </section>

            {!isAuth && (
                <section id="why-us" className="py-20 px-4 bg-gray-50">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 flex justify-center">
                            <div className="relative">
                                <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-blue-100 rounded-full -z-10" />
                                <img src="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80" alt="Audi" className="w-full max-w-md rounded-2xl shadow-xl object-cover" />
                            </div>
                        </div>
                        <div className="lg:w-1/2 space-y-6">
                            <span className="inline-block bg-blue-100 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">WHY CHOOSE US</span>
                            <h2 className="text-4xl font-bold text-gray-900">We offer the best experience with our rental deals</h2>
                            <div className="space-y-5">
                                {WHY.map((w, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{w.icon}</div>
                                        <div>
                                            <h4 className="font-semibold mb-1">{w.title}</h4>
                                            <p className="text-sm text-gray-500">{w.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-5xl mx-auto text-center">
                    <span className="inline-block bg-blue-100 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">TESTIMONIALS</span>
                    <h2 className="text-4xl font-bold text-gray-900 mb-12">What people say about us?</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="card text-left hover:shadow-md transition">
                                <div className="text-yellow-400 text-2xl mb-3">{'★'.repeat(t.rating)}</div>
                                <p className="font-bold text-3xl mb-2">{t.rating}.0 stars</p>
                                <p className="text-gray-600 italic mb-4">"{t.text}"</p>
                                <div>
                                    <div className="font-semibold">{t.name}</div>
                                    <div className="text-sm text-gray-400">From {t.location}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-white font-bold text-xl flex items-center gap-2">
                        <img src={logo} alt="ApexRides" className="h-8 w-auto brightness-0 invert" />
                        ApexRides
                    </div>
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="hover:text-white transition">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition">Terms of Service</a>
                        <Link to="/signin" className="hover:text-white transition">Sign In</Link>
                    </div>
                    <div className="text-sm">© 2026 ApexRides. All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
}
