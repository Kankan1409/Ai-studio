import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Link2,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { Task, Employee, ActiveTab } from '../../types';
import { syncDataFromSource } from '../../utils/sheetSync';

interface SettingsViewProps {
  tasks: Task[];
  employees: Employee[];
  onResetData: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onSyncData?: (tasks: Task[], employees: Employee[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  tasks,
  employees,
  onResetData,
  setActiveTab,
  onSyncData,
}) => {
  const [gasUrl, setGasUrl] = useState(() => localStorage.getItem('tm_gas_url') || '');
  const [dataSource, setDataSource] = useState<'mock' | 'gas'>(() => {
    return (localStorage.getItem('tm_data_source') as 'mock' | 'gas') || 'mock';
  });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; message?: string; success?: boolean } | null>(
    null
  );
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; message?: string; success?: boolean } | null>(
    null
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tm_gas_url', gasUrl.trim());
    localStorage.setItem('tm_data_source', dataSource);
    setSaveStatus('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleTestConnection = async () => {
    if (!gasUrl.trim()) {
      setTestStatus({
        loading: false,
        success: false,
        message: 'กรุณากรอก Web App URL หรือ Google Sheets URL ก่อนทดสอบ',
      });
      return;
    }

    setTestStatus({ loading: true });
    try {
      const result = await syncDataFromSource(gasUrl.trim());
      if (result.success) {
        setTestStatus({
          loading: false,
          success: true,
          message: `${result.message || 'เชื่อมต่อสำเร็จ!'} (อ่านข้อมูลจริงจากชีต)`,
        });
      } else {
        setTestStatus({
          loading: false,
          success: false,
          message: result.message || 'เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบ URL และสิทธิ์การเข้าถึง',
        });
      }
    } catch (err: any) {
      setTestStatus({
        loading: false,
        success: false,
        message: `ข้อผิดพลาดในการเชื่อมต่อ: ${err.message}`,
      });
    }
  };

  const handleSyncNow = async () => {
    if (!gasUrl.trim()) {
      setSyncStatus({
        loading: false,
        success: false,
        message: 'กรุณากรอก Web App URL หรือ Google Sheets URL ก่อนกดซิงค์ข้อมูล',
      });
      return;
    }

    setSyncStatus({ loading: true });
    try {
      const result = await syncDataFromSource(gasUrl.trim());
      if (result.success && onSyncData) {
        onSyncData(result.tasks, result.employees);
        setSyncStatus({
          loading: false,
          success: true,
          message: `ซิงค์ข้อมูลสำเร็จ! ดึงข้อมูลจากชีตมาแล้ว ${result.tasks.length} งาน และ ${result.employees.length} พนักงาน`,
        });
        setTimeout(() => setSyncStatus(null), 5000);
      } else {
        setSyncStatus({
          loading: false,
          success: false,
          message: result.message || 'ไม่สามารถดึงข้อมูลจากชีตได้ กรุณาตรวจสอบลิงก์หรือสิทธิ์แชร์',
        });
      }
    } catch (err: any) {
      setSyncStatus({
        loading: false,
        success: false,
        message: `เกิดข้อผิดพลาดในการดึงข้อมูล: ${err.message}`,
      });
    }
  };

  const exportJsonBackup = () => {
    const data = {
      tasks,
      employees,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">ตั้งค่าระบบ</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          จัดการแหล่งข้อมูล Google Sheets และการทำงานของระบบ
        </p>
      </div>

      {saveStatus && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Data Source Configuration */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <Database className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">แหล่งข้อมูล (Data Source)</h3>
            <p className="text-xs text-slate-500">
              เลือกใช้งานระหว่างฐานข้อมูลจำลอง (Mock Data) หรือเชื่อมต่อสดกับ Google Sheets
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mode 1: Mock Storage */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                dataSource === 'mock'
                  ? 'border-indigo-600 bg-indigo-50/40'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="data_source"
                value="mock"
                checked={dataSource === 'mock'}
                onChange={() => setDataSource('mock')}
                className="mt-1 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>โหมดจำลอง (Mock Data)</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  บันทึกข้อมูลในเครื่อง (Local Storage) ไม่ต้องรันสคริปต์ ใช้งานได้รวดเร็วทันที ปลอดภัย
                </p>
              </div>
            </label>

            {/* Mode 2: Real Google Apps Script Web App */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                dataSource === 'gas'
                  ? 'border-indigo-600 bg-indigo-50/40'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="data_source"
                value="gas"
                checked={dataSource === 'gas'}
                onChange={() => setDataSource('gas')}
                className="mt-1 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span>Google Apps Script (GAS Live)</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  เชื่อมต่อสดกับ Google Sheets ผ่าน Web App URL ที่คุณ Deploy ใน Apps Script
                </p>
              </div>
            </label>
          </div>

          {/* Web App URL or Google Sheet link input */}
          {dataSource === 'gas' && (
            <div className="space-y-2 pt-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Google Apps Script Web App URL หรือ ลิงก์ Google Sheets
                </label>
                <span className="text-[11px] text-indigo-600 font-medium">รองรับทั้ง URL สคริปต์ และลิงก์ชีตโดยตรง</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={gasUrl}
                  onChange={(e) => setGasUrl(e.target.value)}
                  placeholder="เช่น https://script.google.com/.../exec หรือ https://docs.google.com/spreadsheets/d/..."
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus?.loading || syncStatus?.loading}
                  className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors shrink-0"
                >
                  {testStatus?.loading ? 'กำลังทดสอบ...' : 'ทดสอบเชื่อมต่อ'}
                </button>
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={testStatus?.loading || syncStatus?.loading}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all shrink-0 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${syncStatus?.loading ? 'animate-spin' : ''}`} />
                  <span>{syncStatus?.loading ? 'กำลังดึงข้อมูล...' : 'ดึงข้อมูลสดจากชีต'}</span>
                </button>
              </div>

              {testStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    testStatus.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {testStatus.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testStatus.message}</span>
                </div>
              )}

              {syncStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    syncStatus.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {syncStatus.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  )}
                  <span>{syncStatus.message}</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('sheets_guide')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>ดูโครงสร้างหัวตารางและโค้ด Code.gs</span>
            </button>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>
      </div>

      {/* Local Storage & Backup Management */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <RefreshCw className="h-5 w-5 text-slate-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">จัดการข้อมูลและสำรอง</h3>
            <p className="text-xs text-slate-500">
              รีเซ็ตข้อมูล Mock เริ่มต้น หรือดาวน์โหลดไฟล์สำรอง
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="text-xs font-semibold text-slate-800">
              สถานะข้อมูลปัจจุบันในระบบ
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              มีงานทั้งหมด {tasks.length} รายการ และพนักงาน {employees.length} คน
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="export-json-btn"
              onClick={exportJsonBackup}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors"
            >
              <Download className="h-4 w-4 text-slate-500" />
              <span>ส่งออก JSON</span>
            </button>

            <button
              id="reset-mock-data-btn"
              onClick={() => {
                if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นตามที่ Mock ไว้หรือไม่?')) {
                  onResetData();
                  alert('รีเซ็ตข้อมูลเรียบร้อยแล้ว!');
                }
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-rose-600" />
              <span>รีเซ็ตค่าเริ่มต้น</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
