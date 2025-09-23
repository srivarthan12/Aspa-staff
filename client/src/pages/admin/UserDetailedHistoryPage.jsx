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

  const { groupedByMonth, monthlyTotals } = useMemo(() => {
    if (!details) return { groupedByMonth: {}, monthlyTotals: {} };

    const allTransactions = [
      ...details.payments.map(p => ({ ...p, type: 'payment' })),
      ...details.bata.map(b => ({ ...b, type: 'bata' })),
      ...details.advances.map(a => ({ ...a, type: 'advance' }))
    ];

    const grouped = allTransactions.reduce((acc, item) => {
      const date = new Date(item.createdAt || item.date);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(item);
      return acc;
    }, {});

    const totals = {};
    for (const month in grouped) {
        const salary = grouped[month].filter(t => t.type === 'payment').reduce((sum, t) => sum + t.finalPaid, 0);
        const bata = grouped[month].filter(t => t.type === 'bata').reduce((sum, t) => sum + t.amount, 0);
        totals[month] = { salary, bata, total: salary + bata };
    }

    return { groupedByMonth: grouped, monthlyTotals: totals };
  }, [details]);

  const toggleMonth = (monthYear) => {
    setActiveMonth(activeMonth === monthYear ? null : monthYear);
  };

  if (loading) return <div>Loading details...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!details) return <div>User not found.</div>;

  return (
    <div>
      <Link to="/admin/history" className="text-emerald-600 hover:underline mb-4 inline-block">&larr; Back to User List</Link>
      <div className="flex items-center space-x-4 mb-6">
        <img className="h-16 w-16 rounded-full object-cover" src={details.user.photo || `https://placehold.co/100x100/E2E8F0/4A5568?text=${details.user.username.charAt(0)}`} alt="" />
        <div>
            <h1 className="text-3xl font-bold text-gray-800">{details.user.username}</h1>
            <p className="text-gray-600">{details.user.staffRole}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.keys(groupedByMonth).map(monthYear => {
          const totalForMonth = monthlyTotals[monthYear]?.total || 0;
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
                        Total Paid: ₹{new Intl.NumberFormat('en-IN').format(totalForMonth)}
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
                <div className="border-t border-gray-200 p-4">
                  <div className="space-y-3">
                      {groupedByMonth[monthYear].sort((a,b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).map(item => (
                          <div key={item._id || item.date} className="flex justify-between items-center text-sm p-3 rounded-md border">
                              <div>
                                  <span className={`font-semibold ${
                                      item.type === 'payment' ? 'text-green-600' :
                                      item.type === 'bata' ? 'text-blue-600' : 'text-red-600'
                                  }`}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                                  <span className="text-gray-500 ml-2 text-xs">{new Date(item.createdAt || item.date).toLocaleDateString()}</span>
                                  {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                              </div>
                              <span className="font-bold">
                                  ₹{new Intl.NumberFormat('en-IN').format(item.finalPaid || item.amount)}
                              </span>
                          </div>
                      ))}
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