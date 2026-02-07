
export default function CardComponent({ IconName, keyName, val, iconTxColor, iconBgColor }) {

    return <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all">
        <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${iconBgColor}  rounded-xl flex items-center justify-center shrink-0`}>
                <IconName className={`w-6 h-6 ${iconTxColor} `} />
            </div>
            <div className="min-w-0">
                <p className="text-gray-600 font-semibold text-sm">{keyName}</p>
                <p className="text-2xl font-bold text-gray-900">{val}</p>
            </div>
        </div>
    </div>
}