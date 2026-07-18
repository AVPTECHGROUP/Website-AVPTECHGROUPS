import { useEffect, useState } from "react";
import { getAcademicYears, getCurrentAcademicYear } from "../../Api/AcademicYears/AcademicYear";

const AddStudentPersonalDetails = ({ formData, setFormData, handleInputChange, sections = [], sectionsLoading = false }) => {

    // Group sections by className for the <optgroup> UX
    const groupedSections = sections.reduce((acc, section) => {
        const key = section.className;
        if (!acc[key]) acc[key] = [];
        acc[key].push(section);
        return acc;
    }, {});

    const [academicYears,        setAcademicYears]        = useState([]);
    const [academicYearsLoading, setAcademicYearsLoading] = useState(false);
    const [currentYearId,        setCurrentYearId]        = useState(null);

    useEffect(() => {
        const fetchAcademicYears = async () => {
            setAcademicYearsLoading(true);
            try {
                // Handle all known API shapes
                const unwrap = (r) =>
                    Array.isArray(r)                 ? r :
                    Array.isArray(r?.years)          ? r.years :
                    Array.isArray(r?.data)           ? r.data :
                    Array.isArray(r?.content)        ? r.content :
                    Array.isArray(r?.data?.years)    ? r.data.years :
                    Array.isArray(r?.data?.data)     ? r.data.data :
                    Array.isArray(r?.data?.content)  ? r.data.content : [];

                const [yearsRes, currentRes] = await Promise.allSettled([
                    getAcademicYears(),
                    getCurrentAcademicYear(),
                ]);

                const list = yearsRes.status === "fulfilled" ? unwrap(yearsRes.value) : [];

                if (yearsRes.status === "rejected") {
                    console.error("getAcademicYears failed:", yearsRes.reason);
                }
                if (currentRes.status === "rejected") {
                    console.error("getCurrentAcademicYear failed:", currentRes.reason);
                }

                // current year from dedicated endpoint or isCurrent flag in list
                const currentPayload = currentRes.status === "fulfilled" ? currentRes.value : null;
                const currentYear = currentPayload?.id
                    ? currentPayload
                    : currentPayload?.data?.id
                        ? currentPayload.data
                        : currentPayload?.data?.data?.id
                            ? currentPayload.data.data
                            : null;
                const curId = currentYear?.id
                    ?? list.find(y => y.isCurrent)?.id
                    ?? null;

                console.log("[AcademicYear debug]", { list, currentPayload, currentYear, curId });

                // Sort: current first, then newest to oldest
                const sorted = [...list].sort((a, b) => {
                    if (a.id === curId) return -1;
                    if (b.id === curId) return 1;
                    return b.id - a.id;
                });

                setAcademicYears(sorted);
                setCurrentYearId(curId);

                // Auto-select current year by default (unless already set)
                if (curId != null) {
                    setFormData(prev => {
                        const existing = prev.academicYearId || prev.academicYear;
                        if (existing) return prev;
                        return { ...prev, academicYearId: String(curId) };
                    });
                }
            } catch (err) {
                console.error("Error fetching academic years:", err);
            } finally {
                setAcademicYearsLoading(false);
            }
        };

        fetchAcademicYears();
    }, []);

    // Which year id is currently selected (support both academicYearId and academicYear field names)
    const selectedId = formData.academicYearId || formData.academicYear || "";
    const isSelectedCurrent = selectedId !== "" && currentYearId != null && Number(selectedId) === Number(currentYearId);

    return (
        <div className="space-y-8">
            {/* ─── Personal Details Section ─── */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-user text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Personal Details</h2>
                </div>

                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Full Name<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                            placeholder='Enter full name' required
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Gender<span className="text-red-600 ml-1">*</span>
                        </label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} required
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Mobile Number<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange}
                            placeholder='10 digit mobile number' maxLength={10} pattern="[0-9]{10}" required
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                        <p className="text-xs text-gray-500 mt-1">Must be exactly 10 digits</p>
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                            placeholder='Enter email address'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                        <p className="text-xs text-gray-500 mt-1">Valid email format required if provided</p>
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Date of Birth<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} required
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Blood Group</label>
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange}
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Admission Number</label>
                        <input type="text" name="admissionNumber" value={formData.admissionNumber} onChange={handleInputChange}
                            placeholder='Auto-generated if left empty'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                        <p className="text-xs text-gray-500 mt-1">Leave empty for auto-generation</p>
                    </div>

                    {/* ─── Section Dropdown ─── */}
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Section<span className="text-red-600 ml-1">*</span>
                        </label>
                        <select
                            name="sectionId"
                            value={formData.sectionId}
                            onChange={handleInputChange}
                            required
                            disabled={sectionsLoading}
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            <option value="">
                                {sectionsLoading ? 'Loading sections...' : 'Select Section'}
                            </option>
                            {Object.entries(groupedSections).map(([className, classSections]) => (
                                <optgroup key={className} label={className}>
                                    {classSections.map(section => (
                                        <option key={section.id} value={section.id}>
                                            {section.name} — Room {section.roomNumber} ({section.currentStrength}/{section.capacity})
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.sectionId
                                ? (() => {
                                    const found = sections.find(s => s.id === Number(formData.sectionId));
                                    return found
                                        ? `${found.className} · ${found.name} · ${found.currentStrength}/${found.capacity} students`
                                        : '';
                                })()
                                : 'Choose the class section for this student'}
                        </p>
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Date of Admission<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} required max={new Date().toISOString().split("T")[0]}
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>

                    {/* ─── Academic Year Dropdown ─── */}
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Academic Year<span className="text-red-600 ml-1">*</span>
                        </label>
                        <select
                            name="academicYearId"
                            value={selectedId}
                            onChange={handleInputChange}
                            required
                            disabled={academicYearsLoading}
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60'
                        >
                            <option value="">
                                {academicYearsLoading ? "Loading..." : "Select Academic Year"}
                            </option>
                            {academicYears.map((year) => {
                                const isCur = Number(year.id) === Number(currentYearId) || year.isCurrent;
                                return (
                                    <option key={year.id} value={String(year.id)}>
                                        {isCur ? "● " : ""}{year.label}{isCur ? " (Current)" : ""}
                                    </option>
                                );
                            })}
                        </select>

                        {/* Current year green badge */}
                        {!academicYearsLoading && isSelectedCurrent && (
                            <div className="mt-1.5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-50 border border-green-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block flex-shrink-0" />
                                    <span className="text-xs font-semibold text-green-600">Current Academic Year</span>
                                </span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Previous School</label>
                        <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleInputChange}
                            placeholder='Enter previous school name'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Status<span className="text-red-600 ml-1">*</span>
                        </label>
                        <button type="button"
                            onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }))}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.status === 'ACTIVE' ? "bg-blue-500" : "bg-gray-300"}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.status === 'ACTIVE' ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.status === 'ACTIVE'
                                ? <span className="text-green-600 font-medium">● Active</span>
                                : <span className="text-red-600 font-medium">● Inactive</span>}
                        </p>
                    </div>

                    <div className="lg:col-span-2">

                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Current Address   <span className="text-red-600 ml-1">*</span></label>

                        <textarea rows={3} name="address" value={formData.address} onChange={handleInputChange}
                            placeholder='Enter residential address'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>
                </div>
            </div>

            {/* ─── Additional Requirements Section ─── */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-cog text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Additional Requirements</h2>
                </div>
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-6">
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Hostel Required</label>
                        <button type="button"
                            onClick={() => setFormData(prev => ({ ...prev, hostelRequired: !prev.hostelRequired }))}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.hostelRequired ? "bg-blue-500" : "bg-gray-300"}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.hostelRequired ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                        <p className="text-xs text-gray-500 mt-1">{formData.hostelRequired ? 'Hostel accommodation enabled' : 'Hostel accommodation disabled'}</p>
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Transport Required</label>
                        <button type="button"
                            onClick={() => setFormData(prev => ({ ...prev, transportRequired: !prev.transportRequired }))}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.transportRequired ? "bg-blue-500" : "bg-gray-300"}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.transportRequired ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                        <p className="text-xs text-gray-500 mt-1">{formData.transportRequired ? 'School transport enabled' : 'School transport disabled'}</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AddStudentPersonalDetails;