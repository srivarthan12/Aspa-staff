// client/src/pages/admin/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Button from '../../components/Button';
import SkeletonRow from '../../components/SkeletonRow';
import DropdownMenu, { DropdownItem } from '../../components/DropdownMenu';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: loggedInUser } = useAuth();
  
  // State for modals
  const [modalType, setModalType] = useState(null); // 'addUser', 'addBata', 'raiseSalary'
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form state
  const [addUserFormData, setAddUserFormData] = useState({ fullname: '', username: '', password: '', role: 'staff', staffRole: '', salary: '', photo: null });
  const [bataAmount, setBataAmount] = useState('');
  const [bataDescription, setBataDescription] = useState('');
  const [newSalary, setNewSalary] = useState('');

  const fetchUsers = async () => {
    try {
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

  // --- Modal Openers ---
  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    setFormError('');

    if (type === 'addUser') setAddUserFormData({ fullname: '', username: '', password: '', role: 'staff', staffRole: '', salary: '', photo: null });
    if (type === 'addBata') { setBataAmount(''); setBataDescription(''); }
    if (type === 'raiseSalary') setNewSalary(user?.salary || '');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
  };

  // --- Form Handlers ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    const data = new FormData();
    for (const key in addUserFormData) {
      if (addUserFormData[key]) data.append(key, addUserFormData[key]);
    }
    try {
        await userService.registerUser(data, loggedInUser.token);
        closeModal();
        fetchUsers();
    } catch (err) {
        setFormError(err.response?.data?.message || 'Failed to create user.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleAddBata = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
        await userService.addUserBata(selectedUser._id, { amount: bataAmount, description: bataDescription }, loggedInUser.token);
        closeModal();
    } catch (err) {
        setFormError(err.response?.data?.message || 'Failed to add bata.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleRaiseSalary = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
        await userService.raiseUserSalary(selectedUser._id, { newSalary }, loggedInUser.token);
        closeModal();
        fetchUsers();
    } catch (err) {
        setFormError(err.response?.data?.message || 'Failed to update salary.');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <button onClick={() => openModal('addUser')} className="px-4 py-2 font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700">
          Add User
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
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
                          <div className="text-sm font-medium text-gray-900">{user.fullname}</div>
                          <div className="text-xs text-gray-500">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.role === 'staff' ? `₹${new Intl.NumberFormat('en-IN').format(user.salary || 0)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ user.role === 'superadmin' ? 'bg-red-100 text-red-800' : user.role === 'admin' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800' }`}>
                          {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        {user.role === 'staff' && (
                            <>
                                <DropdownItem onClick={() => openModal('addBata', user)}>Add Bata</DropdownItem>
                                <DropdownItem onClick={() => openModal('raiseSalary', user)}>Raise Salary</DropdownItem>
                            </>
                        )}
                        {loggedInUser.role === 'superadmin' && user.role !== 'superadmin' && (
                          <DropdownItem onClick={() => handleDelete(user._id)}>Delete User</DropdownItem>
                        )}
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modals */}
      <Modal isOpen={modalType === 'addUser'} onClose={closeModal} title="Add New User">
        <form onSubmit={handleAddUser} className="space-y-4">
            {formError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{formError}</p>}
            <Input name="fullname" label="Full Name" value={addUserFormData.fullname} onChange={(e) => setAddUserFormData({...addUserFormData, fullname: e.target.value})} />
            <Input name="username" label="Username" value={addUserFormData.username} onChange={(e) => setAddUserFormData({...addUserFormData, username: e.target.value})} />
            <Input name="password" label="Password" type="password" value={addUserFormData.password} onChange={(e) => setAddUserFormData({...addUserFormData, password: e.target.value})} />
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                <select name="role" value={addUserFormData.role} onChange={(e) => setAddUserFormData({...addUserFormData, role: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            {addUserFormData.role === 'staff' && (
                <>
                    <Input name="staffRole" label="Staff Role (e.g., Cashier)" value={addUserFormData.staffRole} onChange={(e) => setAddUserFormData({...addUserFormData, staffRole: e.target.value})} />
                    <Input name="salary" label="Monthly Salary" type="number" value={addUserFormData.salary} onChange={(e) => setAddUserFormData({...addUserFormData, salary: e.target.value})} />
                </>
            )}
            <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Photo</label>
                <input type="file" name="photo" onChange={(e) => setAddUserFormData({...addUserFormData, photo: e.target.files[0]})} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"/>
            </div>
            <div className="pt-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create User'}</Button></div>
        </form>
      </Modal>

      <Modal isOpen={modalType === 'addBata'} onClose={closeModal} title={`Add Bata for ${selectedUser?.username}`}>
        <form onSubmit={handleAddBata} className="space-y-4">
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <Input name="amount" label="Bata Amount (₹)" type="number" value={bataAmount} onChange={(e) => setBataAmount(e.target.value)} />
            <Input name="description" label="Description (Optional)" value={bataDescription} onChange={(e) => setBataDescription(e.target.value)} required={false} />
            <div className="pt-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Bata'}</Button></div>
        </form>
      </Modal>

      <Modal isOpen={modalType === 'raiseSalary'} onClose={closeModal} title={`Raise Salary for ${selectedUser?.username}`}>
        <form onSubmit={handleRaiseSalary} className="space-y-4">
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <Input name="newSalary" label="New Monthly Salary (₹)" type="number" value={newSalary} onChange={(e) => setNewSalary(e.target.value)} />
            <div className="pt-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update Salary'}</Button></div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
