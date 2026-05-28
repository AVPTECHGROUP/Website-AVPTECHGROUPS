import {
  Users2,
  UserCheck2,
  UserRoundXIcon,
  IndianRupee,
  ShieldBanIcon,
} from 'lucide-react';
import CardComponent from '../../CommonComp/CardComponent';
import CardLoader from '../../CommonComp/CardLoader';
import TooltipComponent from '../../CommonComp/Tooltip_comp/TooltipComp';

const TeachersHeader = ({ stats, loading }) => {
  const cards = [
    {
      iconName: Users2,
      keyName: 'Total Teachers',
      val: stats.total,
      iconTxColor: 'text-blue-600',
      iconBgColor: 'bg-blue-50',
    },
    {
      iconName: UserCheck2,
      keyName: `Active (${stats.activePercent}%)`,
      val: stats.active,
      iconTxColor: 'text-green-600',
      iconBgColor: 'bg-green-50',
    },
    {
      iconName: UserRoundXIcon,
      keyName: `Inactive (${stats.inActivePercent}%)`,
      val: stats.inActive,
      iconTxColor: 'text-red-600',
      iconBgColor: 'bg-red-50',
    },
    {
      iconName: IndianRupee,
      keyName: 'Payroll Included',
      val: stats.payrollIncluded,
      iconTxColor: 'text-teal-600',
      iconBgColor: 'bg-teal-50',
    },
  ];

  return (
    <div className="px-4 sm:px-5 lg:px-4 pt-4">
      {/* PAGE TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            <TooltipComponent message="Efficiently manage all teacher records, class assignments and account status." direction='right' color='nocolor'>
              Manage All Teachers
            </TooltipComponent>
          </h2>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <CardLoader key={i} />)
          : cards.map((card, i) => (
            <CardComponent
              key={i}
              IconName={card.iconName}
              keyName={card.keyName}
              val={card.val}
              iconTxColor={card.iconTxColor}
              iconBgColor={card.iconBgColor}
            />
          ))}
      </div>
    </div>
  );
};

export default TeachersHeader;