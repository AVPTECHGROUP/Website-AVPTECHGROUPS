import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_DOUBLE_V1;

// Get All Exams (with optional filters)
export const getExams = async (filters = {}) => {
  try {
    const query = new URLSearchParams(filters).toString();

    const res = await authFetch(`${BASE_URL}/exams${query ? `?${query}` : ""}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch exams");

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getExams error: ${error.message}`);
    throw error;
  }
};

// Create Exam
export const createExam = async (examData) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams`, {
      method: "POST",
      body: JSON.stringify(examData),
    });

    if (!res.ok) throw new Error(`Failed to create exam`);

    return await res.json();
  } catch (error) {
    console.error(`createExam error: ${error.message}`);
    throw error;
  }
};

/* =========================
   EXAM TYPES
========================= */

// Get All Grade Configs
export const getGradeConfigs = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/grade-configs`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch grade configs");

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getGradeConfigs error: ${error.message}`);
    throw error;
  }
};

// Create Grade Config
export const createGradeConfig = async (gradeData) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/grade-configs`, {
      method: "POST",
      body: JSON.stringify(gradeData),
    });

    if (!res.ok) throw new Error("Failed to create grade config");

    return await res.json();
  } catch (error) {
    console.error(`createGradeConfig error: ${error.message}`);
    throw error;
  }
};

// Update Grade Config
export const updateGradeConfig = async (id, gradeData) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/grade-configs/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(gradeData),
      }
    );

    if (!res.ok) throw new Error(`Failed to update grade config with id: ${id}`);

    return await res.json();
  } catch (error) {
    console.error(`updateGradeConfig error: ${error.message}`);
    throw error;
  }
};

// Delete Grade Config (Soft Delete)
export const deleteGradeConfig = async (id) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/grade-configs/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) throw new Error(`Failed to delete grade config with id: ${id}`);

    return await res.json();
  } catch (error) {
    console.error(`deleteGradeConfig error: ${error.message}`);
    throw error;
  }
};

/* =========================
   EXAM SUBJECT CONFIG
========================= */

// Get Subjects for an Exam
export const getExamSubjects = async (examId, sectionId = null) => {
  try {
    const query = sectionId ? `?sectionId=${sectionId}` : "";

    const res = await authFetch(`${BASE_URL}/exams/${examId}/subjects${query}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error(`Failed to fetch subjects for examId: ${examId}`);

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getExamSubjects error: ${error.message}`);
    throw error;
  }
};

// Declare Exam Result (LOCKS marks permanently )
export const declareExamResult = async (examId) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/declare-result`,
      {
        method: "PATCH",
      }
    );

    if (!res.ok)
      throw new Error(`Failed to declare result for examId: ${examId}`);

    return await res.json();
  } catch (error) {
    console.error(`declareExamResult error: ${error.message}`);
    throw error;
  }
};

// Add Subject to Exam
export const addExamSubject = async (examId, subjectData) => {
  try {
    const res = await authFetch(`${BASE_URL.replace('/api/api', '/api')}/exams/${examId}/subjects`, {
      method: "POST",
      body: JSON.stringify(subjectData),
    });

    if (!res.ok) throw new Error(`Failed to add subject to examId: ${examId}`);

    return await res.json();
  } catch (error) {
    console.error(`addExamSubject error: ${error.message}`);
    throw error;
  }
};

// Update Subject Config
export const updateExamSubject = async (examId, configId, subjectData) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/subjects/${configId}`,
      {
        method: "PUT",
        body: JSON.stringify(subjectData),
      }
    );

    if (!res.ok) throw new Error(`Failed to update subject configId: ${configId}`);

    return await res.json();
  } catch (error) {
    console.error(`updateExamSubject error: ${error.message}`);
    throw error;
  }
};

// Delete Subject Config
export const deleteExamSubject = async (examId, configId) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/subjects/${configId}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) throw new Error(`Failed to delete subject configId: ${configId}`);

    return await res.json();
  } catch (error) {
    console.error(`deleteExamSubject error: ${error.message}`);
    throw error;
  }
};

/* =========================
   MARKS SHEET
========================= */

// Get Marks Sheet (All students for a subject)
export const getMarksSheet = async (examId, sectionSubjectId) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/marks/sheet/${sectionSubjectId}`,
      {
        method: "GET",
      }
    );

    if (!res.ok)
      throw new Error(
        `Failed to fetch marks sheet for examId: ${examId}, sectionSubjectId: ${sectionSubjectId}`
      );

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getMarksSheet error: ${error.message}`);
    throw error;
  }
};

/* =========================
   SINGLE MARK ENTRY
========================= */

// Enter Marks (Single Student)
export const enterMarks = async (examId, marksData) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/${examId}/marks`, {
      method: "POST",
      body: JSON.stringify(marksData),
    });

    if (!res.ok) throw new Error(`Failed to enter marks`);

    return await res.json();
  } catch (error) {
    console.error(`enterMarks error: ${error.message}`);
    throw error;
  }
};

// Update Marks
export const updateMarks = async (examId, marksId, marksData) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/marks/${marksId}`,
      {
        method: "PUT",
        body: JSON.stringify(marksData),
      }
    );

    if (!res.ok)
      throw new Error(
        `Failed to update marks for marksId: ${marksId}`
      );

    return await res.json();
  } catch (error) {
    console.error(`updateMarks error: ${error.message}`);
    throw error;
  }
};

/* =========================
   BULK MARK ENTRY
========================= */

// Bulk Enter Marks (All students)
export const bulkEnterMarks = async (examId, bulkData) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/marks/bulk`,
      {
        method: "POST",
        body: JSON.stringify(bulkData),
      }
    );

    if (!res.ok)
      throw new Error(`Failed to bulk enter marks`);

    return await res.json();
  } catch (error) {
    console.error(`bulkEnterMarks error: ${error.message}`);
    throw error;
  }
};

/* =========================
   GENERATE REPORT CARDS
========================= */

// Generate Report Cards (All students)
export const generateReportCards = async (examId) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/report-cards/generate`,
      {
        method: "POST",
      }
    );

    if (!res.ok)
      throw new Error(`Failed to generate report cards for examId: ${examId}`);

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`generateReportCards error: ${error.message}`);
    throw error;
  }
};

/* =========================
   GET REPORT CARDS
========================= */

// Get All Report Cards (with optional section filter)
export const getReportCards = async (examId, sectionId = null) => {
  try {
    const query = sectionId ? `?sectionId=${sectionId}` : "";

    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/report-cards${query}`,
      {
        method: "GET",
      }
    );

    if (!res.ok)
      throw new Error(`Failed to fetch report cards for examId: ${examId}`);

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getReportCards error: ${error.message}`);
    throw error;
  }
};

// Get Single Student Report Card
export const getStudentReportCard = async (examId, studentId) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/report-cards/${studentId}`,
      {
        method: "GET",
      }
    );

    if (!res.ok)
      throw new Error(
        `Failed to fetch report card for studentId: ${studentId}`
      );

    const data = await res.json();
    return data?.data || {};
  } catch (error) {
    console.error(`getStudentReportCard error: ${error.message}`);
    throw error;
  }
};

/* =========================
   REMARKS UPDATE
========================= */

// Add / Update Remarks
export const updateReportCardRemarks = async (
  examId,
  studentId,
  remarksData
) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/report-cards/${studentId}/remarks`,
      {
        method: "PATCH",
        body: JSON.stringify(remarksData),
      }
    );

    if (!res.ok)
      throw new Error(
        `Failed to update remarks for studentId: ${studentId}`
      );

    return await res.json();
  } catch (error) {
    console.error(`updateReportCardRemarks error: ${error.message}`);
    throw error;
  }
};

/* =========================
   STUDENT REPORT HISTORY
========================= */

// Get All Report Cards for a Student (History)
export const getStudentReportHistory = async (studentId) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/students/${studentId}/report-cards`,
      {
        method: "GET",
      }
    );

    if (!res.ok)
      throw new Error(
        `Failed to fetch report history for studentId: ${studentId}`
      );

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getStudentReportHistory error: ${error.message}`);
    throw error;
  }
};


/* =========================
   CLASS RESULT SUMMARY
========================= */

// Get Class Result (Section-wise + Overall)
export const getClassResultSummary = async (examId) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/reports/class-result`,
      {
        method: "GET",
      }
    );

    if (!res.ok)
      throw new Error(`Failed to fetch class result for examId: ${examId}`);

    const data = await res.json();
    return data?.data || {};
  } catch (error) {
    console.error(`getClassResultSummary error: ${error.message}`);
    throw error;
  }
};

/* =========================
   FAILED STUDENTS
========================= */

// Get Failed Students List
export const getFailedStudents = async (examId) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/reports/failed-students`,
      {
        method: "GET",
      }
    );

    if (!res.ok)
      throw new Error(`Failed to fetch failed students for examId: ${examId}`);

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getFailedStudents error: ${error.message}`);
    throw error;
  }
};

/* =========================
   SUBJECT ANALYSIS
========================= */

// Get Subject-wise Analysis
export const getSubjectAnalysis = async (examId) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/reports/subject-analysis`,
      {
        method: "GET",
      }
    );

    if (!res.ok)
      throw new Error(`Failed to fetch subject analysis for examId: ${examId}`);

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getSubjectAnalysis error: ${error.message}`);
    throw error;
  }
};

/* =========================
   TOPPERS
========================= */

// Get Topper List
export const getToppers = async (examId, limit = 10) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/reports/toppers?limit=${limit}`,
      {
        method: "GET",
      }
    );

    if (!res.ok)
      throw new Error(`Failed to fetch toppers for examId: ${examId}`);

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getToppers error: ${error.message}`);
    throw error;
  }
};

/* =========================
   EXAM TYPES (FULL CRUD + STATUS)
========================= */

// Get All Exam Types
export const getExamTypes = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/exam-types`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch exam types");

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getExamTypes error: ${error.message}`);
    throw error;
  }
};

// Create Exam Type
export const createExamType = async (examTypeData) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/exam-types`, {
      method: "POST",
      body: JSON.stringify(examTypeData),
    });

    if (!res.ok) throw new Error("Failed to create exam type");

    return await res.json();
  } catch (error) {
    console.error(`createExamType error: ${error.message}`);
    throw error;
  }
};

// Update Exam Type
export const updateExamType = async (id, examTypeData) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/exam-types/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(examTypeData),
      }
    );

    if (!res.ok) throw new Error(`Failed to update exam type with id: ${id}`);

    return await res.json();
  } catch (error) {
    console.error(`updateExamType error: ${error.message}`);
    throw error;
  }
};

// Activate Exam Type
export const activateExamType = async (id) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/exam-types/${id}/activate`,
      {
        method: "PATCH",
      }
    );

    if (!res.ok) throw new Error(`Failed to activate exam type: ${id}`);

    return await res.json();
  } catch (error) {
    console.error(`activateExamType error: ${error.message}`);
    throw error;
  }
};

// Deactivate Exam Type
export const deactivateExamType = async (id) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/exam-types/${id}/deactivate`,
      {
        method: "PATCH",
      }
    );

    if (!res.ok) throw new Error(`Failed to deactivate exam type: ${id}`);

    return await res.json();
  } catch (error) {
    console.error(`deactivateExamType error: ${error.message}`);
    throw error;
  }
};