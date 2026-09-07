import React from 'react';
import {
  LayoutGrid,
  CheckSquare,
  Users,
  Settings,
  FileSpreadsheet,
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  tasksCount?: number;
  employeesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  tasksCount,
  employeesCount,
}) => {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between py-5 select-none min-h-[calc(100vh-61px)]">
      <div className="px-3">
        {/* Main Navigation Group */}
        <div className="space-y-1">
          {/* Dashboard */}
          <button
            id="nav-dashboard-btn"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutGrid
                className={`h-4.5 w-4.5 stroke-[1.8] ${
                  activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'
                }`}
              />
              <span>Dashboard</span>
            </div>
          </button>

          {/* งานทั้งหมด */}
          <button
            id="nav-work-btn"
            onClick={() => setActiveTab('work')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'work'
                ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckSquare
                className={`h-4.5 w-4.5 stroke-[1.8] ${
                  activeTab === 'work' ? 'text-indigo-600' : 'text-slate-400'
                }`}
              />
              <span>งานทั้งหมด</span>
            </div>
            {typeof tasksCount === 'number' && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === 'work'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tasksCount}
              </span>
            )}
          </button>

          {/* พนักงาน */}
          <button
            id="nav-employees-btn"
            onClick={() => setActiveTab('employees')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'employees'
                ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users
                className={`h-4.5 w-4.5 stroke-[1.8] ${
                  activeTab === 'employees' ? 'text-indigo-600' : 'text-slate-400'
                }`}
              />
              <span>พนักงาน</span>
            </div>
            {typeof employeesCount === 'number' && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === 'employees'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {employeesCount}
              </span>
            )}
          </button>
        </div>

        {/* Divider as seen in Image 2 */}
        <div className="border-t border-slate-200 my-4 mx-1" />

        {/* Category Header: ตั้งค่า */}
        <div className="px-3 pb-2 text-xs font-medium text-slate-400">
          ตั้งค่า
        </div>

        {/* Settings Navigation Group */}
        <div className="space-y-1">
          {/* ตั้งค่า */}
          <button
            id="nav-settings-btn"
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings
              className={`h-4.5 w-4.5 stroke-[1.8] ${
                activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'
              }`}
            />
            <span>ตั้งค่า</span>
          </button>

          {/* ฐานข้อมูล Google Sheets & GAS */}
          <button
            id="nav-sheets-guide-btn"
            onClick={() => setActiveTab('sheets_guide')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'sheets_guide'
                ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet
              className={`h-4.5 w-4.5 stroke-[1.8] ${
                activeTab === 'sheets_guide' ? 'text-emerald-600' : 'text-slate-400'
              }`}
            />
            <span>Google Sheets & GAS</span>
          </button>
        </div>
      </div>

      {/* Bottom helper card */}
      <div className="px-3 pt-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Google Sheets Ready</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            เชื่อมต่อชีต Tasks และ Employees นำโค้ดไปวางใน Apps Script ใช้งานได้ทันที
          </p>
        </div>
      </div>
    </aside>
  );
};
