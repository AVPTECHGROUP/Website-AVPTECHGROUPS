import { useState } from "react";
import { RotateCcw, CheckCircle2, Copy, Check, X, Key } from "lucide-react";

export default function PasswordResetModal({ isOpen, onClose, onReset, userName }) {
  const [step, setStep] = useState("confirm");
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await onReset();
      setNewPassword(result.data);
      setStep("success");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep("confirm");
    setNewPassword("");
    setCopied(false);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-500/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl animate-[modalIn_0.2s_ease]">
        <style>{`
          @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
          @keyframes spin { to { transform:rotate(360deg); } }
          .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.35); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
        `}</style>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={16} />
        </button>

        {/* ── CONFIRM STEP ── */}
        {step === "confirm" && (
          <>
            <div className="flex items-start gap-3.5 pr-6">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <Key size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-[17px] font-bold text-slate-900 leading-snug">Confirm Password Reset</div>
                <div className="text-[13px] text-slate-500 mt-0.5">Action required for user security</div>
              </div>
            </div>

            <div className="h-px bg-slate-100 my-5" />

            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              Are you sure you want to reset the password
              {userName ? <> for <strong className="text-slate-700">{userName}</strong></> : " for this user"}?
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-3.5 py-2.5 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2.5">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold flex items-center gap-2 min-w-[140px] justify-center transition-colors disabled:opacity-70"
              >
                {loading ? <span className="spinner" /> : <><Key size={15} /> Reset Password</>}
              </button>
            </div>
          </>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === "success" && (
          <>
            <div className="flex items-start gap-3.5 pr-6">
              <div className="w-11 h-11 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-[17px] font-bold text-slate-900 leading-snug">Password Reset Successfully</div>
                <div className="text-[13px] text-green-600 mt-0.5">New credentials generated</div>
              </div>
            </div>

            <div className="h-px bg-slate-100 my-5" />

            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              The password has been reset. Share the temporary password below with the user through a secure channel.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 mb-5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                New Password
              </span>
              <div className="flex items-center justify-between gap-3">
                <code className="text-[15px] font-bold text-slate-900 tracking-wide font-mono break-all">
                  {newPassword}
                </code>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[13px] font-semibold shrink-0 transition-colors ${
                    copied
                      ? "border-green-200 bg-green-50 text-green-600"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}