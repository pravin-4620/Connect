import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

const AdvancedSearch = ({ onClose, onSelectStudent }) => {
  const { isDark } = useTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    batch: '',
    minCGPA: '',
    maxCGPA: '',
    skills: [],
    placementStatus: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    batches: [],
    skills: [],
    cgpaRange: { minCGPA: 0, maxCGPA: 10 }
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');

  const searchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.department) queryParams.append('department', filters.department);
      if (filters.batch) queryParams.append('batch', filters.batch);
      if (filters.minCGPA) queryParams.append('minCGPA', filters.minCGPA);
      if (filters.maxCGPA) queryParams.append('maxCGPA', filters.maxCGPA);
      if (selectedSkills.length > 0) queryParams.append('skills', selectedSkills.join(','));
      if (filters.placementStatus) queryParams.append('placementStatus', filters.placementStatus);
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);

      const response = await fetch(`http://localhost:5001/api/students?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.data || []);
      }
    } catch (error) {
      console.error('Error searching students:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, selectedSkills, sortBy, sortOrder]);

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/students/filters', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
    searchStudents();
  }, [searchStudents]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      department: '',
      batch: '',
      minCGPA: '',
      maxCGPA: '',
      skills: [],
      placementStatus: ''
    });
    setSelectedSkills([]);
    setSortBy('name');
    setSortOrder('asc');
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const filteredSkillOptions = filterOptions.skills?.filter(skill =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  ) || [];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-black/50'}`}>
      <div className={`w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-none shadow-2xl flex flex-col ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-none ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Advanced Student Search</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Filter by skills, CGPA, department & more
              </p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-none transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Filters Sidebar */}
          <div className={`w-80 border-r overflow-y-auto ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="p-4 space-y-4">
              {/* Search */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Name, email, roll number..."
                  className={`w-full px-3 py-2 rounded-none border focus:ring-2 focus:ring-gray-500 focus:border-transparent ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                />
              </div>

              {/* Department */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Department
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className={`w-full px-3 py-2 rounded-none border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'}`}
                >
                  <option value="">All Departments</option>
                  {filterOptions.departments?.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Batch */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Batch
                </label>
                <select
                  value={filters.batch}
                  onChange={(e) => handleFilterChange('batch', e.target.value)}
                  className={`w-full px-3 py-2 rounded-none border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'}`}
                >
                  <option value="">All Batches</option>
                  {filterOptions.batches?.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>

              {/* CGPA Range */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  CGPA Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minCGPA}
                    onChange={(e) => handleFilterChange('minCGPA', e.target.value)}
                    placeholder="Min"
                    min="0"
                    max="10"
                    step="0.1"
                    className={`w-1/2 px-3 py-2 rounded-none border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                  />
                  <input
                    type="number"
                    value={filters.maxCGPA}
                    onChange={(e) => handleFilterChange('maxCGPA', e.target.value)}
                    placeholder="Max"
                    min="0"
                    max="10"
                    step="0.1"
                    className={`w-1/2 px-3 py-2 rounded-none border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                  />
                </div>
              </div>

              {/* Placement Status */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Placement Status
                </label>
                <select
                  value={filters.placementStatus}
                  onChange={(e) => handleFilterChange('placementStatus', e.target.value)}
                  className={`w-full px-3 py-2 rounded-none border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'}`}
                >
                  <option value="">All Students</option>
                  <option value="placed">Placed</option>
                  <option value="unplaced">Not Placed</option>
                </select>
              </div>

              {/* Skills */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Skills ({selectedSkills.length} selected)
                </label>
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Search skills..."
                  className={`w-full px-3 py-2 rounded-none border mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                />
                <div className={`max-h-40 overflow-y-auto rounded-none border p-2 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                  {filteredSkillOptions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {filteredSkillOptions.slice(0, 30).map(skill => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`px-2 py-1 text-xs rounded-none transition-colors ${
                            selectedSkills.includes(skill)
                              ? 'bg-blue-500 text-white'
                              : isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm text-center py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      No skills found
                    </p>
                  )}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sort By
                </label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-none border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'}`}
                  >
                    <option value="name">Name</option>
                    <option value="cgpa">CGPA</option>
                    <option value="department">Department</option>
                    <option value="batch">Batch</option>
                    <option value="createdAt">Registration Date</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className={`px-3 py-2 rounded-none border transition-colors ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                      : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'}`}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={searchStudents}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-none font-medium hover:from-blue-600 hover:to-cyan-700 transition-all"
                >
                  Search
                </button>
                <button
                  onClick={clearFilters}
                  className={`py-2 px-4 rounded-none font-medium transition-colors ${isDark 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {loading ? 'Searching...' : `${students.length} students found`}
              </p>
              {selectedSkills.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Filtered by:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedSkills.map(skill => (
                      <span key={skill} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                        {skill}
                        <button onClick={() => toggleSkill(skill)} className="hover:text-blue-900">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Student Cards */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map(student => (
                  <div
                    key={student._id}
                    className={`p-4 rounded-none border transition-all hover:shadow-lg cursor-pointer ${isDark 
                      ? 'bg-gray-750 border-gray-700 hover:border-blue-500' 
                      : 'bg-white border-gray-200 hover:border-blue-400'}`}
                    onClick={() => onSelectStudent && onSelectStudent(student)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isDark ? 'bg-blue-600' : 'bg-blue-500'} text-white`}>
                        {student.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {student.name}
                        </h3>
                        <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {student.email || student.user?.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {student.department && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                              {student.department}
                            </span>
                          )}
                          {student.batch && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                              {student.batch}
                            </span>
                          )}
                          {student.cgpa && (
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              student.cgpa >= 8 ? 'bg-green-100 text-green-700' :
                              student.cgpa >= 6 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              CGPA: {student.cgpa}
                            </span>
                          )}
                        </div>
                        {student.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {student.skills.slice(0, 4).map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                {skill}
                              </span>
                            ))}
                            {student.skills.length > 4 && (
                              <span className={`px-2 py-0.5 text-xs rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                                +{student.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">No students found</p>
                <p className="text-sm mt-1">Try adjusting your search filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
