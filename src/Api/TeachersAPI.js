const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/v1";

// ==================== TEACHER ENDPOINTS ====================

// List All Teacher with pagination 
export const getTeachers = async (page = 0, size = 10, sort = 'id') => {
  try {
    const res = await fetch(
      `${BASE_URL}/teachers/paginated?page=${page}&size=${size}&sort=${sort}`
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch teachers");
    }

    const data = await res.json();
    return data; 
  } catch (error) {
    console.error("getTeachers error:", error.message);
    throw error;
  }
};

// Creating a Teacher
export const createTeachers = async (teacher) => {
  const res = await fetch(`${BASE_URL}/teachers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(teacher),
  });

  const text = await res.text();
  console.log("CREATE TEACHER RESPONSE:", text);

  if (!res.ok) {
    throw new Error(text || "Failed to create Teacher");
  }

  return text ? JSON.parse(text) : {};
};

// Get Teacher by Id
export const getTeacherById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/teachers/${id}`);
    if (!res.ok) throw new Error("Failed to fetch Teacher");
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("getTeachersByID error:", error.message);
    throw error;
  }
};

// Updating a Teacher
export const updateTeacher = async (id, updatedTeacher) => {
  try {
    const res = await fetch(`${BASE_URL}/teachers/${id}`, {
      method: 'PUT',
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify(updatedTeacher)
    });
    if (!res.ok) throw new Error('Failed to update Teacher');
    return res.json();
  } catch (error) {
    console.error("UpdateTeachers error:", error.message);
    throw error;
  }
};

// Search Teachers
export const searchTeachers = async (filters = {}, page, size = 10, sort = 'id') => {
  try {
    const res = await fetch(`${BASE_URL}/teachers/search/paginated?page=${page}&size=${size}&sort=${sort}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(filters)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to Search Teachers...');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('searchTeachers error:', error.message);
    throw error;
  }
};

// Get Teacher Salary
export const getTeacherSalary = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/teachers/${id}/salary-structure`, {
      headers: {
        accept: 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to get the teachers salary.');
    } 
    
    const result = await res.json();
    return result.data; 
    
  } catch (error) {
    console.error('getTeacherSalary error:', error.message);
    throw error;
  }
};

// Update Teacher Salary
export const updateSalary = async (id, updatedSalary) => {
  try {
    const res = await fetch(`${BASE_URL}/teachers/${id}/salary-structure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(updatedSalary)
    });

    if (!res.ok) {
      throw new Error('Failed to update the Teachers Salary.');
    }
    
    const data = await res.json();
    return data;

  } catch (error) {
    console.error('updateSalary error:', error.message);
    throw error;
  }
};


// activate teacher status--->
export const activateStatus=async(id)=>{
  try {
    const res=await fetch(`${BASE_URL}/teachers/${id}/activate`,{
      method:'PATCH',
      headers:{
        Accept:'application/json'
      }})
      if(!res.ok) throw new Error('Failed to Activate Teacher')
      const data=await res.json()
      return data;
  } catch (error) {
      console.error('Activate Status error:', error.message);
      throw error;
  }}

// Deactivate teacher status--->

export const deactivateStatus=async(id)=>{

  try {
    const res=await fetch(`${BASE_URL}/teachers/${id}/deactivate`,{
      method:'PATCH',
      headers:{
        Accept:'application/json'
      }})
      if(!res.ok) throw new Error('Failed to Deactivate Teacher')
      const data=await res.json()
      return data;
  } catch (error) {
      console.error('Deactivate error:', error.message);
      throw error;
  }

}

// ==================== ASSIGNMENTS API ====================

// Get Teacher Assignments
// GET /v1/teachers/{teacherId}/assignments
export const getTeacherAssignment = async (teacherId) => {
  try {
    const res = await fetch(`${BASE_URL}/teachers/${teacherId}/assignments`, {
      headers: {
        accept: 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch assignments');
    }
    
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("getTeacherAssignment error:", error.message);
    throw error;
  }
};

// Create Teacher Assignment
// POST /v1/teachers/{teacherId}/assignments
// ACCEPTS: Single object OR Array of objects
export const createTeacherAssignment = async (teacherId, assignmentData) => {
  try {
    console.log("Creating assignment with data:", assignmentData);
    
    const res = await fetch(`${BASE_URL}/teachers/${teacherId}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(assignmentData)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to create assignment');
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('createTeacherAssignment error:', error.message);
    throw error;
  }
};

// Update Teacher Assignment
// PUT /v1/teachers/assignments/{assignmentId}
export const updateTeacherAssignment = async (assignmentId, updatedAssignment) => {
  try {
    const res = await fetch(`${BASE_URL}/teachers/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(updatedAssignment)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to update assignment');
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('updateTeacherAssignment error:', error.message);
    throw error;
  }
};

// Delete Teacher Assignment
// DELETE /v1/teachers/assignments/{assignmentId}
export const deleteTeacherAssignment = async (assignmentId) => {
  try {
    const res = await fetch(`${BASE_URL}/teachers/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: {
        accept: 'application/json'
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to delete assignment');
    }

    return { success: true };
  } catch (error) {
    console.error('deleteTeacherAssignment error:', error.message);
    throw error;
  }
};

// ==================== CLASSES API ====================

// Get All Classes
// GET /v1/classes
// RESPONSE: { success, message, data: [{id, name, ...}] }
export const getClasses = async () => {
  try {
    const res = await fetch(`${BASE_URL}/classes`, {
      headers: {
        accept: 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch classes');
    }

    const data = await res.json();
    console.log("Classes API response:", data);
    
    // Handle response structure: { success, message, data: [...] }
    if (data.data && Array.isArray(data.data)) {
      console.log("Returning classes from data.data:", data.data);
      return data.data;
    } else if (Array.isArray(data)) {
      console.log("Returning classes as direct array:", data);
      return data;
    } else {
      console.warn("Unexpected classes response format:", data);
      return [];
    }
  } catch (error) {
    console.error('getClasses error:', error.message);
    throw error;
  }
};

// Get Class by ID
// GET /v1/classes/{classId}
export const getClassById = async (classId) => {
  try {
    const res = await fetch(`${BASE_URL}/classes/${classId}`, {
      headers: {
        accept: 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch class');
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('getClassById error:', error.message);
    throw error;
  }
};

// Create Class (Admin only)
// POST /v1/classes
export const createClass = async (classData) => {
  try {
    const res = await fetch(`${BASE_URL}/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(classData)
    });

    if (!res.ok) {
      throw new Error('Failed to create class');
    }
};

// Update Class
// PUT /v1/classes/{classId}
export const updateClass = async (classId, classData) => {
  try {
    const res = await fetch(`${BASE_URL}/classes/${classId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(classData)
    });

    if (!res.ok) {
      throw new Error('Failed to update class');
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('updateClass error:', error.message);
    throw error;
  }
};

// ==================== SECTIONS API ====================

// Get Sections for a Class
// GET /v1/sections/class/{classId}
// RESPONSE: { success, message, data: [{id, name, ...}] }
export const getSectionsByClass = async (classId) => {
  try {
    const res = await fetch(`${BASE_URL}/sections/class/${classId}`, {
      headers: {
        accept: 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch sections');
    }

    const data = await res.json();
    console.log("Sections API response:", data);
    
    // Handle response structure: { success, message, data: [...] }
    if (data.data && Array.isArray(data.data)) {
      console.log("Returning sections from data.data:", data.data);
      return data.data;
    } else if (Array.isArray(data)) {
      console.log("Returning sections as direct array:", data);
      return data;
    } else {
      console.warn("Unexpected sections response format:", data);
      return [];
    }
  } catch (error) {
    console.error('getSectionsByClass error:', error.message);
    throw error;
  }
};

// Get Section by ID
// GET /v1/sections/{sectionId}
export const getSectionById = async (sectionId) => {
  try {
    const res = await fetch(`${BASE_URL}/sections/${sectionId}`, {
      headers: {
        accept: 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch section');
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('getSectionById error:', error.message);
    throw error;
  }
};

// Create Section
// POST /v1/sections
export const createSection = async (sectionData) => {
  try {
    const res = await fetch(`${BASE_URL}/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(sectionData)
    });

    if (!res.ok) {
      throw new Error('Failed to create section');
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('createSection error:', error.message);
    throw error;
  }
};

// Update Section
// PUT /v1/sections/{sectionId}
export const updateSection = async (sectionId, sectionData) => {
  try {
    const res = await fetch(`${BASE_URL}/sections/${sectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(sectionData)
    });

    if (!res.ok) {
      throw new Error('Failed to update section');
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('updateSection error:', error.message);
    throw error;
  }
};

// ==================== SUBJECTS API ====================

// Get Subjects for a Section
// GET /v1/section-subjects/section/{sectionId}
// RESPONSE: { success, message, data: [{id, name, ...}] }
export const getSubjectsBySection = async (sectionId) => {
  try {
    const res = await fetch(`${BASE_URL}/section-subjects/section/${sectionId}`, {
      headers: { accept: 'application/json' }
    });

    if (!res.ok) throw new Error('Failed to fetch subjects');

    const data = await res.json();
    console.log("🔍 API Response:", data);
    
    if (data && data.data && Array.isArray(data.data)) {
      // Transform API response: change subjectId→id, subjectName→name
      const subjects = data.data.map(mapping => ({
        id: mapping.subjectId,        // ← Change subjectId to id
        name: mapping.subjectName,    // ← Change subjectName to name
        code: mapping.subjectCode
      }));
      
      console.log("✅ Subjects extracted:", subjects);
      return subjects;
    }
    
    return [];
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};

// Get All Subjects
// GET /v1/subjects
export const getAllSubjects = async () => {
  try {
    const res = await fetch(`${BASE_URL}/subjects`, {
      headers: {
        accept: 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch subjects');
    }

    const data = await res.json();
    console.log("All subjects API response:", data);
    
    // Handle response structure
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.warn("Unexpected all subjects response format:", data);
      return [];
    }
  } catch (error) {
    console.error('getAllSubjects error:', error.message);
    throw error;
  }
};

// Get Subject by ID
// GET /v1/subjects/{subjectId}
export const getSubjectById = async (subjectId) => {
  try {
    const res = await fetch(`${BASE_URL}/subjects/${subjectId}`, {
      headers: {
        accept: 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch subject');
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('getSubjectById error:', error.message);
    throw error;
  }
};

// Create Subject
// POST /v1/subjects
export const createSubject = async (subjectData) => {
  try {
    const res = await fetch(`${BASE_URL}/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(subjectData)
    });

    if (!res.ok) {
      throw new Error('Failed to create subject');
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('createSubject error:', error.message);
    throw error;
  }
};

// Update Subject
// PUT /v1/subjects/{subjectId}
export const updateSubject = async (subjectId, subjectData) => {
  try {
    const res = await fetch(`${BASE_URL}/subjects/${subjectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(subjectData)
    });

    if (!res.ok) {
      throw new Error('Failed to update subject');
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('updateSubject error:', error.message);
    throw error;
  }
};