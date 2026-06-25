const BASE_URL = import.meta.env.VITE_API_BASE_V1;

export const API_ENDPOINTS = {
  // Academic Years
  ACADEMIC_YEARS: `${BASE_URL}/academic-years`,
  CURRENT_ACADEMIC_YEAR: `${BASE_URL}/academic-years/current`,

  academicYearById: (id) =>
    `${BASE_URL}/academic-years/${id}`,

  setCurrentAcademicYear: (id) =>
    `${BASE_URL}/academic-years/${id}/set-current`,

  closeAcademicYear: (id) =>
    `${BASE_URL}/academic-years/${id}/close`,
};