import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_DOUBLE_V1;

// ─── Helper: extract error message from response ───────────────────────────
// BUG FIX: Centralized error extractor so we get backend messages, not generic ones
async function extractError(res, fallback) {
  try {
    const body = await res.clone().json();
    return body?.message || body?.error || fallback;
  } catch {
    try {
      const text = await res.text();
      return text || fallback;
    } catch {
      return fallback;
    }
  }
}

// ─── Get All Exams (with optional filters) ────────────────────────────────────
export const getExams = async (filters = {}) => {
  try {
    // BUG FIX: Filter out empty/undefined values before building query string
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== "" && v !== null && v !== undefined)
    );
    const query = new URLSearchParams(cleanFilters).toString();

    const res = await authFetch(`${BASE_URL}/exams${query ? `?${query}` : ""}`, {
      method: "GET",
    });

    if (!res.ok) {
      const msg = await extractError(res, "Failed to fetch exams");
      throw new Error(msg);
    }

    const data = await res.json();
    // BUG FIX: Handle both array and wrapped responses
    if (Array.isArray(data)) return data;
    return data?.data || [];
  } catch (error) {
    console.error(`getExams error: ${error.message}`);
    throw error;
  }
};

// ─── Create Exam ──────────────────────────────────────────────────────────────
export const createExam = async (examData) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams`, {
      method: "POST",
      body: JSON.stringify(examData),
    });

    if (!res.ok) {
      const msg = await extractError(res, "Failed to create exam");
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`createExam error: ${error.message}`);
    throw error;
  }
};

/* =========================
   GRADE CONFIGS
========================= */

export const getGradeConfigs = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/grade-configs`, {
      method: "GET",
    });

    if (!res.ok) {
      const msg = await extractError(res, "Failed to fetch grade configs");
      throw new Error(msg);
    }

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getGradeConfigs error: ${error.message}`);
    throw error;
  }
};

export const createGradeConfig = async (gradeData) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/grade-configs`, {
      method: "POST",
      body: JSON.stringify(gradeData),
    });

    if (!res.ok) {
      const msg = await extractError(res, "Failed to create grade config");
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`createGradeConfig error: ${error.message}`);
    throw error;
  }
};

export const updateGradeConfig = async (id, gradeData) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/grade-configs/${id}`, {
      method: "PUT",
      body: JSON.stringify(gradeData),
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to update grade config with id: ${id}`);
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`updateGradeConfig error: ${error.message}`);
    throw error;
  }
};

export const deleteGradeConfig = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/grade-configs/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to delete grade config with id: ${id}`);
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`deleteGradeConfig error: ${error.message}`);
    throw error;
  }
};

/* =========================
   EXAM SUBJECT CONFIG
========================= */

// ─── Get Subjects for an Exam ─────────────────────────────────────────────────
export const getExamSubjects = async (examId, sectionId = null) => {
  try {
    // BUG FIX: Validate examId
    if (!examId) throw new Error("examId is required");

    const query = sectionId ? `?sectionId=${sectionId}` : "";

    const res = await authFetch(`${BASE_URL}/exams/${examId}/subjects${query}`, {
      method: "GET",
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to fetch subjects for examId: ${examId}`);
      throw new Error(msg);
    }

    const data = await res.json();
    if (Array.isArray(data)) return data;
    return data?.data || [];
  } catch (error) {
    console.error(`getExamSubjects error: ${error.message}`);
    throw error;
  }
};

// ─── Declare Exam Result ──────────────────────────────────────────────────────
export const declareExamResult = async (examId) => {
  try {
    if (!examId) throw new Error("examId is required");

    const res = await authFetch(`${BASE_URL}/exams/${examId}/declare-result`, {
      method: "PATCH",
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to declare result for examId: ${examId}`);
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`declareExamResult error: ${error.message}`);
    throw error;
  }
};

// ─── Add Subject to Exam ──────────────────────────────────────────────────────
// BUG FIX: Removed the BASE_URL.replace('/api/api', '/api') hack — use BASE_URL consistently
// If your env var already has double /api/api, fix it at the env level, not here.
// If you need the replace, keep it, but be explicit about why.
export const addExamSubject = async (examId, subjectData) => {
  try {
    if (!examId) throw new Error("examId is required");
    if (!subjectData) throw new Error("subjectData is required");

    const res = await authFetch(`${BASE_URL}/exams/${examId}/subjects`, {
      method: "POST",
      body: JSON.stringify(subjectData),
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to add subject to examId: ${examId}`);
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`addExamSubject error: ${error.message}`);
    throw error;
  }
};

// ─── Update Subject Config ────────────────────────────────────────────────────
export const updateExamSubject = async (examId, configId, subjectData) => {
  try {
    if (!examId)   throw new Error("examId is required");
    if (!configId) throw new Error("configId is required");
    if (!subjectData) throw new Error("subjectData is required");

    const res = await authFetch(`${BASE_URL}/exams/${examId}/subjects/${configId}`, {
      method: "PUT",
      body: JSON.stringify(subjectData),
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to update subject configId: ${configId}`);
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`updateExamSubject error: ${error.message}`);
    throw error;
  }
};

// ─── Delete Subject Config ────────────────────────────────────────────────────
export const deleteExamSubject = async (examId, configId) => {
  try {
    if (!examId)   throw new Error("examId is required");
    if (!configId) throw new Error("configId is required");

    const res = await authFetch(`${BASE_URL}/exams/${examId}/subjects/${configId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to delete subject configId: ${configId}`);
      throw new Error(msg);
    }

    // BUG FIX: DELETE may return 204 No Content — handle gracefully
    const text = await res.text();
    return text ? JSON.parse(text) : { success: true };
  } catch (error) {
    console.error(`deleteExamSubject error: ${error.message}`);
    throw error;
  }
};

/* =========================
   MARKS SHEET
========================= */

export const getMarksSheet = async (examId, sectionSubjectId) => {
  try {
    if (!examId || !sectionSubjectId) throw new Error("examId and sectionSubjectId are required");

    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/marks/sheet/${sectionSubjectId}`,
      { method: "GET" }
    );

    if (!res.ok) {
      const msg = await extractError(res, `Failed to fetch marks sheet`);
      throw new Error(msg);
    }

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

export const enterMarks = async (examId, marksData) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/${examId}/marks`, {
      method: "POST",
      body: JSON.stringify(marksData),
    });

    if (!res.ok) {
      const msg = await extractError(res, "Failed to enter marks");
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`enterMarks error: ${error.message}`);
    throw error;
  }
};

export const updateMarks = async (examId, marksId, marksData) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/${examId}/marks/${marksId}`, {
      method: "PUT",
      body: JSON.stringify(marksData),
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to update marks for marksId: ${marksId}`);
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`updateMarks error: ${error.message}`);
    throw error;
  }
};

/* =========================
   BULK MARK ENTRY
========================= */

export const bulkEnterMarks = async (examId, bulkData) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/${examId}/marks/bulk`, {
      method: "POST",
      body: JSON.stringify(bulkData),
    });

    if (!res.ok) {
      const msg = await extractError(res, "Failed to bulk enter marks");
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`bulkEnterMarks error: ${error.message}`);
    throw error;
  }
};

/* =========================
   REPORT CARDS
========================= */

export const generateReportCards = async (examId) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/${examId}/report-cards/generate`, {
      method: "POST",
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to generate report cards for examId: ${examId}`);
      throw new Error(msg);
    }

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`generateReportCards error: ${error.message}`);
    throw error;
  }
};

export const getReportCards = async (examId, sectionId = null) => {
  try {
    const query = sectionId ? `?sectionId=${sectionId}` : "";
    const res = await authFetch(`${BASE_URL}/exams/${examId}/report-cards${query}`, {
      method: "GET",
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to fetch report cards for examId: ${examId}`);
      throw new Error(msg);
    }

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getReportCards error: ${error.message}`);
    throw error;
  }
};

export const getStudentReportCard = async (examId, studentId) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/${examId}/report-cards/${studentId}`, {
      method: "GET",
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to fetch report card for studentId: ${studentId}`);
      throw new Error(msg);
    }

    const data = await res.json();
    return data?.data || {};
  } catch (error) {
    console.error(`getStudentReportCard error: ${error.message}`);
    throw error;
  }
};

/* =========================
   REMARKS
========================= */

export const updateReportCardRemarks = async (examId, studentId, remarksData) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/report-cards/${studentId}/remarks`,
      { method: "PATCH", body: JSON.stringify(remarksData) }
    );

    if (!res.ok) {
      const msg = await extractError(res, `Failed to update remarks for studentId: ${studentId}`);
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`updateReportCardRemarks error: ${error.message}`);
    throw error;
  }
};

/* =========================
   STUDENT REPORT HISTORY
========================= */

export const getStudentReportHistory = async (studentId) => {
  try {
    const res = await authFetch(`${BASE_URL}/students/${studentId}/report-cards`, {
      method: "GET",
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to fetch report history for studentId: ${studentId}`);
      throw new Error(msg);
    }

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

export const getClassResultSummary = async (examId) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/${examId}/reports/class-result`, {
      method: "GET",
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to fetch class result for examId: ${examId}`);
      throw new Error(msg);
    }

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

export const getFailedStudents = async (examId) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/${examId}/reports/failed-students`, {
      method: "GET",
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to fetch failed students for examId: ${examId}`);
      throw new Error(msg);
    }

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

export const getSubjectAnalysis = async (examId) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/${examId}/reports/subject-analysis`, {
      method: "GET",
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to fetch subject analysis for examId: ${examId}`);
      throw new Error(msg);
    }

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

export const getToppers = async (examId, limit = 10) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/exams/${examId}/reports/toppers?limit=${limit}`,
      { method: "GET" }
    );

    if (!res.ok) {
      const msg = await extractError(res, `Failed to fetch toppers for examId: ${examId}`);
      throw new Error(msg);
    }

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getToppers error: ${error.message}`);
    throw error;
  }
};

/* =========================
   EXAM TYPES
========================= */

export const getExamTypes = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/exam-types`, { method: "GET" });

    if (!res.ok) {
      const msg = await extractError(res, "Failed to fetch exam types");
      throw new Error(msg);
    }

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error(`getExamTypes error: ${error.message}`);
    throw error;
  }
};

export const createExamType = async (examTypeData) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/exam-types`, {
      method: "POST",
      body: JSON.stringify(examTypeData),
    });

    if (!res.ok) {
      const msg = await extractError(res, "Failed to create exam type");
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`createExamType error: ${error.message}`);
    throw error;
  }
};

export const updateExamType = async (id, examTypeData) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/exam-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(examTypeData),
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to update exam type with id: ${id}`);
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`updateExamType error: ${error.message}`);
    throw error;
  }
};

export const activateExamType = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/exam-types/${id}/activate`, {
      method: "PATCH",
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to activate exam type: ${id}`);
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`activateExamType error: ${error.message}`);
    throw error;
  }
};

export const deactivateExamType = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/exams/exam-types/${id}/deactivate`, {
      method: "PATCH",
    });

    if (!res.ok) {
      const msg = await extractError(res, `Failed to deactivate exam type: ${id}`);
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.error(`deactivateExamType error: ${error.message}`);
    throw error;
  }
};