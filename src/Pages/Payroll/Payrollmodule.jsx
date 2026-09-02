import React, { useState } from "react";
import PayrollDashboard from "./PayrollDashboard";
import PayrollRecords from "./PayrollRecords";
import PayrollGenerate from "./PayrollGenerate";
import PayrollStructures from "./payrollstructure.jsx";
import PayrollSlip from "./Payrollslip.jsx";

const TABS = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "records", label: "Records", icon: "📋" },
    { key: "generate", label: "Generate", icon: "⚡" },
    { key: "structures", label: "Structures", icon: "🧾" },
    { key: "slip", label: "Slip", icon: "🧾" },
];

export default function PayrollModule() {
    const [tab, setTab] = useState("dashboard");
    const [slipTarget, setSlipTarget] = useState(null);

    function goToSlip(record) {
        setSlipTarget({
            userId: record.userId,
            userType: record.userType,
            month: record.month,
            year: record.year,
        });
        setTab("slip");
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-0">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`inline-flex items-center gap-1.5 px-4 py-3 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors ${
                            tab === t.key ? "text-slate-900 border-slate-900" : "text-slate-500 border-transparent hover:text-slate-700"
                        }`}
                    >
                        <span>{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="p-6 max-w-[1400px] mx-auto">
                {tab === "dashboard" && <PayrollDashboard onReviewDraft={() => setTab("records")} />}
                {tab === "records" && <PayrollRecords onViewSlip={goToSlip} />}
                {tab === "generate" && <PayrollGenerate />}
                {tab === "structures" && <PayrollStructures />}
                {tab === "slip" && <PayrollSlip key={JSON.stringify(slipTarget)} initialTarget={slipTarget} />}
            </div>
        </div>
    );
}