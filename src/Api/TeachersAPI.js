import { data } from "react-router-dom";

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

// Get Teacher Salary===>
  
  export const getTeacherSalary=async(id)=>{
    try {
      const res= await fetch(`${BASE_URL}/teachers/${id}/salary-structure`,{headers:{
        accept:'application/json'
      }})
      
      if(!res.ok) {throw new Error( 'Failed to get the teachers salary.')} 
        
        const result = await res.json();
        return result.data; 
        
      } catch (error) {
        console.error('searchTeachers error:', error.message);
        throw error;
      }
  }

  // Update Teacher Salary--->

  export const updateSalary=async(id, updatedSalary)=>{
    try {
      const res=await fetch(`${BASE_URL}/teachers/${id}/salary-structure`,{
        method:'POST',
        headers:{
          'Content-Type': 'application/json',
        accept: 'application/json'
        },
        body:JSON.stringify(updatedSalary)
      });
      if(!res.ok){throw new Error('Failed to update the Teachers Salary.')}    
      const data=await res.json()
      return data
    } catch (error) {
      console.error('updateSalary error:', error.message);
        throw error;
    }
  }

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


// Add Teacher Assignment===>

export const addTeacherAssignment = async (id, assignments) => {
  try {
    const res = await fetch(`${BASE_URL}/teachers/${id}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(assignments) 
    });

    if (!res.ok) throw new Error('Failed to add assignments');

    const data = await res.json();
    return data.data || data;

  } catch (error) {
    console.error("addTeacherAssignment error:", error.message);
    throw error;
  }
};

// Update Teacher Assignment--->

export const updateTeacherAssignment = async (id, updateAssignment)=>{

  try {
    const res= await fetch(`${BASE_URL}/teachers/assignments/${id}`,{
      method:'PUT', headers:{"Content-Type":"application/json", Accept:"application/json"},body:JSON.stringify(updateAssignment)})
      if(!res.ok) throw new Error('Failed to Update Teacher Assignment')
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.log("Update Assignment Error", error);
    throw error;
  }
}

// Get Teacher Assignments--->
export const getTeacherAssignments = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/teachers/${id}/assignments`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) throw new Error('Failed to get teacher assignments');

    const result = await res.json();
    return result.data; 

  } catch (error) {
    console.log("Get Teacher Assignments Error:", error.message);
    throw error;
  }
};
