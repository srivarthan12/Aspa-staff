// client/src/pages/admin/SalaryHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

const SkeletonAccordion = () => (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
    </div>
);

const SalaryHistoryPage = () => {
  const [groupedPayments, setGroupedPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMonth, setActiveMonth] = useState(null);
  const { user: loggedInUser } = useAuth();

  useEffect(() => {
    const fetchAndGroupPayments = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getAllPayments(loggedInUser.token);
        
        const groups = data.reduce((acc, payment) => {
          const monthYear = `${payment.month} ${payment.year}`;
          if (!acc[monthYear]) {
            acc[monthYear] = [];
          }
          acc[monthYear].push(payment);
          return acc;
        }, {});

        setGroupedPayments(groups);
      } catch (err) {
        setError('Failed to fetch payment history.');
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUser?.token) {
      fetchAndGroupPayments();
    }
  }, [loggedInUser]);

  const toggleMonth = (monthYear) => {
    setActiveMonth(activeMonth === monthYear ? null : monthYear);
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Full Salary History</h1>
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => <SkeletonAccordion key={i} />)
        ) : (
          Object.keys(groupedPayments).map((monthYear) => (
            <div key={monthYear} className="bg-white shadow-md rounded-lg overflow-hidden">
              <button
                onClick={() => toggleMonth(monthYear)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-gray-800 hover:bg-gray-50 focus:outline-none"
              >
                <span>{monthYear}</span>
                <svg
                  className={`w-5 h-5 transform transition-transform duration-300 ${
                    activeMonth === monthYear ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {activeMonth === monthYear && (
                <div className="border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Deduction</th>
                          <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {groupedPayments[monthYear].map((p) => (
                          <tr key={p._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{p.employee?.username || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{p.employee?.staffRole || 'Staff'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{new Intl.NumberFormat('en-IN').format(p.baseSalary)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">- ₹{new Intl.NumberFormat('en-IN').format(p.advanceDeduction)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">₹{new Intl.NumberFormat('en-IN').format(p.finalPaid)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SalaryHistoryPage;
