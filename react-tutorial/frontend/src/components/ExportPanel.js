import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ExportPanel = ({ onClose }) => {
  const { isDark } = useTheme();
  const [exportType, setExportType] = useState('students');
  const [format, setFormat] = useState('excel');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    batch: '',
    status: '',
    startDate: '',
    endDate: '',
    company: '',
    year: new Date().getFullYear().toString()
  });

  const exportTypes = [
    { id: 'students', label: 'Students', icon: '👨‍🎓', description: 'Export student data with profiles' },
    { id: 'placements', label: 'Placements', icon: '💼', description: 'Export placement records' },
    { id: 'interviews', label: 'Interviews', icon: '🎯', description: 'Export interview schedules' },
    { id: 'assessments', label: 'Assessment Results', icon: '📝', description: 'Export skill test results' },
    { id: 'companies', label: 'Companies', icon: '🏢', description: 'Export company database' },
    { id: 'applications', label: 'Applications', icon: '📋', description: 'Export placement applications' },
    { id: 'report', label: 'Full Report', icon: '📊', description: 'Comprehensive placement report' }
  ];

  const formats = [
    { id: 'excel', label: 'Excel (.xlsx)', icon: '📗' },
    { id: 'csv', label: 'CSV', icon: '📄' },
    { id: 'pdf', label: 'PDF Report', icon: '📕' },
    { id: 'json', label: 'JSON', icon: '📘' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (format === 'csv') queryParams.append('format', 'csv');
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `http://localhost:5001/api/export/${exportType}?${queryParams}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Handle different format downloads
      if (format === 'csv') {
        const blob = await response.blob();
        downloadFile(blob, `${exportType}_export.csv`, 'text/csv');
      } else if (format === 'excel') {
        const data = await response.json();
        downloadAsExcel(data.data || data, exportType);
      } else if (format === 'pdf') {
        const data = await response.json();
        generatePDF(data.data || data, exportType);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadFile(blob, `${exportType}_export.json`, 'application/json');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (blob, filename, type) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const downloadAsExcel = (data, type) => {
    // Convert to CSV format for Excel compatibility
    if (!data || !Array.isArray(data) || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          let value = row[header] || '';
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    downloadFile(blob, `${type}_export.csv`, 'text/csv');
  };

  const generatePDF = (data, type) => {
    // Create a printable HTML version
    if (!data || !Array.isArray(data) || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${type.charAt(0).toUpperCase() + type.slice(1)} Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #8B5CF6; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header { display: flex; justify-content: space-between; align-items: center; }
          .date { color: #666; font-size: 14px; }
          .summary { background: #f5f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${type.charAt(0).toUpperCase() + type.slice(1)} Report</h1>
          <span class="date">Generated: ${new Date().toLocaleDateString()}</span>
        </div>
        <div class="summary">
          <strong>Total Records:</strong> ${data.length}
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(h => `<td>${row[h] || '-'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const renderFilters = () => {
    switch (exportType) {
      case 'students':
        return (
          <>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className={`w-full px-3 py-2 rounded-none border ${isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'}`}
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Batch
              </label>
              <select
                value={filters.batch}
                onChange={(e) => handleFilterChange('batch', e.target.value)}
                className={`w-full px-3 py-2 rounded-none border ${isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'}`}
              >
                <option value="">All Batches</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className={`w-full px-3 py-2 rounded-none border ${isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'}`}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        );

      case 'placements':
      case 'interviews':
        return (
          <>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 rounded-none border ${isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className={`w-full px-3 py-2 rounded-none border ${isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Company
              </label>
              <input
                type="text"
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                placeholder="Filter by company name"
                className={`w-full px-3 py-2 rounded-none border ${isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
              />
            </div>
            {exportType === 'interviews' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={`w-full px-3 py-2 rounded-none border ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'}`}
                >
                  <option value="">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </>
        );

      case 'report':
        return (
          <>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className={`w-full px-3 py-2 rounded-none border ${isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'}`}
              >
                <option value="">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className={`w-full px-3 py-2 rounded-none border ${isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'}`}
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-black/50'}`}>
      <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-none shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-none ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Export Data</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Download data in various formats</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-none transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Type Selection */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              What do you want to export?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {exportTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setExportType(type.id)}
                  className={`p-4 rounded-none border-2 transition-all text-left ${
                    exportType === type.id
                      ? isDark ? 'border-gray-500 bg-gray-700' : 'border-gray-900 bg-gray-50'
                      : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <p className={`font-medium mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{type.label}</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Export Format
            </label>
            <div className="grid grid-cols-4 gap-3">
              {formats.map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => setFormat(fmt.id)}
                  className={`p-3 rounded-none border-2 transition-all text-center ${
                    format === fmt.id
                      ? isDark ? 'border-gray-500 bg-gray-700' : 'border-gray-900 bg-gray-50'
                      : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{fmt.icon}</span>
                  <p className={`text-sm mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>{fmt.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Filters (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderFilters()}
            </div>
          </div>

          {/* Export Summary */}
          <div className={`p-4 rounded-none ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Export Summary</h4>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-600'}`}>
                Type: {exportTypes.find(t => t.id === exportType)?.label}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-600'}`}>
                Format: {formats.find(f => f.id === format)?.label}
              </span>
              {Object.entries(filters).map(([key, value]) => 
                value && (
                  <span key={key} className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-600'}`}>
                    {key}: {value}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={loading}
            className={`w-full py-3 rounded-none font-semibold text-white transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Data
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
