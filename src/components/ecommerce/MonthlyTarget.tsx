import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect, useCallback } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";

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

interface SubjectData {
  subject: string;
  average: number;
  highest: number;
  lowest: number;
  count: number;
}

export default function SubjectPolarChart() {
  const [results, setResults] = useState<Result[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataType, setDataType] = useState<'average' | 'highest' | 'lowest'>('average');
  const [isOpen, setIsOpen] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

  // Beautiful color palette for polar chart
  const polarColors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1",
    "#14B8A6", "#F43F5E", "#D946EF", "#0EA5E9", "#84CC16"
  ];

  useEffect(() => {
    fetchMyResults();
  }, []);

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
        average: Number(average.toFixed(1)),
        highest,
        lowest,
        count: marks.length
      };
    });

    // Sort by average marks (highest first) and limit to top subjects for better visualization
    const sortedData = processedData
      .sort((a, b) => b.average - a.average)
      .slice(0, 8); // Limit to top 8 subjects for clean polar chart

    setSubjectData(sortedData);
  }, [results]);

  useEffect(() => {
    if (results.length > 0) {
      processSubjectData();
    }
  }, [results, processSubjectData]);

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
      
      if (!response.ok) throw new Error('Failed to fetch results');
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Get data based on selected type
  const getChartData = () => {
    return subjectData.map(item => {
      switch (dataType) {
        case 'average':
          return item.average;
        case 'highest':
          return item.highest;
        case 'lowest':
          return item.lowest;
        default:
          return item.average;
      }
    });
  };

  // Get chart title based on data type
  const getChartTitle = () => {
    switch (dataType) {
      case 'average':
        return 'Average Marks by Subject';
      case 'highest':
        return 'Highest Marks by Subject';
      case 'lowest':
        return 'Lowest Marks by Subject';
      default:
        return 'Subject Performance';
    }
  };

  // Polar chart configuration
  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "polarArea",
      height: 350,
    },
    colors: polarColors,
    labels: subjectData.map(item => item.subject),
    stroke: {
      width: 2,
      colors: ['#fff']
    },
    fill: {
      opacity: 0.9,
    },
    plotOptions: {
      polarArea: {
        rings: {
          strokeWidth: 1,
          strokeColor: '#E5E7EB'
        },
        spokes: {
          strokeWidth: 1,
          connectorColors: '#E5E7EB'
        }
      }
    },
    yaxis: {
      show: false
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '12px',
      fontWeight: 500,
      markers: {
        size: 8, // Use 'size' instead of 'width' and 'height'
        strokeWidth: 0,
        
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },
    tooltip: {
      y: {
        formatter: function(val: number) {
          return `${val}%`;
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '11px',
        fontWeight: 600,
        colors: ['#1F2937']
      },
      background: {
        enabled: true,
        borderRadius: 4,
        padding: 4,
        opacity: 0.9,
        borderWidth: 1,
        borderColor: '#E5E7EB'
      },
      dropShadow: {
        enabled: false
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            position: 'bottom',
            fontSize: '10px',
            markers: {
              size: 6, // Use 'size' instead of 'width' and 'height'
              strokeWidth: 0,
              radius: 3,
            },
          },
        },
      },
    ],
  };

  const series = getChartData();

  // Calculate overall statistics
  const getOverallAverage = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + Number(result.marks), 0);
    return (total / results.length).toFixed(1);
  };

  const getBestSubject = () => {
    if (subjectData.length === 0) return 'N/A';
    return subjectData.reduce((best, current) => 
      current.average > best.average ? current : best
    ).subject;
  };

  const getBestScore = () => {
    if (subjectData.length === 0) return 0;
    return Math.max(...subjectData.map(s => s.average));
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Loading Polar Chart...
          </h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-gray-500 dark:text-gray-400">Loading subject data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            No Results Data
          </h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              No results available for visualization
            </div>
            <button
              onClick={fetchMyResults}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {getChartTitle()}
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Polar visualization of subject performance
          </p>
        </div>
        
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={() => {
                setDataType('average');
                closeDropdown();
              }}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Average Marks
            </DropdownItem>
            <DropdownItem
              onItemClick={() => {
                setDataType('highest');
                closeDropdown();
              }}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Highest Marks
            </DropdownItem>
            <DropdownItem
              onItemClick={() => {
                setDataType('lowest');
                closeDropdown();
              }}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Lowest Marks
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Polar Chart */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[400px] xl:min-w-full flex justify-center">
          <Chart 
            options={options} 
            series={series} 
            type="polarArea" 
            height={350} 
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {getOverallAverage()}%
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">Overall Avg</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {getBestScore()}%
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">Best Score</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {subjectData.length}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400">Subjects</div>
        </div>
      </div>

      {/* Best Subject */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Best Performing Subject:{" "}
          <span className="font-semibold text-gray-800 dark:text-white">
            {getBestSubject()}
          </span>
        </p>
      </div>
    </div>
  );
}