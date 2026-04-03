export default function CardComponent({ IconName, keyName, val, iconTxColor, iconBgColor }) {
    const toProperCase = (str) => {
        return str
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };
    return <div className="bg-white shadow-md rounded-xl p-4 lg:pl-3  border border-gray-200 hover:shadow-lg transition-all">
        <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${iconBgColor}  rounded-xl flex items-center justify-center shrink-0`}>
                <IconName className={`w-6 h-6 ${iconTxColor} `} />
            </div>
            <div className="min-w-0">
                <p className="text-gray-600 lg:text-lg font-semibold"> {toProperCase(keyName)}</p>
                <p className="font-bold text-gray-900 text-lg">{val}</p>
            </div>
        </div>
    </div>
}