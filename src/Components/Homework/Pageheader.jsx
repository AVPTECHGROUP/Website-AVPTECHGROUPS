import { BookOpen, Download } from "lucide-react";

export default function PageHeader() {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <BookOpen size={18} className="text-blue-700" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">Homework</h1>
          <p className="text-xs text-gray-500 mt-0.5">Assign and manage homework by class and section</p>
        </div>
      </div>
      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg text-gray-600 bg-white hover:bg-gray-50 transition-colors">
        <Download size={13} /> Export
      </button>
    </div>
  );
}