import { useState, useEffect, useCallback } from 'react';
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface Result {
  id: number;
  academic_year: {
    id: number;
    year: number;
    subject: string;
  };
  semester: {
    id: number;
    semester_name: string;
    academic_year: {
      id: number;
      year: number;
      subject: string;
    };
    subject: string;
  };
  subject: string;
  marks: number;
  grade: string;
  created_at: string;
  updated_at: string;
}

interface SubjectData {
  subject: string;
  marks: number[];
  average: number;
  highest: number;
  lowest: number;
  count: number;
}

export default function SubjectPerformanceChart() {
  const [results, setResults] = useState<Result[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [sortBy, setSortBy] = useState<'name' | 'average' | 'highest'>('average');

  const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

  // Define processSubjectData with useCallback to prevent infinite re-renders
  const processSubjectData = useCallback(() => {
    const subjectsMap: { [key: string]: number[] } = {};

    // Group marks by subject
    results.forEach(result => {
      const subject = result.subject || 'Unknown Subject';
      const mark = Number(result.marks);
      
      if (!subjectsMap[subject]) {
        subjectsMap[subject] = [];
      }
      subjectsMap[subject].push(mark);
    });

    // Calculate statistics for each subject
    const processedData = Object.entries(subjectsMap).map(([subject, marks]) => {
      const average = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
      const highest = Math.max(...marks);
      const lowest = Math.min(...marks);
      
      return {
        subject,
        marks,
        average: Number(average.toFixed(1)),
        highest,
        lowest,
        count: marks.length
      };
    });

    // Sort the data
    const sortedData = processedData.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.subject.localeCompare(b.subject);
        case 'average':
          return b.average - a.average;
        case 'highest':
          return b.highest - a.highest;
        default:
          return b.average - a.average;
      }
    });

    setSubjectData(sortedData);
  }, [results, sortBy]);

  // Fetch student results
  useEffect(() => {
    fetchMyResults();
  }, []);

  // Process data when results change
  useEffect(() => {
    if (results.length > 0) {
      processSubjectData();
    }
  }, [results, sortBy, processSubjectData]); // Added processSubjectData dependency

  const fetchMyResults = async () => {
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
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to calculate overall statistics safely
  const getOverallAverage = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + Number(result.marks), 0);
    return (total / results.length).toFixed(1);
  };

  const getHighestMark = () => {
    if (results.length === 0) return 0;
    const marks = results.map(r => Number(r.marks));
    return Math.max(...marks);
  };

  const getLowestMark = () => {
    if (results.length === 0) return 0;
    const marks = results.map(r => Number(r.marks));
    return Math.min(...marks);
  };

  // Chart configuration for subject-based data
  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 400,
      type: chartType,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: true
        }
      }
    },
    colors: ["#465FFF", "#00E396", "#FEB019", "#FF4560", "#775DD0"],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '55%',
      }
    },
    dataLabels: {
      enabled: chartType === 'bar',
      formatter: function(val) {
        return val + "%";
      },
      style: {
        fontSize: '12px',
        colors: ["#304758"]
      }
    },
    stroke: {
      width: chartType === 'line' ? 3 : 0,
      curve: "smooth"
    },
    grid: {
      borderColor: "#f1f1f1",
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      categories: subjectData.map(item => item.subject),
      labels: {
        style: {
          fontSize: "11px",
          colors: "#6B7280",
        },
        rotate: -45,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: function(value) {
          return value + "%";
        },
      },
      title: {
        text: "Marks (%)",
        style: {
          fontSize: "12px",
          fontWeight: "normal",
          color: "#6B7280"
        },
      },
    },
    tooltip: {
      y: {
        formatter: function(value) {
          return value + "%";
        }
      }
    },
    fill: {
      opacity: 1,
      type: chartType === 'bar' ? 'solid' : 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      },
    },
  };

  // Prepare series data for chart - showing average marks per subject
  const chartSeries = [
    {
      name: "Average Marks",
      data: subjectData.map(item => item.average)
    }
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-gray-500 dark:text-gray-400">Loading results data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">No results data available</div>
            <button
              onClick={fetchMyResults}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Subject Performance Analysis
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Compare your average marks across different subjects
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Chart:</span>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'bar' | 'line')}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'average' | 'highest')}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="average">Average Marks</option>
              <option value="highest">Highest Marks</option>
              <option value="name">Subject Name</option>
            </select>
          </div>
          
          <button
            onClick={fetchMyResults}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px] xl:min-w-full">
          <Chart 
            options={chartOptions} 
            series={chartSeries} 
            type={chartType} 
            height={400} 
          />
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {subjectData.length}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Subjects</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {getOverallAverage()}%
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Overall Average</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {getHighestMark()}%
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Highest Mark</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {getLowestMark()}%
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">Lowest Mark</div>
        </div>
      </div>

      {/* Subject Details Table */}
      <div className="mt-6">
        <h4 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">
          Subject Performance Details
        </h4>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Average
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Highest
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lowest
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Results
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {subjectData.map((subject, index) => (
                <tr key={subject.subject} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {subject.subject}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    <span className={`font-semibold ${
                      subject.average >= 80 ? 'text-green-600' :
                      subject.average >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {subject.average}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {subject.highest}%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {subject.lowest}%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {subject.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}