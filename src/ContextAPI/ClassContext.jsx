import { createContext, useContext, useState, useEffect } from "react";
import sectionSubjectService from "../Api/SectionSubjectService";

const ClassContext = createContext(null);

export function ClassProvider({ children }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassesAndSections = async () => {
      try {
        setLoading(true);
        // 1. Fetch your active classes list
        const classList = await sectionSubjectService.getActiveClasses();

        // 2. Fetch all sections for each class in parallel to attach them
        const populatedClasses = await Promise.all(
          classList.map(async (cls) => {
            try {
              const sections = await sectionSubjectService.getSectionsByClass(cls.id);
              return { ...cls, sections }; // Attach sections array into each class object
            } catch (err) {
              console.error(`Failed to load sections for class ${cls.id}:`, err);
              return { ...cls, sections: [] }; // Fallback to avoid breaking layout execution
            }
          })
        );

        setClasses(populatedClasses);
      } catch (error) {
        console.error("Failed to initialize system classes data layer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassesAndSections();
  }, []);

  // Helper utility to safely extract names from context mapping parameters
  const getClassLabel = (classId, sectionId) => {
    if (!classId) return "—";
    const targetClass = classes.find((c) => c.id === parseInt(classId));
    if (!targetClass) return `Class ${classId}`;
    
    if (!sectionId) return targetClass.name;
    
    const targetSection = targetClass.sections?.find((s) => s.id === parseInt(sectionId));
    return `${targetClass.name} – ${targetSection ? targetSection.name : `Sec ${sectionId}`}`;
  };

  return (
    <ClassContext.Provider value={{ classes, getClassLabel, loading }}>
      {children}
    </ClassContext.Provider>
  );
}

export function useClasses() {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error("useClasses must be used within a ClassProvider");
  }
  return context;
}