import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/logo.png';

export default function Navbar() {
    const { isAuth, user, logout } = useAuth();
    const navigate = useNavigate();

    const dashboardPath = user?.roles?.includes('admin')
        ? '/admin'
        : user?.roles?.includes('driver')
            ? '/driver'
            : '/customer';

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                    <img src={logo} alt="ApexRides" className="h-10 w-auto" />
                    ApexRides
                </Link>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                    {/* Only show landing page info to guest users */}
                    {!isAuth && (
                        <>
                            <NavLink to="/#how-it-works" className="hover:text-primary transition">How it works</NavLink>
                            <NavLink to="/#why-us" className="hover:text-primary transition">Why choose us</NavLink>
                        </>
                    )}

                    {/* Rental deals visible to guests and customers only */}
                    {(!isAuth || (user?.roles?.includes('customer') && !user?.roles?.includes('admin'))) && (
                        <>
                            <NavLink to="/customer/vehicles" className="hover:text-primary transition">Rental deals</NavLink>
                            {user?.roles?.includes('customer') && <NavLink to="/customer/activity" className="hover:text-primary transition">My Activity</NavLink>}
                        </>
                    )}

                    {isAuth && (
                        <>
                            <NavLink to={dashboardPath} className="hover:text-primary transition">Dashboard</NavLink>
                            <NavLink to="/profile" className="hover:text-primary transition">Profile</NavLink>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {isAuth ? (
                        <>
                            <span className="hidden md:block text-sm text-gray-500">Hi, {user?.full_name?.split(' ')[0]}</span>
                            <button onClick={handleLogout} className="btn-outline text-sm py-2 px-4">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/signin" className="text-sm font-semibold text-gray-700 hover:text-primary transition px-3 py-2">Sign in</Link>
                            <Link to="/signup" className="btn-primary text-sm py-2 px-5">Sign up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
