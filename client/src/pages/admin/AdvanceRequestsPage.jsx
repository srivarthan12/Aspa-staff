// client/src/pages/admin/AdvanceRequestsPage.jsx
import React, { useState, useEffect } from 'react';
import advanceRequestService from '../../services/advanceRequestService';
import { useAuth } from '../../context/AuthContext';
import SkeletonRow from '../../components/SkeletonRow'; // We can reuse this

const AdvanceRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: loggedInUser } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await advanceRequestService.getAllRequests(loggedInUser.token);
        setRequests(data);
      } catch (err) {
        setError('Failed to fetch advance requests.');
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUser?.token) {
      fetchRequests();
    }
  }, [loggedInUser]);

  const handleStatusUpdate = async (requestId, status) => {
    try {
        await advanceRequestService.updateRequestStatus(requestId, status, loggedInUser.token);
        setRequests(requests.map(req => 
            req._id === requestId ? { ...req, status } : req
        ));
    } catch (err) {
        alert(`Failed to ${status} request.`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'approved': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        case 'processed': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  }

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Advance Salary Requests</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : (
                requests.map((req) => (
                  <tr key={req._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{req.employee?.username || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{req.employee?.staffRole || 'Staff'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{new Intl.NumberFormat('en-IN').format(req.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(req.requestDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                          {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      {req.status === 'pending' && (
                        <>
                            <button onClick={() => handleStatusUpdate(req._id, 'approved')} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-xs">Approve</button>
                            <button onClick={() => handleStatusUpdate(req._id, 'rejected')} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-xs">Reject</button>
                        </>
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

export default AdvanceRequestsPage;
