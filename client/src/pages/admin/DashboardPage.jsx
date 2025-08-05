// client/src/pages/admin/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard'; // Assuming StatCard is in this path
import SkeletonDashboard from '../../components/SkeletonDashboard'; // Assuming Skeleton is in this path
import userService from '../../services/userService';
import advanceRequestService from '../../services/advanceRequestService';
import paymentService from '../../services/paymentService';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// A redesigned StatCard component for a more elegant look.
// You can replace your existing StatCard component with this.
const ElegantStatCard = ({ title, value, icon, gradient }) => (
  <div className={`relative p-6 rounded-xl shadow-md text-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${gradient}`}>
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/80 uppercase tracking-wider">{title}</p>
        <div className="absolute -top-3 -right-3 text-5xl opacity-20">{icon}</div>
      </div>
      <p className="mt-2 text-4xl font-bold">{value}</p>
    </div>
  </div>
);


const DashboardPage = () => {
  const [stats, setStats] = useState({ totalStaff: 0, pendingRequests: 0, monthlyPayroll: 0 });
  const [recentPayments, setRecentPayments] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const { user: loggedInUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!loggedInUser?.token) return;

      try {
        setLoading(true);
        const [users, requests, payments] = await Promise.all([
          userService.getUsers(loggedInUser.token),
          advanceRequestService.getAllRequests(loggedInUser.token),
          paymentService.getAllPayments(loggedInUser.token),
        ]);

        // --- Calculate Stats ---
        const staffUsers = users.filter(u => u.role === 'staff');
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const currentYear = new Date().getFullYear();
        const monthlyPayroll = payments
          .filter(p => p.month === currentMonth && p.year === currentYear)
          .reduce((sum, p) => sum + p.finalPaid, 0);

        setStats({
          totalStaff: staffUsers.length,
          pendingRequests: requests.filter(r => r.status === 'pending').length,
          monthlyPayroll: monthlyPayroll,
        });

        // --- Get Recent Payments ---
        setRecentPayments(payments.slice(0, 5));

        // --- Prepare Payroll Chart Data (Last 6 months) ---
        const payrollByMonth = {};
        for(let i=5; i>=0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const month = d.toLocaleString('default', { month: 'long' });
            const year = d.getFullYear();
            const key = `${month.slice(0,3)} ${year}`;
            payrollByMonth[key] = 0;
        }

        payments.forEach(p => {
          const key = `${p.month.slice(0, 3)} ${p.year}`;
          if (payrollByMonth.hasOwnProperty(key)) {
            payrollByMonth[key] += p.finalPaid;
          }
        });
        
        const labels = Object.keys(payrollByMonth);
        const data = Object.values(payrollByMonth);

        setChartData({
            labels,
            datasets: [{
                label: 'Total Payroll',
                data,
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
                borderRadius: 5,
                hoverBackgroundColor: 'rgba(16, 185, 129, 0.8)',
            }]
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loggedInUser]);

  // --- Enhanced Chart.js options for a more professional look ---
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false }, 
      title: { display: true, text: 'Monthly Payroll Overview', font: { size: 18, family: 'sans-serif', weight: '600' }, padding: { bottom: 20 }, color: '#334155' },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
            label: (context) => `Payroll: ₹${new Intl.NumberFormat('en-IN').format(context.raw)}`
        }
      }
    },
    scales: {
      y: { 
        ticks: { callback: value => `₹${value/1000}k`, color: '#64748b' },
        grid: { color: '#e2e8f0', borderDash: [4, 4] },
      },
      x: { 
        grid: { display: false },
        ticks: { color: '#64748b' }
      }
    }
  };

  if (loading) {
      return <SkeletonDashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Redesigned Header --- */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 mt-2">
            Welcome back, {loggedInUser?.username || 'Admin'}! Here's an overview of your business activity.
          </p>
        </div>
        
        {/* --- Redesigned Stat Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ElegantStatCard title="Total Staff" value={stats.totalStaff} icon="👥" gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
          <ElegantStatCard title="Pending Requests" value={stats.pendingRequests} icon="🔔" gradient="bg-gradient-to-br from-yellow-500 to-yellow-600" />
          <ElegantStatCard title="Payroll this Month" value={`₹${new Intl.NumberFormat('en-IN').format(stats.monthlyPayroll)}`} icon="💰" gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
        </div>

        {/* --- Main Content Area (Chart and Info) --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* --- Monthly Payroll Chart --- */}
            <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-xl">
                <div className="h-96 relative">
                    <Bar options={barChartOptions} data={chartData} />
                </div>
            </div>

            {/* --- Side Column (Quick Actions & Recent Payments) --- */}
            <div className="space-y-8">
                {/* --- Quick Actions Card --- */}
                <div className="bg-white p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-xl">
                    <h3 className="text-xl font-semibold mb-4 text-slate-800">Quick Actions</h3>
                    <div className="flex flex-col space-y-4">
                        <Link to="/admin/users" className="group flex items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors">
                            <span className="text-2xl mr-4">👥</span>
                            <p className="font-semibold text-emerald-800">Manage Staff</p>
                        </Link>
                        <Link to="/admin/payroll" className="group flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors">
                            <span className="text-2xl mr-4">💳</span>
                            <p className="font-semibold text-blue-800">Process Payroll</p>
                        </Link>
                    </div>
                </div>

                {/* --- Recent Payments Card --- */}
                <div className="bg-white p-6 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-xl">
                    <h3 className="text-xl font-semibold mb-4 text-slate-800">Recent Payments</h3>
                    <div className="overflow-y-auto h-48 pr-2">
                        <table className="w-full text-left">
                           <thead className="sticky top-0 bg-white">
                                <tr>
                                    <th className="py-2 text-sm font-semibold text-slate-500">Employee</th>
                                    <th className="py-2 text-sm font-semibold text-slate-500 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPayments.length > 0 ? recentPayments.map(p => (
                                    <tr key={p._id} className="border-t border-slate-100">
                                        <td className="py-3 pr-2">
                                          <p className="text-sm font-medium text-slate-800">{p.employee?.username || 'N/A'}</p>
                                          <p className="text-xs text-slate-500">{p.month} {p.year}</p>
                                        </td>
                                        <td className="py-3 pl-2 text-sm font-bold text-emerald-600 text-right">₹{new Intl.NumberFormat('en-IN').format(p.finalPaid)}</td>
                                    </tr>
                                )) : (
                                  <tr>
                                    <td colSpan="2" className="text-center py-8 text-slate-500">No recent payments.</td>
                                  </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
