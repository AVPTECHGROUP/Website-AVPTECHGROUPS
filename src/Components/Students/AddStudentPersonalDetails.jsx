import { useEffect, useState } from "react";
import { getAcademicYears, getCurrentAcademicYear } from "../../Api/AcademicYears/AcademicYear";

const AddStudentPersonalDetails = ({ formData, setFormData, handleInputChange, errors = {}, sections = [], sectionsLoading = false }) => {

    const groupedSections = sections.reduce((acc, section) => {
        const key = section.className;
        if (!acc[key]) acc[key] = [];
        acc[key].push(section);
        return acc;
    }, {});

    const [academicYears, setAcademicYears] = useState([]);
    const [academicYearsLoading, setAcademicYearsLoading] = useState(false);
    const [currentYearId, setCurrentYearId] = useState(null);

    useEffect(() => {
        const fetchAcademicYears = async () => {
            setAcademicYearsLoading(true);
            try {
                const unwrap = (r) =>
                    Array.isArray(r) ? r :
                        Array.isArray(r?.years) ? r.years :
                            Array.isArray(r?.data) ? r.data :
                                Array.isArray(r?.content) ? r.content :
                                    Array.isArray(r?.data?.years) ? r.data.years :
                                        Array.isArray(r?.data?.data) ? r.data.data :
                                            Array.isArray(r?.data?.content) ? r.data.content : [];

                const [yearsRes, currentRes] = await Promise.allSettled([
                    getAcademicYears(),
                    getCurrentAcademicYear(),
                ]);

                const list = yearsRes.status === "fulfilled" ? unwrap(yearsRes.value) : [];
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

                const sorted = [...list].sort((a, b) => {
                    if (a.id === curId) return -1;
                    if (b.id === curId) return 1;
                    return b.id - a.id;
                });

                setAcademicYears(sorted);
                setCurrentYearId(curId);

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

    const selectedId = formData.academicYearId || formData.academicYear || "";
    const isSelectedCurrent = selectedId !== "" && currentYearId != null && Number(selectedId) === Number(currentYearId);

    const inputClass = (field) =>
        `bg-gray-100 font-normal text-gray-800 border p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`;

    const ErrorMsg = ({ field }) =>
        errors[field] ? (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span>⚠</span> {errors[field]}
            </p>
        ) : null;

    const handleWhatsappSameAsMobile = (checked) => {
        setFormData(prev => ({
            ...prev,
            sameAsMobile: checked,
            whatsappNumber: checked ? prev.mobile : '',
        }));
    };

    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-user text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Personal Details</h2>
                </div>

                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            First Name<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleInputChange}
                            placeholder='Enter first name' required className={inputClass('firstName')} />
                        <ErrorMsg field="firstName" />
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Last Name
                        </label>
                        <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleInputChange}
                            placeholder='Enter last name' className={inputClass('lastName')} />
                        <ErrorMsg field="lastName" />
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Gender<span className="text-red-600 ml-1">*</span>
                        </label>
                        <select name="gender" value={formData.gender || ''} onChange={handleInputChange} required
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
                        <input type="tel" name="mobile" value={formData.mobile || ''} onChange={handleInputChange}
                            placeholder='10 digit mobile number' maxLength={10} pattern="[6-9][0-9]{9}" inputMode="numeric" required
                            className={inputClass('mobile')} />
                        <ErrorMsg field="mobile" />
                    </div>

                    <div>
                        <label className='flex items-center justify-between font-semibold text-gray-600 text-sm mb-2'>
                            <span>WhatsApp Number
                                <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                            </span>
                            <span className="flex items-center gap-1.5 font-normal cursor-pointer select-none">
                                <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600"
                                    checked={!!formData.sameAsMobile}
                                    onChange={(e) => handleWhatsappSameAsMobile(e.target.checked)} />
                                <span className="text-xs text-gray-500">Same as mobile</span>
                            </span>
                        </label>
                        <input type="tel" name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleInputChange}
                            placeholder='10 digit WhatsApp number' maxLength={10} pattern="[6-9][0-9]{9}" inputMode="numeric" disabled={!!formData.sameAsMobile}
                            className={inputClass('whatsappNumber')} />
                        <ErrorMsg field="whatsappNumber" />
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Email Address</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange}
                            placeholder='Enter email address'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                        <p className="text-xs text-gray-500 mt-1">Valid email format required if provided</p>
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Date of Birth<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input type="date" name="dob" value={formData.dob || ''} onChange={handleInputChange} required
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Blood Group</label>
                        <select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleInputChange}
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
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Category
                        </label>
                        <select name="category" value={formData.category || ''} onChange={handleInputChange} required
                            className={inputClass('category')}>
                            <option value="">Select Category</option>
                            <option value="General">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                        </select>
                        <ErrorMsg field="category" />
                    </div>

                    {/* ─── Fixed Religion Dropdown matching Backend Enum ─── */}
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Religion
                        </label>
                        <select name="religion" value={formData.religion || ''} onChange={handleInputChange}
                            className={inputClass('religion')}>
                            <option value="">Select Religion</option>
                            <option value="HINDU">Hindu</option>
                            <option value="MUSLIM">Muslim</option>
                            <option value="CHRISTIAN">Christian</option>
                            <option value="OTHER">Other</option>
                        </select>
                        <ErrorMsg field="religion" />
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            SR Number
                            <span className="text-gray-400 text-xs font-normal ml-2">(auto-generated)</span>
                        </label>
                        <input type="text" value="Assigned automatically on save" disabled readOnly
                            className='bg-gray-200 font-normal text-gray-500 border border-gray-300 p-2 px-4 w-full rounded-md cursor-not-allowed' />
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Admission Number</label>
                        <input type="text" name="admissionNumber" value={formData.admissionNumber || ''} onChange={handleInputChange}
                            placeholder='Auto-generated if left empty'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                        <p className="text-xs text-gray-500 mt-1">Leave empty for auto-generation</p>
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Section<span className="text-red-600 ml-1">*</span>
                        </label>
                        <select
                            name="sectionId"
                            value={formData.sectionId || ''}
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
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Date of Admission<span className="text-red-600 ml-1">*</span>
                        </label>
                        <input type="date" name="admissionDate" value={formData.admissionDate || ''} onChange={handleInputChange} required max={new Date().toISOString().split("T")[0]}
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>

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
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Student House
                            <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                        </label>
                        <input type="text" name="studentHouse" value={formData.studentHouse || ''} onChange={handleInputChange}
                            placeholder='e.g. Red House' list="student-house-options"
                            className={inputClass('studentHouse')} />
                        <datalist id="student-house-options">
                            <option value="Red House" />
                            <option value="Blue House" />
                            <option value="Green House" />
                            <option value="Yellow House" />
                        </datalist>
                        <ErrorMsg field="studentHouse" />
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>ABC ID
                            <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                        </label>
                        <input type="text" name="abcId" value={formData.abcId || ''} onChange={handleInputChange}
                            placeholder='Academic Bank of Credits ID' className={inputClass('abcId')} />
                        <ErrorMsg field="abcId" />
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Previous School</label>
                        <input type="text" name="previousSchool" value={formData.previousSchool || ''} onChange={handleInputChange}
                            placeholder='Enter previous school name'
                            className='bg-gray-100 font-normal text-gray-800 border border-gray-300 p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
                    </div>

                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>Transfer Student</label>
                        <button type="button"
                            onClick={() => setFormData(prev => ({ ...prev, isTransferStudent: !prev.isTransferStudent }))}
                            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.isTransferStudent ? "bg-blue-500" : "bg-gray-300"}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.isTransferStudent ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
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
                    </div>

                    <div className="lg:col-span-2">
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Current Address <span className="text-red-600 ml-1">*</span>
                        </label>
                        <textarea rows={3} name="address" value={formData.address || ''} onChange={handleInputChange} required
                            placeholder='Enter residential address'
                            className={inputClass('address')} />
                        <ErrorMsg field="address" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudentPersonalDetails;