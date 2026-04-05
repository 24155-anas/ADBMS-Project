import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

export default function SignUp() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'customer' });
    const [loading, setLoading] = useState(false);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', { ...form, role: form.role });
            login(data);
            const user = data.user;
            const roles = user.roles || [user.role];
            const path = roles.includes('admin') ? '/admin'
                : roles.includes('driver') ? '/driver'
                    : '/customer';
            navigate(path);
            toast.success('Account created successfully!');
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to create account.';
            toast.error(msg);
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="card shadow-xl">
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-3">🚗</div>
                        <h1 className="text-2xl font-bold">Create your account</h1>
                        <p className="text-gray-500 text-sm mt-1">Join ApexRides today — it's free</p>
                    </div>

                    {/* Role picker */}
                    <div className="flex gap-3 mb-6">
                        {['customer', 'driver'].map(r => (
                            <button key={r} type="button"
                                onClick={() => set('role', r)}
                                className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition ${form.role === r ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-600 hover:border-primary/40'}`}>
                                {r === 'customer' ? '🧑 Customer' : '🚘 Driver'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="label">Full name</label>
                            <input className="input" type="text" placeholder="John Doe" required value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Email address</label>
                            <input className="input" type="email" placeholder="you@example.com" required value={form.email} onChange={e => set('email', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Phone</label>
                            <input className="input" type="tel" placeholder="+92 300 0000000" required value={form.phone} onChange={e => set('phone', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <input className="input" type="password" placeholder="Minimum 6 characters" required value={form.password} onChange={e => set('password', e.target.value)} />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
                            {loading ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account? <Link to="/signin" className="text-primary font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
