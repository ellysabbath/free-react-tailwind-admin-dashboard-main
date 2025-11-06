import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";

// Define BadgeColor type based on your Badge component
type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface AcademicYear {
  id: number;
  year: number;
  subject: string;
}

interface Semester {
  id: number;
  semester_name: string;
  academic_year: AcademicYear;
  subject: string;
}

interface Result {
  id: number;
  user: User;
  academic_year: AcademicYear;
  semester: Semester;
  username: string;
  first_name: string;
  last_name: string;
  subject: string;
  marks: number;
  grade: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  user: string;
  academic_year: string;
  semester: string;
  marks: string;
  subject: string;
}

interface ConfirmDialog {
  show: boolean;
  result: Result | null;
}

const ResultsTable: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ConfirmDialog>({ 
    show: false, 
    result: null 
  });
  const [successMessage, setSuccessMessage] = useState<string>('');

  const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

  const [formData, setFormData] = useState<FormData>({
    user: '',
    academic_year: '',
    semester: '',
    marks: '',
    subject: ''
  });

  // Define tryAlternativeUserEndpoints first since it's used in fetchUsers
  const tryAlternativeUserEndpoints = useCallback(async (): Promise<void> => {
    const alternativeEndpoints = [
      `${API_BASE_URL}/user/`,
      `${API_BASE_URL}/auth/user/`,
      'http://localhost:8000/api/auth/user/',
      'http://127.0.0.1:8000/api/auth/user/'
    ];

    for (const endpoint of alternativeEndpoints) {
      try {
        console.log('Trying alternative endpoint:', endpoint);
        const response = await fetch(endpoint);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Success with endpoint:', endpoint, data);
          
          let usersArray: User[] = [];
          
          if (Array.isArray(data)) {
            usersArray = data;
          } else if (data.results && Array.isArray(data.results)) {
            usersArray = data.results;
          } else if (data.data && Array.isArray(data.data)) {
            usersArray = data.data;
          } else if (data.users && Array.isArray(data.users)) {
            usersArray = data.users;
          }
          
          if (usersArray.length > 0) {
            setUsers(usersArray);
            console.log('Users found with endpoint:', endpoint, usersArray.length);
            return;
          }
        }
      } catch (error) {
        console.log('Failed with endpoint:', endpoint, error);
      }
    }
    
    // If all endpoints fail, show empty users array
    console.warn('No users found from any endpoint');
    setUsers([]);
  }, [API_BASE_URL]);

  // Define fetchUsers after tryAlternativeUserEndpoints since it depends on it
  const fetchUsers = useCallback(async (): Promise<void> => {
    try {
      setUsersLoading(true);
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
        // Handle paginated response
        usersArray = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        // Handle wrapped response
        usersArray = data.data;
      } else if (data.users && Array.isArray(data.users)) {
        // Handle nested users array
        usersArray = data.users;
      } else {
        console.error('Unexpected users response format:', data);
        usersArray = [];
      }
      
      setUsers(usersArray);
      console.log('Users processed:', usersArray.length);
      
      // Log first few users to verify structure
      if (usersArray.length > 0) {
        console.log('Sample user:', usersArray[0]);
      }
      
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Try alternative endpoints
      await tryAlternativeUserEndpoints();
    } finally {
      setUsersLoading(false);
    }
  }, [API_BASE_URL, tryAlternativeUserEndpoints]); // Added tryAlternativeUserEndpoints dependency

  // Define other fetch functions
  const fetchResults = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/results/`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setResults(data);
      console.log('Results fetched:', data.length);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchAcademicYears = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/academic-years/`);
      if (!response.ok) {
        throw new Error('Failed to fetch academic years');
      }
      const data = await response.json();
      setAcademicYears(data);
      console.log('Academic years fetched:', data.length);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  }, [API_BASE_URL]);

  const fetchSemesters = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/semesters/`);
      if (!response.ok) {
        throw new Error('Failed to fetch semesters');
      }
      const data = await response.json();
      setSemesters(data);
      console.log('Semesters fetched:', data.length);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  }, [API_BASE_URL]);

  // Fetch all data from APIs
  useEffect(() => {
    fetchResults();
    fetchAcademicYears();
    fetchSemesters();
    fetchUsers();
  }, [fetchResults, fetchAcademicYears, fetchSemesters, fetchUsers]);

  // Add new result
  const handleAdd = (): void => {
    setEditingResult(null);
    setFormData({ user: '', academic_year: '', semester: '', marks: '', subject: '' });
    setShowForm(true);
  };

  // Delete result
  const handleDelete = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/results/${id}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete result');
      }
      
      setSuccessMessage('Result deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchResults();
    } catch (error) {
      console.error('Error deleting result:', error);
      alert('Error deleting result. Please try again.');
    } finally {
      setDeleteConfirm({ show: false, result: null });
    }
  };

  // Handle form submission for add/edit
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload = {
        user: parseInt(formData.user),
        academic_year: parseInt(formData.academic_year),
        semester: parseInt(formData.semester),
        marks: parseFloat(formData.marks),
        subject: formData.subject
      };

      const url = editingResult 
        ? `${API_BASE_URL}/results/${editingResult.id}/`
        : `${API_BASE_URL}/results/`;
      
      const method = editingResult ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save result');
      }

      setSuccessMessage(editingResult ? 'Result updated successfully!' : 'Result created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowForm(false);
      setEditingResult(null);
      setFormData({ user: '', academic_year: '', semester: '', marks: '', subject: '' });
      fetchResults();
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Error saving result. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (): void => {
    setShowForm(false);
    setEditingResult(null);
    setFormData({ user: '', academic_year: '', semester: '', marks: '', subject: '' });
  };

  const getGradeColor = (grade: string): BadgeColor => {
    switch (grade) {
      case 'A': return "success";
      case 'B': return "primary";
      case 'C': return "warning";
      case 'D': return "info";
      case 'F': return "error";
      default: return "primary";
    }
  };

  const getSemesterDisplayName = (semesterName: string): string => {
    const semesterOptions = [
      { value: '1', label: 'First Semester' },
      { value: '2', label: 'Second Semester' },
      { value: '3', label: 'Third Semester' },
      { value: '4', label: 'Fourth Semester' },
      { value: '5', label: 'Fifth Semester' },
      { value: '6', label: 'Sixth Semester' },
      { value: '7', label: 'Seventh Semester' },
      { value: '8', label: 'Eighth Semester' },
    ];
    
    const semester = semesterOptions.find(s => s.value === semesterName);
    return semester ? semester.label : semesterName;
  };

  const showDeleteConfirmation = (result: Result): void => {
    setDeleteConfirm({ show: true, result });
  };

  const calculateGrade = (marks: number): string => {
    if (marks >= 90) return 'A';
    if (marks >= 80) return 'B';
    if (marks >= 70) return 'C';
    if (marks >= 60) return 'D';
    return 'F';
  };

  // Format user display name for dropdown
  const getUserDisplayName = (user: User): string => {
    return `${user.first_name} ${user.last_name} (${user.username})`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          </div>
          <div className="text-gray-500 dark:text-gray-400">Loading results...</div>
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

      {/* Header and Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Student Results</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Add Result
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            {editingResult ? `Edit Result - ${editingResult.user.first_name} ${editingResult.user.last_name}` : 'Add New Result'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student *
                </label>
                <select
                  name="user"
                  value={formData.user}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={isSaving || usersLoading}
                >
                  <option value="">Select Student</option>
                  {usersLoading ? (
                    <option value="" disabled>Loading users...</option>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {getUserDisplayName(user)}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No users available</option>
                  )}
                </select>
                {usersLoading && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Loading users from {API_BASE_URL}/user/...
                  </p>
                )}
                {!usersLoading && users.length === 0 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    No users found. Please check if the users API endpoint is accessible at {API_BASE_URL}/user/
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Academic Year *
                </label>
                <select
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={isSaving}
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.year} - {year.subject || 'No Subject'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Semester *
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={isSaving}
                >
                  <option value="">Select Semester</option>
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {getSemesterDisplayName(semester.semester_name)} - {semester.academic_year.year}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marks (0-100) *
                </label>
                <input
                  type="number"
                  name="marks"
                  value={formData.marks}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter marks"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  disabled={isSaving}
                />
                {formData.marks && (
                  <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                    Grade: {calculateGrade(parseFloat(formData.marks))}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Subject (optional)"
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving || users.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {editingResult ? (isSaving ? 'Updating...' : 'Update Result') : (isSaving ? 'Creating...' : 'Create Result')}
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
      )}

      {/* Results Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Student
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Subject
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Marks
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-green-500 text-start text-theme-xs dark:text-green-400"
                >
                  Grade
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created
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
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/30">
                        <span className="font-semibold text-blue-600 text-theme-sm dark:text-blue-400">
                          {result.user.first_name?.charAt(0)}{result.user.last_name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {result.first_name} {result.last_name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          @{result.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-start">
                    <span className="text-gray-800 text-theme-sm dark:text-white/90">
                      {result.subject || (
                        <span className="text-gray-400 italic">No subject</span>
                      )}
                    </span>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-start">
                    <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                      {result.marks}%
                    </span>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-start dark:text-green-500">
                    <Badge
                      size="sm"
                      color={getGradeColor(result.grade)}
                    >
                      {result.grade}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {new Date(result.created_at).toLocaleDateString()}
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex gap-2">
                      <button
                        onClick={() => showDeleteConfirmation(result)}
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
        {results.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              No results found. Click "Add Result" to create the first one!
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete the result for {deleteConfirm.result ? 
              `${deleteConfirm.result.first_name} ${deleteConfirm.result.last_name} - ${deleteConfirm.result.subject}` : 
              'this result'}? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm({ show: false, result: null })}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm.result && handleDelete(deleteConfirm.result.id)}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;