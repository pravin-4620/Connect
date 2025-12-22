import React, { useState } from 'react';
import { User, BookOpen, Award, Code, Upload, CheckCircle, Phone } from 'lucide-react';
import { createStudent, updateUserProfile } from '../services/apiService';
import apiService from '../services/apiService';
import { useTheme } from '../context/ThemeContext';

const StudentProfileForm = ({ user, onComplete }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    rollNumber: '',
    department: 'Computer Science',
    year: '1',
    cgpa: '',
    skills: '',
    phone: '',
    photo: '',
    resumeUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const themeClasses = {
    bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    input: isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    iconBg: isDark ? 'bg-gray-700' : 'bg-gray-50',
    iconColor: isDark ? 'text-gray-300' : 'text-gray-700',
  };

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Biotechnology'
  ];

  const years = ['1', '2', '3', '4'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setPhotoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate CGPA
    const cgpa = parseFloat(formData.cgpa);
    if (cgpa < 0 || cgpa > 10) {
      setError('CGPA must be between 0 and 10');
      return;
    }

    // Validate phone
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      setError('Phone number must be 10 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let photoPath = formData.photo;
      
      // Upload photo if selected
      if (photoFile) {
        setUploadingPhoto(true);
        try {
          const photoResponse = await apiService.uploadProfilePhoto(photoFile);
          if (photoResponse.success) {
            photoPath = photoResponse.data.photoUrl;
          }
        } catch (photoErr) {
          console.error('Photo upload error:', photoErr);
          // Continue without photo if upload fails
        }
        setUploadingPhoto(false);
      }

      // First update user profile with phone, photo, department
      const userProfileData = {
        phone: formData.phone,
        photo: photoPath,
        department: formData.department,
        profileCompleted: true
      };

      await updateUserProfile(userProfileData);

      // Convert skills string to array
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const profileData = {
        ...formData,
        skills: skillsArray,
        year: parseInt(formData.year),
        cgpa: parseFloat(formData.cgpa),
        placementStatus: 'unplaced'
      };

      const response = await createStudent(profileData);
      
      if (response.success) {
        alert('Profile created successfully!');
        onComplete();
      }
    } catch (err) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} py-8 px-4`}>
      <div className={`max-w-4xl mx-auto ${themeClasses.card} rounded-lg shadow-lg p-8 border`}>
        <div className={`text-center mb-8 border-b ${themeClasses.border} pb-6`}>
          <div className={`${themeClasses.iconBg} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <User className={themeClasses.text} size={40} />
          </div>
          <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>Complete Your Profile</h1>
          <p className={themeClasses.textSecondary}>Welcome, {user.name}! Please fill in your details to continue</p>
        </div>

        {error && (
          <div className={`${isDark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-300 text-red-800'} border px-4 py-3 rounded-lg mb-6 text-sm`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className={`border-b ${themeClasses.border} pb-6`}>
            <h2 className={`text-xl font-semibold ${themeClasses.text} mb-4 flex items-center`}>
              <User className={`mr-2 ${themeClasses.iconColor}`} size={24} />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.textMuted}`} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition ${themeClasses.input}`}
                    required
                    placeholder="9876543210"
                    pattern="[0-9]{10}"
                  />
                </div>
                <p className={`text-xs ${themeClasses.textMuted} mt-1`}>10 digit mobile number</p>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  Profile Photo (optional)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className={`w-16 h-16 rounded-full object-cover border-2 ${themeClasses.border}`}
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-full ${themeClasses.iconBg} flex items-center justify-center border-2 ${themeClasses.border}`}>
                        <User className={`h-8 w-8 ${themeClasses.textMuted}`} />
                      </div>
                    )}
                    {uploadingPhoto && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <label className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.iconBg} border ${themeClasses.border} rounded-lg cursor-pointer hover:opacity-80 transition`}>
                    <Upload className={`h-4 w-4 ${themeClasses.textSecondary}`} />
                    <span className={`text-sm ${themeClasses.textSecondary}`}>
                      {photoFile ? 'Change Photo' : 'Upload Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className={`text-xs ${themeClasses.textMuted} mt-1`}>JPG, PNG (MAX. 5MB)</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className={`border-b ${themeClasses.border} pb-6`}>
            <h2 className={`text-xl font-semibold ${themeClasses.text} mb-4 flex items-center`}>
              <BookOpen className={`mr-2 ${themeClasses.iconColor}`} size={24} />
              Academic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  Roll Number *
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition ${themeClasses.input}`}
                  required
                  placeholder="e.g., 21CS001"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 cursor-pointer transition ${themeClasses.input}`}
                  required
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 cursor-pointer transition ${themeClasses.input}`}
                  required
                >
                  {years.map(year => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  CGPA *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition ${themeClasses.input}`}
                  required
                  placeholder="e.g., 8.5"
                  min="0"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className={`border-b ${themeClasses.border} pb-6`}>
            <h2 className={`text-xl font-semibold ${themeClasses.text} mb-4 flex items-center`}>
              <Code className={`mr-2 ${themeClasses.iconColor}`} size={24} />
              Skills & Expertise
            </h2>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                Skills * (comma-separated)
              </label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition ${themeClasses.input}`}
                required
                rows="3"
                placeholder="e.g., JavaScript, React, Node.js, Python, SQL"
              />
              <p className={`text-xs ${themeClasses.textMuted} mt-1`}>Enter your skills separated by commas</p>
            </div>
          </div>

          {/* Documents & Links */}
          <div className={`border-b ${themeClasses.border} pb-6`}>
            <h2 className={`text-xl font-semibold ${themeClasses.text} mb-4 flex items-center`}>
              <Upload className={`mr-2 ${themeClasses.iconColor}`} size={24} />
              Documents & Links
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  Resume URL
                </label>
                <input
                  type="url"
                  name="resumeUrl"
                  value={formData.resumeUrl}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition ${themeClasses.input}`}
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  GitHub Profile
                </label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition ${themeClasses.input}`}
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition ${themeClasses.input}`}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h2 className={`text-xl font-semibold ${themeClasses.text} mb-4 flex items-center`}>
              <Award className={`mr-2 ${themeClasses.iconColor}`} size={24} />
              About You
            </h2>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                Bio / Career Objective
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition ${themeClasses.input}`}
                rows="4"
                placeholder="Tell us about yourself, your career goals, interests, achievements..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg transition font-medium flex items-center justify-center shadow-sm ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600' 
                : 'bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-400'
            } disabled:cursor-not-allowed`}
          >
            {loading ? (
              'Creating Profile...'
            ) : (
              <>
                <CheckCircle className="mr-2" size={20} />
                Complete Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfileForm;
