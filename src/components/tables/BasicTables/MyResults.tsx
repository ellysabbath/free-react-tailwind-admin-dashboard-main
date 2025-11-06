import  { useState, useEffect } from 'react';
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

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
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

// Use the same BadgeColor type from your Badge component
type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

export default function StudentResultsTable() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

  useEffect(() => {
    fetchMyResults();
  }, []);

  const fetchMyResults = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/my-results/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your results');
        }
        throw new Error('Failed to fetch your results');
      }
      
      const data: Result[] = await response.json();
      setResults(data);
    } catch (error: unknown) {
      console.error('Error fetching results:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load your results';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string): BadgeColor => {
    switch (grade) {
      case 'A': return "success";
      case 'B': return "primary";
      case 'C': return "warning";
      case 'D': return "info"; // Using info for D grades
      case 'F': return "error";
      default: return "light"; // Using light for unknown grades instead of "default"
    }
  };

  const calculateGPA = (results: Result[]): number => {
    if (results.length === 0) return 0;
    
    const gradePoints: Record<string, number> = {
      'A': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'F': 0.0
    };
    
    const totalPoints = results.reduce((sum, result) => {
      return sum + (gradePoints[result.grade] || 0);
    }, 0);
    
    return totalPoints / results.length;
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          </div>
          <div className="text-gray-500 dark:text-gray-400">Loading your results...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={fetchMyResults}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const gpa = calculateGPA(results);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">My Academic Results</h2>
        {results.length > 0 && (
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Cumulative GPA</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {gpa.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{results.length}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total Subjects</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {results.filter(r => r.grade === 'A' || r.grade === 'B').length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">A & B Grades</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {results.filter(r => r.grade === 'C' || r.grade === 'D').length}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">C & D Grades</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {results.filter(r => r.grade === 'F').length}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">F Grades</div>
          </div>
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
                  Date
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {results.map((result) => (
                <TableRow key={result.id}>
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
                  
                  <TableCell className="px-4 py-3 text-start">
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Empty State */}
        {results.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              No results found for your account. Results will appear here once they are published.
            </div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchMyResults}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Results
        </button>
      </div>
    </div>
  );
}