import { useRef, useState } from 'react';
import {
    X,
    Download,
    UploadCloud,
    FileSpreadsheet,
    Trash2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Loader2,
    RotateCcw,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { createStudentsBulk } from '../Api/Students/StudentsApi';

import {
    parseCsvText,
    findMissingRequiredHeaders,
    validateCsvRows,
    generateTemplateCsv,
    downloadCsv,
    buildFailedRowsCsv,
} from '../utils/Student/Studentcsv';

const MAX_FILE_SIZE_MB = 10;

const BulkStudentImport = ({ isOpen, onClose, groupedSections = [], onImportComplete }) => {
    const [step, setStep] = useState('upload');
    const [fileName, setFileName] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [parsedHeaders, setParsedHeaders] = useState([]);
    const [parsedRows, setParsedRows] = useState([]);
    const [validationRows, setValidationRows] = useState([]);
    const [importResult, setImportResult] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const sectionIdSet = new Set(
        groupedSections.flatMap((grp) => grp.sections.map((s) => Number(s.id)))
    );

    const resetState = () => {
        setStep('upload');
        setFileName('');
        setParsedHeaders([]);
        setParsedRows([]);
        setValidationRows([]);
        setImportResult(null);
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClose = () => {
        if (isImporting) return;
        resetState();
        onClose();
    };

    const handleDownloadTemplate = () => {
        try {
            downloadCsv('Student_Import_Template.csv', generateTemplateCsv());
        } catch {
            toast.error('Failed to generate template file.');
        }
    };

    const handleFilePick = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            toast.error('Only .csv files are supported.');
            e.target.value = '';
            return;
        }
        if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
            toast.error(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
            e.target.value = '';
            return;
        }

        setFileName(file.name);
        setLoadingMessage('Reading CSV...');

        try {
            const text = await file.text();

            if (!text || !text.trim()) {
                toast.error('The CSV file is empty.');
                setLoadingMessage('');
                return;
            }

            await new Promise((res) => setTimeout(res, 50));
            setLoadingMessage('Validating students...');

            const { headers, rows } = parseCsvText(text);

            if (headers.length === 0) {
                toast.error('The CSV file is empty.');
                setLoadingMessage('');
                return;
            }

            const missing = findMissingRequiredHeaders(headers);
            if (missing.length > 0) {
                toast.error(`Missing required column(s): ${missing.join(', ')}`);
                setLoadingMessage('');
                return;
            }

            if (rows.length === 0) {
                toast.error('The CSV file has headers but no student rows.');
                setLoadingMessage('');
                return;
            }

            await new Promise((res) => setTimeout(res, 50));

            const result = validateCsvRows(headers, rows, sectionIdSet);

            setParsedHeaders(headers);
            setParsedRows(rows);
            setValidationRows(result.rows);
            setLoadingMessage('');
            setStep('preview');
        } catch (err) {
            console.error('CSV parse error:', err.message);
            toast.error('Could not read this CSV file. Please check the format and try again.');
            setLoadingMessage('');
        }
    };

    const handleConfirmImport = async () => {
        const validRows = validationRows.filter((r) => r.isValid);
        if (validRows.length === 0) {
            toast.error('There are no valid rows to import.');
            return;
        }

        setIsImporting(true);
        setStep('importing');
        setLoadingMessage('Importing students into server...');

        try {
            const payloads = validRows.map((r) => r.payload);

            const response = await createStudentsBulk(payloads);
            let data = response?.data || response;

            if (Array.isArray(data)) {
                data = {
                    totalRequested: payloads.length,
                    totalCreated: data.length,
                    totalFailed: 0,
                    created: data,
                    failed: [],
                };
            }

            setImportResult(data);
            setStep('results');

            const created = data?.totalCreated ?? (data?.created?.length || 0);
            const failed = data?.totalFailed ?? (data?.failed?.length || 0);

            if (failed === 0) {
                toast.success(`Successfully imported ${created} student(s).`);
            } else {
                toast.warning(`Imported ${created} student(s), ${failed} failed.`);
            }

            onImportComplete?.();
        } catch (err) {
            const message = err?.message || '';
            toast.error(message || 'Failed to import students. Please try again.');
            setStep('preview');
        } finally {
            setIsImporting(false);
            setLoadingMessage('');
        }
    };

    const handleDownloadFailedRows = () => {
        if (!importResult?.failed?.length) return;
        try {
            const validRows = validationRows.filter((r) => r.isValid);
            const failedInfos = importResult.failed.map((f) => {
                const originalRow = validRows[f.index];
                return {
                    rowNumber: originalRow ? originalRow.rowNumber : f.index + 2,
                    reason: f.reason || 'Import failed',
                };
            });
            const csv = buildFailedRowsCsv(parsedHeaders, parsedRows, failedInfos);
            downloadCsv('Failed_Student_Imports.csv', csv);
        } catch {
            toast.error('Failed to generate the failed-rows file.');
        }
    };

    const validCount = validationRows.filter((r) => r.isValid).length;
    const invalidCount = validationRows.length - validCount;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

            <div className="relative bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="w-4.5 h-4.5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Import Students</h3>
                            <p className="text-xs text-gray-400">Bulk upload student records via CSV</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isImporting}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all disabled:opacity-40 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {step === 'upload' && (
                        <div className="flex flex-col gap-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                <p className="text-xs font-semibold text-blue-900 mb-2">Instructions</p>
                                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                                    <li>Download the template CSV file.</li>
                                    <li>Enter your students' data. Required: <strong>Admission Number, First Name, Last Name, Section ID, Admission Date, Academic Year</strong>.</li>
                                    <li>Upload the CSV and inspect validation results.</li>
                                </ol>
                            </div>

                            <button
                                onClick={handleDownloadTemplate}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer shadow-sm w-fit"
                            >
                                <Download className="w-4 h-4 text-gray-500" />
                                Download CSV Template
                            </button>

                            {groupedSections.length > 0 && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <p className="text-xs font-semibold text-gray-700 px-3 py-2 bg-gray-50 border-b border-gray-100">
                                        Section ID Reference
                                    </p>
                                    <div className="max-h-32 overflow-y-auto">
                                        <table className="w-full text-xs">
                                            <tbody>
                                                {groupedSections.flatMap((grp) =>
                                                    grp.sections.map((sec) => (
                                                        <tr key={sec.id} className="border-b border-gray-50 last:border-0">
                                                            <td className="px-3 py-1.5 text-gray-500">{grp.className}</td>
                                                            <td className="px-3 py-1.5 text-gray-500">{sec.name}</td>
                                                            <td className="px-3 py-1.5 text-gray-700 font-medium">ID: {sec.id}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {!loadingMessage ? (
                                    <button
                                        onClick={handleFilePick}
                                        className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer"
                                    >
                                        <UploadCloud className="w-7 h-7 text-gray-400" />
                                        <span className="text-xs font-semibold text-gray-600">Click to select a CSV file</span>
                                        <span className="text-[11px] text-gray-400">.csv only, up to {MAX_FILE_SIZE_MB}MB</span>
                                    </button>
                                ) : (
                                    <div className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40">
                                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                        <span className="text-xs font-semibold text-blue-700">{loadingMessage}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileSpreadsheet className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="text-xs text-gray-600 truncate">{fileName}</span>
                                </div>
                                <button
                                    onClick={resetState}
                                    className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2.5">
                                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-center">
                                    <p className="text-lg font-bold text-gray-900">{validationRows.length}</p>
                                    <p className="text-[11px] text-gray-500">Total Rows</p>
                                </div>
                                <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2.5 text-center">
                                    <p className="text-lg font-bold text-green-700">{validCount}</p>
                                    <p className="text-[11px] text-green-600">Valid Rows</p>
                                </div>
                                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 text-center">
                                    <p className="text-lg font-bold text-red-700">{invalidCount}</p>
                                    <p className="text-[11px] text-red-600">Invalid Rows</p>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="max-h-64 overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-2.5 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Row</th>
                                                <th className="px-2.5 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Admission No</th>
                                                <th className="px-2.5 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Name</th>
                                                <th className="px-2.5 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Section ID</th>
                                                <th className="px-2.5 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {validationRows.map((r) => (
                                                <tr key={r.rowNumber} className={r.isValid ? '' : 'bg-red-50/40'}>
                                                    <td className="px-2.5 py-2 text-gray-500">{r.rowNumber}</td>
                                                    <td className="px-2.5 py-2 text-gray-700 font-medium">{r.admissionNumber || '—'}</td>
                                                    <td className="px-2.5 py-2 text-gray-700">{r.displayName || '—'}</td>
                                                    <td className="px-2.5 py-2 text-gray-500">{r.sectionId || '—'}</td>
                                                    <td className="px-2.5 py-2">
                                                        {r.isValid ? (
                                                            <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-start gap-1 text-red-700">
                                                                <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                                <span>{r.errors.join('; ')}</span>
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'importing' && (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-sm font-semibold text-gray-700">{loadingMessage || 'Importing...'}</p>
                            <p className="text-xs text-gray-400">Please do not close this window</p>
                        </div>
                    )}

                    {step === 'results' && importResult && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-3 gap-2.5">
                                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-center">
                                    <p className="text-lg font-bold text-gray-900">{importResult.totalRequested ?? 0}</p>
                                    <p className="text-[11px] text-gray-500">Total Requested</p>
                                </div>
                                <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2.5 text-center">
                                    <p className="text-lg font-bold text-green-700">{importResult.totalCreated ?? 0}</p>
                                    <p className="text-[11px] text-green-600">Created</p>
                                </div>
                                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 text-center">
                                    <p className="text-lg font-bold text-red-700">{importResult.totalFailed ?? 0}</p>
                                    <p className="text-[11px] text-red-600">Failed</p>
                                </div>
                            </div>

                            {importResult.created?.length > 0 && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <p className="text-xs font-semibold text-gray-700 px-3 py-2 bg-gray-50 border-b border-gray-100">
                                        Successfully Created ({importResult.created.length})
                                    </p>
                                    <div className="max-h-40 overflow-y-auto">
                                        <table className="w-full text-xs">
                                            <tbody className="divide-y divide-gray-50">
                                                {importResult.created.map((stu) => (
                                                    <tr key={stu.id ?? stu.admissionNumber}>
                                                        <td className="px-3 py-1.5 text-gray-700 font-medium">{stu.admissionNumber}</td>
                                                        <td className="px-3 py-1.5 text-gray-700">{stu.fullName || `${stu.firstName || ''} ${stu.lastName || ''}`.trim()}</td>
                                                        <td className="px-3 py-1.5 text-gray-500">{stu.className || '—'}</td>
                                                        <td className="px-3 py-1.5 text-gray-500">{stu.sectionName || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {importResult.failed?.length > 0 && (
                                <div className="border border-red-100 rounded-lg overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-2 bg-red-50 border-b border-red-100">
                                        <p className="text-xs font-semibold text-red-700">Failed Records</p>
                                        <button
                                            onClick={handleDownloadFailedRows}
                                            className="flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-800 cursor-pointer"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Download Failed Rows
                                        </button>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto">
                                        <table className="w-full text-xs">
                                            <tbody className="divide-y divide-gray-50">
                                                {importResult.failed.map((f, i) => (
                                                    <tr key={`${f.admissionNumber}-${i}`}>
                                                        <td className="px-3 py-1.5 text-gray-700 whitespace-nowrap">{f.admissionNumber || '—'}</td>
                                                        <td className="px-3 py-1.5 text-red-600">{f.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-100 shrink-0">
                    {step === 'upload' && (
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 rounded-lg font-semibold text-xs text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                    )}

                    {step === 'preview' && (
                        <>
                            <button
                                onClick={resetState}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Re-upload
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                disabled={validCount === 0}
                                className="px-4 py-2 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                            >
                                Import {validCount} Student{validCount === 1 ? '' : 's'}
                            </button>
                        </>
                    )}

                    {step === 'results' && (
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-sm"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkStudentImport;   