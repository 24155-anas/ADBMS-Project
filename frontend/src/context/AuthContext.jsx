import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')) || null; }
        catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    const login = useCallback((data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    // Detect token expiry: parse exp claim
    useEffect(() => {
        if (!token) return;
        try {
            const { exp } = JSON.parse(atob(token.split('.')[1]));
            const msUntilExpiry = exp * 1000 - Date.now();
            if (msUntilExpiry <= 0) { logout(); return; }
            const t = setTimeout(logout, msUntilExpiry);
            return () => clearTimeout(t);
        } catch { /* ignore malformed token */ }
    }, [token, logout]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuth: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
