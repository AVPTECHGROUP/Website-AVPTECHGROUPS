import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Building2,
    MapPin,
    User,
    ShieldCheck,
    CheckSquare,
} from 'lucide-react';
import { toast } from 'react-toastify';
// import { createSchool } from '../../Api/schoolManagementAPI';

// ─── Constants ────────────────────────────────────────────────────────────────
const BOARD_OPTIONS = ['CBSE', 'ICSE', 'STATE_BOARD', 'IGCSE', 'IB'];
const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE'];
const CURRENT_YEAR = new Date().getFullYear();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^\d{6}$/;
const URL_REGEX = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w\-./?%&=]*)?$/i;

// ─── Validation ───────────────────────────────────────────────────────────────
const validateForm = (data) => {
    const errors = {};

    if (!data.name.trim()) errors.name = 'School name is required.';
    else if (data.name.trim().length < 3) errors.name = 'School name must be at least 3 characters.';

    if (!data.code.trim()) errors.code = 'School code is required.';
    else if (!/^[A-Za-z0-9\-_]{2,20}$/.test(data.code.trim())) errors.code = 'Code must be 2–20 alphanumeric characters.';

    if (!data.board) errors.board = 'Please select a board.';

    if (data.establishedYear) {
        const yr = Number(data.establishedYear);
        if (!Number.isInteger(yr) || yr < 1800 || yr > CURRENT_YEAR) errors.establishedYear = `Year must be between 1800 and ${CURRENT_YEAR}.`;
    }

    if (!data.phone.trim()) errors.phone = 'Phone number is required.';
    else if (!PHONE_REGEX.test(data.phone.trim())) errors.phone = 'Enter a valid 10-digit Indian phone number.';

    if (!data.email.trim()) errors.email = 'Email is required.';
    else if (!EMAIL_REGEX.test(data.email.trim())) errors.email = 'Enter a valid email address.';

    if (data.website && !URL_REGEX.test(data.website.trim())) errors.website = 'Enter a valid website URL.';

    if (!data.principalName.trim()) errors.principalName = 'Principal name is required.';

    if (!data.address.trim()) errors.address = 'Address is required.';

    if (!data.city.trim()) errors.city = 'City is required.';

    if (!data.state.trim()) errors.state = 'State is required.';

    if (!data.pincode.trim()) errors.pincode = 'Pincode is required.';
    else if (!PINCODE_REGEX.test(data.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode.';

    return errors;
};

// ─── Reusable Field Components ────────────────────────────────────────────────
const FormField = ({ label, required, error, children }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
);

const inputClass = (error) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${error
        ? 'border-red-400 focus:ring-red-200 bg-red-50'
        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400 bg-white'
    }`;

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, color = 'text-blue-600' }) => (
    <div className="flex items-center gap-2 pb-3 border-b border-gray-200 mb-5">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className={`text-sm font-bold uppercase tracking-widest ${color}`}>{title}</h3>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
function EditSchool() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        board: '',
        establishedYear: '',
        status: 'ACTIVE',
        phone: '',
        email: '',
        website: '',
        principalName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        affiliationNumber: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Clear field error on change
        if (fieldErrors[name]) {
            setFieldErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
        }
        let sanitized = value;
        if (name === 'phone') sanitized = value.replace(/\D/g, '').slice(0, 10);
        if (name === 'pincode') sanitized = value.replace(/\D/g, '').slice(0, 6);
        if (name === 'establishedYear') sanitized = value.replace(/\D/g, '').slice(0, 4);
        setFormData((prev) => ({ ...prev, [name]: sanitized }));
    };

    const buildPayload = (data) => ({
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        board: data.board,
        establishedYear: data.establishedYear ? Number(data.establishedYear) : null,
        status: data.status,
        phone: data.phone.trim(),
        email: data.email.trim(),
        website: data.website.trim() || '',
        principalName: data.principalName.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        pincode: data.pincode.trim(),
        affiliationNumber: data.affiliationNumber.trim(),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm(formData);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            toast.error(Object.values(errors)[0]);
            return;
        }
        setFieldErrors({});
        setIsSubmitting(true);
        const loadingToast = toast.loading('Creating school...');
        try {
            const payload = buildPayload(formData);
            // const response = await createSchool(payload);
            await new Promise(r => setTimeout(r, 1000)); // remove when API is wired
            toast.dismiss(loadingToast);
            toast.success(`${formData.name} created successfully!`);
            navigate('/dashboard/schools');
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err?.message || 'Failed to create school. Please try again.');
            console.error('AddNewSchool submit error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Live payload preview
    const payloadPreview = JSON.stringify(buildPayload(formData), null, 2);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-4">
            <div className="mx-auto max-w-6xl">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center cursor-pointer bg-gray-600 p-2 rounded-xl text-white gap-2 hover:bg-gray-900 transition-colors mb-4"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back to List</span>
                </button>

                {/* Page Heading */}
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Add New School</h1>
                    <p className="text-sm sm:text-base text-gray-500">Fill in the details below to register a new school into the system.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="bg-white rounded-lg shadow">

                        {/* ── Form Body ── */}
                        <div className="p-4 sm:p-6 lg:p-8 space-y-10">

                            {/* ── SECTION 1: Basic Information ── */}
                            <div>
                                <SectionHeader icon={Building2} title="Basic Information" color="text-blue-600" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                                    <FormField label="School Name" required error={fieldErrors.name}>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Delhi Public School"
                                            className={inputClass(fieldErrors.name)}
                                        />
                                    </FormField>

                                    <FormField label="School Code" required error={fieldErrors.code}>
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            placeholder="e.g. SCH001"
                                            className={inputClass(fieldErrors.code)}
                                        />
                                    </FormField>

                                    <FormField label="Board" required error={fieldErrors.board}>
                                        <select
                                            name="board"
                                            value={formData.board}
                                            onChange={handleChange}
                                            className={inputClass(fieldErrors.board)}
                                        >
                                            <option value="">Select Board</option>
                                            {BOARD_OPTIONS.map(b => (
                                                <option key={b} value={b}>{b.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                    </FormField>

                                    <FormField label="Established Year" error={fieldErrors.establishedYear}>
                                        <input
                                            type="text"
                                            name="establishedYear"
                                            value={formData.establishedYear}
                                            onChange={handleChange}
                                            placeholder={`e.g. 1995`}
                                            maxLength={4}
                                            className={inputClass(fieldErrors.establishedYear)}
                                        />
                                    </FormField>

                                    <FormField label="Status" required>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className={inputClass(false)}
                                        >
                                            {STATUS_OPTIONS.map(s => (
                                                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                                            ))}
                                        </select>
                                    </FormField>

                                </div>
                            </div>

                            {/* ── SECTION 2: Contact Details ── */}
                            <div>
                                <SectionHeader icon={User} title="Contact Details" color="text-green-600" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                                    <FormField label="Phone Number" required error={fieldErrors.phone}>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="e.g. 9876543210"
                                            maxLength={10}
                                            className={inputClass(fieldErrors.phone)}
                                        />
                                    </FormField>

                                    <FormField label="Email Address" required error={fieldErrors.email}>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="e.g. info@school.in"
                                            className={inputClass(fieldErrors.email)}
                                        />
                                    </FormField>

                                    <FormField label="Website" error={fieldErrors.website}>
                                        <input
                                            type="text"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            placeholder="e.g. https://school.in"
                                            className={inputClass(fieldErrors.website)}
                                        />
                                    </FormField>

                                    <FormField label="Principal Name" required error={fieldErrors.principalName}>
                                        <input
                                            type="text"
                                            name="principalName"
                                            value={formData.principalName}
                                            onChange={handleChange}
                                            placeholder="e.g. Dr. R. Sharma"
                                            className={inputClass(fieldErrors.principalName)}
                                        />
                                    </FormField>

                                </div>
                            </div>

                            {/* ── SECTION 3: Address ── */}
                            <div>
                                <SectionHeader icon={MapPin} title="Address" color="text-orange-500" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <FormField label="Street Address" required error={fieldErrors.address}>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="e.g. 12, Sector 5, Near Bus Stand"
                                                rows={2}
                                                className={`${inputClass(fieldErrors.address)} resize-none`}
                                            />
                                        </FormField>
                                    </div>

                                    <FormField label="City" required error={fieldErrors.city}>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="e.g. New Delhi"
                                            className={inputClass(fieldErrors.city)}
                                        />
                                    </FormField>

                                    <FormField label="State" required error={fieldErrors.state}>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            placeholder="e.g. Delhi"
                                            className={inputClass(fieldErrors.state)}
                                        />
                                    </FormField>

                                    <FormField label="Pincode" required error={fieldErrors.pincode}>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            placeholder="e.g. 110001"
                                            maxLength={6}
                                            className={inputClass(fieldErrors.pincode)}
                                        />
                                    </FormField>

                                </div>
                            </div>

                            {/* ── SECTION 4: Accreditation ── */}
                            <div>
                                <SectionHeader icon={ShieldCheck} title="Accreditation" color="text-indigo-600" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                                    <FormField label="Affiliation Number" error={fieldErrors.affiliationNumber}>
                                        <input
                                            type="text"
                                            name="affiliationNumber"
                                            value={formData.affiliationNumber}
                                            onChange={handleChange}
                                            placeholder="e.g. AFF-2023-001234"
                                            className={inputClass(fieldErrors.affiliationNumber)}
                                        />
                                    </FormField>

                                </div>

                               
                            </div>

                        </div>

                        {/* ── Footer Actions ── */}
                        <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 rounded-b-lg">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard/schools')}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${isSubmitting
                                        ? 'bg-blue-300 cursor-not-allowed text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer text-white'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckSquare className="w-4 h-4" />
                                            Create School
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditSchool;