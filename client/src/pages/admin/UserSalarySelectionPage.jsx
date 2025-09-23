import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import SkeletonRow from '../../components/SkeletonRow';

const UserSalarySelectPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: loggedInUser } = useAuth();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const users = await userService.getUsers(loggedInUser.token);
        setStaff(users.filter(u => u.role === 'staff'));
      } finally {
        setLoading(false);
      }
    };
    if (loggedInUser) fetchStaff();
  }, [loggedInUser]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">View Detailed Salary History</h1>
      <p className="text-gray-600 mb-6">Select a staff member to view their complete financial history, including salary, advances, and bata payments.</p>
      <div className="bg-white shadow-md rounded-lg">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {staff.map(user => (
              <li key={user._id}>
                <Link to={`/admin/history/${user._id}`} className="block hover:bg-gray-50">
                  <div className="flex items-center px-4 py-4 sm:px-6">
                    <div className="min-w-0 flex-1 flex items-center">
                      <div className="flex-shrink-0">
                        <img className="h-12 w-12 rounded-full object-cover" src={user.photo || `https://placehold.co/100x100/E2E8F0/4A5568?text=${user.username.charAt(0)}`} alt="" />
                      </div>
                      <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                        <div>
                          <p className="text-sm font-medium text-emerald-600 truncate">{user.username}</p>
                          <p className="mt-2 flex items-center text-sm text-gray-500">{user.staffRole}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserSalarySelectPage;