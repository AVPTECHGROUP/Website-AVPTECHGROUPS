import React from 'react';
import { getStatusColor, getStatusDotColor } from '../../Components/FeeModal/helper';

const Badge = ({ status, children, showDot = false }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-md border ${getStatusColor(status)}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(status)}`}></span>}
      {children || status}
    </span>
  );
};

export default Badge;