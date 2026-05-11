// SuperAdmin.jsx - School Selection Page
// ✅ Fetches and saves current academic year AFTER school selection

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../ContextAPI/UserContext';
import { getCurrentAcademicYear } from '../Api/AcademicYear';
import { toast } from 'react-toastify';

const SuperAdmin = () => {
  const navigate = useNavigate();
  const { saveSchool, saveCurrentAcademicYear } = useContext(UserContext);
  
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingSchool, setSelectingSchool] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    // Replace with your actual API endpoint
    try {
      setLoading(true);
      // const response = await fetch('/api/schools');
      // const data = await response.json();
      // setSchools(data);
      
      // Temporary mock data
      setSchools([
        { id: 1, name: 'Springfield High School', location: 'Springfield, IL' },
        { id: 2, name: 'Riverdale Academy', location: 'Riverdale, NY' },
        { id: 3, name: 'Greenwood International', location: 'Greenwood, CA' },
      ]);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSelect = async (school) => {
    try {
      setSelectingSchool(true);

      // Save selected school
      saveSchool(school);
      
      // ✅ FETCH AND SAVE CURRENT ACADEMIC YEAR AFTER SCHOOL SELECTION
      try {
        const academicYear = await getCurrentAcademicYear();
        if (academicYear) {
          saveCurrentAcademicYear(academicYear);
          console.log('✅ Academic year loaded:', academicYear);
        }
      } catch (err) {
        console.error('Failed to fetch academic year:', err);
        toast.error('Failed to load academic year. Some features may not work correctly.');
        // Don't block navigation - continue even if academic year fetch fails
      }

      toast.success(`Selected: ${school.name}`);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('School selection error:', error);
      toast.error('Failed to select school');
    } finally {
      setSelectingSchool(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Select School</h1>
          <p className="text-gray-600">Choose a school to manage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((school) => (
            <div
              key={school.id}
              onClick={() => !selectingSchool && handleSchoolSelect(school)}
              className={`bg-white rounded-xl border-2 border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-500 hover:-translate-y-1 ${
                selectingSchool ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                  {school.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{school.name}</h3>
                  <p className="text-sm text-gray-500">{school.location}</p>
                </div>
              </div>
              <div className="text-right">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectingSchool && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-2xl">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-gray-700 font-medium">Setting up school...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;