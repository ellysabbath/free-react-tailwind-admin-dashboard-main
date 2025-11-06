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

export default function AcademicYearTable() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    year: '',
    subject: ''
  });

  const API_BASE_URL = 'http://localhost:8000/api/auth';

  // Generate years from 1990 to 2100
  const yearOptions = Array.from({ length: 211 }, (_, i) => 1990 + i);

  // Fetch academic years from API
  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/academic-years/`);
      if (!response.ok) {
        throw new Error('Failed to fetch academic years');
      }
      const data = await response.json();
      setAcademicYears(data);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new academic year
  const handleAdd = () => {
    setEditingYear(null);
    setFormData({ year: '', subject: '' });
    setShowForm(true);
  };

  // Edit academic year
  const handleEdit = (year: AcademicYear) => {
    setEditingYear(year);
    setFormData({
      year: year.year.toString(),
      subject: year.subject || ''
    });
    setShowForm(true);
  };

  // Delete academic year
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this academic year?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/academic-years/${id}/`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete academic year');
        }
        
        fetchAcademicYears();
      } catch (error) {
        console.error('Error deleting academic year:', error);
        alert('Error deleting academic year. Please try again.');
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        year: parseInt(formData.year),
        subject: formData.subject
      };

      const url = editingYear 
        ? `${API_BASE_URL}/academic-years/${editingYear.id}/`
        : `${API_BASE_URL}/academic-years/`;
      
      const method = editingYear ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save academic year');
      }

      setShowForm(false);
      setEditingYear(null);
      setFormData({ year: '', subject: '' });
      fetchAcademicYears();
    } catch (error) {
      console.error('Error saving academic year:', error);
      alert('Error saving academic year. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingYear(null);
    setFormData({ year: '', subject: '' });
  };

  const getStatusColor = (year: number) => {
    const currentYear = new Date().getFullYear();
    if (year === currentYear) return "success";
    if (year > currentYear) return "warning";
    return "error";
  };

  const getStatusText = (year: number) => {
    const currentYear = new Date().getFullYear();
    if (year === currentYear) return "Current";
    if (year > currentYear) return "Upcoming";
    return "Completed";
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">Loading academic years...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Academic Years</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Add Academic Year
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            {editingYear ? 'Edit Academic Year' : 'Add New Academic Year'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Academic Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
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
                  placeholder="Primary subject (optional)"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {editingYear ? 'Update' : 'Create'} Academic Year
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Academic Years Table */}
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
              {academicYears.map((academicYear) => (
                <TableRow key={academicYear.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/30">
                        <span className="font-semibold text-blue-600 text-theme-sm dark:text-blue-400">
                          #{academicYear.id}
                        </span>
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          ID {academicYear.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-start">
                    <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                      {academicYear.year}
                    </span>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-start">
                    <span className="text-gray-800 text-theme-sm dark:text-white/90">
                      {academicYear.subject || (
                        <span className="text-gray-400 italic">No subject</span>
                      )}
                    </span>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-start">
                    <Badge
                      size="sm"
                      color={getStatusColor(academicYear.year)}
                    >
                      {getStatusText(academicYear.year)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(academicYear)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(academicYear.id)}
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
        {academicYears.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              No academic years found. Click "Add Academic Year" to create the first one!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}