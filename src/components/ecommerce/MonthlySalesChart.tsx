import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useState, useEffect, useCallback } from "react";

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

interface SubjectMarks {
  subject: string;
  marks: number[];
  average: number;
  highest: number;
  lowest: number;
  sum: number; // Added missing 'sum' property
}

export default function SubjectMarksChart() {
  const [results, setResults] = useState<Result[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectMarks[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'average' | 'highest' | 'sum'>('average');
  const [isOpen, setIsOpen] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

  // Fetch student results
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
      const sum = marks.reduce((total, mark) => total + mark, 0);
      
      return {
        subject,
        marks,
        average: Number(average.toFixed(1)),
        highest,
        lowest,
        sum
      };
    });

    // Sort by average marks (highest first)
    const sortedData = processedData.sort((a, b) => b.average - a.average);
    setSubjectData(sortedData);
  }, [results]);

  // Process data when results change
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

  // Get data based on selected view type
  const getChartData = () => {
    return subjectData.map(item => {
      switch (viewType) {
        case 'average':
          return item.average;
        case 'highest':
          return item.highest;
        case 'sum':
          return item.sum;
        default:
          return item.average;
      }
    });
  };

  // Get chart title based on view type
  const getChartTitle = () => {
    switch (viewType) {
      case 'average':
        return 'Average Marks by Subject';
      case 'highest':
        return 'Highest Marks by Subject';
      case 'sum':
        return 'Total Marks by Subject';
      default:
        return 'Marks by Subject';
    }
  };

  // Get y-axis title based on view type
  const getYAxisTitle = () => {
    switch (viewType) {
      case 'average':
        return 'Average Marks';
      case 'highest':
        return 'Highest Marks';
      case 'sum':
        return 'Total Marks';
      default:
        return 'Marks';
    }
  };

  // Chart configuration
  const options: ApexOptions = {
    colors: ["#465fff", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
        borderRadiusApplication: "end",
        distributed: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: subjectData.map(item => item.subject),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "11px",
          colors: "#6B7280",
        },
        rotate: -45,
      },
    },
    legend: {
      show: false,
    },
    yaxis: {
      title: {
        text: getYAxisTitle(),
        style: {
          fontSize: "11px",
          fontWeight: "normal",
          color: "#6B7280"
        },
      },
      labels: {
        formatter: function(val: number) {
          return `${val}${viewType === 'sum' ? '' : '%'}`;
        },
        style: {
          fontSize: "11px",
          colors: "#6B7280",
        },
      },
      min: 0,
      max: viewType === 'sum' ? undefined : 100,
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: true,
        formatter: function(val: number, opts?: { dataPointIndex: number }) {
          const subject = subjectData[opts?.dataPointIndex || 0];
          return `
            <div class="text-xs">
              <div class="font-semibold">${subject?.subject || val}</div>
              <div>Average: ${subject?.average}%</div>
              <div>Highest: ${subject?.highest}%</div>
              <div>Lowest: ${subject?.lowest}%</div>
              <div>Results: ${subject?.marks.length}</div>
            </div>
          `;
        },
      },
      y: {
        formatter: function(val: number) {
          return `${val}${viewType === 'sum' ? '' : '%'}`;
        },
        title: {
          formatter: function() {
            return "";
          },
        },
      },
    },
  };

  const series = [
    {
      name: getYAxisTitle(),
      data: getChartData(),
    },
  ];

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Loading Marks Data...
          </h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            No Results Data
          </h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              No results available
            </div>
            <button
              onClick={fetchMyResults}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {getChartTitle()}
        </h3>
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
                setViewType('average');
                closeDropdown();
              }}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Average Marks
            </DropdownItem>
            <DropdownItem
              onItemClick={() => {
                setViewType('highest');
                closeDropdown();
              }}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Highest Marks
            </DropdownItem>
            <DropdownItem
              onItemClick={() => {
                setViewType('sum');
                closeDropdown();
              }}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Total Marks
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
          <div className="font-semibold text-blue-600 dark:text-blue-400">
            {subjectData.length}
          </div>
          <div className="text-blue-600 dark:text-blue-400">Subjects</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
          <div className="font-semibold text-green-600 dark:text-green-400">
            {Math.max(...subjectData.map(s => s.average))}%
          </div>
          <div className="text-green-600 dark:text-green-400">Best Avg</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
          <div className="font-semibold text-purple-600 dark:text-purple-400">
            {subjectData.filter(s => s.average >= 80).length}
          </div>
          <div className="text-purple-600 dark:text-purple-400">A Grades</div>
        </div>
      </div>
    </div>
  );
}