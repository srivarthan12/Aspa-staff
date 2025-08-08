// client/src/pages/admin/UserDetailedHistoryPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const UserDetailedHistoryPage = () => {
  const { userId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMonth, setActiveMonth] = useState(null);
  const { user: loggedInUser } = useAuth();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await userService.getUserFinancialDetails(userId, loggedInUser.token);
        setDetails(data);
      } catch (err) {
        setError('Failed to load user details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (loggedInUser && userId) {
      fetchDetails();
    }
  }, [userId, loggedInUser]);

  const monthlyPayments = useMemo(() => {
    if (!details) return {};
    // Group payments by month, as each payment is a summary of that month's transactions
    return details.payments.reduce((acc, payment) => {
      const monthYear = `${payment.month} ${payment.year}`;
      acc[monthYear] = payment;
      return acc;
    }, {});
  }, [details]);

  const toggleMonth = (monthYear) => {
    setActiveMonth(activeMonth === monthYear ? null : monthYear);
  };

  if (loading) return <div className="text-center p-10">Loading details...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!details) return <div className="text-center p-10">User not found.</div>;

  return (
    <div>
      <Link to="/admin/history" className="text-emerald-600 hover:underline mb-4 inline-block">&larr; Back to User List</Link>
      <div className="flex items-center space-x-4 mb-8">
        <img className="h-16 w-16 rounded-full object-cover" src={details.user.photo || `https://placehold.co/100x100/E2E8F0/4A5568?text=${details.user.username.charAt(0)}`} alt="" />
        <div>
            <h1 className="text-3xl font-bold text-gray-800">{details.user.username}</h1>
            <p className="text-gray-600">{details.user.staffRole}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.keys(monthlyPayments).map(monthYear => {
          const payment = monthlyPayments[monthYear];
          const isActive = activeMonth === monthYear;

          return (
            <div key={monthYear} className="bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggleMonth(monthYear)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-gray-800 hover:bg-gray-50 focus:outline-none"
              >
                <span>{monthYear}</span>
                <div className="flex items-center space-x-4">
                    <span className="text-base font-bold text-emerald-600">
                        Total Paid: ₹{new Intl.NumberFormat('en-IN').format(payment.finalPaid)}
                    </span>
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-300 ${
                        isActive ? 'rotate-180' : ''
                      }`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
              </button>
              {isActive && (
                <div className="border-t border-gray-200 p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Base Salary:</span>
                        <span className="font-medium text-gray-800">₹{new Intl.NumberFormat('en-IN').format(payment.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Bata Paid:</span>
                        <span className="font-medium text-blue-600">+ ₹{new Intl.NumberFormat('en-IN').format(payment.bataPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Advance:</span>
                        <span className="font-medium text-red-600">₹{new Intl.NumberFormat('en-IN').format(payment.advanceDeduction)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3 mt-3">
                        <span className="font-bold text-gray-800">Total Paid:</span>
                        <span className="font-bold text-emerald-600 text-lg">₹{new Intl.NumberFormat('en-IN').format(payment.baseSalary+bataPaid)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default UserDetailedHistoryPage;
