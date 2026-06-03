import { createContext, useContext, useState, useEffect } from "react";

const ClassContext = createContext(null);

export function ClassProvider({ children }) {
  // In production, you can replace this initial state with an API call inside useEffect
  const [classes] = useState([
    // { id: 9, name: "Class 9", sections: [{ id: 1, name: "A" }, { id: 2, name: "B" }] },
    // { id: 10, name: "Class 10", sections: [{ id: 1, name: "A" }, { id: 2, name: "B" }, { id: 3, name: "C" }] },
    // { id: 11, name: "Class 11", sections: [{ id: 1, name: "Science" }, { id: 2, name: "Commerce" }] },
    // { id: 12, name: "Class 12", sections: [{ id: 1, name: "Science" }, { id: 2, name: "Commerce" }] },
  ]);

  // Helper utility to get readable strings from IDs
  const getClassLabel = (classId, sectionId) => {
    const targetClass = classes.find((c) => c.id === parseInt(classId));
    if (!targetClass) return `Class ${classId}`;
    
    if (!sectionId) return targetClass.name;
    
    const targetSection = targetClass.sections.find((s) => s.id === parseInt(sectionId));
    return `${targetClass.name} – ${targetSection ? targetSection.name : `Sec ${sectionId}`}`;
  };

  return (
    <ClassContext.Provider value={{ classes, getClassLabel }}>
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