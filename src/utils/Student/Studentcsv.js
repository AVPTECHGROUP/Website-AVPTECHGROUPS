/**
 * Studentcsv.js - Fixed Single Source of Truth
 */

export const FIELD_DEFINITIONS = [
    { key: 'admissionNumber', label: 'Admission Number', target: 'root', type: 'string', required: true },
    { key: 'rollNumber', label: 'Roll Number', target: 'root', type: 'string' },
    { key: 'firstName', label: 'First Name', target: 'root', type: 'string', required: true },
    { key: 'lastName', label: 'Last Name', target: 'root', type: 'string', required: true },
    { key: 'sectionId', label: 'Section ID', target: 'root', type: 'number', required: true },
    { key: 'admissionDate', label: 'Admission Date', target: 'root', type: 'date', required: true },
    { key: 'academicYear', label: 'Academic Year', target: 'root', type: 'string', required: true },
    { key: 'status', label: 'Status', target: 'root', type: 'string', enum: ['ACTIVE', 'INACTIVE'], required: true },
    { key: 'gender', label: 'Gender', target: 'personalDetails', type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
    { key: 'dateOfBirth', label: 'Date of Birth', target: 'personalDetails', type: 'date' },
    { key: 'bloodGroup', label: 'Blood Group', target: 'root', type: 'string' },
    { key: 'previousSchool', label: 'Previous School', target: 'root', type: 'string' },
    { key: 'category', label: 'Category', target: 'root', type: 'enum_upper' },
    { key: 'religion', label: 'Religion', target: 'root', type: 'enum_upper' },

    // Contact
    { key: 'mobile', label: 'Mobile', target: 'personalDetails', type: 'string' },
    { key: 'whatsappNumber', label: 'WhatsApp Number', target: 'root', type: 'string' },
    { key: 'email', label: 'Email', target: 'personalDetails', type: 'email' },
    { key: 'address', label: 'Contact Address', target: 'personalDetails', type: 'string' },
    { key: 'emergencyContact', label: 'Emergency Contact', target: 'personalDetails', type: 'string' },
    { key: 'emergencyContactName', label: 'Emergency Contact Name', target: 'personalDetails', type: 'string' },
    { key: 'emergencyContactRelation', label: 'Emergency Contact Relation', target: 'personalDetails', type: 'string' },

    // Address
    { key: 'currentAddress', label: 'Current Address', target: 'root', type: 'string' },
    { key: 'permanentAddress', label: 'Permanent Address', target: 'root', type: 'string' },

    // Student Info
    { key: 'transportRequired', label: 'Transport Required', target: 'root', type: 'boolean' },
    { key: 'hostelRequired', label: 'Hostel Required', target: 'root', type: 'boolean' },
    { key: 'hostelRoomDescription', label: 'Hostel Room Description', target: 'root', type: 'string' },
    { key: 'studentHouse', label: 'Student House', target: 'root', type: 'string' },
    { key: 'height', label: 'Height', target: 'root', type: 'string' },
    { key: 'weight', label: 'Weight', target: 'root', type: 'number' },
    { key: 'heightWeightDate', label: 'Height Weight Date', target: 'root', type: 'date' },
    { key: 'srNumber', label: 'SR Number', target: 'root', type: 'string' },

    // IDs
    { key: 'aadhaarNumber', label: 'Aadhaar Number', target: 'root', type: 'string' },
    { key: 'abcId', label: 'ABC ID', target: 'root', type: 'string' },
    { key: 'aparId', label: 'APAAR ID', target: 'root', type: 'string' },
    { key: 'penNumber', label: 'PEN Number', target: 'root', type: 'string' },
    { key: 'ssmId', label: 'SSM ID', target: 'root', type: 'string' },
    { key: 'familyId', label: 'Family ID', target: 'root', type: 'string' },
    { key: 'udiseCode', label: 'UDISE Code', target: 'root', type: 'string' },

    // Mediums
    { key: 'mediumHindi', label: 'Medium Hindi', target: 'root', type: 'boolean' },
    { key: 'mediumEnglish', label: 'Medium English', target: 'root', type: 'boolean' },
    { key: 'mediumMaths', label: 'Medium Maths', target: 'root', type: 'boolean' },

    // Parents
    { key: 'fatherName', label: 'Father Name', target: 'root', type: 'string' },
    { key: 'fatherOccupation', label: 'Father Occupation', target: 'root', type: 'string' },
    { key: 'fatherPhone', label: 'Father Phone', target: 'root', type: 'string' },
    { key: 'fatherEmail', label: 'Father Email', target: 'root', type: 'email' },
    { key: 'fatherAadhaar', label: 'Father Aadhaar', target: 'root', type: 'string' },
    { key: 'fatherNote', label: 'Father Note', target: 'root', type: 'string' },

    { key: 'motherName', label: 'Mother Name', target: 'root', type: 'string' },
    { key: 'motherOccupation', label: 'Mother Occupation', target: 'root', type: 'string' },
    { key: 'motherPhone', label: 'Mother Phone', target: 'root', type: 'string' },
    { key: 'motherEmail', label: 'Mother Email', target: 'root', type: 'email' },
    { key: 'motherAadhaar', label: 'Mother Aadhaar', target: 'root', type: 'string' },
    { key: 'motherNote', label: 'Mother Note', target: 'root', type: 'string' },

    { key: 'guardianName', label: 'Guardian Name', target: 'root', type: 'string' },
    { key: 'guardianRelation', label: 'Guardian Relation', target: 'root', type: 'string' },
    { key: 'guardianPhone', label: 'Guardian Phone', target: 'root', type: 'string' },
    { key: 'guardianEmail', label: 'Guardian Email', target: 'root', type: 'email' },
    { key: 'guardianAddress', label: 'Guardian Address', target: 'root', type: 'string' },
    { key: 'guardianOccupation', label: 'Guardian Occupation', target: 'root', type: 'string' },
    { key: 'guardianNote', label: 'Guardian Note', target: 'root', type: 'string' },

    // Bank
    { key: 'bankAccountNumber', label: 'Bank Account Number', target: 'root', type: 'string' },
    { key: 'bankName', label: 'Bank Name', target: 'root', type: 'string' },
    { key: 'bankIfscCode', label: 'Bank IFSC Code', target: 'root', type: 'string' },

    // Misc
    { key: 'miscNote', label: 'Misc Note', target: 'root', type: 'string' },
    { key: 'remarks', label: 'Remarks', target: 'root', type: 'string' },
];

export const TEMPLATE_HEADERS = FIELD_DEFINITIONS.map((f) => f.label);

export const EXAMPLE_ROW = FIELD_DEFINITIONS.map((f) => {
    switch (f.key) {
        case 'admissionNumber': return 'S107001';
        case 'rollNumber': return '1';
        case 'firstName': return 'Aarav';
        case 'lastName': return 'Sharma';
        case 'sectionId': return '107';
        case 'admissionDate': return '2026-04-01';
        case 'academicYear': return '2026-2027';
        case 'status': return 'ACTIVE';
        case 'gender': return 'MALE';
        case 'dateOfBirth': return '2015-05-14';
        case 'category': return 'GENERAL';
        case 'religion': return 'HINDU';
        case 'mobile': return '9000000001';
        case 'transportRequired': return 'No';
        case 'hostelRequired': return 'No';
        case 'mediumHindi': return 'Yes';
        case 'mediumEnglish': return 'Yes';
        case 'mediumMaths': return 'Yes';
        default: return '';
    }
});

export function parseCsvText(rawText) {
    if (!rawText) return { headers: [], rows: [] };
    const text = rawText.charCodeAt(0) === 0xfeff ? rawText.slice(1) : rawText;
    const rows = [];
    let field = '';
    let row = [];
    let inQuotes = false;
    let i = 0;
    const len = text.length;

    while (i < len) {
        const char = text[i];
        if (inQuotes) {
            if (char === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i += 2;
                    continue;
                }
                inQuotes = false;
                i += 1;
                continue;
            }
            field += char;
            i += 1;
            continue;
        }

        if (char === '"') { inQuotes = true; i += 1; continue; }
        if (char === ',') { row.push(field); field = ''; i += 1; continue; }
        if (char === '\r') {
            if (text[i + 1] === '\n') i += 1;
            row.push(field); field = ''; rows.push(row); row = []; i += 1; continue;
        }
        if (char === '\n') {
            row.push(field); field = ''; rows.push(row); row = []; i += 1; continue;
        }
        field += char;
        i += 1;
    }
    if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

    const cleanedRows = rows.filter((r) => r.length > 0 && !(r.length === 1 && r[0].trim() === ''));
    if (cleanedRows.length === 0) return { headers: [], rows: [] };

    const headers = cleanedRows[0].map((h) => h.trim());
    return { headers, rows: cleanedRows.slice(1) };
}

const normalizeHeaderStr = (str) =>
    String(str || '')
        .toLowerCase()
        .replace(/\(.*?\)/g, '')
        .replace(/[^a-z0-9]/g, '');

export function buildHeaderIndex(headers) {
    const index = {};
    const normalizedHeaders = headers.map(normalizeHeaderStr);

    FIELD_DEFINITIONS.forEach((def) => {
        let colIdx = normalizedHeaders.indexOf(normalizeHeaderStr(def.label));
        if (colIdx === -1) {
            colIdx = normalizedHeaders.indexOf(normalizeHeaderStr(def.key));
        }
        index[def.key] = colIdx;
    });
    return index;
}

export function findMissingRequiredHeaders(headers) {
    const index = buildHeaderIndex(headers);
    return FIELD_DEFINITIONS.filter((def) => def.required && index[def.key] === -1).map((def) => def.label);
}

const TRUE_VALUES = new Set(['true', 'yes', 'y', '1']);
const FALSE_VALUES = new Set(['false', 'no', 'n', '0']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseBoolean(raw) {
    if (raw === null || raw === undefined) return { ok: true, value: false };
    const v = String(raw).trim().toLowerCase();
    if (v === '') return { ok: true, value: false };
    if (TRUE_VALUES.has(v)) return { ok: true, value: true };
    if (FALSE_VALUES.has(v)) return { ok: true, value: false };
    return { ok: false, value: false };
}

export function parseNumberField(raw) {
    if (raw === null || raw === undefined) return { ok: true, value: undefined };
    const v = String(raw).trim();
    if (v === '') return { ok: true, value: undefined };
    const cleaned = v.replace(/[^0-9.-]/g, '');
    if (cleaned === '' || Number.isNaN(Number(cleaned))) return { ok: false, value: undefined };
    return { ok: true, value: Number(cleaned) };
}

export function isValidDate(raw) {
    if (!raw) return true;
    const v = String(raw).trim();
    if (!v) return true;
    return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v).getTime());
}

export function mapCsvRowToStudentPayload(rawRowValues, headerIndex, sectionIdSet) {
    const errors = [];
    const payload = { personalDetails: {} };

    const get = (key) => {
        const idx = headerIndex[key];
        if (idx === undefined || idx === -1) return '';
        const val = rawRowValues[idx];
        return val === undefined ? '' : String(val).trim();
    };

    FIELD_DEFINITIONS.forEach((def) => {
        const raw = get(def.key);
        if (def.required && raw === '') {
            errors.push(`${def.label} is required`);
            return;
        }
        if (raw === '') return;

        let finalValue = raw;

        if (def.type === 'number') {
            const { ok, value } = parseNumberField(raw);
            if (!ok) { errors.push(`${def.label} must be a number`); return; }
            finalValue = value;
        } else if (def.type === 'boolean') {
            const { ok, value } = parseBoolean(raw);
            if (!ok) { errors.push(`${def.label} must be Yes or No`); return; }
            finalValue = value;
        } else if (def.type === 'date') {
            if (!isValidDate(raw)) { errors.push(`${def.label} must be in YYYY-MM-DD format`); return; }
            finalValue = raw;
        } else if (def.type === 'email') {
            if (!EMAIL_RE.test(raw)) { errors.push(`${def.label} is not a valid email`); return; }
            finalValue = raw;
        } else if (def.type === 'enum_upper' || def.enum) {
            const upper = raw.toUpperCase();
            if (def.enum && !def.enum.includes(upper)) {
                errors.push(`${def.label} must be one of: ${def.enum.join(', ')}`);
                return;
            }
            finalValue = upper;
        }

        if (def.target === 'personalDetails') {
            payload.personalDetails[def.key] = finalValue;
        } else {
            payload[def.key] = finalValue;
        }
    });

    // 1. Mandatory personalDetails.fullName for Swagger schema
    const fName = payload.firstName || get('firstName');
    const lName = payload.lastName || get('lastName');
    if (fName) {
        payload.personalDetails.fullName = `${fName} ${lName || ''}`.trim();
    }

    // 2. Force Category & Religion to UPPERCASE to prevent Jackson Enum crash
    if (payload.category) {
        payload.category = payload.category.trim().toUpperCase();
    }
    if (payload.religion) {
        payload.religion = payload.religion.trim().toUpperCase();
    }

    // 3. Normalize Student House (e.g. "Blue" -> "Blue House")
    if (payload.studentHouse) {
        const h = payload.studentHouse.trim();
        payload.studentHouse = h.toLowerCase().endsWith('house') ? h : `${h} House`;
    }

    // 4. Fallback addresses
    if (!payload.personalDetails.address && payload.currentAddress) {
        payload.personalDetails.address = payload.currentAddress;
    }
    if (!payload.currentAddress && payload.personalDetails.address) {
        payload.currentAddress = payload.personalDetails.address;
    }
    if (!payload.permanentAddress && payload.currentAddress) {
        payload.permanentAddress = payload.currentAddress;
    }

    // 5. Safe Booleans defaults
    ['transportRequired', 'hostelRequired', 'mediumHindi', 'mediumEnglish', 'mediumMaths'].forEach((k) => {
        if (payload[k] === undefined) payload[k] = false;
    });

    if (payload.sectionId !== undefined && sectionIdSet && sectionIdSet.size > 0 && !sectionIdSet.has(Number(payload.sectionId))) {
        errors.push(`Section ID ${payload.sectionId} does not match any known class/section`);
    }

    return {
        payload,
        errors,
        admissionNumber: get('admissionNumber'),
        displayName: `${fName} ${lName}`.trim(),
        sectionId: get('sectionId'),
    };
}

export function validateCsvRows(headers, dataRows, sectionIdSet) {
    const headerIndex = buildHeaderIndex(headers);
    const admissionCounts = new Map();

    dataRows.forEach((r) => {
        const idx = headerIndex.admissionNumber;
        const val = idx !== -1 ? String(r[idx] ?? '').trim() : '';
        if (val) admissionCounts.set(val, (admissionCounts.get(val) || 0) + 1);
    });

    const rows = dataRows.map((rawRowValues, i) => {
        const mapped = mapCsvRowToStudentPayload(rawRowValues, headerIndex, sectionIdSet);
        const rowErrors = [...mapped.errors];

        if (mapped.admissionNumber && admissionCounts.get(mapped.admissionNumber) > 1) {
            rowErrors.push(`Duplicate admission number "${mapped.admissionNumber}" in this file`);
        }

        return {
            rowNumber: i + 2,
            admissionNumber: mapped.admissionNumber,
            displayName: mapped.displayName,
            sectionId: mapped.sectionId,
            errors: rowErrors,
            payload: mapped.payload,
            isValid: rowErrors.length === 0,
        };
    });

    const validCount = rows.filter((r) => r.isValid).length;
    return { rows, validCount, invalidCount: rows.length - validCount };
}

function csvEscape(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
}

export function toCsvString(headers, rows) {
    const headerLine = headers.map(csvEscape).join(',');
    const dataLines = rows.map((r) => r.map(csvEscape).join(','));
    return [headerLine, ...dataLines].join('\r\n');
}

export function downloadCsv(filename, csvString) {
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

export function generateTemplateCsv() {
    return toCsvString(TEMPLATE_HEADERS, [EXAMPLE_ROW]);
}

export function buildFailedRowsCsv(headers, dataRows, failedRowInfos) {
    const outHeaders = [...headers, 'Import Error'];
    const outRows = failedRowInfos.map((info) => {
        const original = dataRows[info.rowNumber - 2] || [];
        const padded = headers.map((_, i) => original[i] ?? '');
        return [...padded, info.reason];
    });
    return toCsvString(outHeaders, outRows);
}