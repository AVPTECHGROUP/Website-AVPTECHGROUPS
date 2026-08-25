import { LEAD_STATUS_LABELS, LEAD_STATUS_STYLES } from "../../Constants/StringConstants/LeadsConstants.js";

const LeadStatusBadge = ({ status }) => {
    const style = LEAD_STATUS_STYLES[status] ?? LEAD_STATUS_STYLES.NEW;
    const label = LEAD_STATUS_LABELS[status] ?? status;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}
        >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {label}
    </span>
    );
};

export default LeadStatusBadge;