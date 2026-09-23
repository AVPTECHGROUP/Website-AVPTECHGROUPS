export default function CardComponent({ IconName, keyName, val, iconTxColor, iconBgColor }) {
    const toProperCase = (str) => {
        return str
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };
    // return <div className={`rounded-xl overflow-hidden flex flex-col bg-white shadow-lg hover:shadow-${iconTxColor} w-full h-18`}>
    return <div
        className={`rounded-xl overflow-hidden flex flex-col bg-white border-b-[4px] border-b-current ${iconTxColor} shadow-md hover:shadow-lg transition-all duration-300 w-full h-18`}
        style={{
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}>
        {/* Wrap with color context so currentColor works */}
        <div className={`${iconTxColor} flex flex-col h-full`}>

            {/* Card Body */}
            <div className="flex items-center justify-between px-2 py-3">

                {/* Left: Icon + Labels */}
                <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 ${iconBgColor} rounded-xl flex items-center justify-center shrink-0`}>
                        <IconName className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[12px] font-medium text-gray-600 text-nowrap leading-snug">
                            {toProperCase(keyName)}
                        </p>
                        {/* <p className="text-[12px] text-gray-400">This Month</p> */}
                <p className="text-lg font-semibold">{val}</p>
                    </div>
                </div>

                {/* Right: Value */}

            </div>
        </div>
    </div>
}