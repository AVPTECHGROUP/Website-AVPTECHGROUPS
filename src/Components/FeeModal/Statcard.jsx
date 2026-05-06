import React from 'react';

const StatCard = ({ title, value, subtitle, type = 'default', icon }) => {
  const borderColors = {
    total: 'border-navy',
    paid: 'border-success',
    partial: 'border-[#B45309]',
    overdue: 'border-danger',
    discount: 'border-gray-500',
    default: 'border-gray-300',
  };
  
  const valueColors = {
    total: 'text-navy',
    paid: 'text-success',
    partial: 'text-[#B45309]',
    overdue: 'text-danger',
    discount: 'text-gray-700',
    default: 'text-gray-900',
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-card border border-gray-200 border-l-[3px] ${borderColors[type]} p-4 transition-all duration-200 hover:shadow-card-lg`}>
      <div className="flex items-start justify-between mb-1.5">
        <div className="text-[10px] font-bold tracking-wider uppercase text-gray-500">
          {title}
        </div>
        {icon && (
          <div className="text-lg opacity-60">
            {icon}
          </div>
        )}
      </div>
      <div className={`text-2xl font-extrabold leading-none mb-1 ${valueColors[type]}`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-[11px] text-gray-500">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;