import React from 'react';
import { Upload, X, FilePlus2 } from 'lucide-react';

const AddStudentIdentityDocuments = ({
    formData, handleInputChange, errors = {},
    documents, onDocumentChange, onDocumentRemove,
    onGenericDocAdd, onGenericDocRemove,
}) => {

    const inputClass = (field) =>
        `bg-gray-100 font-normal text-gray-800 border p-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`;

    const ErrorMsg = ({ field }) =>
        errors[field] ? (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span>⚠</span> {errors[field]}
            </p>
        ) : null;

    const FileUploadField = ({ docKey, label, required = false, helperText, accept = '.pdf,.jpg,.jpeg,.png' }) => {
        const file = documents?.[docKey];
        return (
            <div>
                <label className='block font-semibold text-gray-600 text-sm mb-2'>
                    {label}
                    {required
                        ? <span className="text-red-500 ml-1">*</span>
                        : <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>}
                </label>
                {!file ? (
                    <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-md p-3 cursor-pointer transition-colors ${errors[docKey] ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50'
                        }`}>
                        <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-500">Click to upload</span>
                        <input type="file" accept={accept} onChange={(e) => onDocumentChange(docKey, e)} className="hidden" />
                    </label>
                ) : (
                    <div className="flex items-center justify-between gap-2 border border-green-200 bg-green-50 rounded-md p-2 px-3">
                        <span className="text-sm text-green-700 truncate">{file.name}</span>
                        <button type="button" onClick={() => onDocumentRemove(docKey)}
                            className="text-red-500 hover:text-red-700 shrink-0">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
                <ErrorMsg field={docKey} />
            </div>
        );
    };

    return (
        <div className="space-y-8">

            {/* Identity Numbers */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-id-card text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Identity Numbers</h2>
                </div>
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Student Aadhaar Number
                        </label>
                        <input type="text" name="studentAadhaar" value={formData.studentAadhaar} onChange={handleInputChange}
                            placeholder="12 digit Aadhaar number" maxLength={12} inputMode="numeric"
                            className={inputClass('studentAadhaar')} />
                        <ErrorMsg field="studentAadhaar" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            APAR ID
                        </label>
                        <input type="text" name="aparId" value={formData.aparId} onChange={handleInputChange}
                            placeholder="Automated Permanent Academic Registry ID" className={inputClass('aparId')} />
                        <ErrorMsg field="aparId" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            PEN
                            <span className="text-gray-400 text-xs font-normal ml-2">(if applicable)</span>
                        </label>
                        <input type="text" name="pen" value={formData.pen} onChange={handleInputChange}
                            placeholder="Permanent Enrollment Number" className={inputClass('pen')} />
                        <p className="text-xs text-gray-500 mt-1">State/school specific enrollment number</p>
                        <ErrorMsg field="pen" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            Family ID
                            <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                        </label>
                        <input type="text" name="familyId" value={formData.familyId} onChange={handleInputChange}
                            placeholder="Links siblings under one family" className={inputClass('familyId')} />
                        <ErrorMsg field="familyId" />
                    </div>
                    <div>
                        <label className='block font-semibold text-gray-600 text-sm mb-2'>
                            SSM ID
                            <span className="text-gray-400 text-xs font-normal ml-2">(if applicable)</span>
                        </label>
                        <input type="text" name="ssmId" value={formData.ssmId} onChange={handleInputChange}
                            placeholder="Enter SSM ID" className={inputClass('ssmId')} />
                        <ErrorMsg field="ssmId" />
                    </div>
                </div>
            </div>

            {/* Document Uploads */}
            <div>
                <div className="flex justify-start items-center mb-4 pb-3 border-b border-gray-200">
                    <i className="fa-solid fa-file-arrow-up text-xl lg:text-2xl text-blue-500 mr-3"></i>
                    <h2 className='text-xl font-medium text-gray-700'>Document Uploads</h2>
                </div>
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                    <FileUploadField docKey="birthCertificate" label="Birth Certificate"
                        helperText="PDF or image, max 10MB" />

                    {formData.isTransferStudent && (
                        <FileUploadField docKey="transferCertificate" label="Transfer Certificate"
                            helperText="Required for students transferring from another school" />
                    )}

                    {formData.isTransferStudent && (
                        <FileUploadField docKey="reportCard" label="Report Card"
                            helperText="Last report card from previous school" />
                    )}
                </div>

                {/* Generic multi-document upload */}
                <div className="mt-4">
                    <label className='block font-semibold text-gray-600 text-sm mb-2'>
                        Other Documents
                        <span className="text-gray-400 text-xs font-normal ml-2">(optional)</span>
                    </label>
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 rounded-md p-3 cursor-pointer transition-colors">
                        <FilePlus2 className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-500">Upload any additional documents</span>
                        <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={onGenericDocAdd} className="hidden" />
                    </label>

                    {documents?.genericDocuments?.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {documents.genericDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between gap-2 border border-gray-200 bg-gray-50 rounded-md p-2 px-3">
                                    <span className="text-sm text-gray-700 truncate">{doc.file.name}</span>
                                    <button type="button" onClick={() => onGenericDocRemove(doc.id)}
                                        className="text-red-500 hover:text-red-700 shrink-0">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default AddStudentIdentityDocuments;