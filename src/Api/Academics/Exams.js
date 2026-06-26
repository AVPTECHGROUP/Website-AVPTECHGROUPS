import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

/** Extracts backend error messages reliably */
const extractError = async (res, fallback) => {
  try {
    const body = await res.clone().json();
    return body?.message || body?.error || fallback;
  } catch {
    try {
      return (await res.text()) || fallback;
    } catch {
      return fallback;
    }
  }
};

// ==================== Exams ====================

export const getExams = async (filters = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v != null))
  ).toString();

  const res = await authFetch(`${API_ENDPOINTS.EXAMS}${query ? `?${query}` : ""}`, { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch exams"));

  const data = await res.json();
  return Array.isArray(data) ? data : data?.data || [];
};

export const createExam = async (examData) => {
  const res = await authFetch(API_ENDPOINTS.EXAMS, { method: "POST", body: JSON.stringify(examData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to create exam"));
  return await res.json();
};

export const declareExamResult = async (examId) => {
  const res = await authFetch(API_ENDPOINTS.examDeclareResult(examId), { method: "PATCH" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to declare result"));
  return await res.json();
};

// ==================== Grade Configs ====================

export const getGradeConfigs = async () => {
  const res = await authFetch(API_ENDPOINTS.GRADE_CONFIGS, { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch grade configs"));
  return (await res.json())?.data || [];
};

export const createGradeConfig = async (gradeData) => {
  const res = await authFetch(API_ENDPOINTS.GRADE_CONFIGS, { method: "POST", body: JSON.stringify(gradeData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to create grade config"));
  return await res.json();
};

export const updateGradeConfig = async (id, gradeData) => {
  const res = await authFetch(API_ENDPOINTS.gradeConfigById(id), { method: "PUT", body: JSON.stringify(gradeData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to update grade config"));
  return await res.json();
};

export const deleteGradeConfig = async (id) => {
  const res = await authFetch(API_ENDPOINTS.gradeConfigById(id), { method: "DELETE" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to delete grade config"));
  return await res.json();
};

// ==================== Exam Subjects ====================

export const getExamSubjects = async (examId, sectionId = null) => {
  const query = sectionId ? `?sectionId=${sectionId}` : "";
  const res = await authFetch(`${API_ENDPOINTS.examSubjects(examId)}${query}`, { method: "GET" });

  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch subjects"));
  const data = await res.json();
  return Array.isArray(data) ? data : data?.data || [];
};

export const addExamSubject = async (examId, subjectData) => {
  const res = await authFetch(API_ENDPOINTS.examSubjects(examId), { method: "POST", body: JSON.stringify(subjectData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to add subject"));
  return await res.json();
};

export const updateExamSubject = async (examId, configId, subjectData) => {
  const res = await authFetch(API_ENDPOINTS.examSubjectById(examId, configId), { method: "PUT", body: JSON.stringify(subjectData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to update subject"));
  return await res.json();
};

export const deleteExamSubject = async (examId, configId) => {
  const res = await authFetch(API_ENDPOINTS.examSubjectById(examId, configId), { method: "DELETE" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to delete subject"));

  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
};

export const bulkAddExamSubjects = async (examId, subjectsData = []) => {
  const res = await authFetch(API_ENDPOINTS.examSubjectsBulk(examId), { method: "POST", body: JSON.stringify(subjectsData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to bulk add subjects"));
  return (await res.json())?.data || { added: [], skipped: [], addedCount: 0, skippedCount: 0 };
};

export const bulkUpdateExamSubjects = async (examId, subjectsData = []) => {
  const res = await authFetch(API_ENDPOINTS.examSubjectsBulk(examId), { method: "PUT", body: JSON.stringify(subjectsData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to bulk update subjects"));
  return (await res.json())?.data || [];
};

// ==================== Marks & Report Cards ====================

export const getMarksSheet = async (examId, sectionSubjectId) => {
  const res = await authFetch(API_ENDPOINTS.examMarksSheet(examId, sectionSubjectId), { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch marks sheet"));
  return (await res.json())?.data || [];
};

export const enterMarks = async (examId, marksData) => {
  const res = await authFetch(API_ENDPOINTS.examMarks(examId), { method: "POST", body: JSON.stringify(marksData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to enter marks"));
  return await res.json();
};

export const updateMarks = async (examId, marksId, marksData) => {
  const res = await authFetch(API_ENDPOINTS.examMarksById(examId, marksId), { method: "PUT", body: JSON.stringify(marksData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to update marks"));
  return await res.json();
};

export const bulkEnterMarks = async (examId, bulkData) => {
  const res = await authFetch(API_ENDPOINTS.examMarksBulk(examId), { method: "POST", body: JSON.stringify(bulkData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to bulk enter marks"));
  return await res.json();
};

export const generateReportCards = async (examId) => {
  const res = await authFetch(API_ENDPOINTS.reportCardsGenerate(examId), { method: "POST" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to generate report cards"));
  return (await res.json())?.data || [];
};

export const getReportCards = async (examId, sectionId = null) => {
  const query = sectionId ? `?sectionId=${sectionId}` : "";
  const res = await authFetch(`${API_ENDPOINTS.reportCards(examId)}${query}`, { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch report cards"));
  return (await res.json())?.data || [];
};

export const getStudentReportCard = async (examId, studentId) => {
  const res = await authFetch(API_ENDPOINTS.studentReportCard(examId, studentId), { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch report card"));
  return (await res.json())?.data || {};
};

export const updateReportCardRemarks = async (examId, studentId, remarksData) => {
  const res = await authFetch(API_ENDPOINTS.studentRemarks(examId, studentId), { method: "PATCH", body: JSON.stringify(remarksData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to update remarks"));
  return await res.json();
};

export const getStudentReportHistory = async (studentId) => {
  const res = await authFetch(API_ENDPOINTS.studentReportHistory(studentId), { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch history"));
  return (await res.json())?.data || [];
};

// ==================== Analytics ====================

export const getClassResultSummary = async (examId) => {
  const res = await authFetch(API_ENDPOINTS.classResultSummary(examId), { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch result summary"));
  return (await res.json())?.data || {};
};

export const getFailedStudents = async (examId) => {
  const res = await authFetch(API_ENDPOINTS.failedStudents(examId), { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch failed students"));
  return (await res.json())?.data || [];
};

export const getSubjectAnalysis = async (examId) => {
  const res = await authFetch(API_ENDPOINTS.subjectAnalysis(examId), { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch subject analysis"));
  return (await res.json())?.data || [];
};

export const getToppers = async (examId, limit = 10) => {
  const res = await authFetch(`${API_ENDPOINTS.examToppers(examId)}?limit=${limit}`, { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch toppers"));
  return (await res.json())?.data || [];
};

export const getGradeDistribution = async (examId, sectionId = null) => {
  const query = sectionId ? `?sectionId=${sectionId}` : "";
  const res = await authFetch(`${API_ENDPOINTS.gradeDistribution(examId)}${query}`, { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch distribution"));
  return (await res.json())?.data || { examId, totalStudents: 0, bands: [] };
};

export const getClassPerformanceTrend = async (classId, academicYearId = null) => {
  const query = academicYearId ? `?academicYearId=${academicYearId}` : "";
  const res = await authFetch(`${API_ENDPOINTS.classPerformanceTrend(classId)}${query}`, { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch trend"));
  return (await res.json())?.data || { classId, points: [] };
};

// ==================== Exam Types ====================

export const getExamTypes = async () => {
  const res = await authFetch(API_ENDPOINTS.EXAM_TYPES, { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch exam types"));
  return (await res.json())?.data || [];
};

export const createExamType = async (examTypeData) => {
  const res = await authFetch(API_ENDPOINTS.EXAM_TYPES, { method: "POST", body: JSON.stringify(examTypeData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to create exam type"));
  return await res.json();
};

export const updateExamType = async (id, examTypeData) => {
  const res = await authFetch(API_ENDPOINTS.examTypeById(id), { method: "PUT", body: JSON.stringify(examTypeData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to update exam type"));
  return await res.json();
};

export const activateExamType = async (id) => {
  const res = await authFetch(API_ENDPOINTS.examTypeActivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to activate exam type"));
  return await res.json();
};

export const deactivateExamType = async (id) => {
  const res = await authFetch(API_ENDPOINTS.examTypeDeactivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to deactivate exam type"));
  return await res.json();
};

// ==================== Exam Events ====================

export const getExamEvents = async (filters = {}) => {
  const f = typeof filters === "object" && filters !== null ? filters : { academicYearId: filters };
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(f).filter(([, v]) => v))
  ).toString();

  const res = await authFetch(`${API_ENDPOINTS.EXAM_EVENTS}${query ? `?${query}` : ""}`, { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch exam events"));
  return (await res.json())?.data || [];
};

export const getExamEventById = async (eventId) => {
  const res = await authFetch(API_ENDPOINTS.examEventById(eventId), { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch event"));
  return (await res.json())?.data || {};
};

export const createExamEvent = async (eventData) => {
  const res = await authFetch(API_ENDPOINTS.EXAM_EVENTS, { method: "POST", body: JSON.stringify(eventData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to create exam event"));
  return await res.json();
};

export const updateExamEvent = async (eventId, eventData) => {
  const res = await authFetch(API_ENDPOINTS.examEventById(eventId), { method: "PUT", body: JSON.stringify(eventData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to update event"));
  return await res.json();
};

export const copyExamEvent = async (eventId, newEventMeta) => {
  const res = await authFetch(API_ENDPOINTS.examEventCopy(eventId), { method: "POST", body: JSON.stringify(newEventMeta) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to copy event"));
  return (await res.json())?.data || {};
};

export const addClassesToExamEvent = async (eventId, classIds) => {
  const res = await authFetch(API_ENDPOINTS.examEventClasses(eventId), { method: "POST", body: JSON.stringify({ classIds }) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to add classes"));
  return await res.json();
};

export const removeClassFromExamEvent = async (eventId, classId) => {
  const res = await authFetch(API_ENDPOINTS.examEventClassById(eventId, classId), { method: "DELETE" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to remove class"));
  return await res.json();
};

export const getExamEventSummary = async (eventId) => {
  const res = await authFetch(API_ENDPOINTS.examEventSummary(eventId), { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch event summary"));
  return (await res.json())?.data || {};
};

export const getExamEventClassAnalytics = async (eventId, classId) => {
  const res = await authFetch(API_ENDPOINTS.examEventClassAnalytics(eventId, classId), { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch class analytics"));
  return (await res.json())?.data || {};
};

export const getExamEventToppers = async (eventId, limit = 10) => {
  const res = await authFetch(`${API_ENDPOINTS.examEventToppers(eventId)}?limit=${limit}`, { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch toppers"));
  return (await res.json())?.data || [];
};

export const getEventClassSubjects = async (eventId, classId, sectionId = null) => {
  const query = sectionId ? `?sectionId=${sectionId}` : "";
  const res = await authFetch(`${API_ENDPOINTS.eventClassSubjects(eventId, classId)}${query}`, { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch subjects"));
  return (await res.json())?.data || [];
};

export const addEventSubject = async (eventId, classId, subjectData) => {
  const res = await authFetch(API_ENDPOINTS.eventClassSubjects(eventId, classId), { method: "POST", body: JSON.stringify(subjectData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to add subject"));
  return await res.json();
};

export const updateEventSubject = async (eventId, classId, configId, subjectData) => {
  const res = await authFetch(API_ENDPOINTS.eventClassSubjectById(eventId, classId, configId), { method: "PUT", body: JSON.stringify(subjectData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to update subject"));
  return await res.json();
};

export const deleteEventSubject = async (eventId, classId, configId) => {
  const res = await authFetch(API_ENDPOINTS.eventClassSubjectById(eventId, classId, configId), { method: "DELETE" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to delete subject"));
  return await res.json();
};

export const generateEventReportCards = async (eventId, classId, sectionId = null) => {
  const query = sectionId ? `?sectionId=${sectionId}` : "";
  const res = await authFetch(`${API_ENDPOINTS.eventReportCardsGenerate(eventId, classId)}${query}`, { method: "POST" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to generate report cards"));
  return (await res.json())?.data || [];
};

export const getEventReportCards = async (eventId, classId, sectionId = null) => {
  const query = sectionId ? `?sectionId=${sectionId}` : "";
  const res = await authFetch(`${API_ENDPOINTS.eventReportCards(eventId, classId)}${query}`, { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to fetch report cards"));
  return (await res.json())?.data || [];
};

export const updateEventStudentRemarks = async (eventId, classId, studentId, remarksData) => {
  const res = await authFetch(API_ENDPOINTS.eventStudentRemarks(eventId, classId, studentId), { method: "PATCH", body: JSON.stringify(remarksData) });
  if (!res.ok) throw new Error(await extractError(res, "Failed to update remarks"));
  return await res.json();
};

export const declareEventExamResult = async (examId) => {
  const res = await authFetch(API_ENDPOINTS.examDeclareResult(examId), { method: "PATCH" });
  if (!res.ok) throw new Error(await extractError(res, "Failed to declare result"));
  return await res.json();
};

export const getExamEventSchedule = async (eventId) => {
  const res = await authFetch(API_ENDPOINTS.examEventSchedule(eventId), { method: "GET" });
  if (!res.ok) throw new Error(await extractError(res, "Failed fetching schedule"));
  return (await res.json())?.data || {};
};