// client/src/pages/admin/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Button from '../../components/Button';
import SkeletonRow from '../../components/SkeletonRow';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: loggedInUser } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'staff',
    staffRole: '',
    salary: '',
    photo: null,
  });

  const fetchUsers = async () => {
    try {
      // Keep loading true on manual refresh
      setLoading(true);
      const data = await userService.getUsers(loggedInUser.token);
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedInUser?.token) {
      fetchUsers();
    }
  }, [loggedInUser]);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
        try {
            await userService.deleteUser(userId, loggedInUser.token);
            setUsers(users.filter((user) => user._id !== userId));
        } catch (err) {
            alert('Failed to delete user.');
        }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const data = new FormData();
    // Use a loop to append all form data
    for (const key in formData) {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    }

    try {
        await userService.registerUser(data, loggedInUser.token);
        setIsModalOpen(false);
        fetchUsers(); // Refresh the user list
    } catch (err) {
        setFormError(err.response?.data?.message || 'Failed to create user.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const openModal = () => {
    setFormData({
        username: '',
        password: '',
        role: 'staff',
        staffRole: '',
        salary: '',
        photo: null,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <button onClick={openModal} className="px-4 py-2 font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700">
          Add User
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={user.photo || `https://placehold.co/100x100/E2E8F0/4A5568?text=${user.username.charAt(0)}`} alt="" />
                        </div>
                        <div className="ml-4">
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'superadmin' ? 'bg-red-100 text-red-800' :
                          user.role === 'admin' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                          {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {loggedInUser.role === 'superadmin' && user.role !== 'superadmin' && (
                          <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">Delete</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New User">
        <form onSubmit={handleAddUser} className="space-y-4">
            {formError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{formError}</p>}
            <Input name="username" label="Username" value={formData.username} onChange={handleInputChange} required />
            <Input name="password" label="Password" type="password" value={formData.password} onChange={handleInputChange} required />
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select name="role" value={formData.role} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super admin</option>
              </select>
            </div>
            {formData.role === 'staff' && (
                <>
                    <Input name="staffRole" label="Staff Role (e.g., Cashier)" value={formData.staffRole} onChange={handleInputChange} required/>
                    <Input name="salary" label="Monthly Salary" type="number" value={formData.salary} onChange={handleInputChange} required/>
                </>
            )}
            <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Photo</label>
                <input type="file" name="photo" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"/>
            </div>
            <div className="pt-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create User'}
                </Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
