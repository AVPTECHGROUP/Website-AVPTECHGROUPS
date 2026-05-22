import React from 'react';

const Table = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className={`w-full ${className}`}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children }) => {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      {children}
    </thead>
  );
};

const TableBody = ({ children }) => {
  return (
    <tbody className="divide-y divide-gray-200">
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className = '', selected = false }) => {
  return (
    <tr className={`transition-colors hover:bg-gray-50 ${selected ? 'bg-navy-light' : ''} ${className}`}>
      {children}
    </tr>
  );
};

const TableHead = ({ children, className = '' }) => {
  return (
    <th className={`px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase text-gray-500 ${className}`}>
      {children}
    </th>
  );
};

const TableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-4 py-3.5 text-sm ${className}`}>
      {children}
    </td>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export default Table;