import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Edit2, Plus, Trash2, ChevronLeft, ChevronRight, X, BookOpen, User } from 'lucide-react';
import {
  createTeacherAssignment,
  updateTeacherAssignment,
  deleteTeacherAssignment,
  getClasses,
  getSectionsByClass,
  getSubjectsBySection,
  getTeachersActiveAssignments,
  getTeacherById
} from "../../Api/TeachersAPI";
import { useParams, useNavigate } from 'react-router-dom';

function ClassAssignment() {
  const navigate = useNavigate();

  const [createdAssignments, setCreatedAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  // { [classId-sectionId]: Subject[] } — subjects fetched per section with composite key
  const [sectionSubjectsMap, setSectionSubjectsMap] = useState({});
  // { [classId-sectionId]: { subjectId, subjectName } } — user's subject selection per section with composite key
  const [sectionSubjectSelections, setSectionSubjectSelections] = useState({});
  const [dropdownLoading, setDropdownLoading] = useState({
    classes: false,
    sections: false,
    subjectsBySectionId: {}// per-section loading flags
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [formData, setFormData] = useState({
    teacherId: '',
    teacherName: '',
    classAssignments: [],
    isClassTeacher: false,
    empCode: '',
    currStatus: '',
    dessignation: ''
  });

  const [selectedClassDropdown, setSelectedClassDropdown] = useState('');
  const { teacherId } = useParams();

  // Debounce ref for section toggles
  const sectionToggleTimeoutRef = useRef({});

  // ==================== DERIVED STATE ====================
  const allSelectedSectionIds = formData.classAssignments.flatMap(ca => ca.sections);

  // Preview list: only sections that have a subject assigned (using composite key)
  const sectionSubjectMappings = formData.classAssignments.flatMap(ca =>
    ca.sections
      .map(sid => {
        const uniqueKey = `${ca.gradeId}-${sid}`;
        if (!sectionSubjectSelections[uniqueKey]?.subjectId) return null;

        const section = sections.find(s => String(s.id) === String(sid));
        return {
          sectionId: sid,
          classId: ca.gradeId,
          uniqueKey,
          sectionName: section?.name || section?.sectionName || `Section ${sid}`,
          gradeName: ca.gradeName || '',
          subjectId: sectionSubjectSelections[uniqueKey].subjectId,
          subjectName: sectionSubjectSelections[uniqueKey].subjectName
        };
      })
      .filter(Boolean)
  );

  // ==================== LIFECYCLE ====================

  useEffect(() => {
    if (teacherId) {
      const fetchTeacherDetails = async () => {
        try {
          const teacher = await getTeacherById(teacherId);
          setFormData(prev => ({ ...prev, teacherId, teacherName: teacher.fullName, empCode: teacher.employeeCode, currStatus: teacher.status, dessignation: teacher.designation }));
        } catch (err) {
          console.error('Error fetching teacher details:', err);
          setError('Failed to fetch teacher details');
          setTimeout(() => setError(null), 1000);
        }
      };
      fetchTeacherDetails();
    }
  }, [teacherId]);

  useEffect(() => {
    fetchClasses();
    const savedAssignments = localStorage.getItem('classAssignmentSavedAssignments');
    if (savedAssignments) {
      try { setCreatedAssignments(JSON.parse(savedAssignments)); }
      catch (err) { console.error('Error parsing saved assignments:', err); }
    }
  }, []);

  //for update current assignments of teacher
  const fetchActiveAssignments = async (tid) => {
    if (!tid) return;
    try {
      setLoading(true);
      const res = await getTeachersActiveAssignments(tid);

      const raw = Array.isArray(res) ? res : (res?.content || res?.data || []);

      const mapped = raw.map(item => ({
        id: item.id,
        teacherId: tid,
        classId: item.classId,
        className: item.className,
        sectionId: item.sectionId,
        sections: [{ id: item.sectionId, name: item.sectionName }],
        subjectId: item.subjectId,
        subjectName: item.subjectName,
        isClassTeacher: !!item.isClassTeacher
      }));

      setCreatedAssignments(mapped);

    } catch (e) {
      setError("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.teacherId) {
      fetchActiveAssignments(formData.teacherId);
    }
  }, [formData.teacherId]);

  // Keep sectionSubjectsMap + sectionSubjectSelections in sync with selected sections
  useEffect(() => {
    if (formData.classAssignments.length === 0) {
      setSectionSubjectsMap({});
      setSectionSubjectSelections({});
      return;
    }

    // Fetch subjects for newly added sections
    formData.classAssignments.forEach(ca => {
      ca.sections.forEach(sid => {
        const uniqueKey = `${ca.gradeId}-${sid}`;
        if (!sectionSubjectsMap[uniqueKey]) {
          fetchSubjectsForSection(ca.gradeId, sid);
        }
      });
    });

    // Prune removed sections
    const currentKeys = new Set();
    formData.classAssignments.forEach(ca => {
      ca.sections.forEach(sid => {
        currentKeys.add(`${ca.gradeId}-${sid}`);
      });
    });

    setSectionSubjectsMap(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (!currentKeys.has(key)) {
          delete updated[key];
        }
      });
      return updated;
    });

    setSectionSubjectSelections(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (!currentKeys.has(key)) {
          delete updated[key];
        }
      });
      return updated;
    });
  }, [formData.classAssignments]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // Cleanup debounce timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(sectionToggleTimeoutRef.current).forEach(timeoutId => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
  }, []);

  // ==================== FETCH FUNCTIONS ====================

  const fetchClasses = async () => {
    try {
      setDropdownLoading(prev => ({ ...prev, classes: true }));
      setClasses(await getClasses());
    } catch (err) {
      setError("Failed to fetch classes");
      setTimeout(() => setError(null), 1000);
    } finally {
      setDropdownLoading(prev => ({ ...prev, classes: false }));
    }
  };

  const fetchSections = async (classId) => {
    try {
      setDropdownLoading(prev => ({ ...prev, sections: true }));
      setSections(await getSectionsByClass(classId));
    } catch (err) {
      setError("Failed to fetch sections");
      setTimeout(() => setError(null), 1000);
    } finally {
      setDropdownLoading(prev => ({ ...prev, sections: false }));
    }
  };

  const fetchSubjectsForSection = useCallback(async (classId, sectionId) => {
    const uniqueKey = `${classId}-${sectionId}`;
    try {
      setDropdownLoading(prev => ({
        ...prev,
        subjectsBySectionId: { ...prev.subjectsBySectionId, [uniqueKey]: true }
      }));
      const list = await getSubjectsBySection(sectionId);
      setSectionSubjectsMap(prev => ({ ...prev, [uniqueKey]: list }));
    } catch (err) {
      setError(`Failed to fetch subjects for section ${sectionId}`);
      setTimeout(() => setError(null), 1000);
    } finally {
      setDropdownLoading(prev => ({
        ...prev,
        subjectsBySectionId: { ...prev.subjectsBySectionId, [uniqueKey]: false }
      }));
    }
  }, []);

  // ==================== FORM HANDLERS ====================
  const handleSectionSubjectChange = (classId, sectionId, subjectId) => {
    const uniqueKey = `${classId}-${sectionId}`;
    const subject = (sectionSubjectsMap[uniqueKey] || []).find(s => String(s.id) === String(subjectId));
    setSectionSubjectSelections(prev => ({
      ...prev,
      [uniqueKey]: subjectId
        ? { subjectId: subject?.id || subjectId, subjectName: subject?.name || subject?.subjectName || '' }
        : undefined
    }));
  };

  //for loader for add class 
  const [addingClass, setAddingClass] = useState(false);
  const handleAddClass = async () => {
    if (!selectedClassDropdown) return;
    try {
      setAddingClass(true);   // start loader
      await fetchSections(selectedClassDropdown);
      const selectedClass = classes.find(
        c => String(c.id) === String(selectedClassDropdown)
      );
      setFormData(prev => ({
        ...prev,
        classAssignments: [
          ...prev.classAssignments,
          {
            gradeId: selectedClassDropdown,
            gradeName: selectedClass?.name || '',
            sections: []
          }
        ]
      }));
      setSelectedClassDropdown('');
    } finally {
      setAddingClass(false);  // stop loader
    }
  };
  const handleRemoveClass = (gradeId) => {
    const ca = formData.classAssignments.find(c => c.gradeId === gradeId);
    if (ca) {
      // Clear any pending debounce timeouts for sections in this class
      ca.sections.forEach(sid => {
        const uniqueKey = `${gradeId}-${sid}`;
        if (sectionToggleTimeoutRef.current[uniqueKey]) {
          clearTimeout(sectionToggleTimeoutRef.current[uniqueKey]);
          delete sectionToggleTimeoutRef.current[uniqueKey];
        }
      });

      // Remove all composite keys for this class
      setSectionSubjectsMap(prev => {
        const u = { ...prev };
        ca.sections.forEach(sid => {
          const uniqueKey = `${gradeId}-${sid}`;
          delete u[uniqueKey];
        });
        return u;
      });
      setSectionSubjectSelections(prev => {
        const u = { ...prev };
        ca.sections.forEach(sid => {
          const uniqueKey = `${gradeId}-${sid}`;
          delete u[uniqueKey];
        });
        return u;
      });
    }
    setFormData(prev => ({ ...prev, classAssignments: prev.classAssignments.filter(c => c.gradeId !== gradeId) }));
  };

  const toggleSectionForClass = (gradeId, sectionId) => {
    const uniqueKey = `${gradeId}-${sectionId}`;

    // Clear any existing timeout for this section
    if (sectionToggleTimeoutRef.current[uniqueKey]) {
      clearTimeout(sectionToggleTimeoutRef.current[uniqueKey]);
    }

    // Set new debounced timeout (300ms delay)
    sectionToggleTimeoutRef.current[uniqueKey] = setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        classAssignments: prev.classAssignments.map(ca => {
          if (ca.gradeId !== gradeId) return ca;
          const isSelected = ca.sections.includes(sectionId);
          if (isSelected) {
            // Clear its subject selection on deselect using composite key
            setSectionSubjectSelections(sel => {
              const u = { ...sel };
              delete u[uniqueKey];
              return u;
            });
          }
          return {
            ...ca,
            sections: isSelected ? ca.sections.filter(s => s !== sectionId) : [...ca.sections, sectionId]
          };
        })
      }));

      // Clean up the timeout reference
      delete sectionToggleTimeoutRef.current[uniqueKey];
    }, 1000); // 300ms debounce delay
  };

  const validatePayload = (d) => {
    const errs = [];
    if (!d.classId || d.classId === 0) errs.push("classId missing");
    if (!d.sectionId || d.sectionId === 0) errs.push("sectionId missing");
    if (!d.subjectId || d.subjectId === 0) errs.push("subjectId missing");
    if (typeof d.isClassTeacher !== 'boolean') errs.push("isClassTeacher must be boolean");
    if (!d.weeklyPeriods || d.weeklyPeriods < 0) errs.push("weeklyPeriods invalid");
    if (!d.academicYear) errs.push("academicYear missing");
    if (!d.status) errs.push("status missing");
    if (errs.length) { console.warn("Validation errors:", errs); return false; }
    return true;
  };

  // ==================== CRUD ====================

  const handleAddMapping = async (e) => {
    e.preventDefault();

    if (!formData.teacherId) {
      setError("Teacher missing");
      return;
    }

    const assignmentsArray = [];

    formData.classAssignments.forEach(ca => {
      ca.sections.forEach(sectionId => {
        const uniqueKey = `${ca.gradeId}-${sectionId}`;
        const subject = sectionSubjectSelections[uniqueKey];

        if (subject?.subjectId) {
          assignmentsArray.push({
            classId: Number(ca.gradeId),
            sectionId: Number(sectionId),
            subjectId: Number(subject.subjectId),
            isClassTeacher: formData.isClassTeacher,
            weeklyPeriods: 5,
            academicYear: "2025-2026",
            status: "ACTIVE"
          });
        }
      });
    });

    if (assignmentsArray.length === 0) {
      setError("Please select subjects");
      return;
    }
    let resT;
    try {
      setLoading(true);
      resT = await createTeacherAssignment(formData.teacherId, assignmentsArray);
      await fetchActiveAssignments(formData.teacherId);
      setSuccessMessage(resT.message || "Assignment created successfully");
      resetForm();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    const sectionsArray = Array.isArray(assignment.sections)
      ? assignment.sections.map(s => typeof s === 'object' ? s.id : s)
      : assignment.sectionId ? [assignment.sectionId] : [];
    setFormData({
      teacherId: assignment.teacherId,
      teacherName: assignment.teacherName,
      classAssignments: [{
        gradeId: assignment.classId,
        gradeName: assignment.className || '',
        sections: sectionsArray
      }],
      isClassTeacher: assignment.isClassTeacher || false
    });
    if (assignment.classId) fetchSections(assignment.classId);
    setSectionSubjectsMap({});
    const preFilledSelections = {};
    sectionsArray.forEach(sid => {
      const uniqueKey = `${assignment.classId}-${sid}`;
      preFilledSelections[uniqueKey] = {
        subjectId: assignment.subjectId || '',
        subjectName: assignment.subjectName || ''
      };
      fetchSubjectsForSection(assignment.classId, sid);
    });
    setSectionSubjectSelections(preFilledSelections);
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    if (!editingAssignment || formData.classAssignments.length === 0) return;
    const ca = formData.classAssignments[0];
    if (!ca.sections?.length) {
      setError("Please select at least one section");
      setTimeout(() => setError(null), 1000);
      return;
    }
    const sectionId = ca.sections[0];
    const uniqueKey = `${ca.gradeId}-${sectionId}`;
    const sel = sectionSubjectSelections[uniqueKey];
    if (!sel?.subjectId) {
      setError("Please select a subject for the section");
      setTimeout(() => setError(null), 1000);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const payload = {
        classId: ca.gradeId,
        sectionId,
        subjectId: sel.subjectId,
        isClassTeacher: formData.isClassTeacher,
        weeklyPeriods: 5,
        academicYear: "2025-2026",
        status: "ACTIVE"
      };
      if (!validatePayload(payload)) throw new Error("Invalid payload: " + JSON.stringify(payload));
      await updateTeacherAssignment(editingAssignment.id, payload);
      const secObj = sections.find(s => String(s.id) === String(sectionId));
      setCreatedAssignments(prev => prev.map(a => a.id !== editingAssignment.id ? a : {
        ...a,
        classId: ca.gradeId,
        className: ca.gradeName,
        sections: [{ id: sectionId, name: secObj?.name || secObj?.sectionName || String(sectionId) }],
        sectionId,
        subjectId: sel.subjectId,
        subjectName: sel.subjectName,
        isClassTeacher: formData.isClassTeacher
      }));
      setSuccessMessage("Assignment updated successfully!");
      setEditingAssignment(null);
      resetForm();
      setTimeout(() => setSuccessMessage(""), 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update assignment");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      setLoading(true);
      await deleteTeacherAssignment(assignmentId);
      setCreatedAssignments(prev => prev.filter(a => a.id !== assignmentId));
      setSuccessMessage("Assignment deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 1000);
    } catch (err) {
      setError("Failed to delete assignment");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (keepTeacher = true) => {
    // Clear all pending debounce timeouts
    Object.values(sectionToggleTimeoutRef.current).forEach(timeoutId => {
      if (timeoutId) clearTimeout(timeoutId);
    });
    sectionToggleTimeoutRef.current = {};

    setFormData(prev => ({
      teacherId: keepTeacher ? prev.teacherId : '',
      teacherName: keepTeacher ? prev.teacherName : '',
      classAssignments: [],
      isClassTeacher: false
    }));
    setSections([]);
    setSectionSubjectsMap({});
    setSectionSubjectSelections({});
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
    resetForm();
  };

  const handleCancel = () => {
    setCreatedAssignments([]);
    setEditingAssignment(null);
    setError(null);
    resetForm(false);
    navigate('/teachers');
  };

  // ==================== RENDER HELPERS ====================

  const filteredAssignments = (formData.teacherId
    ? createdAssignments.filter(a => String(a.teacherId) === String(formData.teacherId))
    : []
  ).filter(a => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    const secNames = (a.sections || []).map(s => typeof s === 'object' ? s.name || String(s.id) : String(s));
    return (a.teacherName || '').toLowerCase().includes(q)
      || (a.className || '').toLowerCase().includes(q)
      || (a.subjectName || '').toLowerCase().includes(q)
      || secNames.join(' ').toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const fetch = async (tid) => {
      if (!tid) {
        setCreatedAssignments([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await getTeachersActiveAssignments(tid);
        let raw = Array.isArray(res) ? res : (res?.content || res?.data || []);
        const mapped = raw.map(item => {
          const classObj = classes.find(c => String(c.id) === String(item.classId));
          return {
            id: item.id || `${tid}-${item.classId}-${item.sectionId}`,
            teacherId: tid,
            teacherName: formData.teacherName || '',
            classId: item.classId,
            className: item.className || `NA`,
            sectionId: item.sectionId,
            sections: [{ id: item.sectionId, name: item.sectionName }],
            subjectId: item.subjectId,
            subjectName: item.subjectName ?? 'N/A',
            isClassTeacher: !!item.isClassTeacher,
            weeklyPeriods: item.weeklyPeriods || 0,
            academicYear: item.academicYear || '',
            status: item.status || 'ACTIVE',
            remarks: item.remarks || null
          };
        });
        setCreatedAssignments(mapped);
      } catch (e) {
        setError('Failed to fetch active assignments');
      } finally {
        setLoading(false);
      }
    };
    fetch(formData.teacherId);
  }, [formData.teacherId, classes, formData.teacherName]);

  const getInitials = (name) =>
    (name || 'N').trim().split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="border-b border-gray-200 p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Class & Subject Assignment</h1>
            <p className="text-sm text-gray-500 mt-1">Assign multiple classes & sections with per-section subject mapping.</p>
          </div>
          <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors self-start sm:self-auto">
            Cancel
          </button>
        </div>

        {/* Assignment Editor */}
        <div className="p-4 md:p-6 bg-slate-50 border-b border-gray-200">
          {/* Heading + styled teacher name */}
          <div className="flex items-start justify-between mb-5">
            {formData.teacherName && (
              <div className="flex items-center justify-between w-full gap-2.5 bg-white border rounded-xl p-4 shadow-sm border-gray-200">
                <div className="min-w-50 flex items-center gap-2">
                  {/* Avatar */}
                  <span className="w-14 h-14 rounded-full bg-linear-to-br from-blue-800 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                    {getInitials(formData.teacherName)}
                  </span>

                  <div className="flex flex-col leading-tight">
                    <span className="text-lg font-medium text-gray-800">{formData.teacherName}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      {formData.dessignation || "teacher"}
                      {formData.empCode && (
                      <span className="text-[10px] text-blue-800 bg-blue-200 ml-2 px-1 rounded">{formData.empCode}</span>
                    )}
                    </span>
                  </div>
                </div>

                {/* Status Label */}
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${formData.currStatus === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}
                >
                  {formData.currStatus || 'status'}
                </div>
              </div>
            )}



            {editingAssignment && (
              <button onClick={handleCancelEdit} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mt-1">
                <X className="w-4 h-4" /> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={editingAssignment ? handleUpdateAssignment : handleAddMapping}>
            <div className="space-y-4 mb-4">

              {/* Class selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Select Classes <span className="text-red-500">*</span>
                </label>
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-2 min-h-14 shadow-sm">
                  {classes.length > 0 ? classes.map(cls => {
                    const isAdded = formData.classAssignments.some(ca => String(ca.gradeId) === String(cls.id));
                    const isSelected = selectedClassDropdown === String(cls.id);
                    return (
                      <button key={cls.id} type="button" onClick={() => setSelectedClassDropdown(String(cls.id))} disabled={isAdded}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${isAdded ? 'bg-blue-600 text-white opacity-60 cursor-not-allowed' : isSelected ? 'bg-blue-50 text-blue-700 border-2 border-blue-400 ring-2 ring-blue-100' : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}>
                        {cls.name || cls.className}
                      </button>
                    );
                  }) : (
                    <span className="text-xs text-gray-400 self-center">
                      {dropdownLoading.classes ? 'Loading classes…' : 'No classes available'}
                    </span>
                  )}
                </div>
              </div>

              {/* Add Class + Is Class Teacher */}
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={handleAddClass} disabled={!selectedClassDropdown || addingClass}
                  className="flex items-center justify-center w-full px-4 py-2.5 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus className="w-4 h-4" /> {addingClass ? "Adding..." : "Add Class"}
                </button>
                <div className="items-center flex justify-items-center justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        isClassTeacher: !prev.isClassTeacher,
                      }))
                    }
                    className={`relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-10 flex items-center rounded-lg transition-colors duration-300 ${formData.isClassTeacher ? "bg-blue-500" : "bg-gray-300"}`}
                  >
                    {/* Text inside toggle */}
                    <span className="text-xs sm:text-sm md:text-base lg:text-lg text-center w-full font-medium text-white px-4">
                      Set as Class Teacher
                    </span>

                    {/* Toggle Circle */}
                    <span className={`absolute top-1 left-1 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-xs font-bold`}>
                      {formData.isClassTeacher && (
                        <span className="text-blue-600 text-sm">✓</span>
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* Per-class section rows + per-section subject dropdowns */}
              {formData.classAssignments.length > 0 && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="text-sm font-bold text-gray-800">Select Sections &amp; Assign Subjects</h3>

                  {formData.classAssignments.map(ca => (
                    <div key={ca.gradeId} className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">

                      {/* Class header bar */}
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <span className="text-sm font-bold text-gray-800">{ca.gradeName}</span>
                        <button type="button" onClick={() => handleRemoveClass(ca.gradeId)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Section toggle buttons */}
                        {dropdownLoading.sections ? (
                          <p className="text-xs text-gray-400">Loading sections…</p>
                        ) : sections.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {sections.map(section => {
                              const sid = section.id;
                              const isSelected = ca.sections.includes(sid);
                              return (
                                <button
                                  key={sid}
                                  type="button"
                                  onClick={() => toggleSectionForClass(ca.gradeId, sid)}
                                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${isSelected
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                                    }`}
                                >
                                  {section.name || section.sectionName}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400">No sections available</p>
                        )}

                        {ca.sections.length === 0 && (
                          <p className="text-xs text-amber-600">⚠ Select at least one section</p>
                        )}

                        {/* Per-section subject dropdown — one row per selected section */}
                        {ca.sections.length > 0 && (
                          <div className="space-y-2">
                            {ca.sections.map(sid => {
                              const uniqueKey = `${ca.gradeId}-${sid}`;
                              const section = sections.find(s => String(s.id) === String(sid));
                              const sectionLabel = section?.name || section?.sectionName || `Section ${sid}`;
                              const subjectsList = sectionSubjectsMap[uniqueKey] || [];
                              const isLoadingSubjects = !!dropdownLoading.subjectsBySectionId?.[uniqueKey];
                              const currentVal = sectionSubjectSelections[uniqueKey]?.subjectId || '';
                              return (
                                <div key={uniqueKey}
                                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${sectionSubjectSelections[uniqueKey]?.subjectId
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-blue-50 border-blue-200'
                                    }`}>
                                  {/* Section badge */}
                                  <span className="min-w-8 w-auto max-w-max px-1 h-8 shrink-0 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                    {sectionLabel}
                                  </span>

                                  {/* Subject select or locked message */}
                                  <div className="flex-1 min-w-0">
                                    {isLoadingSubjects ? (
                                      <p className="text-xs text-gray-400">Loading subjects…</p>
                                    ) : (
                                      <select
                                        value={currentVal}
                                        onChange={e => handleSectionSubjectChange(ca.gradeId, sid, e.target.value)}
                                        disabled={subjectsList.length === 0}
                                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                      >
                                        {subjectsList.length === 0 ? (
                                          <option value="">No subjects available</option>
                                        ) : (
                                          <>
                                            <option value="">Select Subject…</option>
                                            {subjectsList.map(subj => (
                                              <option key={subj.id} value={subj.id}>
                                                {subj.name || subj.subjectName}
                                              </option>
                                            ))}
                                          </>
                                        )}
                                      </select>

                                    )}
                                  </div>

                                  {/* Green tick when done */}
                                  {sectionSubjectSelections[uniqueKey]?.subjectId && (
                                    <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Quick Reference: Assignment Preview ── */}
              {sectionSubjectMappings.length > 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 border-b border-blue-200">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Assignment Preview</span>
                    <span className="ml-auto text-xs text-blue-500 font-medium">
                      {sectionSubjectMappings.length} mapping{sectionSubjectMappings.length > 1 ? 's' : ''} ready
                    </span>
                  </div>
                  <div className="divide-y divide-blue-100">
                    {sectionSubjectMappings.map(m => (
                      <div key={m.uniqueKey} className="flex items-center gap-3 px-4 py-3">
                        {/* Section badge */}
                        <span className="min-w-8 w-auto max-w-max px-1 h-8 shrink-0 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          {m.sectionName}
                        </span>
                        <div className="flex flex-col leading-tight min-w-20">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Grade</span>
                          <span className="text-xs font-semibold text-gray-700">{m.gradeName}</span>
                        </div>
                        {/* Arrow */}
                        <span className="text-gray-300 font-light text-lg shrink-0">→</span>
                        {/* Subject */}
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <BookOpen className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="text-sm font-bold text-blue-900 truncate">{m.subjectName}</span>
                        </div>
                        {/* Clear subject button */}
                        <button type="button"
                          onClick={() => handleSectionSubjectChange(m.classId, m.sectionId, '')}
                          className="shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                          title="Clear subject for this section">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Banners */}
            {successMessage && (
              <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
                <span className="font-bold text-green-600">✓</span>{successMessage}
              </div>
            )}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
                <span className="font-bold text-red-600">✕</span>{error}
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {sectionSubjectMappings.length > 0
                  ? `${sectionSubjectMappings.length} section${sectionSubjectMappings.length > 1 ? 's' : ''} ready to assign`
                  : 'Select sections and assign subjects above'}
              </p>
              <button
                type="submit"
                disabled={
                  loading ||
                  formData.classAssignments.length === 0 ||
                  sectionSubjectMappings.length === 0
                }
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors ${loading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
              >

                {editingAssignment
                  ? <><Edit2 className="w-4 h-4" />{loading ? 'Updating …' : 'Update Assignment'}</>
                  : <><Plus className="w-4 h-4" />{loading ? 'Assigning' : 'Assign'}</>
                }
              </button>
            </div>
          </form>
        </div>

        {/* Current Mappings Table */}
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="font-bold text-gray-900">
              Current Mappings
              <span className="ml-2 text-sm font-normal text-gray-400">{filteredAssignments.length} Total</span>
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search mapping..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64" />
            </div>
          </div>

          {formData.teacherId !== '' && filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No assignments yet</p>
              <p className="text-gray-400 text-sm mt-1">Create assignments using the form above</p>
            </div>
          ) : formData.teacherId !== '' ? (
            <>
              <div className="overflow-auto shadow shadow-gray-300 p-8 rounded-xl">
                <table className="w-full text-sm">
                  <thead className='px-3'>
                    <tr className="border-b border-gray-200 text-left">
                      {['Grade', 'Section', 'Subject', 'Class Teacher', 'Actions'].map((h, i) => (
                        <th key={h} className={`pb-3 text-xs font-semibold text-gray-500 uppercase ${i === 4 ? 'hidden lg:table-cell' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentAssignments.map((a, idx) => {
                      const secList = a.sections || (a.sectionId ? [{ id: a.sectionId, name: null }] : []);
                      return (
                        <tr key={a.id || `a-${idx}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 text-gray-700">{a.className || 'N/A'}</td>
                          <td className="py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {secList.map(s => {
                                const sId = typeof s === 'object' ? s.id : s;
                                const sName = typeof s === 'object' ? s.name : null;
                                return (
                                  <span key={sId} className="min-w-8 w-auto max-w-max px-1 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                    {sName || sId}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-4 text-gray-700">{a.subjectName || 'N/A'}</td>
                          <td className="py-4 hidden lg:table-cell">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${a.isClassTeacher ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                              {a.isClassTeacher ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex gap-1">
                              <button onClick={() => handleEditAssignment(a)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteAssignment(a.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredAssignments.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredAssignments.length)} of {filteredAssignments.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <span className="text-sm font-medium text-gray-700 px-2">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
export default ClassAssignment;