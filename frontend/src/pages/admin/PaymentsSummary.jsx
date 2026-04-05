import { useState, useEffect } from 'react';
import api from '../../api/client.js';

export default function PaymentsSummary() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/payments?limit=100').then(r => setPayments(r.data.payments || [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
            <h1 className="text-3xl font-bold">Payments History</h1>

            <div className="card overflow-hidden !p-0 border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 font-bold text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-center">Method</th>
                                <th className="px-6 py-4 text-center">Time</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {payments.map(p => (
                                <tr key={p.payment_id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#PAY-{p.payment_id}</td>
                                    <td className="px-6 py-4 font-semibold">{p.user_name || 'System User'}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">${p.amount}</td>
                                    <td className="px-6 py-4 text-center border-x border-gray-50">
                                        <span className="uppercase text-[10px] font-bold text-gray-400">{p.payment_method}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-xs whitespace-nowrap">
                                        {new Date(p.payment_time).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`badge badge-${p.payment_status === 'completed' ? 'active' : p.payment_status}`}>{p.payment_status}</span>
                                    </td>
                                </tr>
                            ))}
                            {!loading && payments.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">No transactions recorded yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
