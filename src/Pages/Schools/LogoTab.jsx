import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, CheckCircle, X, School, Loader2, AlertCircle } from "lucide-react";
import { uploadSchoolLogo, getSchoolById } from "../../Api/SchoolConfiguration/schoolconfig";
import { toast } from "react-toastify";
import SCHOOL_CONFIG_CONST from "../../Constants/StringConstants/SchoolConfigConstants";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function LogoTab({ schoolId, currentLogoUrl, onLogoUpdated, schoolName }) {
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [logoSaveState, setLogoSaveState] = useState("idle");
    const [logoError, setLogoError] = useState(null);
    const fileInputRef = useRef(null);

    const processFile = (file) => {
        setLogoError(null);
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setLogoError(SCHOOL_CONFIG_CONST.ERR_FILE_TYPE);
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setLogoError(SCHOOL_CONFIG_CONST.ERR_FILE_SIZE_LIMIT);
            return;
        }
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setLogoPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleUploadLogo = async () => {
        if (!schoolId) return;
        setLogoError(null);
        if (!logoFile) {
            setLogoError("Please select a logo file first");
            return;
        }
        if (logoFile.size > MAX_FILE_SIZE) {
            setLogoError(SCHOOL_CONFIG_CONST.ERR_FILE_SIZE_LIMIT);
            return;
        }

        setLogoSaveState("saving");
        try {
            await uploadSchoolLogo(schoolId, logoFile);
            setLogoSaveState("saved");
            toast.info("Logo uploaded! It may take a few seconds to reflect.");

            let attempts = 0;
            const poll = async () => {
                attempts++;
                try {
                    const fresh = await getSchoolById(schoolId);
                    const newLogoUrl = fresh.data?.logoUrl;
                    if (newLogoUrl && newLogoUrl !== currentLogoUrl) {
                        setLogoFile(null);
                        setLogoPreview(newLogoUrl);
                        if (onLogoUpdated) onLogoUpdated(newLogoUrl);
                        toast.success("Logo updated successfully!");

                        const currentSchool = JSON.parse(localStorage.getItem("school") || "{}");
                        localStorage.setItem(
                            "school",
                            JSON.stringify({
                                ...currentSchool,
                                logoUrl: newLogoUrl,
                            })
                        );
                        window.dispatchEvent(new Event("storage"));
                    } else if (attempts < 3) {
                        setTimeout(poll, 3000);
                    }
                } catch (e) {
                    console.warn("Logo poll failed:", e);
                }
            };
            setTimeout(poll, 3000);
            setTimeout(() => setLogoSaveState("idle"), 3000);
        } catch (err) {
            console.error("Logo upload error:", err);
            setLogoSaveState("error");
            setTimeout(() => setLogoSaveState("idle"), 3000);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h2 className="text-base font-bold text-slate-800">School Logo</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{SCHOOL_CONFIG_CONST.UPLOAD_INSTRUCTION}</p>
                </div>
            </div>

            {logoError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 font-medium flex-1">{logoError}</p>
                    <button onClick={() => setLogoError(null)} className="text-red-400 hover:text-red-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload zone */}
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Logo</p>
                    <div
                        onDrop={handleFileDrop}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[200px]
              ${dragOver
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40"}`}
                    >
                        {logoFile ? (
                            <div className="flex flex-col items-center gap-3">
                                <img src={logoPreview} alt="preview" className="max-h-28 max-w-full rounded-xl object-contain shadow-md" />
                                <p className="text-xs text-slate-500 text-center break-all">{logoFile.name}</p>
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Ready to upload</span>
                            </div>
                        ) : (
                            <>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${dragOver ? "bg-blue-100" : "bg-slate-100"}`}>
                                    <Upload className={`w-6 h-6 ${dragOver ? "text-blue-500" : "text-slate-400"}`} />
                                </div>
                                <p className="text-sm font-semibold text-slate-600 text-center">Click to browse or drag &amp; drop</p>
                                <p className="text-xs text-slate-400 mt-1 text-center">JPG · PNG · WEBP · Max 5 MB</p>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
                        />
                    </div>
                </div>

                {/* Current logo */}
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Logo</p>
                        <div className="border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[120px] bg-white">
                            {currentLogoUrl ? (
                                <img
                                    src={currentLogoUrl}
                                    alt="Current logo"
                                    className="max-h-24 max-w-full object-contain rounded-xl"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                                        <School className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">No logo uploaded yet</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="px-5 py-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-400 hidden sm:block truncate">
                        {schoolName ? `Editing Logo for: ${schoolName}` : "School Logo"}
                    </p>
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={() => { setLogoFile(null); setLogoPreview(currentLogoUrl || null); setLogoError(null); }}
                            className="cursor-pointer flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" /><span>Clear</span>
                        </button>
                        <button
                            onClick={handleUploadLogo}
                            disabled={!logoFile || logoSaveState === "saving"}
                            className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm
                ${logoSaveState === "saved" ? "bg-emerald-600 text-white" :
                                    logoSaveState === "saving" ? "bg-blue-400 text-white cursor-wait" :
                                        logoSaveState === "error" ? "bg-red-500 text-white" :
                                            logoFile ? "bg-blue-600 hover:bg-blue-700 text-white" :
                                                "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                        >
                            {logoSaveState === "saved" ? <><CheckCircle className="w-4 h-4" /><span>Uploaded!</span></> :
                                logoSaveState === "saving" ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Uploading…</span></> :
                                    logoSaveState === "error" ? <><AlertCircle className="w-4 h-4" /><span>Failed</span></> :
                                        <><Upload className="w-4 h-4" /><span>Upload Logo</span></>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}