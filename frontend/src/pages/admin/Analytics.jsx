import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/client.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Analytics() {
    const [revenue, setRevenue] = useState([]);
    const [driverEarnings, setDriverEarnings] = useState([]);
    const [vehicleStats, setVehicleStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(`/analytics/revenue?period=${period}`).catch(() => ({ data: { revenue: [] } })),
            api.get('/analytics/driver-earnings').catch(() => ({ data: { earnings: [] } })),
            api.get('/analytics/vehicle-stats').catch(() => ({ data: { stats: [] } })),
        ]).then(([rev, earn, stats]) => {
            setRevenue(rev.data.revenue || []);
            setDriverEarnings(earn.data.earnings || []);
            setVehicleStats(stats.data.stats || []);
        }).finally(() => setLoading(false));
    }, [period]);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Project Revenue Report', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()} | Period: ${period}`, 14, 30);

        const tableData = revenue.map(r => [r.period, r.category, `$${r.total}`]);
        doc.autoTable({
            head: [['Period', 'Category', 'Total Revenue']],
            body: tableData,
            startY: 40,
            theme: 'grid',
            headStyles: { fillStyle: '#2563EB' }
        });
        doc.save('revenue-report.pdf');
    };

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(revenue);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue');
        XLSX.writeFile(workbook, 'revenue-report.xlsx');
    };

    // Process data for charts
    const groupedRevenue = revenue.reduce((acc, curr) => {
        const found = acc.find(item => item.period === curr.period);
        if (found) found[curr.category] = parseFloat(curr.total);
        else acc.push({ period: curr.period, [curr.category]: parseFloat(curr.total) });
        return acc;
    }, []).reverse();

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Analytics & Reports</h1>
                <div className="flex gap-3">
                    <select className="input text-xs w-auto py-2" value={period} onChange={e => setPeriod(e.target.value)}>
                        <option value="day">Daily</option>
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                    </select>
                    <button onClick={exportPDF} className="btn-outline text-xs py-2 px-4 border-gray-200 text-gray-600 hover:border-gray-500">PDF Report</button>
                    <button onClick={exportExcel} className="btn-outline text-xs py-2 px-4 border-gray-200 text-gray-600 hover:border-gray-500">Excel Export</button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Aggregating data…</div>
            ) : (
                <>
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Revenue Line Chart */}
                        <div className="card">
                            <h2 className="text-lg font-bold mb-6">Revenue Over Time</h2>
                            <div className="h-72 w-full">
                                <ResponsiveContainer>
                                    <LineChart data={groupedRevenue}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis dataKey="period" stroke="#9CA3AF" fontSize={11} tickMargin={10} />
                                        <YAxis stroke="#9CA3AF" fontSize={11} tickFormatter={v => `$${v}`} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                        <Line type="monotone" dataKey="rental" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="ride" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="carpool" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Vehicle Ratings Bar Chart */}
                        <div className="card">
                            <h2 className="text-lg font-bold mb-6">Top Vehicle Consistency</h2>
                            <div className="h-72 w-full">
                                <ResponsiveContainer>
                                    <BarChart data={vehicleStats.slice(0, 5)}>
                                        <XAxis dataKey="model" stroke="#9CA3AF" fontSize={10} angle={-15} textAnchor="end" interval={0} />
                                        <YAxis stroke="#9CA3AF" fontSize={11} domain={[0, 5]} />
                                        <Tooltip />
                                        <Bar dataKey="avg_rating" fill="#2563EB" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Driver Earnings Table */}
                        <div className="card">
                            <h2 className="text-lg font-bold mb-6">Driver Performance</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-400 border-b">
                                            <th className="pb-3">Driver</th>
                                            <th className="pb-3 text-right">Rides</th>
                                            <th className="pb-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {driverEarnings.map(d => (
                                            <tr key={d.driver_id}>
                                                <td className="py-4 font-medium">{d.driver_name}</td>
                                                <td className="py-4 text-right">${d.ride_earnings}</td>
                                                <td className="py-4 text-right font-bold text-green-600">${d.total_earnings}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Review Categories Pie Chart */}
                        <div className="card">
                            <h2 className="text-lg font-bold mb-4">Revenue Breakdown</h2>
                            <div className="h-64 w-full">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={revenue} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                            {revenue.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
