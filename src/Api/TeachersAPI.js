const BASE_URL= "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/v1";

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


// Get Teacher by Id--->
export const getTeacherById= async (id)=>{
    try {
        const res=await fetch(`${BASE_URL}/teachers/${id}`);
        if(!res.ok) throw new Error ("Failed to fetch Teacher")
            const data= await res.json();
        return data.data || data;
    } catch (error) {
        console.error("getTeachersByID error:", error.message);
        throw error;
    }
}

// Updating a Teacher--->

export const updateTeacher=async(id, updatedTeacher)=>{
    try {
        const res=await fetch(`${BASE_URL}/teachers/${id}`,{
        method:'PUT',
        headers:{"Content-Type":"application/json", accept:"application/json"},
        body:JSON.stringify(updatedTeacher)
    });
    if(!res.ok) throw new Error('Failed to update Teacher')
        return res.json()
    } catch (error) {
        console.error("UpdateTeachers error:", error.message);
        throw error;
    }
};

// Search Teaachers -->

export const searchTeachers=async(filters={}, page, size=10, sort='id')=>{
  try {
    const res= await fetch(`${BASE_URL}/teachers/search/paginated?page=${page}&size=${size}&sort=${sort}`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(filters)
    });

    if(!res.ok){
      const errorText= await res.text();
      throw new Error(errorText || 'Failed to  Search Teachers...')
    }
    const data= await res.json();
    return data;
  } catch (error) {
    console.error('searchTeachers error:', error.message);
    throw error;
  }
}

// Get Teacher Assignment===>

export const getTeacherAssignment=async(id)=>{

    try {
        const res=await fetch(`${BASE_URL}/teachers/${id}/assignments`);
        if(!res.ok) throw new Error('Failed to fetch assignments')
            const data=await res.json()
        return data.data || data;
        
    } catch (error) {
        console.error("getTeachersAssignments error:", error.message);
        throw error;
    }

}
