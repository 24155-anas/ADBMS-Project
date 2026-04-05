import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, role }) {
    const { isAuth, user } = useAuth();
    if (!isAuth) return <Navigate to="/signin" replace />;
    if (role && !user?.roles?.includes(role)) return <Navigate to="/dashboard" replace />;
    return children;
}
