import React, { useEffect, useState } from 'react';
import {
  User, Mail, Phone, ChevronLeft, Users, Home, Bus, BookOpen,
  ShieldCheck, Building2, CreditCard, FileText, Award, Calendar,
  Heart, MapPin, Hash, Sparkles, ExternalLink, School, MessageSquare,
  Shield, Clock
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudentById, getStudentDocuments } from '../../Api/Students/StudentsApi';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // // Secure Aadhaar Masking Helper
  // const maskAadhaar = (val) => {
  //   if (!val || val === 'N/A') return 'N/A';
  //   const str = String(val).replace(/\s+/g, '');
  //   if (str.length === 12) {
  //     return `•••• •••• ${str.slice(-4)}`;
  //   }
  //   return str;
  // };

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        const data = await getStudentById(id);

        let docsList = data?.documents || [];
        if (!docsList.length) {
          try {
            docsList = await getStudentDocuments(id);
          } catch (e) {
            console.warn("Could not fetch extra documents", e);
          }
        }
        setDocuments(docsList);

        const pd = data?.personalDetails || {};

        setStudent({
          id: data?.id,
          admissionNumber: data?.admissionNumber || 'N/A',
          rollNumber: data?.rollNumber || 'N/A',
          fullName: data?.fullName || `${data?.firstName || ''} ${data?.lastName || ''}`.trim() || 'N/A',
          firstName: data?.firstName || 'N/A',
          lastName: data?.lastName || 'N/A',

          // Personal
          email: pd.email || data?.fatherEmail || 'N/A',
          mobile: pd.mobile || data?.fatherPhone || 'N/A',
          whatsappNumber: data?.whatsappNumber || pd.mobile || 'N/A',
          gender: pd.gender || 'N/A',
          dob: pd.dateOfBirth || 'N/A',
          address: data?.currentAddress || pd.address || 'N/A',
          permanentAddress: data?.permanentAddress || 'N/A',
          bloodGroup: data?.bloodGroup || 'N/A',
          category: data?.category || 'N/A',
          religion: data?.religion || 'N/A',
          profileImageUrl: data?.profileImageUrl || null,
          studentHouse: data?.studentHouse || 'N/A',

          // Academic
          admissionDate: data?.admissionDate || 'N/A',
          academicYear: data?.academicYear || 'N/A',
          status: data?.status || 'ACTIVE',
          className: data?.className || 'N/A',
          sectionName: data?.sectionName || 'N/A',
          previousSchool: data?.previousSchool || 'N/A',

          // Gov / Identity IDs
          aadhaarNumber: data?.aadhaarNumber || 'N/A',
          aparId: data?.aparId || 'N/A',
          penNumber: data?.penNumber || 'N/A',
          familyId: data?.familyId || 'N/A',
          ssmId: data?.ssmId || 'N/A',
          abcId: data?.abcId || 'N/A',

          // Family
          fatherName: data?.fatherName || 'N/A',
          fatherPhone: data?.fatherPhone || 'N/A',
          fatherEmail: data?.fatherEmail || 'N/A',
          fatherOccupation: data?.fatherOccupation || 'N/A',
          fatherAadhaar: data?.fatherAadhaar || 'N/A',
          fatherPhotoUrl: data?.fatherPhotoUrl || null,

          motherName: data?.motherName || 'N/A',
          motherPhone: data?.motherPhone || 'N/A',
          motherEmail: data?.motherEmail || 'N/A',
          motherOccupation: data?.motherOccupation || 'N/A',
          motherAadhaar: data?.motherAadhaar || 'N/A',
          motherPhotoUrl: data?.motherPhotoUrl || null,

          guardianName: data?.guardianName || 'N/A',
          guardianPhone: data?.guardianPhone || 'N/A',
          guardianRelation: data?.guardianRelation || 'N/A',
          guardianAddress: data?.guardianAddress || 'N/A',
          guardianPhotoUrl: data?.guardianPhotoUrl || null,
          emergencyContact: pd.emergencyContact || data?.guardianPhone || 'N/A',

          // Facilities & Banking
          hostelRequired: Boolean(data?.hostelRequired),
          hostelRoomDescription: data?.hostelRoomDescription || 'N/A',
          transportRequired: Boolean(data?.transportRequired),
          bankName: data?.bankName || 'N/A',
          bankAccountNumber: data?.bankAccountNumber || 'N/A',
          bankIfscCode: data?.bankIfscCode || 'N/A',

          // Metadata
          createdBy: data?.createdBy || 'N/A',
          updatedBy: data?.updatedBy || 'N/A',
          createdAt: data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A',
          updatedAt: data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : 'N/A',
          remarks: data?.remarks || null,
        });
      } catch (err) {
        console.error('Failed to load student details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStudentDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading Student Dashboard...</p>
      </div>
    );
  }

  if (!student) return null;

  const DetailItem = ({ icon: Icon, label, value, highlight = false, badge = false }) => (
    <div className="flex items-start justify-between py-2.5 border-b border-slate-100 last:border-0 gap-3">
      <div className="flex items-center gap-2 text-slate-500 shrink-0">
        {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      {badge ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
          {value}
        </span>
      ) : (
        <span className={`text-xs font-semibold text-right break-all ${highlight ? 'text-blue-600 font-bold' : 'text-slate-800'}`}>
          {value}
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                Student Profile Details
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● {student.status}
                </span>
              </h1>
             </div>
          </div>
        
        </div>

        {/* ── Hero Profile Banner ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-800 flex items-center justify-center">
                {student.profileImageUrl ? (
                  <img src={student.profileImageUrl} alt={student.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-blue-300">{student.fullName[0]}</span>
                )}
              </div>
              <span className="absolute -bottom-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500 text-white shadow-md">
                {student.category}
              </span>
            </div>

            {/* Core Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{student.fullName}</h2>
                {student.studentHouse !== 'N/A' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    🏠 {student.studentHouse}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-300 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span>Admission No: <strong className="text-white font-mono">{student.admissionNumber}</strong></span>
                <span>•</span>
                <span>Roll No: <strong className="text-white font-mono">{student.rollNumber}</strong></span>
                <span>•</span>
                <span>Academic Year: <strong className="text-white">{student.academicYear}</strong></span>
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  Class: {student.className} ({student.sectionName})
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Blood Group: {student.bloodGroup}
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {student.mobile}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Balanced 2-Column Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Left Column */}
          <div className="space-y-6">
            {/* 1. Personal Profile */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-blue-600 font-bold text-sm">
                <User className="w-4 h-4" /> Personal Profile
              </div>
              <DetailItem icon={User} label="Full Name" value={student.fullName} />
              <DetailItem icon={User} label="Gender" value={student.gender} />
              <DetailItem icon={Calendar} label="Date of Birth" value={student.dob} />
              <DetailItem icon={Heart} label="Blood Group" value={student.bloodGroup} />
              <DetailItem icon={Award} label="Category" value={student.category} />
              <DetailItem icon={Sparkles} label="Religion" value={student.religion} />
              <DetailItem icon={Phone} label="Mobile Number" value={student.mobile} />
              <DetailItem icon={MessageSquare} label="WhatsApp" value={student.whatsappNumber} />
              <DetailItem icon={Mail} label="Email Address" value={student.email} />
              <DetailItem icon={MapPin} label="Residential Address" value={student.address} />
            </div>

            {/* 2. Facilities & Accommodation */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-blue-600 font-bold text-sm">
                <Home className="w-4 h-4" /> Facilities & Accommodation
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-slate-700">Hostel Room</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${student.hostelRequired ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {student.hostelRequired ? student.hostelRoomDescription : 'Not Availed'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-slate-700">Transport</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${student.transportRequired ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>
                    {student.transportRequired ? 'Required' : 'Not Required'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Bank Account Details */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
              <div className="flex items-center gap-2 pb-3 mb-2 border-b border-slate-100 text-blue-600 font-bold text-sm">
                <CreditCard className="w-4 h-4" /> Bank Account Details
              </div>
              <DetailItem icon={Building2} label="Bank Name" value={student.bankName} />
              <DetailItem icon={CreditCard} label="Account Number" value={student.bankAccountNumber} />
              <DetailItem icon={Hash} label="IFSC Code" value={student.bankIfscCode} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* 1. Parent & Guardian Information */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <Users className="w-4 h-4" /> Parent & Guardian Information
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Verified Photos</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Father Card */}
                <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-xl flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                    {student.fatherPhotoUrl ? (
                      <img src={student.fatherPhotoUrl} alt="Father" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-[10px]">Father</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">Father</span>
                    <h3 className="text-xs font-bold text-slate-900 truncate">{student.fatherName}</h3>
                    <p className="text-[11px] text-slate-500 truncate">{student.fatherOccupation}</p>
                    <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {student.fatherPhone}
                    </p>
                  </div>
                </div>

                {/* Mother Card */}
                <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-xl flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                    {student.motherPhotoUrl ? (
                      <img src={student.motherPhotoUrl} alt="Mother" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-[10px]">Mother</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">Mother</span>
                    <h3 className="text-xs font-bold text-slate-900 truncate">{student.motherName}</h3>
                    <p className="text-[11px] text-slate-500 truncate">{student.motherOccupation}</p>
                    <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {student.motherPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guardian Info if exists */}
              {student.guardianName !== 'N/A' && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Guardian: <strong>{student.guardianName}</strong> ({student.guardianRelation})</span>
                  <span>Phone: <strong>{student.guardianPhone}</strong></span>
                </div>
              )}
            </div>

            {/* 2. Government & National Identifiers */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-blue-600 font-bold text-sm">
                <Shield className="w-4 h-4" /> Government & National Identifiers
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <DetailItem icon={ShieldCheck} label="Student Aadhaar" value={(student.aadhaarNumber)} highlight />
                <DetailItem icon={Hash} label="APAR ID" value={student.aparId} />
                <DetailItem icon={Hash} label="PEN Number" value={student.penNumber} />
                <DetailItem icon={Hash} label="Family ID" value={student.familyId} />
                <DetailItem icon={Hash} label="SSM ID" value={student.ssmId} />
                <DetailItem icon={Award} label="ABC ID" value={student.abcId} />
              </div>
            </div>

            {/* 3. Academic Records */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-blue-600 font-bold text-sm">
                <School className="w-4 h-4" /> Academic Records
              </div>
              <DetailItem icon={Hash} label="Admission No" value={student.admissionNumber} highlight />
              <DetailItem icon={Hash} label="Roll Number" value={student.rollNumber} />
              <DetailItem icon={BookOpen} label="Class & Section" value={`${student.className} - Section ${student.sectionName}`} badge />
              <DetailItem icon={Calendar} label="Admission Date" value={student.admissionDate} />
              <DetailItem icon={Calendar} label="Academic Session" value={student.academicYear} />
              <DetailItem icon={Building2} label="Previous School" value={student.previousSchool} highlight />
              <DetailItem icon={Home} label="House" value={student.studentHouse} />
            </div>
          </div>

        </div>

        {/* ── Full Width: Attached Documents & Certificates ── */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <FileText className="w-4 h-4" /> Attached Documents & Certificates
            </div>
            <span className="text-xs text-slate-400">{documents.length} File(s) Uploaded</span>
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <a
                  key={doc.id || doc.docType}
                  href={doc.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {doc.docType?.replace(/_/g, ' ')}
                      </p>
                      <p className="text-[10px] text-slate-400">Click to preview document</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No uploaded documents attached to this record.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;