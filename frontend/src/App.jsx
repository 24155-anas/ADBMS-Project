import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Navbar from './components/Navbar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import Profile from './pages/Profile.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard.jsx';
import VehiclesList from './pages/customer/VehiclesList.jsx';
import RentalBooking from './pages/customer/RentalBooking.jsx';
import CarpoolBrowse from './pages/customer/CarpoolBrowse.jsx';
import RideRequest from './pages/customer/RideRequest.jsx';
import MyActivity from './pages/customer/MyActivity.jsx';

// Driver pages
import DriverDashboard from './pages/driver/DriverDashboard.jsx';
import DriverRides from './pages/driver/DriverRides.jsx';
import DriverCarpool from './pages/driver/DriverCarpool.jsx';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import UsersManagement from './pages/admin/UsersManagement.jsx';
import VehiclesCrud from './pages/admin/VehiclesCrud.jsx';
import RentalsManagement from './pages/admin/RentalsManagement.jsx';
import PaymentsSummary from './pages/admin/PaymentsSummary.jsx';
import Analytics from './pages/admin/Analytics.jsx';

function RoleRedirect() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/signin" replace />;
    if (user.roles?.includes('admin')) return <Navigate to="/admin" replace />;
    if (user.roles?.includes('driver')) return <Navigate to="/driver" replace />;
    return <Navigate to="/customer" replace />;
}

export default function App() {
    return (
        <ErrorBoundary>
            <Navbar />
            <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

                {/* Profile */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Customer */}
                <Route path="/customer" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
                <Route path="/customer/vehicles" element={<ProtectedRoute role="customer"><VehiclesList /></ProtectedRoute>} />
                <Route path="/customer/rentals/new/:vehicleId" element={<ProtectedRoute role="customer"><RentalBooking /></ProtectedRoute>} />
                <Route path="/customer/carpool" element={<ProtectedRoute role="customer"><CarpoolBrowse /></ProtectedRoute>} />
                <Route path="/customer/rides" element={<ProtectedRoute role="customer"><RideRequest /></ProtectedRoute>} />
                <Route path="/customer/activity" element={<ProtectedRoute role="customer"><MyActivity /></ProtectedRoute>} />

                {/* Driver */}
                <Route path="/driver" element={<ProtectedRoute role="driver"><DriverDashboard /></ProtectedRoute>} />
                <Route path="/driver/rides" element={<ProtectedRoute role="driver"><DriverRides /></ProtectedRoute>} />
                <Route path="/driver/carpool" element={<ProtectedRoute role="driver"><DriverCarpool /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute role="admin"><UsersManagement /></ProtectedRoute>} />
                <Route path="/admin/vehicles" element={<ProtectedRoute role="admin"><VehiclesCrud /></ProtectedRoute>} />
                <Route path="/admin/rentals" element={<ProtectedRoute role="admin"><RentalsManagement /></ProtectedRoute>} />
                <Route path="/admin/payments" element={<ProtectedRoute role="admin"><PaymentsSummary /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ErrorBoundary>
    );
}
