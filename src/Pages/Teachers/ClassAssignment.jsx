import { useState, useEffect } from 'react';
import { Search, Edit2, Plus, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { 
  getTeachers, 
  createTeacherAssignment, 
  updateTeacherAssignment,
  deleteTeacherAssignment,
  getClasses,
  getSectionsByClass,
  getSubjectsBySection,
  getTeachersActiveAssignments
} from "../../Api/TeachersAPI";

function ClassAssignment({teacherId}) {
  const [teachers, setTeachers] = useState([]); 
  const [createdAssignments, setCreatedAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Dropdown data
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  // for active teacher (tracks currently selected teacher id)
  const [activeTeacher, setActiveTeacher] = useState('');
  const [dropdownLoading, setDropdownLoading] = useState({
    classes: false,
    sections: false,
    subjects: false
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Edit mode state
  const [editingAssignment, setEditingAssignment] = useState(null);
  
  // Form state for new/edit assignment
  const [formData, setFormData] = useState({
    teacherId: '',
    teacherName: '',
    classAssignments: [],
    subject: '',
    subjectId: '',
    isClassTeacher: false
  });

  // State for class dropdown selection
  const [selectedClassDropdown, setSelectedClassDropdown] = useState('');

  // ==================== LIFECYCLE ====================

  useEffect(() => {
    fetchClasses();
    fetchTeachers();

    
    // Load form data from localStorage on mount
    let savedFormData;// = localStorage.getItem('classAssignmentFormData');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
        
        // Load sections if there are classAssignments
        if (parsedData.classAssignments && parsedData.classAssignments.length > 0) {
          fetchSections(parsedData.classAssignments[0].gradeId);
          
          // Load subjects if there's a subjectId
          if (parsedData.subjectId && parsedData.classAssignments[0].sections.length > 0) {
            fetchSubjects(parsedData.classAssignments[0].sections[0]);
          }
        }
      } catch (err) {
        console.error('Error parsing saved form data:', err);
      }
    }

    // Load created assignments from localStorage
    let savedAssignments ;// = localStorage.getItem('classAssignmentCreatedAssignments');
    if (savedAssignments) {
      try {
        const parsedAssignments = JSON.parse(savedAssignments);
        setCreatedAssignments(parsedAssignments);
      } catch (err) {
        console.error('Error parsing saved assignments:', err);
      }
    }
  }, []);

  // Fetch subjects when any section is selected in any class
  useEffect(() => {
    if (formData.classAssignments.length > 0) {
      const allSections = formData.classAssignments.flatMap(ca => ca.sections);
      
      if (allSections.length > 0) {
        console.log("Fetching subjects for section:", allSections[0]);
        fetchSubjects(allSections[0]);
      } else {
        setSubjects([]);
        setFormData(prev => ({
          ...prev,
          subject: '',
          subjectId: ''
        }));
      }
    } else {
      setSubjects([]);
      setFormData(prev => ({
        ...prev,
        subject: '',
        subjectId: ''
      }));
    }
  }, [formData.classAssignments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Save form data to localStorage whenever it changes
  // useEffect(() => {
  //   localStorage.setItem('classAssignmentFormData', JSON.stringify(formData));
  // }, [formData]);

  // Save created assignments to localStorage whenever they change
  // useEffect(() => {
  //   localStorage.setItem('classAssignmentCreatedAssignments', JSON.stringify(createdAssignments));
  // }, [createdAssignments]);

  // ==================== FETCH FUNCTIONS ====================

  const fetchClasses = async () => {
    try {
      setDropdownLoading(prev => ({ ...prev, classes: true }));
      console.log("Fetching classes...");
      
      const classList = await getClasses();
      console.log("Classes fetched:", classList);
      setClasses(classList);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Failed to fetch classes");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDropdownLoading(prev => ({ ...prev, classes: false }));
    }
  };

  const fetchSections = async (classId) => {
    try {
      setDropdownLoading(prev => ({ ...prev, sections: true }));
      console.log("Fetching sections for classId:", classId);
      
      const sectionsList = await getSectionsByClass(classId);
      console.log("Sections fetched:", sectionsList);
      setSections(sectionsList);
    } catch (err) {
      console.error("Error fetching sections:", err);
      setError("Failed to fetch sections");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDropdownLoading(prev => ({ ...prev, sections: false }));
    }
  };

  const fetchSubjects = async (sectionId) => {
    try {
      setDropdownLoading(prev => ({ ...prev, subjects: true }));
      console.log("Fetching subjects for sectionId:", sectionId);
      
      const subjectsList = await getSubjectsBySection(sectionId);
      console.log("Subjects fetched:", subjectsList);
      setSubjects(subjectsList);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError("Failed to fetch subjects");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDropdownLoading(prev => ({ ...prev, subjects: false }));
    }
  };
 // we have to replace it
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      console.log("Fetching teachers...");
      
      const response = await getTeachers(0, 1000);
      console.log("Teachers API response:", response);
      
      let teachersList = [];
      if (Array.isArray(response)) {
        teachersList = response;
      } else if (response?.content && Array.isArray(response.content)) {
        teachersList = response.content;
      } else if (response?.data && Array.isArray(response.data)) {
        teachersList = response.data;
      }
      
      console.log("Processed teachers:", teachersList.length);
      setTeachers(teachersList);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setError("Failed to fetch teachers: " + err.message);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (teacherId) {
    const selectedTeacher = teachers.find(t => String(t.id) === String(teacherId));
    if (selectedTeacher) {
      const teacherName = selectedTeacher.fullName || 
                         `${selectedTeacher.firstName || ''} ${selectedTeacher.lastName || ''}`.trim();
      setFormData(prev => ({
        ...prev,
        teacherId: teacherId,
        teacherName: teacherName
      }));
    }
  }
}, [teacherId, teachers]);

  // ==================== FORM HANDLERS ====================
// update form here 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name ,'name ','value is:', value)
    
    if (name === 'teacherId') {
      const selectedTeacher = teachers.find(t => String(t.id) === String(value));
      
      if (selectedTeacher) {
        const teacherName = selectedTeacher.fullName || 
                           `${selectedTeacher.firstName || ''} ${selectedTeacher.lastName || ''}`.trim() ||
                           'Unknown';
        
        // Reset form data when teacher changes and clear localStorage
        const newFormData = {
          teacherId: value,
          teacherName: teacherName,
          classAssignments: [],
          subject: '',
          subjectId: '',
          isClassTeacher: false
        };
        
        setFormData(newFormData);
        setCreatedAssignments([]);
       // localStorage.setItem('classAssignmentFormData', JSON.stringify(newFormData));
       // localStorage.removeItem('classAssignmentCreatedAssignments');
        setSections([]);
        setSubjects([]);
      }
    } else if (name === 'subject') {
      const selectedSubject = subjects.find(s => String(s.id) === String(value));
      
      setFormData(prev => ({
        ...prev,
        subject: selectedSubject?.name || value,
        subjectId: selectedSubject?.id || value
      }));
    } else if (name === 'isClassTeacher') {
      setFormData(prev => ({
        ...prev,
        [name]: e.target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Add a new class to assignments
  const handleAddClass = async () => {
    if (!selectedClassDropdown) {
      setError("Please select a class first");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const classExists = formData.classAssignments.some(
      ca => String(ca.gradeId) === String(selectedClassDropdown)
    );
    
    if (classExists) {
      setError("This class is already added");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const selectedClass = classes.find(c => String(c.id) === String(selectedClassDropdown));
    
    if (!selectedClass) {
      setError("Class not found");
      setTimeout(() => setError(null), 3000);
      return;
    }

    await fetchSections(selectedClassDropdown);
    
    setFormData(prev => ({
      ...prev,
      classAssignments: [
        ...prev.classAssignments,
        { 
          gradeId: selectedClassDropdown, 
          gradeName: selectedClass.name || selectedClass.className || '',
          sections: [] 
        }
      ]
    }));

    // Reset dropdown after adding
    setSelectedClassDropdown('');
  };

  // Remove a class from assignments
  const handleRemoveClass = (gradeId) => {
    setFormData(prev => ({
      ...prev,
      classAssignments: prev.classAssignments.filter(ca => ca.gradeId !== gradeId)
    }));
  };

  // Toggle section for a class
  const toggleSectionForClass = (gradeId, sectionId) => {
    setFormData(prev => ({
      ...prev,
      classAssignments: prev.classAssignments.map(ca => {
        if (ca.gradeId === gradeId) {
          return {
            ...ca,
            sections: ca.sections.includes(sectionId)
              ? ca.sections.filter(s => s !== sectionId)
              : [...ca.sections, sectionId]
          };
        }
        return ca;
      })
    }));
  };

  const validatePayload = (assignmentData) => {
    console.log("=== VALIDATING PAYLOAD ===");
    const errors = [];
    
    if (!assignmentData.classId || assignmentData.classId === 0) {
      errors.push("classId is missing or invalid");
    }
    if (!assignmentData.sectionId || assignmentData.sectionId === 0) {
      errors.push("sectionId is missing or invalid");
    }
    if (!assignmentData.subjectId || assignmentData.subjectId === 0) {
      errors.push("subjectId is missing or invalid");
    }
    if (typeof assignmentData.isClassTeacher !== 'boolean') {
      errors.push("isClassTeacher must be a boolean");
    }
    if (!assignmentData.weeklyPeriods || assignmentData.weeklyPeriods < 0) {
      errors.push("weeklyPeriods is missing or invalid");
    }
    if (!assignmentData.academicYear) {
      errors.push("academicYear is missing");
    }
    if (!assignmentData.status) {
      errors.push("status is missing");
    }
    
    if (errors.length > 0) {
      console.warn("❌ Validation Errors:", errors);
      return false;
    }
    
    console.log("✅ Payload validation passed");
    return true;
  };

  const handleAddMapping = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.teacherId || formData.classAssignments.length === 0 || !formData.subjectId) {
      setError("Please fill all required fields and add at least one class");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Check if all classes have at least one section selected
    const allHaveSections = formData.classAssignments.every(ca => ca.sections.length > 0);
    if (!allHaveSections) {
      setError("Each class must have at least one section selected");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("=== CREATE MULTIPLE ASSIGNMENTS ===");
      console.log("Teacher ID:", formData.teacherId);
      console.log("Teacher Name:", formData.teacherName);
      console.log("Classes:", formData.classAssignments);
      console.log("Subject ID:", formData.subjectId);

      const assignmentsArray = [];

      for (const classAssignment of formData.classAssignments) {
        for (const sectionId of classAssignment.sections) {
          const assignmentData = {
            classId: classAssignment.gradeId,
            sectionId: sectionId,
            subjectId: formData.subjectId,
            isClassTeacher: formData.isClassTeacher,
            weeklyPeriods: 5,
            academicYear: "2025-2026",
            status: "ACTIVE"
          };

          if (!validatePayload(assignmentData)) {
            throw new Error("Invalid payload: " + JSON.stringify(assignmentData));
          }

          console.log(`Payload for class ${classAssignment.gradeId}, section ${sectionId}:`, assignmentData);
          assignmentsArray.push(assignmentData);
        }
      }

      console.log("\n📤 SENDING ARRAY PAYLOAD:", JSON.stringify(assignmentsArray, null, 2));
      console.log(`Total assignments to create: ${assignmentsArray.length}`);
      
      const result = await createTeacherAssignment(formData.teacherId, assignmentsArray);
      console.log("✅ All assignments created successfully");
      console.log("Results:", result);
      
      // Add assignments to local state with all details
      const newAssignments = [];
      for (const classAssignment of formData.classAssignments) {
        const className = classAssignment.gradeName;
        for (const sectionId of classAssignment.sections) {
          newAssignments.push({
            id: `${formData.teacherId}-${classAssignment.gradeId}-${sectionId}`,
            teacherId: formData.teacherId,
            teacherName: formData.teacherName,
            employeeCode: '',
            role: 'Full-time',
            department: 'General',
            classId: classAssignment.gradeId,
            className: className,
            sectionId: sectionId,
            sections: [sectionId],
            subjectId: formData.subjectId,
            subjectName: formData.subject,
            isClassTeacher: formData.isClassTeacher,
            weeklyPeriods: 5,
            academicYear: "2025-2026",
            status: "ACTIVE"
          });
        }
      }

      setCreatedAssignments(prev => [...prev, ...newAssignments]);

      setSuccessMessage(`${assignmentsArray.length} assignment${assignmentsArray.length > 1 ? 's' : ''} added successfully!`);
      
      // Keep the selected values but reset only class form for next entry
      // Teacher, isClassTeacher persist - only reset classes/subjects
      setFormData(prev => ({
        ...prev,
        classAssignments: [],
        subject: '',
        subjectId: '',
        isClassTeacher: prev.isClassTeacher
      }));
      setSections([]);
      setSubjects([]);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("=== CREATE ASSIGNMENT ERROR ===");
      console.error("Error object:", err);
      console.error("Error message:", err.message);
      
      let errorMessage = "Failed to add assignment";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAssignment = (assignment) => {
    console.log("Editing assignment:", assignment);
    setEditingAssignment(assignment);
    
    let sectionsArray = [];
    if (Array.isArray(assignment.sections)) {
      sectionsArray = assignment.sections;
    } else if (assignment.sectionId) {
      sectionsArray = [assignment.sectionId];
    }
    
    setFormData({
      teacherId: assignment.teacherId,
      teacherName: assignment.teacherName,
      classAssignments: [{
        gradeId: assignment.classId,
        gradeName: assignment.className || assignment.grade || '',
        sections: sectionsArray
      }],
      subject: assignment.subjectName || assignment.subject || '',
      subjectId: assignment.subjectId || '',
      isClassTeacher: assignment.isClassTeacher || false
    });

    if (assignment.classId) {
      fetchSections(assignment.classId);
      fetchSubjects(assignment.sectionId || sectionsArray[0]);
    }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    
    if (!editingAssignment) return;
    
    if (formData.classAssignments.length === 0 || !formData.subjectId) {
      setError("Please fill all required fields");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const classAssignment = formData.classAssignments[0];
      const sectionId = classAssignment.sections[0];

      const assignmentData = {
        classId: classAssignment.gradeId,
        sectionId: sectionId,
        subjectId: formData.subjectId,
        isClassTeacher: formData.isClassTeacher,
        weeklyPeriods: 5,
        academicYear: "2025-2026",
        status: "ACTIVE"
      };

      if (!validatePayload(assignmentData)) {
        throw new Error("Invalid payload: " + JSON.stringify(assignmentData));
      }

      console.log("=== UPDATE ASSIGNMENT ===");
      console.log("Assignment ID:", editingAssignment.id);
      console.log("Payload:", JSON.stringify(assignmentData, null, 2));
      
      const response = await updateTeacherAssignment(editingAssignment.id, assignmentData);
      console.log("✅ SUCCESS:", response);
      
      // Update in local state
      setCreatedAssignments(prev => prev.map(a => 
        a.id === editingAssignment.id 
          ? {
              ...a,
              classId: classAssignment.gradeId,
              className: classAssignment.gradeName,
              sections: [sectionId],
              sectionId: sectionId,
              subjectId: formData.subjectId,
              subjectName: formData.subject,
              isClassTeacher: formData.isClassTeacher
            }
          : a
      ));

      setSuccessMessage("Assignment updated successfully!");
      
      setFormData({
        teacherId: '',
        teacherName: '',
        classAssignments: [],
        subject: '',
        subjectId: '',
        isClassTeacher: false
      });
      setEditingAssignment(null);
      setSections([]);
      setSubjects([]);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("=== UPDATE ASSIGNMENT ERROR ===");
      console.error("Error object:", err);
      
      let errorMessage = "Failed to update assignment";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      setLoading(true);
      console.log("Deleting assignment:", assignmentId);
      
      await deleteTeacherAssignment(assignmentId);
      
      // Remove from local state
      setCreatedAssignments(prev => prev.filter(a => a.id !== assignmentId));
      
      setSuccessMessage("Assignment deleted successfully!");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting assignment:", err);
      setError("Failed to delete assignment");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
    // Reset form but keep teacher selected
    setFormData(prev => ({
      teacherId: prev.teacherId,
      teacherName: prev.teacherName,
      classAssignments: [],
      subject: '',
      subjectId: '',
      isClassTeacher: false
    }));
    setSections([]);
    setSubjects([]);
  };

  const handleCancel = () => {
    setFormData({
      teacherId: '',
      teacherName: '',
      classAssignments: [],
      subject: '',
      subjectId: '',
      isClassTeacher: false
    });
    setCreatedAssignments([]);
    setEditingAssignment(null);
    setError(null);
    setSections([]);
    setSubjects([]);
    // Clear localStorage when canceling
  //  localStorage.removeItem('classAssignmentFormData');
   // localStorage.removeItem('classAssignmentCreatedAssignments');
    navigate('/teachers'); // Navigate back to main teachers page
  };

  // ==================== RENDER HELPERS ====================

  // Filter assignments to show only those for the currently selected teacher
  const filteredAssignmentsByTeacher = formData.teacherId 
    ? createdAssignments.filter(assignment => String(assignment.teacherId) === String(formData.teacherId))
    : [];

  const filteredAssignments = filteredAssignmentsByTeacher.filter((assignment) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const sections = assignment.sections || (assignment.sectionId ? [assignment.sectionId] : []);
    return (
      (assignment.teacherName || '').toLowerCase().includes(searchLower) ||
      (assignment.className || assignment.grade || assignment.class || '').toLowerCase().includes(searchLower) ||
      (assignment.subjectName || assignment.subject || '').toLowerCase().includes(searchLower) ||
      sections.join(", ").toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, endIndex);
  //fetch call for current assignment fetch

  // Fetch current/active assignments when selected teacher changes
  useEffect(() => {
    const fetchCurrentAssignments = async (teacherId) => {
      if (!teacherId) {
        setCreatedAssignments([]);
        setActiveTeacher('');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getTeachersActiveAssignments(teacherId);

        // Normalize API response to array
        let raw = [];
        if (Array.isArray(response)) raw = response;
        else if (response?.content && Array.isArray(response.content)) raw = response.content;
        else if (response?.data && Array.isArray(response.data)) raw = response.data;

        // Map API items to UI assignment shape
        const mapped = raw.map(item => {
          const classObj = classes.find(c => String(c.id) === String(item.classId));
          const className = item.className || classObj?.name || classObj?.className || `Class ${item.classId}`;

          return {
            id: item.id || `${teacherId}-${item.classId}-${item.sectionId}`,
            teacherId: teacherId,
            teacherName: formData.teacherName || '',
            classId: item.classId,
            className,
            sectionId: item.sectionId,
            sections: item.sectionId ? [item.sectionId] : (item.sections || []),
            subjectId: item.subjectId,
            subjectName: item.subjectName || '',
            isClassTeacher: !!item.isClassTeacher,
            weeklyPeriods: item.weeklyPeriods || 0,
            academicYear: item.academicYear || '',
            status: item.status || 'ACTIVE',
            remarks: item.remarks || null
          };
        });

        setCreatedAssignments(mapped);
        setActiveTeacher(teacherId);
      } catch (e) {
        console.error('current assignment error:', e?.message || e);
        setError('Failed to fetch active assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentAssignments(formData.teacherId);
  }, [formData.teacherId, classes, formData.teacherName]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // ==================== RENDER ====================


  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Class & Subject Assignment</h1>
            <p className="text-sm text-gray-600 mt-1">Assign multiple classes & sections to Teachers with flexible subject mapping.</p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
            <span className="text-green-600 font-bold">✓</span>
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
            <span className="text-red-600 font-bold">✕</span>
            {error}
          </div>
        )}

        {/* Assignment Editor */}
        <div className="p-4 md:p-6 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              {editingAssignment ? 'Edit Assignment' : 'Assign Teacher to Classes'}
            </h2>
            {editingAssignment && (
              <button
                onClick={handleCancelEdit}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Cancel Edit
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={editingAssignment ? handleUpdateAssignment : handleAddMapping}>
            <div className="space-y-4 mb-4">
              {/* Teacher Dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  SELECT TEACHER <span className="text-red-500">*</span>
                </label>
                <select 
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  required
                  disabled={editingAssignment !== null}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select teacher...</option>
                  {teachers.map(teacher => {
                    const displayName = teacher.fullName || 
                                      `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() ||
                                      `Teacher ${teacher.id}`;
                    return (
                      <option key={teacher.id} value={teacher.id}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Class Selection Grid */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  SELECT CLASSES <span className="text-red-500">*</span>
                </label>
                <div className="bg-white border border-gray-300 rounded-lg p-4  flex flex-wrap gap-2 items-start content-start">
                  {classes.length > 0 ? (
                    classes.map(cls => {
                      const isAdded = formData.classAssignments.some(ca => String(ca.gradeId) === String(cls.id));
                      const isSelected = selectedClassDropdown === String(cls.id);
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => setSelectedClassDropdown(cls.id)}
                          disabled={isAdded}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors  ${
                            isAdded
                              ? 'bg-blue-600 text-white border border-blue-700 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-600 text-white border border-blue-700'
                              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {cls.name || cls.className}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-xs text-gray-500 py-2">Loading classes...</span>
                  )}
                </div>
               
              </div>

              {/* Class Teacher Checkbox - Button Style */}
              <div className='grid grid-cols-2 gap-4'>
                 <button
                  type="button"
                  onClick={handleAddClass}
                  disabled={!selectedClassDropdown}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add Class
                </button>
                <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => handleInputChange({
                    target: {
                      name: 'isClassTeacher',
                      type: 'checkbox',
                      checked: !formData.isClassTeacher
                    }
                  })}
                  className={`w-full px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-200 cursor-pointer ${
                    formData.isClassTeacher
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-700  hover:bg-blue-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    id="isClassTeacher"
                    name="isClassTeacher"
                    checked={formData.isClassTeacher}
                    onChange={handleInputChange}
                    className="w-4 h-4 hidden text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Is Class Teacher</span>
                </button>
              </div>
              </div>
              

              {/* Sections for Selected Classes */}
              {formData.classAssignments.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Sections for Each Class</h3>
                  <div className="space-y-4 ">
                    {formData.classAssignments.map((classAssignment) => (
                      <div key={classAssignment.gradeId} className="border border-gray-200 rounded-lg p-4  bg-gray-50 ">
                        <h4 className="font-medium text-gray-900 mb-3 ">
                          {classAssignment.gradeName}
                        </h4>

                        {/* Sections for this class */}
                        {dropdownLoading.sections ? (
                          <div className="text-xs text-gray-500">Loading sections...</div>
                        ) : (
                          <div className="flex gap-2 flex-wrap ">
                            {sections.length > 0 ? (
                              sections.map(section => (
                                <button
                                  key={section.id}
                                  type="button"
                                  onClick={() => toggleSectionForClass(classAssignment.gradeId, section.id)}
                                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                                    classAssignment.sections.includes(section.id)
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-5000 focus:outline-none focus:ring-2  focus:ring-blue-500  focus:ring-opacity-50 focus:border-blue-500 '
                                  }`}
                                >
                                  {section.name || section.sectionName}
                                </button>
                              ))
                            ) : (
                              <div className="text-xs text-gray-500">No sections available</div>
                            )}
                          </div>
                        )}
                        
                        {classAssignment.sections.length === 0 && (
                          <div className="text-xs text-red-600 mt-2">⚠ Select at least one section</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    SUBJECT <span className="text-red-500">*</span>
                  </label>
                  {dropdownLoading.subjects ? (
                    <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500">
                      Loading subjects...
                    </div>
                  ) : subjects.length > 0 ? (
                    <select 
                      name="subject"
                      value={formData.subjectId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Subject...</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name || subject.subjectName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500">
                      {formData.classAssignments.length === 0 
                        ? "Add classes first to see subjects" 
                        : "No subjects available"}
                    </div>
                  )}
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                {formData.classAssignments.length > 0 && formData.subjectId && (
                  <>
                    {formData.classAssignments.reduce((sum, ca) => sum + ca.sections.length, 0)} section{formData.classAssignments.reduce((sum, ca) => sum + ca.sections.length, 0) !== 1 ? 's' : ''} selected
                    {formData.subject && ` - Subject: ${formData.subject}`}
                  </>
                )}
              </div>
              <button 
                type="submit"
                disabled={loading || formData.classAssignments.length === 0 || !formData.subjectId}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 flex items-center gap-2 self-start sm:self-auto whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingAssignment ? (
                  <>
                    <Edit2 className="w-4 h-4" />
                    {loading ? 'Updating...' : 'Update Assignment'}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {loading ? 'Adding...' : 'Assign'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Current Mappings */}
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="font-semibold text-gray-900">
              Current Mappings{' '}
              <span className="ml-2 text-sm font-normal text-gray-600">
                {filteredAssignments.length} Total
              </span>
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search mapping..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {formData.teacherId === '' ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Select a teacher to view assignments</p>
              <p className="text-gray-400 text-sm mt-1">Choose a teacher from the form above and click "Add Assignments"</p>
            </div>
          ) : (
            <>
              {/* Teacher Details Header */}
              <div className="mb-6 p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {(formData.teacherName || 'N')
                      .split(' ')
                      .filter(n => n)
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{formData.teacherName}</h3>
                    <p className="text-sm text-gray-600 mt-1">Teacher ID: {formData.teacherId}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {formData.teacherId !== '' && filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No assignments created yet</p>
              <p className="text-gray-400 text-sm mt-1">Create assignments using the form above</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 text-xs font-medium text-gray-700 uppercase">Teacher</th>
                      <th className="pb-3 text-xs font-medium text-gray-700 uppercase">Grade</th>
                      <th className="pb-3 text-xs font-medium text-gray-700 uppercase">Sections</th>
                      <th className="pb-3 text-xs font-medium text-gray-700 uppercase">Subject</th>
                      <th className="pb-3 text-xs font-medium text-gray-700 uppercase hidden lg:table-cell">Class Teacher</th>
                      <th className="pb-3 text-xs font-medium text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentAssignments.map((assignment, idx) => {
                      const initials = (assignment.teacherName || 'NA')
                        .split(' ')
                        .filter(n => n)
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      const sections = assignment.sections || 
                                     (assignment.sectionId ? [assignment.sectionId] : []);

                      return (
                        <tr 
                          key={assignment.id || `assignment-${idx}`} 
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                                {initials}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {assignment.teacherName || 'Unknown Teacher'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 text-gray-700">
                            {assignment.className || assignment.grade || assignment.class || 'N/A'}
                          </td>

                          <td className="py-4">
                            <div className="flex flex-wrap gap-2">
                              {sections.length > 0 ? (
                                sections.map(section => (
                                  <span
                                    key={section}
                                    className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-medium"
                                  >
                                    {section}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 text-gray-700">
                            {assignment.subjectName || assignment.subject || 'N/A'}
                          </td>

                          <td className="py-4 text-gray-700 hidden lg:table-cell">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              assignment.isClassTeacher 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {assignment.isClassTeacher ? 'Yes' : 'No'}
                            </span>
                          </td>

                          <td className="py-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditAssignment(assignment)}
                                className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
                                title="Edit assignment"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                className="p-2 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                                title="Delete assignment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredAssignments.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredAssignments.length)} of {filteredAssignments.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2 px-3">
                      <span className="text-sm font-medium text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    
                    <button 
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white flex items-center gap-1 transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClassAssignment;