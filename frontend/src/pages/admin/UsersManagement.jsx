import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { toast } from 'react-toastify';

export default function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        api.get('/users?limit=100').then(r => setUsers(r.data.users || [])).catch(() => { }).finally(() => setLoading(false));
    };
    useEffect(load, []);

    const toggleActive = async (id, current) => {
        try {
            if (current) await api.delete(`/users/${id}`); // deactivate
            else await api.put(`/users/${id}`, { is_active: true });
            toast.success('User status updated');
            load();
        } catch { }
    };

    const manageRole = async (id, role, has) => {
        try {
            if (has) await api.delete(`/users/${id}/role`, { data: { role_name: role } });
            else await api.put(`/users/${id}/role`, { role_name: role });
            toast.success('Role updated');
            load();
        } catch { }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">User Management</h1>
                <button onClick={load} className="btn-outline text-sm py-2">Refresh List</button>
            </div>

            <div className="card overflow-hidden !p-0 border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Roles</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(u => (
                                <tr key={u.user_id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{u.full_name}</div>
                                        <div className="text-xs text-gray-400">{u.email} · {u.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-1">
                                            {['customer', 'driver', 'admin'].map(r => (
                                                <button key={r} onClick={() => manageRole(u.user_id, r, u.roles.includes(r))}
                                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${u.roles.includes(r) ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-gray-100 text-gray-400 border border-transparent hover:border-gray-300'}`}>
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`badge ${u.is_active ? 'badge-active' : 'badge-rejected'}`}>
                                            {u.is_active ? 'Active' : 'Deactivated'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => toggleActive(u.user_id, u.is_active)}
                                            className={`text-xs font-bold px-4 py-2 rounded-lg transition ${u.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                                            {u.is_active ? 'Deactivate' : 'Reactivate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && users.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
