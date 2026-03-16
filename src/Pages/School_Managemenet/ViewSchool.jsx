import {
    Building2,
    Mail,
    Phone,
    ChevronLeft,
    MapPin,
    ShieldCheck,
    User,
    Globe,
    BookOpen,
    Hash,
    Calendar,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
// import { getSchoolById } from '../../Api/schoolManagementAPI';
import { useEffect, useState } from 'react';

const ViewSchool = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchool = async () => {
            try {
                setLoading(true);
                // const data = await getSchoolById(id);

                // ── Mock data (remove when API is wired) ──────────────────────
                await new Promise(r => setTimeout(r, 700));
                const data = {
                    id: 1,
                    name: 'Delhi Public School',
                    code: 'SCH001',
                    board: 'CBSE',
                    establishedYear: 1972,
                    status: 'ACTIVE',
                    phone: '9876543210',
                    email: 'dps@school.in',
                    website: 'https://dpsschool.in',
                    principalName: 'Dr. R. Sharma',
                    address: '12, Sector 5, Near Bus Stand',
                    city: 'New Delhi',
                    state: 'Delhi',
                    pincode: '110001',
                    affiliationNumber: 'AFF-2023-001234',
                };

                setSchool({
                    id:                data.id,
                    name:              data.name              || 'N/A',
                    code:              data.code              || 'N/A',
                    board:             data.board             || 'N/A',
                    establishedYear:   data.establishedYear   || 'N/A',
                    status:            data.status            || 'N/A',
                    phone:             data.phone             || 'N/A',
                    email:             data.email             || 'N/A',
                    website:           data.website           || 'N/A',
                    principalName:     data.principalName     || 'N/A',
                    address:           data.address           || 'N/A',
                    city:              data.city              || 'N/A',
                    state:             data.state             || 'N/A',
                    pincode:           data.pincode           || 'N/A',
                    affiliationNumber: data.affiliationNumber || 'N/A',
                });
            } catch (err) {
                console.error('Failed to load school', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchSchool();
    }, [id]);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading School Details...</p>
            </div>
        );
    }

    if (!school) return null;

    // ── Reusable row ─────────────────────────────────────────────────────────
    const Row = ({ label, value }) => (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 border-b border-gray-50 last:border-0 gap-1 sm:gap-4">
            <span className="text-sm text-gray-500 font-medium shrink-0">{label}</span>
            <span className="text-sm text-gray-900 font-semibold text-left sm:text-right break-all">{value}</span>
        </div>
    );

    const statusColor = school.status === 'ACTIVE'
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700';

    const boardBadgeStyle = {
        CBSE:        'bg-blue-100 text-blue-700',
        ICSE:        'bg-purple-100 text-purple-700',
        STATE_BOARD: 'bg-yellow-100 text-yellow-700',
        IGCSE:       'bg-pink-100 text-pink-700',
        IB:          'bg-indigo-100 text-indigo-700',
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

                {/* ── Header ── */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">School Profile</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center cursor-pointer bg-gray-600 hover:bg-gray-800 active:scale-95 transition-all p-2 pr-3 rounded-xl text-white gap-1.5 text-sm font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to List</span>
                    </button>
                </div>

                {/* ── Hero Card ── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                            {school.name?.[0]?.toUpperCase() || 'S'}
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Name + status */}
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{school.name}</h2>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
                                    {school.status}
                                </span>
                            </div>

                            {/* Code + Board */}
                            <p className="text-sm text-gray-500 mb-3">
                                Code: <span className="font-medium text-gray-700">{school.code}</span>
                                &nbsp;·&nbsp;
                                Est. <span className="font-medium text-gray-700">{school.establishedYear}</span>
                            </p>

                            {/* Quick chips */}
                            <div className="flex flex-wrap gap-2 sm:gap-3 text-sm text-gray-600">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-xs ${boardBadgeStyle[school.board] || 'bg-gray-100 text-gray-700'}`}>
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {school.board.replace('_', ' ')}
                                </span>

                                {school.email !== 'N/A' && (
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                                        <span className="break-all">{school.email}</span>
                                    </span>
                                )}

                                {school.phone !== 'N/A' && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                                        {school.phone}
                                    </span>
                                )}

                                {school.city !== 'N/A' && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                        {school.city}, {school.state}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Basic Information</h3>
                        </div>
                        <div>
                            <Row label="School Name"      value={school.name} />
                            <Row label="School Code"      value={school.code} />

                            {/* Board — highlighted row */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 border-b border-gray-50 gap-1 sm:gap-4">
                                <span className="text-sm text-gray-500 font-medium shrink-0">Board</span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs ${boardBadgeStyle[school.board] || 'bg-gray-100 text-gray-700'}`}>
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {school.board.replace('_', ' ')}
                                </span>
                            </div>

                            <Row label="Established Year" value={school.establishedYear} />

                            {/* Status row */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 gap-1 sm:gap-4">
                                <span className="text-sm text-gray-500 font-medium">Status</span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${school.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    {school.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                <User className="w-4 h-4 text-green-600" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Contact Details</h3>
                        </div>
                        <div>
                            <Row label="Principal Name" value={school.principalName} />
                            <Row label="Phone Number"   value={school.phone} />
                            <Row label="Email Address"  value={school.email} />

                            {/* Website row */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 border-b border-gray-50 last:border-0 gap-1 sm:gap-4">
                                <span className="text-sm text-gray-500 font-medium shrink-0">Website</span>
                                {school.website !== 'N/A' ? (
                                    <a
                                        href={school.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1 text-right break-all"
                                    >
                                        <Globe className="w-3.5 h-3.5 shrink-0" />
                                        {school.website}
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-900 font-semibold">N/A</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-orange-500" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Address</h3>
                        </div>
                        <div>
                            <Row label="Street Address" value={school.address} />
                            <Row label="City"           value={school.city} />
                            <Row label="State"          value={school.state} />
                            <Row label="Pincode"        value={school.pincode} />

                            {/* Full address chip */}
                            <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                                <p className="text-xs font-semibold text-orange-700 mb-1 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> Full Address
                                </p>
                                <p className="text-sm text-orange-800 leading-relaxed">
                                    {school.address}, {school.city}, {school.state} — {school.pincode}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Accreditation */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Accreditation</h3>
                        </div>
                        <div>
                            <Row label="Affiliation Number" value={school.affiliationNumber} />
                        </div>

                        {/* Accreditation status card */}
                        <div className={`mt-4 relative rounded-xl p-4 border ${school.affiliationNumber !== 'N/A' ? 'border-indigo-200 bg-indigo-50' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${school.affiliationNumber !== 'N/A' ? 'bg-indigo-100' : 'bg-white'}`}>
                                    <ShieldCheck className={`w-5 h-5 ${school.affiliationNumber !== 'N/A' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">Affiliation Status</h4>
                                    <p className={`text-xs mt-0.5 font-medium ${school.affiliationNumber !== 'N/A' ? 'text-indigo-600' : 'text-gray-400'}`}>
                                        {school.affiliationNumber !== 'N/A' ? `Affiliated · ${school.affiliationNumber}` : 'Not Affiliated'}
                                    </p>
                                </div>
                            </div>
                            {school.affiliationNumber !== 'N/A' && (
                                <div className="absolute top-2.5 right-2.5">
                                    <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ViewSchool;