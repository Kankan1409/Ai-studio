import React from 'react';
import { X, CheckSquare, FileSpreadsheet, Code, Sparkles, CheckCircle2 } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSheetsGuide: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenSheetsGuide,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <CheckSquare className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold">เกี่ยวกับ Task Manager</h3>
              <p className="text-xs text-slate-400">ระบบบริหารจัดการงานและพนักงาน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900">
            <p className="font-semibold text-sm mb-1 text-indigo-950">
              สร้างตามความต้องการของผู้ใช้:
            </p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>Google Sheets เป็นฐานข้อมูล (ชีต Tasks และ Employees)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>เขียนโค้ดรองรับ Google Apps Script (GAS Code.gs)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>ตกแต่งด้วย Tailwind CSS และใช้ Lucide Icons อย่างลงตัว</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>จำลองข้อมูล Mock Data ให้ครบถ้วน คีย์ลง Google Sheets ได้เลย</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>คลิกงานในหน้า work เพื่อเปิดดูรายละเอียดงาน (workdetail) ได้ทันที</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              หน้าจอหลักภายในระบบ:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                <strong className="text-slate-800">1. Dashboard</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">การ์ดสรุป 4 ใบ + กราฟสถิติรายสัปดาห์และสัดส่วนงาน</p>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                <strong className="text-slate-800">2. งานทั้งหมด (work)</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">ตารางค้นหา กรองสถานะ เพิ่มงานใหม่</p>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                <strong className="text-slate-800">3. workdetail</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">กดจากแถวงานเพื่อดู เช็คลิสต์ ผู้รับผิดชอบ</p>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                <strong className="text-slate-800">4. พนักงาน</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">รายชื่อทีมงาน เบอร์โทร แผนกที่สังกัด</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                onOpenSheetsGuide();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>เปิดดูชีต & โค้ด GAS</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-medium text-white transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
