import { useState, useEffect } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

export default function Profile() {
    const { user, login, token } = useAuth();
    const [form, setForm] = useState({ full_name: '', phone: '' });
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) setForm({ full_name: user.full_name || '', phone: user.phone || '' });
    }, [user]);

    const updateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put(`/auth/profile`, form);
            // Update local user data
            login({ token, user: { ...user, ...data.user } });
            toast.success('Profile updated!');
        } catch { } finally { setLoading(false); }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (pwForm.new_password.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            await api.put('/auth/change-password', pwForm);
            toast.success('Password changed successfully!');
            setPwForm({ current_password: '', new_password: '' });
        } catch { } finally { setLoading(false); }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
            <h1 className="text-3xl font-bold">My Profile</h1>

            <div className="card">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl">
                        {user?.full_name?.[0] || '?'}
                    </div>
                    <div>
                        <div className="font-bold text-lg">{user?.full_name}</div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                        <div className="flex gap-2 mt-1">
                            {user?.roles?.map(r => <span key={r} className="badge badge-active capitalize">{r}</span>)}
                        </div>
                    </div>
                </div>
                <form onSubmit={updateProfile} className="space-y-4">
                    <div>
                        <label className="label">Full name</label>
                        <input className="input" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required />
                    </div>
                    <div>
                        <label className="label">Phone</label>
                        <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">Save changes</button>
                </form>
            </div>

            <div className="card">
                <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                <form onSubmit={changePassword} className="space-y-4">
                    <div>
                        <label className="label">Current password</label>
                        <input className="input" type="password" required value={pwForm.current_password} onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))} />
                    </div>
                    <div>
                        <label className="label">New password</label>
                        <input className="input" type="password" required value={pwForm.new_password} onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))} />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">Change password</button>
                </form>
            </div>
        </div>
    );
}
