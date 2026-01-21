// Get all teachers
export const getTeachers = () => {
  const data = localStorage.getItem("teachers");
  return data ? JSON.parse(data) : [];
};

// Save all teachers
export const saveTeachers = (teachers) => {
  localStorage.setItem("teachers", JSON.stringify(teachers));
};

// Add new teacher
export const addTeacher = (teacher) => {
  const teachers = getTeachers();
  teachers.push(teacher);
  saveTeachers(teachers);
};

// Get teacher by ID
export const getTeacherById = (id) => {
  const teachers = getTeachers();
  return teachers.find(t => t.id === id);
};

// Update teacher
export const updateTeacher = (updatedTeacher) => {
  const teachers = getTeachers().map(t =>
    t.id === updatedTeacher.id 
      ? { ...t, ...updatedTeacher }
      : t
  );
  saveTeachers(teachers);
};

// Delete teacher
export const deleteTeacher = (id) => {
  const teachers = getTeachers().filter(t => t.id !== id);
  saveTeachers(teachers);
};
