import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

export default function SignIn() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', form);
            login(data);
            const path = data.user.roles?.includes('admin') ? '/admin'
                : data.user.roles?.includes('driver') ? '/driver' : '/customer';
            navigate(path);
            toast.success(`Welcome back, ${data.user.full_name.split(' ')[0]}!`);
        } catch (err) {
            const msg = err.response?.data?.error || 'Invalid email or password.';
            toast.error(msg);
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="card shadow-xl">
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-3">🚗</div>
                        <h1 className="text-2xl font-bold">Welcome back</h1>
                        <p className="text-gray-500 text-sm mt-1">Sign in to your ApexRides account</p>
                    </div>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="label">Email address</label>
                            <input className="input" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <input className="input" type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
