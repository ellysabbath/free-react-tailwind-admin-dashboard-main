import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";

// Import the actual BadgeColor type from your Badge component
// If you can't import it, use the exact same string literals as defined in Badge.tsx
type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'info'; // Remove 'default'

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'user' | 'student' | 'teacher';
  is_active: boolean;
  date_joined?: string;
  last_login?: string;
}

interface FormData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'user' | 'student' | 'teacher';
  is_active: boolean;
}

interface ConfirmDialog {
  show: boolean;
  user: User | null;
}

interface ApiError {
  message: string;
}

const UserManagementTable: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ConfirmDialog>({ 
    show: false, 
    user: null 
  });
  const [activateConfirm, setActivateConfirm] = useState<ConfirmDialog>({ 
    show: false, 
    user: null 
  });
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

  const [formData, setFormData] = useState<FormData>({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'student',
    is_active: true
  });

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('Fetching users from:', `${API_BASE_URL}/user/`);
      
      const response = await fetch(`${API_BASE_URL}/user/`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Users API Response:', data);
      
      // Handle different response formats
      let usersArray: User[] = [];
      
      if (Array.isArray(data)) {
        usersArray = data;
      } else if (data.results && Array.isArray(data.results)) {
        usersArray = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        usersArray = data.data;
      } else if (data.users && Array.isArray(data.users)) {
        usersArray = data.users;
      } else {
        console.error('Unexpected users response format:', data);
        usersArray = [];
      }
      
      setUsers(usersArray);
      console.log('Users processed:', usersArray.length);
      
    } catch (error: unknown) {
      console.error('Error fetching users:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load users. Please check the API connection.';
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Add new user - redirect to signup page
  const handleAdd = (): void => {
    navigate('/signup');
  };

  // Edit user
  const handleEdit = (user: User): void => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    });
    setShowForm(true);
  };

  // Delete user
  const handleDelete = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${id}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      setSuccessMessage('User deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUsers();
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      setErrorMessage('Error deleting user. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setDeleteConfirm({ show: false, user: null });
    }
  };

  // Toggle user active status
  const handleToggleActive = async (user: User): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !user.is_active
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user status');
      }
      
      setSuccessMessage(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUsers();
    } catch (error: unknown) {
      console.error('Error updating user status:', error);
      setErrorMessage('Error updating user status. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setActivateConfirm({ show: false, user: null });
    }
  };

  // Handle form submission for edit only (since add redirects to signup)
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!editingUser) {
      setErrorMessage('No user selected for editing');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const payload: Partial<User> = {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role: formData.role,
        is_active: formData.is_active
      };

      const url = `${API_BASE_URL}/user/${editingUser.id}/`;
      const method = 'PUT';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      setSuccessMessage('User updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowForm(false);
      setEditingUser(null);
      setFormData({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        role: 'student',
        is_active: true
      });
      fetchUsers();
    } catch (error: unknown) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error updating user. Please try again.';
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (): void => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      role: 'student',
      is_active: true
    });
  };

  const getRoleColor = (role: string): BadgeColor => {
    switch (role?.toLowerCase()) {
      case 'admin': return "primary";
      case 'student': return "success";
      case 'teacher': return "warning";
      case 'user': return "info";
      default: return "primary"; // Use 'primary' as fallback instead of 'default'
    }
  };

  const getActiveStatusColor = (isActive: boolean): BadgeColor => {
    return isActive ? "success" : "error";
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as 'admin' | 'user' | 'student' | 'teacher';
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          </div>
          <div className="text-gray-500 dark:text-gray-400">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 text-green-700 bg-green-100 border border-green-300 rounded-lg dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
          {errorMessage}
        </div>
      )}

      {/* Header and Add Button - Only show when form is not visible */}
      {!showForm && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">User Management</h2>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Add User
          </button>
        </div>
      )}

      {/* Edit Form Modal - Shows as overlay (only for editing) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.03] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                Edit User - {editingUser?.first_name} {editingUser?.last_name}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter username"
                      required
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter email"
                      required
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter first name"
                      required
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter last name"
                      required
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleRoleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                      disabled={isSaving}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      disabled={isSaving}
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active User
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isSaving ? 'Updating...' : 'Update User'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Users Table - Only show when form is not visible */}
      {!showForm && (
        <div className="overflow-x-auto max-w-[140vh] rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    User
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Username
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Role
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Date Joined
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/30">
                          <span className="font-semibold text-blue-600 text-theme-sm dark:text-blue-400">
                            {getInitials(user.first_name, user.last_name)}
                          </span>
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            ID: {user.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.username}
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        size="sm"
                        color={getRoleColor(user.role)}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        size="sm"
                        color={getActiveStatusColor(user.is_active)}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.date_joined ? formatDate(user.date_joined) : 'N/A'}
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setActivateConfirm({ show: true, user })}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            user.is_active 
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                          }`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ show: true, user })}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Empty State */}
          {users.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                No users found. Click "Add User" to create the first one!
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete the user {deleteConfirm.user ? 
              `${deleteConfirm.user.first_name} ${deleteConfirm.user.last_name} (${deleteConfirm.user.email})` : 
              'this user'}? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm({ show: false, user: null })}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm.user && handleDelete(deleteConfirm.user.id)}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate/Deactivate Confirmation Modal */}
      {activateConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-2">
              Confirm {activateConfirm.user?.is_active ? 'Deactivation' : 'Activation'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to {activateConfirm.user?.is_active ? 'deactivate' : 'activate'} the user {activateConfirm.user ? 
              `${activateConfirm.user.first_name} ${activateConfirm.user.last_name}` : 
              'this user'}?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setActivateConfirm({ show: false, user: null })}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => activateConfirm.user && handleToggleActive(activateConfirm.user)}
                className={`px-4 py-2 text-white rounded-lg ${
                  activateConfirm.user?.is_active 
                    ? 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600'
                    : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                }`}
              >
                {activateConfirm.user?.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTable;