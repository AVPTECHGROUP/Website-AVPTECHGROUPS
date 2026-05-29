export default function LeaveCardComponent({
    IconName,
    keyName,
    rem_val,
    total_val,
    type,
    iconTxColor,
    iconBgColor
}) {

    const toProperCase = (str) => {
        return str
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const getLabel = () => {
        switch (type) {
            case 'available':
                return 'Available';

            case 'used':
                return 'Used';

            default:
                return 'Remaining';
        }
    };

    return (
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">

                <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center shrink-0`}>
                    <IconName className={`w-6 h-6 ${iconTxColor}`} />
                </div>

                <div className="min-w-0">
                    <p className="text-gray-600 font-semibold">
                        {toProperCase(keyName)}
                    </p>

                    <p className={`font-bold ${iconTxColor} text-lg`}>
                        {rem_val}

                        <span className="text-xs font-normal text-gray-600">
                            {" "}
                            / {total_val} {getLabel()}
                        </span>
                    </p>
                </div>

            </div>
        </div>
    );
}