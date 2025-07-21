// client/src/pages/StaffProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import advanceRequestService from '../services/advanceRequestService';
import Input from '../components/Input';
import Button from '../components/Button';

const StaffProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const paymentData = await paymentService.getMyPayments(user._id, user.token);
        setPayments(paymentData);
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAdvanceRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage('');
    try {
        await advanceRequestService.createAdvanceRequest({ amount: advanceAmount }, user.token);
        setFormMessage('Request submitted successfully!');
        setAdvanceAmount('');
    } catch (err) {
        setFormMessage(err.response?.data?.message || 'Failed to submit request.');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img className="h-12 w-12 rounded-full object-cover" src={user.photo || `https://placehold.co/100x100/E2E8F0/4A5568?text=${user.username.charAt(0)}`} alt="Profile" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.username}</h1>
              <p className="text-sm text-gray-500">Your Personal Dashboard</p>
            </div>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">
            Logout
          </button>
        </div>
      </header>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile & Advance Request */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">My Profile</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Role:</strong> <span className="text-gray-600">{user.staffRole}</span></p>
                <p><strong>Base Salary:</strong> <span className="text-gray-600">₹{new Intl.NumberFormat('en-IN').format(user.salary)}</span></p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Request Advance</h3>
              <form onSubmit={handleAdvanceRequest} className="space-y-4">
                {formMessage && <p className="text-sm text-center p-2 rounded-md bg-blue-50 text-blue-700">{formMessage}</p>}
                <Input 
                    name="advanceAmount"
                    label="Amount (₹)"
                    type="number"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    placeholder="e.g., 5000"
                />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column: Payment History */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Deduction</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan="4" className="text-center p-4">Loading history...</td></tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p._id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.month} {p.year}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">₹{new Intl.NumberFormat('en-IN').format(p.baseSalary)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600">- ₹{new Intl.NumberFormat('en-IN').format(p.advanceDeduction)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">₹{new Intl.NumberFormat('en-IN').format(p.finalPaid)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffProfilePage;
