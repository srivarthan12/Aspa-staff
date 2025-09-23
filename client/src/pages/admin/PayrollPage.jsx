// client/src/pages/admin/PayrollPage.jsx
import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import paymentService from '../../services/paymentService';
import advanceRequestService from '../../services/advanceRequestService';
import { useAuth } from '../../context/AuthContext';
import SkeletonRow from '../../components/SkeletonRow';

const PayrollPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: loggedInUser } = useAuth();
  
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  const fetchStaffWithPaymentStatus = async () => {
    try {
      setLoading(true);
      const [users, advances] = await Promise.all([
        userService.getUsers(loggedInUser.token),
        advanceRequestService.getAllRequests(loggedInUser.token)
      ]);
      
      const staffUsers = users.filter(u => u.role === 'staff');
      const approvedAdvances = advances.filter(a => a.status === 'approved');

      const staffWithStatus = await Promise.all(
        staffUsers.map(async (staffMember) => {
          const payments = await paymentService.getMyPayments(staffMember._id, loggedInUser.token);
          const paymentThisMonth = payments.find(p => p.month === currentMonth && p.year === currentYear);
          const isPaid = !!paymentThisMonth;

          if (isPaid) {
            // If paid, use the data from the actual payment record
            return { 
              ...staffMember, 
              isPaid, 
              paymentDetails: {
                baseSalary: paymentThisMonth.baseSalary,
                advanceDeduction: paymentThisMonth.advanceDeduction,
                finalPaid: paymentThisMonth.finalPaid
              }
            };
          } else {
            // If not paid, calculate the pending amounts
            const pendingAdvance = approvedAdvances.find(a => a.employee?._id === staffMember._id);
            const pendingDeduction = pendingAdvance ? pendingAdvance.amount : 0;
            
            const payableAmount = (staffMember.salary || 0) - pendingDeduction;

            return { 
                ...staffMember, 
                isPaid, 
                paymentDetails: {
                    baseSalary: staffMember.salary,
                    advanceDeduction: pendingDeduction,
                    finalPaid: payableAmount
                }
            };
          }
        })
      );

      setStaff(staffWithStatus);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch staff data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedInUser?.token) {
      fetchStaffWithPaymentStatus();
    }
  }, [loggedInUser]);

  const handlePay = async (employeeId) => {
    if (window.confirm('Are you sure you want to process this salary payment?')) {
      try {
        await paymentService.createPayment({ 
            employeeId, 
            month: currentMonth, 
            year: currentYear 
        }, loggedInUser.token);
        fetchStaffWithPaymentStatus();
      } catch (err) {
        alert('Failed to process payment.');
      }
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Payroll Management</h1>
      <p className="text-gray-600 mb-6">Processing payments for {currentMonth} {currentYear}</p>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : (
                staff.map((employee) => (
                  <tr key={employee._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-full object-cover" src={employee.photo || `https://placehold.co/100x100/E2E8F0/4A5568?text=${employee.username.charAt(0)}`} alt="" />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{employee.username}</div>
                                <div className="text-xs text-gray-500">{employee.staffRole}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>Base: ₹{new Intl.NumberFormat('en-IN').format(employee.paymentDetails.baseSalary || 0)}</div>
                        {employee.paymentDetails.advanceDeduction > 0 && (
                            <div className="text-xs text-red-600">Deduction: - ₹{new Intl.NumberFormat('en-IN').format(employee.paymentDetails.advanceDeduction || 0)}</div>
                        )}
                        <div className="font-bold text-emerald-700 mt-1">
                            {employee.isPaid ? 'Paid Amount' : 'Payable'}: ₹{new Intl.NumberFormat('en-IN').format(employee.paymentDetails.finalPaid || 0)}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {employee.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {!employee.isPaid ? (
                        <button onClick={() => handlePay(employee._id)} className="text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-xs font-bold">
                          PAY NOW
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs font-bold">COMPLETED</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;
