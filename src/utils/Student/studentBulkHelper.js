// utils/studentBulkHelper.js

// Convert Excel serial date ya standard string to 'YYYY-MM-DD'
export const formatBackendDate = (val) => {
    if (!val) return null;

    // Handle Excel serial date numbers (e.g., 44561)
    if (typeof val === "number") {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const dateObj = new Date(excelEpoch.getTime() + val * 86400000);
        return dateObj.toISOString().split("T")[0];
    }

    const str = String(val).trim();
    if (!str) return null;

    // Handle DD/MM/YYYY or DD-MM-YYYY
    if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(str)) {
        const [d, m, y] = str.split(/[/-]/);
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    // Handle standard YYYY-MM-DD
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split("T")[0];
    }

    return null;
};

// Clean and map raw Excel row into Spring Boot CreateStudentRequestDto
export const mapExcelRowToStudentDto = (row, defaults = {}) => {
    const getVal = (...keys) => {
        for (const key of keys) {
            if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
                return String(row[key]).trim();
            }
        }
        return null;
    };

    const firstName = getVal("firstName", "First Name", "first_name", "FirstName");
    const lastName = getVal("lastName", "Last Name", "last_name", "LastName");
    const rollNo = getVal("rollNo", "Roll No", "roll_no", "RollNumber");
    const admissionNo = getVal("admissionNo", "Admission No", "admission_no");

    const rawGender = getVal("gender", "Gender")?.toUpperCase();
    const gender = ["MALE", "FEMALE", "OTHER"].includes(rawGender) ? rawGender : "MALE";

    const rawDob = getVal("dob", "DOB", "Date of Birth", "dateOfBirth");
    const dob = formatBackendDate(rawDob);

    const admissionDateRaw = getVal("admissionDate", "Admission Date", "admission_date");
    const admissionDate = formatBackendDate(admissionDateRaw) || new Date().toISOString().split("T")[0];

    const classId = Number(getVal("classId", "Class ID", "ClassId")) || Number(defaults.classId);
    const sectionId = Number(getVal("sectionId", "Section ID", "SectionId")) || Number(defaults.sectionId);

    const payload = {
        admissionNo: admissionNo || undefined,
        rollNo: rollNo || undefined,
        firstName: firstName || "",
        lastName: lastName || "",
        gender,
        dob,
        admissionDate,
        classId: classId || null,
        sectionId: sectionId || null,
        academicSessionId: defaults.academicSessionId ? Number(defaults.academicSessionId) : undefined,
        bloodGroup: getVal("bloodGroup", "Blood Group", "blood_group") || undefined,
        category: getVal("category", "Category") || "GENERAL",
        religion: getVal("religion", "Religion") || undefined,
        caste: getVal("caste", "Caste") || undefined,
        aadhaarNumber: getVal("aadhaarNumber", "Aadhaar", "Aadhaar Number") || undefined,
        email: getVal("email", "Email", "Student Email") || undefined,
        contactNumber: getVal("contactNumber", "Phone", "Mobile", "Contact Number") || undefined,

        // Parent details mapping
        parentDetails: {
            fatherName: getVal("fatherName", "Father Name", "father_name"),
            fatherPhone: getVal("fatherPhone", "Father Mobile", "father_phone"),
            fatherOccupation: getVal("fatherOccupation", "Father Occupation"),
            motherName: getVal("motherName", "Mother Name", "mother_name"),
            motherPhone: getVal("motherPhone", "Mother Mobile"),
            guardianName: getVal("guardianName", "Guardian Name"),
            guardianPhone: getVal("guardianPhone", "Guardian Mobile"),
        },

        // Address
        currentAddress: getVal("currentAddress", "Address", "Current Address") || undefined,
        permanentAddress: getVal("permanentAddress", "Permanent Address") || undefined,
        city: getVal("city", "City") || undefined,
        state: getVal("state", "State") || undefined,
        pincode: getVal("pincode", "Pin Code", "pincode", "Zip") || undefined,
        status: "ACTIVE",
    };

    return payload;
};

// Row-level validator
export const validateStudentDto = (dto, index) => {
    const errors = [];
    if (!dto.firstName) errors.push("First Name is required");
    if (!dto.classId) errors.push("Valid Class ID is required");
    if (!dto.sectionId) errors.push("Valid Section ID is required");
    if (dto.dob && !/^\d{4}-\d{2}-\d{2}$/.test(dto.dob)) errors.push("Invalid DOB format (expected YYYY-MM-DD)");

    return {
        rowIndex: index + 2, // Accounting for Excel header row
        isValid: errors.length === 0,
        errors,
    };
};