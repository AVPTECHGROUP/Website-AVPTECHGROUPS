import { useState } from "react";
import { CheckCircle2, Copy, Check, X, Key, Eye, EyeOff, RefreshCw } from "lucide-react";
import { updateUserPassword } from "../../Api/userManagementAPI";

const getPasswordStrength = (pwd) => {
  if (!pwd || pwd.length < 8) return null;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[!@#$%^&*]/.test(pwd);
  const score = [hasLower, hasUpper, hasNumber, hasSymbol, pwd.length >= 12].filter(Boolean).length;
  if (score <= 2) return { label: "Weak", msg: "Too weak — add uppercase letters, numbers or symbols." };
  if (score === 3) return { label: "Medium", msg: "Medium strength — try adding symbols or making it longer." };
  if (score === 4) return { label: "Strong", msg: "Strong password! Consider adding more symbols to make it harder." };
  return { label: "Very Strong", msg: "Very strong password. Great choice!" };
};

export default function PasswordResetModal({ isOpen, onClose, onReset, userName, currUserId }) {
  const [tab, setTab] = useState("update");
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [lengthError, setLengthError] = useState("");
  const [mismatchError, setMismatchError] = useState("");

  if (!isOpen) return null;

  const strength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const showStrength = passwordsMatch && strength;

  const handleUpdatePassword = async () => {
    // Validate on click
    if (password.length < 8) {
      setLengthError("Password must be at least 8 characters.");
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setLengthError("Password must contain letters and numbers.");
      return;
    }
    if (password !== confirmPassword) {
      setMismatchError("Passwords do not match.");
      return;
    }

    setLoading(true); setError("");
    try {
      const result = await updateUserPassword(currUserId,password.trim(),confirmPassword.trim());// api is defined here 
      setNewPassword(result.data || password);
      setStep("success");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true); setError("");
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
    setStep("form"); setPassword(""); setConfirmPassword("");
    setShowConfirm(false); setError(""); setNewPassword("");
    setCopied(false); setLengthError(""); setMismatchError("");
    onClose();
  };

  const userLabel = userName
    ? <> for <strong className="text-slate-700">{userName}</strong></>
    : " for this user";

  return (
    <div className="fixed inset-0 z-51 flex items-center justify-center ">
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .spinner { width:15px; height:15px; border:2px solid rgba(255,255,255,0.35); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
      `}</style>

      <div className="absolute inset-0 bg-slate-600/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl" style={{ animation: "modalIn 0.2s ease" }}>

        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-6 pb-4 pr-14">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step === "success" ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-100"}`}>
            {step === "success"
              ? <CheckCircle2 size={18} className="text-green-600" />
              : <Key size={18} className="text-blue-600" />
            }
          </div>
          <div>
            <div className="text-base font-bold text-slate-900">
              {step === "success" ? "Password Reset Successfully" : "Password Reset"}
            </div>
            <div className={`text-xs mt-0.5 ${step === "success" ? "text-green-600" : "text-slate-400"}`}>
              {step === "success" ? "New credentials are ready" : <>Managing password{userLabel}</>}
            </div>
          </div>
        </div>

        <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <X size={15} />
        </button>

        {/* Tabs */}
        {step === "form" && (
          <div className="flex mx-6 border-b border-slate-100">
            {[{ key: "update", label: "Update Password" }, { key: "generate", label: "Generate Password" }].map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(""); setLengthError(""); setMismatchError(""); }}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="px-6 py-5 min-h-62.5">

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                The password has been reset{userLabel}. Share the new password through a secure channel.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">New Password</span>
                <div className="flex items-center justify-between gap-3">
                  <code className="text-sm font-bold text-slate-900 tracking-wide font-mono break-all">{newPassword}</code>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shrink-0 transition-colors ${copied ? "border-green-200 bg-green-50 text-green-600" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleClose} className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
                  Done
                </button>
              </div>
            </>
          )}

          {/* ── UPDATE PASSWORD TAB ── */}
          {step === "form" && tab === "update" && (
            <>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                This will update the password{userLabel} and invalidate their current session.
              </p>

              {/* Password field — always obscured, no eye btn */}
              <div className="mb-3">
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setLengthError(""); }}
                  placeholder="Enter new password"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${lengthError ? "border-red-300 focus:ring-red-500/20 focus:border-red-400" : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-400"
                    }`}
                />
                {lengthError && <p className="text-xs text-red-500 mt-1.5">{lengthError}</p>}
              </div>

              {/* Confirm password field — eye btn only here */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setMismatchError(""); }}
                    placeholder="Re-enter password"
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${mismatchError ? "border-red-300 focus:ring-red-500/20 focus:border-red-400" : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-400"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {mismatchError && <p className="text-xs text-red-500 mt-1.5">{mismatchError}</p>}
              </div>

              {/* Strength message — only when passwords match */}
              {showStrength && (
                <div className={`text-xs font-medium px-3.5 py-2.5 rounded-lg border mb-4 ${strength.label === "Weak" ? "bg-red-50 border-red-100 text-red-600" :
                    strength.label === "Medium" ? "bg-yellow-50 border-yellow-100 text-yellow-700" :
                      strength.label === "Strong" ? "bg-blue-50 border-blue-100 text-blue-700" :
                        "bg-green-50 border-green-100 text-green-700"
                  }`}>
                  <span className="font-bold">{strength.label}:</span> {strength.msg}
                </div>
              )}

              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2.5 rounded-lg mb-4">{error}</div>}

              <div className="flex justify-end gap-2.5">
                <button onClick={handleClose} className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePassword}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white text-sm font-semibold flex items-center gap-2 min-w-35 justify-center transition-colors"
                >
                  {loading ? <span className="spinner" /> : <><Key size={14} /> Update Password</>}
                </button>
              </div>
            </>
          )}

          {/* ── GENERATE PASSWORD TAB ── */}
          {step === "form" && tab === "generate" && (
            <div className="flex flex-col min-h-62.5">
              <p className="text-sm text-slate-500 leading-relaxed mb-5">
                This will automatically generate a strong secure password{userLabel} and invalidate their current session.
              </p>

              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2.5 rounded-lg mb-4">{error}</div>}

              <div className="flex justify-end gap-2.5 mt-auto">
                <button onClick={handleClose} disabled={loading} className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold flex items-center gap-2 min-w-37.5 justify-center transition-colors disabled:opacity-70"
                >
                  {loading ? <span className="spinner" /> : <><RefreshCw size={14} /> Generate Password</>}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}