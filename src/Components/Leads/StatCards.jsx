const ACCENTS = {
    blue: { icon: "bg-blue-50 text-blue-600", bar: "bg-blue-500" },
    amber: { icon: "bg-amber-50 text-amber-600", bar: "bg-amber-500" },
    indigo: { icon: "bg-indigo-50 text-indigo-600", bar: "bg-indigo-500" },
    emerald: { icon: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500" },
    red: { icon: "bg-red-50 text-red-600", bar: "bg-red-500" },
};

const StatCard = ({ label, value, icon: Icon, accent = "blue", loading }) => {
    const colors = ACCENTS[accent] ?? ACCENTS.blue;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}>
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </span>
                <div className="min-w-0">
                    <p className="truncate text-sm text-slate-500">{label}</p>
                    <p className="text-2xl font-bold text-slate-900">
                        {loading ? (
                            <span className="inline-block h-6 w-10 animate-pulse rounded bg-slate-200 align-middle" />
                        ) : (
                            value ?? 0
                        )}
                    </p>
                </div>
            </div>
            <span className={`absolute inset-x-0 bottom-0 h-1 ${colors.bar}`} />
        </div>
    );
};

export default StatCard;