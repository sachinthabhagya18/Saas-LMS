// components/TeacherSidebar.tsx - Add courses management
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/teacher/dashboard', icon: '📊' },
  { name: 'Course Management', href: '/teacher/courses', icon: '📚' },
  { name: 'Students', href: '/teacher/students', icon: '👨‍🎓' },
  { name: 'Instructors', href: '/teacher/instructors', icon: '👨‍🏫' },
  { name: 'Assignments', href: '/teacher/assignments', icon: '📝' },
  { name: 'Settings', href: '/teacher/settings', icon: '⚙️' },
];

export default function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    router.push('/teacher/login');
  };

  const teacherName = localStorage.getItem('user_name') || 'Teacher';

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col">
      {/* Logo and Header */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold">T</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">Teacher Portal</h1>
            <p className="text-blue-200 text-sm">Welcome, {teacherName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-blue-900 shadow-lg'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-blue-100 rounded-lg hover:bg-blue-700 hover:text-white transition-all"
        >
          <span className="text-lg mr-3">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
}