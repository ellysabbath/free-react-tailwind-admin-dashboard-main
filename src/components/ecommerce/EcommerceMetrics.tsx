import { useState, useEffect, useCallback } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

// Define BadgeColor type based on your Badge component
type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

interface Result {
  id: number;
  subject: string;
  marks: number;
  grade: string;
  academic_year: {
    year: number;
  };
  semester: {
    semester_name: string;
  };
}

export default function AcademicMetrics() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageMarks, setAverageMarks] = useState(0);
  const [gpa, setGpa] = useState(0);
  const [previousAverage, setPreviousAverage] = useState(0);
  const [previousGpa, setPreviousGpa] = useState(0);

  const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

  // Calculate percentage change
  const calculateChange = useCallback((current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }, []);

  // Get badge color based on change - using valid BadgeColor types
  const getBadgeColor = useCallback((change: number): BadgeColor => {
    if (change > 0) return "success";
    if (change < 0) return "error";
    return "primary";
  }, []);

  // Get badge icon based on change
  const getBadgeIcon = useCallback((change: number) => {
    if (change > 0) return <ArrowUpIcon />;
    if (change < 0) return <ArrowDownIcon />;
    return null;
  }, []);

  // Get performance text based on average
  const getPerformanceText = useCallback((avg: number) => {
    if (avg >= 80) return "Excellent";
    if (avg >= 70) return "Good";
    if (avg >= 60) return "Average";
    return "Needs Improvement";
  }, []);

  // Get GPA performance text
  const getGpaPerformanceText = useCallback((gpaValue: number) => {
    if (gpaValue >= 3.5) return "Outstanding";
    if (gpaValue >= 3.0) return "Very Good";
    if (gpaValue >= 2.5) return "Good";
    if (gpaValue >= 2.0) return "Satisfactory";
    return "Needs Improvement";
  }, []);

  const calculatePreviousMetrics = useCallback((resultsData: Result[], currentAvg: number, currentGpa: number) => {
    if (resultsData.length <= 1) {
      setPreviousAverage(currentAvg);
      setPreviousGpa(currentGpa);
      return;
    }

    // Simulate previous period by taking first half of results
    const midPoint = Math.floor(resultsData.length / 2);
    const previousResults = resultsData.slice(0, midPoint);
    
    // Calculate previous average
    const previousTotalMarks = previousResults.reduce((sum, result) => sum + Number(result.marks), 0);
    const prevAvg = previousTotalMarks / previousResults.length;
    setPreviousAverage(Number(prevAvg.toFixed(1)));

    // Calculate previous GPA
    const gradePoints: { [key: string]: number } = {
      'A': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'F': 0.0
    };

    const previousGradePoints = previousResults.reduce((sum, result) => {
      return sum + (gradePoints[result.grade] || 0);
    }, 0);

    const prevGpa = previousGradePoints / previousResults.length;
    setPreviousGpa(Number(prevGpa.toFixed(2)));
  }, []);

  const calculateMetrics = useCallback((resultsData: Result[]) => {
    if (resultsData.length === 0) {
      setAverageMarks(0);
      setGpa(0);
      return;
    }

    // Calculate average marks
    const totalMarks = resultsData.reduce((sum, result) => sum + Number(result.marks), 0);
    const currentAverage = totalMarks / resultsData.length;
    setAverageMarks(Number(currentAverage.toFixed(1)));

    // Calculate GPA (4.0 scale)
    const gradePoints: { [key: string]: number } = {
      'A': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'F': 0.0
    };

    const totalGradePoints = resultsData.reduce((sum, result) => {
      return sum + (gradePoints[result.grade] || 0);
    }, 0);

    const currentGpa = totalGradePoints / resultsData.length;
    setGpa(Number(currentGpa.toFixed(2)));

    // Simulate previous period data for comparison
    calculatePreviousMetrics(resultsData, currentAverage, currentGpa);
  }, [calculatePreviousMetrics]);

  // Wrap fetchMyResults in useCallback to memoize it and prevent infinite re-renders
  const fetchMyResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/my-results/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        },
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch results');
      
      const data = await response.json();
      setResults(data);
      
      // Calculate metrics
      calculateMetrics(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, calculateMetrics]);

  useEffect(() => {
    fetchMyResults();
  }, [fetchMyResults]);

  const averageChange = calculateChange(averageMarks, previousAverage);
  const gpaChange = calculateChange(gpa, previousGpa);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {/* Loading Skeleton for Average Marks Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <div className="w-6 h-6 bg-gray-300 rounded animate-pulse dark:bg-gray-600"></div>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
              <div className="w-16 h-6 mt-2 bg-gray-300 rounded animate-pulse dark:bg-gray-600"></div>
            </div>
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
          </div>
        </div>

        {/* Loading Skeleton for GPA Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <div className="w-6 h-6 bg-gray-300 rounded animate-pulse dark:bg-gray-600"></div>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
              <div className="w-16 h-6 mt-2 bg-gray-300 rounded animate-pulse dark:bg-gray-600"></div>
            </div>
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Average Marks Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30">
          <GroupIcon className="text-blue-600 size-6 dark:text-blue-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Average Marks
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {averageMarks}%
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {getPerformanceText(averageMarks)} • {results.length} results
            </p>
          </div>
          <Badge color={getBadgeColor(averageChange)}>
            {getBadgeIcon(averageChange)}
            {averageChange !== 0 ? `${Math.abs(averageChange).toFixed(1)}%` : '0%'}
          </Badge>
        </div>
      </div>

      {/* GPA Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30">
          <BoxIconLine className="text-green-600 size-6 dark:text-green-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              GPA Score
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {gpa}/4.0
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {getGpaPerformanceText(gpa)} • 4.0 scale
            </p>
          </div>

          <Badge color={getBadgeColor(gpaChange)}>
            {getBadgeIcon(gpaChange)}
            {gpaChange !== 0 ? `${Math.abs(gpaChange).toFixed(1)}%` : '0%'}
          </Badge>
        </div>
      </div>
    </div>
  );
}