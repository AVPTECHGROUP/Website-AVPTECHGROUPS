import React from "react";

const ListLoader = ({ rows = 3, avatar = true }) => {
  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -100% 0; }
            100% { background-position: 100% 0; }
          }
          .shimmer {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }
        `
        }
      </style>
      <tr>
        <td colSpan={11}>
          <div className="space-y-4 col-span-11 px-4 py-1 my-1 ">
            {Array.from({ length: rows }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 overflow-hidden rounded-xl"
              >
                {avatar === true ? <div className="shimmer rounded-full" style={{ width: 40, height: 40 }} />
                  : <div className="shimmer rounded-sm " style={{ width: 100, height: 40 }} />}
                <div className="flex-1 space-y-2">
                  <div className="shimmer rounded" style={{ height: 16, width: "100%" }} />
                  <div className="shimmer rounded-r" style={{ height: 12, width: "75%" }} />
                </div>
                <div className="shimmer rounded-sm " style={{ width: 100, height: 40 }} />
              </div>
            ))}
          </div>

        </td>
      </tr>

    </>
  );
};

export default ListLoader;
