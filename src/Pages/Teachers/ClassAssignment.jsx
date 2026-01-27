import React, { useState } from 'react';
import { Search, Edit2, Plus } from 'lucide-react';

function ClassAssignment() {
  const [teachers] = useState([
    {
      id: 1,
      name: 'Sarah Jenkins',
      role: 'Full-time • Math Dept',
      grade: 'Grade 10',
      sections: ['A', 'B'],
      subject: 'Mathematics',
      avatar: '👩‍🏫'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Full-time Teacher • Science',
      grade: 'Grade 9',
      sections: ['C'],
      subject: 'Physics',
      avatar: '👨‍🏫'
    },
    {
      id: 3,
      name: 'Robert Fox',
      role: 'Full-time • History',
      grade: 'Grade 11',
      sections: ['A', 'B', 'C'],
      subject: 'World History',
      avatar: '👨‍💼'
    },
    {
      id: 4,
      name: 'Eleanor Pena',
      role: 'Contract • Arts',
      grade: 'Grade 8',
      sections: ['A'],
      subject: 'Visual Arts',
      avatar: '👩‍🎨'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeacher = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(teacher.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.sections.join(", ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "English",
    "Computer Science",
    "Humanities"
  ];
  const classes=[
    "Play Group",
    "Lower Kinder Garden ",
    "Upper Kinder Garden",
    "Standard 1",
    "Standard 2",
    "Standard 3",
    "Standard 4",
    "Standard 5",
    "Standard 6",
    "Standard 7",
    "Standard 8",
    "Standard 9",
    "Standard 10",
    "Standard 11",
    "Standard 12"

  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Class & Subject Assignment</h1>
            <p className="text-sm text-gray-600 mt-1">Assign Specific class & sections to Teachers.</p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-blue-700 cursor-pointer">
              Cancel
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-blue-700 flex items-center gap-2 cursor-pointer">
              Save Changes
            </button>
          </div>
        </div>

        {/* Assignment Editor */}
        <div className="p-4 md:p-6 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-gray-900">Assign Teacher</h2>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">SELECT TEACHER</label>
              <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Enter teacher id...</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">GRADE/CLASS</label>
              <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select Grade...</option>
                {
                    classes.map(cls => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))
                }
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                SECTION ALLOCATION
              </label>
              <div className="flex gap-2">
                {['A', 'B', 'C', 'D'].map(section => (
                  <button
                    key={section}
                    className={`w-10 h-10 rounded-lg font-medium text-sm ${
                      section === 'A'
                        ? 'bg-white text-gray-700 cursor-pointer hover:bg-blue-500'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-500 cursor-pointer'
                    }`}
                  >
                    {section}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">SUBJECT</label>
              <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select Subject...</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 flex items-center gap-2 self-start sm:self-auto whitespace-nowrap">
              <span className="text-lg cursor-pointer">
                <Plus />
              </span>
              Add Mapping
            </button>
          </div>
        </div>

        {/* Current Mappings */}
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="font-semibold text-gray-900">
              Current Mappings <span className="ml-2 text-sm font-normal text-gray-600">12 Total</span>
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search teacher..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 text-xs font-medium text-gray-700 uppercase">Teacher</th>
                  <th className="pb-3 text-xs font-medium text-gray-700 uppercase">Grade</th>
                  <th className="pb-3 text-xs font-medium text-gray-700 uppercase">Sections</th>
                  <th className="pb-3 text-xs font-medium text-gray-700 uppercase hidden sm:table-cell">Subject</th>
                  <th className="pb-3 text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTeacher.map(teacher => (
                  <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {/* Teacher */}
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                          {teacher.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{teacher.name}</div>
                          <div className="text-xs text-gray-600">{teacher.role}</div>
                        </div>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="py-4 text-gray-700">{teacher.grade}</td>

                    {/* Sections */}
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        {teacher.sections.map(section => (
                          <span
                            key={section}
                            className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-medium"
                          >
                            {section}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Subject (hidden on small screens) */}
                    <td className="py-4 text-gray-700 hidden sm:table-cell">
                      {teacher.subject}
                    </td>

                    {/* Actions */}
                    <td className="py-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">Showing 1 to 4 of 12 results</div>
            <div className="flex gap-2">
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                Previous
              </button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClassAssignment;