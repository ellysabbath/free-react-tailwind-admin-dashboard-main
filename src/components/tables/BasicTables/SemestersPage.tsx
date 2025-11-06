import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";

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

// Use the same BadgeColor type from your Badge component
type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

export default function SemesterTable() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; semester: Semester | null }>({ 
    show: false, 
    semester: null 
  });
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = 'http://localhost:8000/api/auth';

  // Semester options
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

  const [formData, setFormData] = useState({
    semester_name: '',
    academic_year: '',
    subject: ''
  });

  // Fetch semesters and academic years from API
  useEffect(() => {
    fetchSemesters();
    fetchAcademicYears();
  }, []);

  const fetchSemesters = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/semesters/`);
      if (!response.ok) {
        throw new Error('Failed to fetch semesters');
      }
      const data: Semester[] = await response.json();
      setSemesters(data);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicYears = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/academic-years/`);
      if (!response.ok) {
        throw new Error('Failed to fetch academic years');
      }
      const data: AcademicYear[] = await response.json();
      setAcademicYears(data);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  // Add new semester
  const handleAdd = (): void => {
    setEditingSemester(null);
    setFormData({ semester_name: '', academic_year: '', subject: '' });
    setShowForm(true);
  };

  // Edit semester - opens form with existing data
  const handleEdit = (semester: Semester): void => {
    setEditingSemester(semester);
    setFormData({
      semester_name: semester.semester_name,
      academic_year: semester.academic_year.id.toString(),
      subject: semester.subject || ''
    });
    setShowForm(true);
  };

  // Delete semester
  const handleDelete = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/semesters/${id}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete semester');
      }
      
      setSuccessMessage('Semester deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchSemesters();
    } catch (error) {
      console.error('Error deleting semester:', error);
      alert('Error deleting semester. Please try again.');
    } finally {
      setDeleteConfirm({ show: false, semester: null });
    }
  };

  // Handle form submission for add/edit
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload = {
        semester_name: formData.semester_name,
        academic_year: parseInt(formData.academic_year),
        subject: formData.subject
      };

      const url = editingSemester 
        ? `${API_BASE_URL}/semesters/${editingSemester.id}/`
        : `${API_BASE_URL}/semesters/`;
      
      const method = editingSemester ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save semester');
      }

      setSuccessMessage(editingSemester ? 'Semester updated successfully!' : 'Semester created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowForm(false);
      setEditingSemester(null);
      setFormData({ semester_name: '', academic_year: '', subject: '' });
      fetchSemesters();
    } catch (error) {
      console.error('Error saving semester:', error);
      alert('Error saving semester. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (): void => {
    setShowForm(false);
    setEditingSemester(null);
    setFormData({ semester_name: '', academic_year: '', subject: '' });
  };

  const getSemesterDisplayName = (semesterName: string): string => {
    const semester = semesterOptions.find(s => s.value === semesterName);
    return semester ? semester.label : semesterName;
  };

  const getStatusColor = (semester: Semester): BadgeColor => {
    const currentYear = new Date().getFullYear();
    const semesterYear = semester.academic_year.year;
    
    if (semesterYear === currentYear) return "success";
    if (semesterYear > currentYear) return "warning";
    return "error";
  };

  const getStatusText = (semester: Semester): string => {
    const currentYear = new Date().getFullYear();
    const semesterYear = semester.academic_year.year;
    
    if (semesterYear === currentYear) return "Current";
    if (semesterYear > currentYear) return "Upcoming";
    return "Completed";
  };

  const showDeleteConfirmation = (semester: Semester): void => {
    setDeleteConfirm({ show: true, semester });
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          </div>
          <div className="text-gray-500 dark:text-gray-400">Loading semesters...</div>
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Semesters</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Add Semester
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            {editingSemester ? `Edit Semester - ${getSemesterDisplayName(editingSemester.semester_name)}` : 'Add New Semester'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Semester Name *
                </label>
                <select
                  name="semester_name"
                  value={formData.semester_name}
                  onChange={(e) => setFormData({ ...formData, semester_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={isSaving}
                >
                  <option value="">Select Semester</option>
                  {semesterOptions.map((semester) => (
                    <option key={semester.value} value={semester.value}>
                      {semester.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Academic Year *
                </label>
                <select
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
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
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Subject (optional)"
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {editingSemester ? (isSaving ? 'Updating...' : 'Update Semester') : (isSaving ? 'Creating...' : 'Create Semester')}
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

      {/* Semesters Table */}
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
                  ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Semester
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Academic Year
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
                  Status
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
              {semesters.map((semester) => (
                <TableRow key={semester.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/30">
                        <span className="font-semibold text-blue-600 text-theme-sm dark:text-blue-400">
                          #{semester.id}
                        </span>
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          ID {semester.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-start">
                    <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                      {getSemesterDisplayName(semester.semester_name)}
                    </span>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-start">
                    <div>
                      <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                        {semester.academic_year.year}
                      </span>
                      {semester.academic_year.subject && (
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {semester.academic_year.subject}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-start">
                    <span className="text-gray-800 text-theme-sm dark:text-white/90">
                      {semester.subject || (
                        <span className="text-gray-400 italic">No subject</span>
                      )}
                    </span>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-start">
                    <Badge
                      size="sm"
                      color={getStatusColor(semester)}
                    >
                      {getStatusText(semester)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(semester)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => showDeleteConfirmation(semester)}
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
        {semesters.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              No semesters found. Click "Add Semester" to create the first one!
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
              Are you sure you want to delete {deleteConfirm.semester ? 
              `"${getSemesterDisplayName(deleteConfirm.semester.semester_name)} - ${deleteConfirm.semester.academic_year.year}"` : 
              'this semester'}? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm({ show: false, semester: null })}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm.semester && handleDelete(deleteConfirm.semester.id)}
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
}