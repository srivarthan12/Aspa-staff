// client/src/pages/admin/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import SkeletonDashboard from '../../components/SkeletonDashboard';
import userService from '../../services/userService';
import advanceRequestService from '../../services/advanceRequestService';
import paymentService from '../../services/paymentService';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardPage = () => {
  const [stats, setStats] = useState({ totalStaff: 0, pendingRequests: 0, monthlyPayroll: 0 });
  const [recentPayments, setRecentPayments] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const { user: loggedInUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
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

        // --- Prepare Payroll Chart Data ---
        const payrollByMonth = payments.reduce((acc, p) => {
            const monthYear = `${p.month.slice(0, 3)} ${p.year}`;
            acc[monthYear] = (acc[monthYear] || 0) + p.finalPaid;
            return acc;
        }, {});
        
        const labels = Object.keys(payrollByMonth).reverse();
        const data = Object.values(payrollByMonth).reverse();

        setChartData({
            labels,
            datasets: [{
                label: 'Total Payroll',
                data,
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
                borderRadius: 5,
            }]
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUser?.token) {
      fetchData();
    }
  }, [loggedInUser]);

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { display: false }, 
        title: { display: true, text: 'Monthly Overall Payroll', font: { size: 18 }, padding: { bottom: 20 } } 
    },
    scales: {
        y: { ticks: { callback: value => `₹${value/1000}k` } },
        x: { grid: { display: false } }
    }
  };

  if (loading) {
      return <SkeletonDashboard />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">An overview of your shop's payroll and staff activity.</p>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Staff" value={stats.totalStaff} icon="👥" gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard title="Pending Requests" value={stats.pendingRequests} icon="🔔" gradient="bg-gradient-to-br from-yellow-500 to-yellow-600" />
        <StatCard title="Payroll this Month" value={`₹${new Intl.NumberFormat('en-IN').format(stats.monthlyPayroll)}`} icon="💰" gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
      </div>

      {/* Monthly Payroll Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="h-80 relative">
            <Bar options={barChartOptions} data={chartData} />
        </div>
      </div>

      {/* Quick Actions & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
                <Link to="/admin/users" className="text-center p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                    <span className="text-3xl">👥</span>
                    <p className="mt-2 font-semibold text-emerald-800">Manage Users</p>
                </Link>
                <Link to="/admin/payroll" className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <span className="text-3xl">💳</span>
                    <p className="mt-2 font-semibold text-blue-800">Process Payroll</p>
                </Link>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Payments</h3>
            <div className="overflow-y-auto h-48">
                <table className="w-full text-left">
                    <tbody>
                        {recentPayments.map(p => (
                            <tr key={p._id} className="border-b border-gray-100">
                                <td className="py-3 px-2 text-sm font-medium text-gray-800">{p.employee?.username || 'N/A'}</td>
                                <td className="py-3 px-2 text-sm text-gray-600">{p.month} {p.year}</td>
                                <td className="py-3 px-2 text-sm font-bold text-emerald-600 text-right">₹{new Intl.NumberFormat('en-IN').format(p.finalPaid)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
