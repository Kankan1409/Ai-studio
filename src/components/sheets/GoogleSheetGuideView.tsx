import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Copy,
  Check,
  Download,
  BookOpen,
  Sparkles,
  Info,
  Eye,
  X,
  FolderCode,
  Layers,
  Code2,
  Layout,
  PanelsTopLeft,
  Tv,
  MessageSquare,
  Palette,
  Terminal,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Task, Employee } from '../../types';
import {
  GAS_CODE_GS,
  GAS_INDEX_HTML,
  GAS_INDEX_MODULAR_HTML,
  GAS_MODULAR_FILES,
  GasProjectFile,
} from '../../data/gasProject';

interface GoogleSheetGuideViewProps {
  tasks: Task[];
  employees: Employee[];
}

export const GoogleSheetGuideView: React.FC<GoogleSheetGuideViewProps> = ({
  tasks,
  employees,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gas_app' | 'schema' | 'guide'>('gas_app');
  const [gasMode, setGasMode] = useState<'modular' | 'bundle'>('modular');
  const [selectedModularFileId, setSelectedModularFileId] = useState<string>('index_modular');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeGasFile, setActiveGasFile] = useState<'code_gs' | 'index_html'>('code_gs');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllModularFiles = () => {
    GAS_MODULAR_FILES.forEach((file, index) => {
      setTimeout(() => {
        const mime = file.type === 'gs' ? 'text/javascript' : 'text/html';
        downloadFile(file.filename, file.content, mime);
      }, index * 200);
    });
  };

  const currentModularFile =
    GAS_MODULAR_FILES.find((f) => f.id === selectedModularFileId) || GAS_MODULAR_FILES[1];

  const filteredModularFiles =
    activeCategory === 'all'
      ? GAS_MODULAR_FILES
      : GAS_MODULAR_FILES.filter((f) => f.category === activeCategory);

  // Generate Tab-Separated Values (TSV) for Tasks ready to paste into Google Sheet cell A1
  const tasksTsv = [
    [
      'ID',
      'Category_Title',
      'Project',
      'Priority',
      'Status',
      'Owner',
      'OwnerPhone',
      'OwnerEmail',
      'StartDate',
      'DueDate',
      'Description',
      'Progress',
    ].join('\t'),
    ...tasks.map((t) =>
      [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        t.project,
        t.priority,
        t.status,
        t.owner,
        t.ownerPhone || '',
        t.ownerEmail || '',
        t.startDate || '',
        t.dueDate || '',
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.progress || 0,
      ].join('\t')
    ),
  ].join('\n');

  // Generate TSV for Employees
  const employeesTsv = [
    ['ID', 'Name', 'Project', 'Phone', 'Email', 'Role', 'TasksCount'].join('\t'),
    ...employees.map((e) =>
      [e.id, e.name, e.project, e.phone, e.email, `"${e.role}"`, e.tasksCount || 0].join('\t')
    ),
  ].join('\n');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'backend':
        return <Terminal className="h-4 w-4 text-amber-500" />;
      case 'entry':
        return <Layers className="h-4 w-4 text-indigo-500" />;
      case 'layout':
        return <Layout className="h-4 w-4 text-blue-500" />;
      case 'views':
        return <PanelsTopLeft className="h-4 w-4 text-emerald-500" />;
      case 'modals':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'assets':
        return <Palette className="h-4 w-4 text-pink-500" />;
      default:
        return <Code2 className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Google Apps Script & Google Sheets
            </h2>
            <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
              Apps Script Ready 🚀
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            โค้ด Apps Script พร้อมนำไปรันบน Google Sheets (เปิดเป็นเมนูกดในชีต หรือเปิดผ่าน Web App ได้ทันที)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('gas_app')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'gas_app'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. โค้ด Apps Script (Code.gs + Index.html)
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'schema'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. หัวตารางชีต & Mock Data
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'guide'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. วิธีติดตั้งใน Google Sheets
          </button>
        </div>
      </div>

      {/* ================= TAB 1: APPS SCRIPT PROJECT (MODULAR & BUNDLE) ================= */}
      {activeTab === 'gas_app' && (
        <div className="space-y-6">
          {/* Highlight Banner */}
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-purple-50/70 p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-base">
                  <Sparkles className="h-5 w-5 text-indigo-600 shrink-0" />
                  <span>Google Apps Script: รองรับทั้งแบบแยกไฟล์เป็นหมวดหมู่ (Modular) และไฟล์เดี่ยว</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  เพื่อความสะอาดและดูแลง่ายตามที่ต้องการ ตอนนี้โค้ดถูกแบ่งออกเป็น <strong>10 โมดูลย่อย</strong> (Server, Layout, Views, Modals, CSS, JS)
                  โดยใช้ฟังก์ชัน <code className="bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded font-mono font-semibold">include(filename)</code> ใน
                  <code className="bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded font-mono font-semibold">Code.gs</code>{' '}
                  เพื่อดึงแต่ละส่วนมาประกอบใน <code className="bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded font-mono font-semibold">Index.html</code> อย่างเป็นระเบียบ
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  id="preview-gas-webapp-btn"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition active:scale-[0.98]"
                >
                  <Eye className="h-4 w-4" />
                  <span>ทดลองพรีวิว Web App</span>
                </button>

                {gasMode === 'modular' ? (
                  <button
                    id="download-all-modular-btn"
                    onClick={downloadAllModularFiles}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-800 px-3.5 py-2 text-xs font-semibold shadow-xs transition"
                    title="ดาวน์โหลดทั้ง 10 ไฟล์ย่อย"
                  >
                    <Download className="h-4 w-4 text-indigo-600" />
                    <span>ดาวน์โหลดครบทั้ง 10 ไฟล์</span>
                  </button>
                ) : (
                  <button
                    id="download-both-files-btn"
                    onClick={() => {
                      downloadFile('Code.gs', GAS_CODE_GS, 'text/javascript');
                      setTimeout(() => downloadFile('Index.html', GAS_INDEX_HTML, 'text/html'), 300);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-800 px-3.5 py-2 text-xs font-semibold shadow-xs transition"
                  >
                    <Download className="h-4 w-4 text-indigo-600" />
                    <span>ดาวน์โหลดทั้ง 2 ไฟล์ (.gs + .html)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mode Switcher: Modular vs Single Bundle */}
            <div className="mt-4 pt-3 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">รูปแบบโค้ดที่ต้องการ:</span>
                <div className="inline-flex rounded-xl bg-white p-1 border border-indigo-200 shadow-xs">
                  <button
                    onClick={() => setGasMode('modular')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      gasMode === 'modular'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>🌟 โครงสร้างแยกไฟล์ (Modular Structure - แนะนำ)</span>
                  </button>
                  <button
                    onClick={() => setGasMode('bundle')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      gasMode === 'bundle'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    <span>📄 รวมไฟล์เดียว (Single File Bundle)</span>
                  </button>
                </div>
              </div>

              <span className="text-[11px] text-slate-500">
                {gasMode === 'modular'
                  ? '💡 แยกเป็น 10 ไฟล์ย่อย เช่น Navbar, Sidebar, Dashboard ดูแลง่าย โค้ดสั้น'
                  : '💡 มีแค่ 2 ไฟล์ (Code.gs และ Index.html แบบรวมทุกอย่าง) เหมาะกับก๊อปปี้เร็ว'}
              </span>
            </div>
          </div>

          {/* ================= MODULAR MODE VIEW ================= */}
          {gasMode === 'modular' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: File Explorer & Categories */}
              <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <FolderCode className="h-4 w-4 text-indigo-400" />
                    <span>หมวดหมู่ไฟล์ Apps Script ({GAS_MODULAR_FILES.length})</span>
                  </div>
                </div>

                {/* Category Filter Chips */}
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'ทั้งหมด (10)' },
                    { id: 'backend', label: 'Backend' },
                    { id: 'entry', label: 'Main' },
                    { id: 'layout', label: 'Layout' },
                    { id: 'views', label: 'Views' },
                    { id: 'modals', label: 'Modals' },
                    { id: 'assets', label: 'Styles/JS' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                        activeCategory === cat.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* File List */}
                <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
                  {filteredModularFiles.map((file) => {
                    const isSelected = file.id === currentModularFile.id;
                    return (
                      <button
                        key={file.id}
                        onClick={() => setSelectedModularFileId(file.id)}
                        className={`w-full text-left p-3 flex items-start justify-between gap-2 transition ${
                          isSelected
                            ? 'bg-indigo-50/90 border-l-4 border-indigo-600 pl-2.5'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="mt-0.5 shrink-0">{getCategoryIcon(file.category)}</div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-xs font-mono font-semibold ${
                                  isSelected ? 'text-indigo-950 font-bold' : 'text-slate-800'
                                }`}
                              >
                                {file.filename}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600">
                                {file.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {file.description}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Code Viewer for Selected File */}
              <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                {/* Code Header Toolbar */}
                <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {getCategoryIcon(currentModularFile.category)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-white">
                          {currentModularFile.filename}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/80 border border-indigo-500/50 text-indigo-200 font-semibold">
                          {currentModularFile.categoryLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {currentModularFile.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const mime =
                          currentModularFile.type === 'gs' ? 'text/javascript' : 'text/html';
                        downloadFile(
                          currentModularFile.filename,
                          currentModularFile.content,
                          mime
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
                      title="ดาวน์โหลดไฟล์นี้"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-400" />
                      <span className="hidden sm:inline">ดาวน์โหลด</span>
                    </button>

                    <button
                      id={`copy-file-${currentModularFile.id}`}
                      onClick={() =>
                        copyToClipboard(currentModularFile.content, currentModularFile.id)
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs transition active:scale-[0.98]"
                    >
                      {copiedSection === currentModularFile.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-300" />
                          <span>คัดลอกสำเร็จ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>คัดลอก {currentModularFile.filename}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Step Guide for Creating This File in Apps Script */}
                <div className="bg-slate-800/80 px-4 py-2 text-[11px] text-slate-300 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span>
                      วิธีสร้างใน Apps Script:{' '}
                      {currentModularFile.type === 'gs' ? (
                        <span>
                          วางในไฟล์ <strong className="text-white">Code.gs</strong> เดิมได้เลย
                        </span>
                      ) : (
                        <span>
                          กดปุ่ม <strong className="text-white">+</strong> &gt; เลือก{' '}
                          <strong className="text-white">HTML</strong> &gt; พิมพ์ชื่อ{' '}
                          <strong className="text-indigo-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">
                            {currentModularFile.filename.replace('.html', '')}
                          </strong>{' '}
                          (ไม่ต้องพิมพ์ .html)
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {currentModularFile.content.split('\n').length} บรรทัด
                  </span>
                </div>

                {/* Code Content */}
                <div className="bg-slate-950 p-4 sm:p-5 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-[560px] overflow-y-auto">
                  <pre>{currentModularFile.content}</pre>
                </div>
              </div>
            </div>
          )}

          {/* ================= SINGLE FILE BUNDLE MODE VIEW ================= */}
          {gasMode === 'bundle' && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              {/* Top Toolbar */}
              <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FolderCode className="h-5 w-5 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    ไฟล์สำหรับ Google Apps Script (Single Bundle):
                  </span>

                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg ml-2">
                    <button
                      id="tab-code-gs"
                      onClick={() => setActiveGasFile('code_gs')}
                      className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition ${
                        activeGasFile === 'code_gs'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      📄 Code.gs
                    </button>
                    <button
                      id="tab-index-html"
                      onClick={() => setActiveGasFile('index_html')}
                      className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition ${
                        activeGasFile === 'index_html'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      🌐 Index.html (Bundle)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const content = activeGasFile === 'code_gs' ? GAS_CODE_GS : GAS_INDEX_HTML;
                      const filename = activeGasFile === 'code_gs' ? 'Code.gs' : 'Index.html';
                      const mime = activeGasFile === 'code_gs' ? 'text/javascript' : 'text/html';
                      downloadFile(filename, content, mime);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
                    title="ดาวน์โหลดไฟล์นี้"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                    <span>ดาวน์โหลด {activeGasFile === 'code_gs' ? 'Code.gs' : 'Index.html'}</span>
                  </button>

                  <button
                    id="copy-active-gas-file-btn"
                    onClick={() =>
                      copyToClipboard(
                        activeGasFile === 'code_gs' ? GAS_CODE_GS : GAS_INDEX_HTML,
                        activeGasFile
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs transition active:scale-[0.98]"
                  >
                    {copiedSection === activeGasFile ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-300" />
                        <span>คัดลอกไฟล์แล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>คัดลอกโค้ด {activeGasFile === 'code_gs' ? 'Code.gs' : 'Index.html'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Body */}
              <div className="bg-slate-950 p-4 sm:p-5 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-[580px] overflow-y-auto">
                <pre>
                  {activeGasFile === 'code_gs' ? GAS_CODE_GS : GAS_INDEX_HTML}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: SCHEMA & MOCK DATA ================= */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          {/* Quick Explanation Banner */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <p className="font-semibold text-sm mb-1 text-blue-950">
                  ต้องการคีย์ข้อมูลลง Google Sheet โดยตรง ต้องสร้างอะไรบ้าง?
                </p>
                ใน Google Sheets คุณสร้างเพียง <strong>2 ชีตย่อย (Tabs)</strong> เท่านั้น:
                <ul className="list-disc list-inside mt-1.5 space-y-1">
                  <li>
                    ชีตที่ 1 ชื่อ: <code className="font-bold bg-blue-100 px-1 py-0.5 rounded">Tasks</code> (สำหรับเก็บงานทั้งหมด, สถานะ, ผู้รับผิดชอบ)
                  </li>
                  <li>
                    ชีตที่ 2 ชื่อ: <code className="font-bold bg-blue-100 px-1 py-0.5 rounded">Employees</code> (สำหรับเก็บรายชื่อพนักงาน, แผนก, เบอร์โทร)
                  </li>
                </ul>
                <p className="mt-2 text-blue-800">
                  👉 หรือถ้าใช้โค้ด Apps Script ในแท็บที่ 1 เมื่อเปิด Google Sheet จะมีปุ่ม <strong>"⚡ สร้างชีตและข้อมูลตัวอย่างอัตโนมัติ"</strong> กดทีเดียวชีตจะสร้างและลงสีให้ครบเลยครับ!
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Sheet "Tasks" */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    ชีตที่ 1: ชื่อแท็บ <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Tasks</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  มี 12 คอลัมน์หลัก (บรรทัดแรกคือชื่อ Header)
                </p>
              </div>

              <button
                id="copy-tasks-sheet-btn"
                onClick={() => copyToClipboard(tasksTsv, 'tasks')}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98]"
              >
                {copiedSection === 'tasks' ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>คัดลอกสำเร็จ! (พร้อมวางในช่อง A1)</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>คัดลอกตาราง Tasks ทั้งหมด</span>
                  </>
                )}
              </button>
            </div>

            {/* Column Definitions explanation */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-indigo-600">A: ID</span>
                <p className="text-slate-500 text-[11px] mt-0.5">รหัสงาน เช่น PID-123</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-indigo-600">B: Category_Title</span>
                <p className="text-slate-500 text-[11px] mt-0.5">ชื่องาน / รายการ</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-indigo-600">C: Project</span>
                <p className="text-slate-500 text-[11px] mt-0.5">แผนก/โครงการ เช่น แผนก/ITW</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-indigo-600">D: Priority</span>
                <p className="text-slate-500 text-[11px] mt-0.5">High / Medium / Low</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-indigo-600">E: Status</span>
                <p className="text-slate-500 text-[11px] mt-0.5">Completed, In progress, Blocked, Todo</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-indigo-600">F: Owner</span>
                <p className="text-slate-500 text-[11px] mt-0.5">ชื่อผู้รับผิดชอบ เช่น พี่ไมค์</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-indigo-600">G: OwnerPhone</span>
                <p className="text-slate-500 text-[11px] mt-0.5">เบอร์โทรศัพท์ผู้รับผิดชอบ</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-indigo-600">H: OwnerEmail</span>
                <p className="text-slate-500 text-[11px] mt-0.5">อีเมลผู้รับผิดชอบ</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-indigo-600">I: StartDate</span>
                <p className="text-slate-500 text-[11px] mt-0.5">วันที่เริ่ม (YYYY-MM-DD)</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-indigo-600">J: DueDate</span>
                <p className="text-slate-500 text-[11px] mt-0.5">วันกำหนดส่ง (YYYY-MM-DD)</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-indigo-600">K: Description</span>
                <p className="text-slate-500 text-[11px] mt-0.5">รายละเอียดและข้อกำหนดงาน</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-indigo-600">L: Progress</span>
                <p className="text-slate-500 text-[11px] mt-0.5">เปอร์เซ็นต์ (0 - 100)</p>
              </div>
            </div>

            {/* Preview table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 font-mono font-semibold text-[11px] text-slate-800 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Category_Title</th>
                    <th className="p-2.5">Project</th>
                    <th className="p-2.5">Priority</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Owner</th>
                    <th className="p-2.5">DueDate</th>
                    <th className="p-2.5">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {tasks.slice(0, 8).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-indigo-600">{t.id}</td>
                      <td className="p-2.5 text-slate-800 font-medium">{t.title}</td>
                      <td className="p-2.5">{t.project}</td>
                      <td className="p-2.5">{t.priority}</td>
                      <td className="p-2.5">{t.status}</td>
                      <td className="p-2.5 text-slate-800">{t.owner}</td>
                      <td className="p-2.5">{t.dueDate}</td>
                      <td className="p-2.5">{t.progress}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400">
              * แสดงตัวอย่าง 8 แถวแรกจากทั้งหมด {tasks.length} แถว (เมื่อกดปุ่มคัดลอก จะได้ครบทุกแถว)
            </p>
          </div>

          {/* Section 2: Sheet "Employees" */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    ชีตที่ 2: ชื่อแท็บ <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Employees</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  คอลัมน์ข้อมูลพนักงาน (ID, Name, Project, Phone, Email, Role)
                </p>
              </div>

              <button
                id="copy-employees-sheet-btn"
                onClick={() => copyToClipboard(employeesTsv, 'employees')}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98]"
              >
                {copiedSection === 'employees' ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>คัดลอกสำเร็จ! (พร้อมวางในช่อง A1)</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>คัดลอกตาราง Employees ทั้งหมด</span>
                  </>
                )}
              </button>
            </div>

            {/* Preview table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 font-mono font-semibold text-[11px] text-slate-800 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Project</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {employees.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-indigo-600">{e.id}</td>
                      <td className="p-2.5 text-slate-800 font-medium">{e.name}</td>
                      <td className="p-2.5">{e.project}</td>
                      <td className="p-2.5">{e.phone}</td>
                      <td className="p-2.5 text-slate-500">{e.email}</td>
                      <td className="p-2.5">{e.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: STEP-BY-STEP SETUP GUIDE ================= */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* Main Guide Container */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <span>คู่มือการติดตั้ง Google Apps Script แบบแยกหมวดหมู่ (Modular Project)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                การแยกโครงสร้างโค้ดออกเป็นหมวดหมู่ (Navbar, Sidebar, Dashboard, Modals, ฯลฯ)
                ช่วยให้ดูแลรักษาง่าย โค้ดสะอาด แก้ไขเฉพาะจุดได้ทันที
              </p>
            </div>

            {/* Architecture Diagram Banner */}
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 to-blue-50/60 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-600" />
                <span>แผนผังโครงสร้างการเชื่อมต่อไฟล์ (Architecture Flow):</span>
              </h4>
              <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
                <div className="text-emerald-400 font-bold mb-1">📁 Google Apps Script Project</div>
                <div className="text-slate-300">├── ⚡ <span className="text-amber-300 font-bold">Code.gs</span> <span className="text-slate-400">(Server Backend + ฟังก์ชัน include(filename))</span></div>
                <div className="text-slate-300">└── 🌐 <span className="text-indigo-300 font-bold">Index.html</span> <span className="text-slate-400">(โครงสร้างหลัก ประกอบร่างด้วย &lt;?!= include('...') ?&gt;)</span></div>
                <div className="text-slate-400 pl-6">├── 🎨 <span className="text-pink-300">Styles.html</span> <span className="text-slate-500">// ฟอนต์ Sarabun + ป้ายสีสถานะ Badge</span></div>
                <div className="text-slate-400 pl-6">├── 🧭 <span className="text-blue-300">Navbar.html</span> <span className="text-slate-500">// แถบเมนูด้านบน โลโก้ และปุ่มเกี่ยวกับ</span></div>
                <div className="text-slate-400 pl-6">├── 📑 <span className="text-blue-300">Sidebar.html</span> <span className="text-slate-500">// เมนูด้านข้าง Dashboard, งาน, พนักงาน</span></div>
                <div className="text-slate-400 pl-6">├── 📊 <span className="text-emerald-300">Dashboard.html</span> <span className="text-slate-500">// การ์ด KPI 4 ใบ + กราฟสรุป Donut & Bar</span></div>
                <div className="text-slate-400 pl-6">├── 📋 <span className="text-emerald-300">WorkView.html</span> <span className="text-slate-500">// ตารางจัดการงาน ค้นหา และฟิลเตอร์</span></div>
                <div className="text-slate-400 pl-6">├── 👥 <span className="text-emerald-300">EmployeesView.html</span> <span className="text-slate-500">// รายชื่อและภาระงานของทีม</span></div>
                <div className="text-slate-400 pl-6">├── 🪟 <span className="text-purple-300">Modals.html</span> <span className="text-slate-500">// หน้าต่างดูรายละเอียดงาน (WorkDetail), เพิ่มงาน</span></div>
                <div className="text-slate-400 pl-6">└── ⚡ <span className="text-amber-300">JavaScript.html</span> <span className="text-slate-500">// Client Logic, Chart.js, google.script.run</span></div>
              </div>
            </div>

            {/* 4 Steps Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-mono">
                    1
                  </span>
                  <span>เปิด Google Apps Script ในชีต</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  1. เปิดไฟล์ Google Sheet ของคุณ
                  <br />
                  2. ที่เมนูด้านบน คลิก <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong>
                  <br />
                  3. จะเปิดหน้าต่างโค้ดโปรเจกต์ของ Apps Script ขึ้นมา
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-mono">
                    2
                  </span>
                  <span>วางไฟล์ Code.gs</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  1. คลิกไฟล์ <strong>Code.gs</strong> ทางซ้ายมือ ลบโค้ดเดิมออกทั้งหมด
                  <br />
                  2. ไปที่แท็บที่ 1 ของหน้านี้ เลือกไฟล์ <strong className="text-indigo-600">Code.gs</strong> แล้วกดคัดลอกมาวาง
                  <br />
                  3. ในนี้จะมีฟังก์ชัน <code className="bg-slate-200 px-1 rounded font-mono">include(filename)</code> ที่ช่วยรวมไฟล์ HTML ย่อยทั้งหมดเข้าด้วยกัน
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-mono">
                    3
                  </span>
                  <span>สร้างไฟล์ HTML ย่อยตามหมวดหมู่ (9 ไฟล์)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  1. คลิกเครื่องหมายบวก <strong>(+)</strong> ถัดจากคำว่า "ไฟล์ (Files)" &gt; เลือก <strong>HTML</strong>
                  <br />
                  2. ตั้งชื่อไฟล์ตามรายการ (Apps Script จะใส่นามสกุล .html ให้เอง):
                  <span className="block font-mono text-[11px] text-slate-700 mt-1 bg-white p-2 rounded border border-slate-200">
                    • Index • Navbar • Sidebar • Dashboard
                    <br />
                    • WorkView • EmployeesView • Modals • Styles • JavaScript
                  </span>
                  3. คัดลอกโค้ดของแต่ละไฟล์จากแท็บที่ 1 มาวางทีละไฟล์ แล้วกดบันทึก (Ctrl+S)
                </p>
              </div>

              {/* Step 4 */}
              <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-mono">
                    4
                  </span>
                  <span>เปิดใช้งานในชีต หรือทำเป็น Web App!</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  1. กลับไปที่หน้า Google Sheet แล้วกดรีเฟรชหน้าเว็บ 1 ครั้ง
                  <br />
                  2. จะเห็นเมนูใหม่ <strong className="text-indigo-900 bg-indigo-100 px-1.5 py-0.5 rounded">📋 Task Manager</strong> บนแถบเมนูชีต
                  <br />
                  3. คลิก <strong>"⚡ สร้างชีตและข้อมูลตัวอย่างอัตโนมัติ"</strong> ชีตจะสร้างตารางและ Mock data ให้ทันที
                  <br />
                  4. คลิก <strong>"🚀 เปิดระบบ Task Manager"</strong> เพื่อเปิดหน้าต่างจัดการงานสวยงาม
                </p>
              </div>
            </div>

            {/* Why Modular is Better Checklist */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>ข้อดีของการแยกไฟล์ใน Google Apps Script (Modular Best Practice)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <strong className="text-slate-800 block mb-1">✨ 1. โค้ดสะอาด แยกหน้าที่ชัดเจน</strong>
                  แต่ละไฟล์มีความยาวสั้น ไม่ปะปนกัน เช่น ไฟล์ Styles มีเฉพาะ CSS, ไฟล์ JavaScript มีเฉพาะคำสั่ง Client
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <strong className="text-slate-800 block mb-1">🔍 2. ค้นหาและแก้ไขได้ทันที</strong>
                  ต้องการแก้สีหัวเมนูไปที่ Navbar.html, ต้องการเปลี่ยนแบบกราฟไปที่ Dashboard.html ไม่ต้องเลื่อนหาในไฟล์ยาวๆ
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <strong className="text-slate-800 block mb-1">🛡️ 3. ปลอดภัย ไม่กระทบส่วนอื่น</strong>
                  แก้โค้ดเฉพาะคอมโพเนนต์ที่ต้องการ ลดความเสี่ยงที่แท็ก HTML หรือวงเล็บจะหลุดไปกระทบหน้าอื่น
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <strong className="text-slate-800 block mb-1">👥 4. ร่วมมือทำงานในทีมง่าย</strong>
                  คนหนึ่งสามารถปรับดีไซน์ CSS ในขณะที่อีกคนปรับฟังก์ชัน JavaScript ได้อย่างราบรื่น
                </div>
              </div>
            </div>

            {/* Additional Web App Deployment Info */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
              <h4 className="font-semibold text-emerald-900 text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>ต้องการแชร์ลิงก์ Web App ให้เพื่อนร่วมทีมเปิดใช้งาน?</span>
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                ในหน้า Apps Script คลิกปุ่ม <strong>การทำให้ใช้งานได้ (Deploy)</strong> &gt; <strong>การทำให้ใช้งานได้ใหม่ (New deployment)</strong>
                &gt; เลือกประเภท <strong>เว็บแอปพลิเคชัน (Web app)</strong> &gt; ตั้งค่า Who has access เป็น <strong>ทุกคน (Anyone)</strong>
                คุณจะได้ URL สำหรับเปิด Task Manager เต็มหน้าจอจากที่ไหนก็ได้โดยเชื่อมเข้ากับชีตนี้อัตโนมัติ!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: LIVE PREVIEW OF INDEX.HTML ================= */}
      {isPreviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-hidden"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[96vw] h-[96vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500"></div>
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-mono text-slate-300 ml-2">
                  ตัวอย่างการแสดงผล Index.html ใน Google Apps Script Web App / Modal Dialog
                </span>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 w-full bg-slate-100 overflow-hidden relative">
              <iframe
                title="Apps Script Web App Preview"
                srcDoc={GAS_INDEX_HTML}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-forms allow-modals"
              />
            </div>

            <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>* จำลองสภาพแวดล้อม Index.html เมื่อรันบน Apps Script (มีระบบ Mock Data รองรับ)</span>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                ปิดหน้าต่างตัวอย่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
