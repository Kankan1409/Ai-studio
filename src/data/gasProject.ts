/**
 * Google Apps Script Project Files (Code.gs + Index.html)
 * Ready-to-copy source code for Google Sheets Add-on / Web App
 */

export const GAS_CODE_GS = `/**
 * ==============================================================================
 * 📋 TASK MANAGER - GOOGLE APPS SCRIPT (Code.gs)
 * ==============================================================================
 * สคริปต์บริหารจัดการงาน (Task Manager) เชื่อมต่อ Google Sheets อัตโนมัติ
 * รองรับทั้ง:
 * 1. เมนูเปิดในหน้าต่าง Dialog หรือ Sidebar บน Google Sheets โดยตรง
 * 2. เผยแพร่เป็น Web App ให้ทีมงานเปิดใช้งานผ่านลิงก์ได้ทุกที่
 * 3. ฟังก์ชันสร้างตาราง (Tasks & Employees) และข้อมูลเริ่มต้นอัตโนมัติในคลิกเดียว
 * ==============================================================================
 */

const SHEET_TASKS = "Tasks";
const SHEET_EMPLOYEES = "Employees";

/**
 * เมนูเมื่อเปิดไฟล์ Google Sheets ขึ้นมา
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📋 Task Manager")
    .addItem("🚀 เปิดระบบ Task Manager (หน้าต่างใหญ่เต็มจอ)", "showTaskManagerDialog")
    .addItem("🌐 เปิด Web App เต็มหน้าจอเบราว์เซอร์", "openFullScreenWebApp")
    .addItem("📱 เปิดแถบข้าง (Sidebar)", "showTaskManagerSidebar")
    .addSeparator()
    .addItem("⚡ สร้างชีตและข้อมูลตัวอย่างอัตโนมัติ (1-Click Setup)", "setupSheetAndSampleData")
    .addToUi();
}

/**
 * Web App Entry point (เมื่อ Deploy เป็น Web App)
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Task Manager - ระบบบริหารจัดการงาน")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0");
}

/**
 * 💡 ฟังก์ชันสำคัญสำหรับระบบแยกไฟล์ (Modular Structure)
 * ทำหน้าที่ดึงเนื้อหาจากไฟล์ HTML ย่อย (เช่น Navbar, Sidebar, Dashboard, JavaScript)
 * เข้ามาประกอบใน Index.html อัตโนมัติด้วยคำสั่ง <?!= include('ชื่อไฟล์'); ?>
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * เปิดหน้าต่าง Modal Dialog บน Google Sheets ขนาดใหญ่เต็มหน้าจอคอมพิวเตอร์
 */
function showTaskManagerDialog() {
  const html = HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setWidth(1400)
    .setHeight(850);
  SpreadsheetApp.getUi().showModalDialog(html, "Task Manager - ระบบบริหารจัดการงาน (เต็มจอ)");
}

/**
 * เปิด Web App บนแท็บใหม่แบบเต็มหน้าจอคอมพิวเตอร์ 100%
 */
function openFullScreenWebApp() {
  const url = ScriptApp.getService().getUrl();
  if (!url) {
    SpreadsheetApp.getUi().alert("กรุณา Deploy เป็น Web App ก่อน โดยไปที่เมนู Deploy (การทำให้ใช้งานได้) > New deployment > เลือก Web app");
    return;
  }
  const html = HtmlService.createHtmlOutput(
    '<script>window.open("' + url + '", "_blank");google.script.host.close();</script>'
  ).setWidth(340).setHeight(100);
  SpreadsheetApp.getUi().showModalDialog(html, "กำลังเปิด Task Manager เต็มจอ...");
}

/**
 * เปิดแถบเครื่องมือด้านข้าง (Sidebar)
 */
function showTaskManagerSidebar() {
  const html = HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Task Manager");
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * ฟังก์ชันดึงข้อมูลเริ่มต้นทั้งหมดส่งให้หน้าเว็บ (Tasks + Employees)
 */
function apiGetInitialData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    checkAndInitSheets(ss);

    const tasks = getSheetData(ss, SHEET_TASKS);
    const employees = getSheetData(ss, SHEET_EMPLOYEES);

    return {
      success: true,
      tasks: tasks,
      employees: employees,
      sheetUrl: ss.getUrl()
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * ฟังก์ชันบันทึกหรืออัปเดตงาน (Save/Update Task)
 */
function apiSaveTask(task) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_TASKS);
    if (!sheet) {
      setupSheetAndSampleData();
      sheet = ss.getSheetByName(SHEET_TASKS);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data.length > 0 ? data[0] : [];
    let rowIndex = -1;

    // หาว่ามี Task ID นี้อยู่แล้วหรือไม่
    const taskId = task.id || task.projectId;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == taskId) {
        rowIndex = i + 1;
        break;
      }
    }

    const subtasksJson = task.subtasks ? JSON.stringify(task.subtasks) : "[]";
    const progressVal = task.progress !== undefined ? Number(task.progress) : 0;
    const progressBarVal = task.progressBar || (progressVal + "%");

    // Dynamic mapping by header column name
    const fieldMap = {
      "Project ID": taskId || "",
      "ID": taskId || "",
      "Category": task.category || task.project || "",
      "Project Name": task.title || task.projectName || "",
      "Category_Title": task.title || "",
      "Project": task.project || task.category || "Project 1",
      "Description": task.description || "",
      "Tech Stack / Tools": task.techStack || "",
      "Tech Stack": task.techStack || "",
      "Start Date": task.startDate || "",
      "StartDate": task.startDate || "",
      "Due Date": task.dueDate || "",
      "DueDate": task.dueDate || "",
      "Duration": task.duration ? String(task.duration) : "",
      "Owner": task.owner || "",
      "OwnerPhone": task.ownerPhone || "",
      "OwnerEmail": task.ownerEmail || "",
      "Priority": task.priority || "Medium",
      "Status": task.status || "Todo",
      "Result / Outcome": task.resultOutcome || "",
      "Project Link": task.projectLink || "",
      "Project Progress": progressVal,
      "Progress": progressVal,
      "Progress Bar": progressBarVal,
      "Subtasks": subtasksJson,
      "UpdatedAt": new Date().toISOString()
    };

    let rowData;
    if (headers.length > 0) {
      rowData = headers.map(function(h) {
        const key = String(h).trim();
        return fieldMap[key] !== undefined ? fieldMap[key] : "";
      });
    } else {
      rowData = [
        taskId,
        task.category || task.project || "",
        task.title || "",
        task.description || "",
        task.techStack || "",
        task.startDate || "",
        task.dueDate || "",
        task.duration ? String(task.duration) : "",
        task.owner || "",
        task.priority || "Medium",
        task.status || "Todo",
        task.resultOutcome || "",
        task.projectLink || "",
        progressVal,
        progressBarVal
      ];
    }

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return { success: true, message: "บันทึกข้อมูลงานสำเร็จ" };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * ฟังก์ชันบันทึกงานหลายรายการพร้อมกัน (Batch Save Tasks / Template Checklist)
 */
function apiSaveTasksBatch(tasks) {
  try {
    if (!Array.isArray(tasks)) return { success: false, error: "ข้อมูลไม่ถูกต้อง" };
    tasks.forEach(function(t) { apiSaveTask(t); });
    return { success: true, count: tasks.length };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * ฟังก์ชันลบงาน (Delete Task)
 */
function apiDeleteTask(taskId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_TASKS);
    if (!sheet) return { success: false, error: "ไม่พบชีต Tasks" };

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == taskId) {
        sheet.deleteRow(i + 1);
        return { success: true, message: "ลบงานเรียบร้อยแล้ว" };
      }
    }
    return { success: false, error: "ไม่พบรหัสงานนี้" };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * ฟังก์ชันเปลี่ยนสถานะงานอย่างรวดเร็ว (Update Status)
 */
function apiUpdateTaskStatus(taskId, newStatus) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_TASKS);
    if (!sheet) return { success: false, error: "ไม่พบชีต Tasks" };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: false, error: "ไม่มีข้อมูลงาน" };

    const headers = data[0];
    let statusCol = -1;
    let progressCol = -1;

    for (let c = 0; c < headers.length; c++) {
      const h = String(headers[c]).trim();
      if (h === "Status") statusCol = c + 1;
      if (h === "Project Progress" || h === "Progress") progressCol = c + 1;
    }
    if (statusCol === -1) statusCol = 11; // Default to Column K in 15-field schema

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == taskId) {
        sheet.getRange(i + 1, statusCol).setValue(newStatus);
        if (newStatus === "Completed" && progressCol > 0) {
          sheet.getRange(i + 1, progressCol).setValue(100);
        }
        return { success: true, message: "อัปเดตสถานะสำเร็จ" };
      }
    }
    return { success: false, error: "ไม่พบรหัสงานนี้" };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * ฟังก์ชันบันทึกหรืออัปเดตพนักงาน (Save Employee)
 */
function apiSaveEmployee(emp) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_EMPLOYEES);
    if (!sheet) {
      setupSheetAndSampleData();
      sheet = ss.getSheetByName(SHEET_EMPLOYEES);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data.length > 0 ? data[0] : [];
    let rowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == emp.id) {
        rowIndex = i + 1;
        break;
      }
    }

    const empFieldMap = {
      "ID": emp.id,
      "Name": emp.name,
      "Phone": emp.phone || "",
      "Project ID": emp.projectId || emp.project || "",
      "Project": emp.project || emp.projectId || "",
      "Email": emp.email || "",
      "Role": emp.role || "",
      "TasksCount": emp.tasksCount || 0
    };

    let rowData;
    if (headers.length > 0) {
      rowData = headers.map(function(h) {
        const key = String(h).trim();
        return empFieldMap[key] !== undefined ? empFieldMap[key] : "";
      });
    } else {
      rowData = [
        emp.id,
        emp.name,
        emp.phone || "",
        emp.projectId || emp.project || ""
      ];
    }

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return { success: true, message: "บันทึกข้อมูลพนักงานสำเร็จ" };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * สร้างชีตและข้อมูลตัวอย่างทั้งหมดอัตโนมัติ (1-Click Setup)
 * รองรับทั้ง 15 คอลัมน์ของ Tasks และ 4 คอลัมน์ของ Employees
 */
function setupSheetAndSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. ชีต Tasks (15 Columns ตามโครงสร้างใหม่)
  let taskSheet = ss.getSheetByName(SHEET_TASKS);
  if (!taskSheet) {
    taskSheet = ss.insertSheet(SHEET_TASKS);
  } else {
    taskSheet.clear();
  }

  const taskHeaders = [
    "Project ID",
    "Category",
    "Project Name",
    "Description",
    "Tech Stack / Tools",
    "Start Date",
    "Due Date",
    "Duration",
    "Owner",
    "Priority",
    "Status",
    "Result / Outcome",
    "Project Link",
    "Project Progress",
    "Progress Bar"
  ];

  taskSheet.getRange(1, 1, 1, taskHeaders.length)
    .setValues([taskHeaders])
    .setBackground("#1e293b")
    .setFontColor("#ffffff")
    .setFontWeight("bold");

  const sampleTasks = [
    ["PID-123", "Website", "พัฒนาหน้า Dashboard และสถิติรายสัปดาห์", "จัดทำ Dashboard และตรวจสอบความถูกต้องของสถิติรายสัปดาห์ W01-W52", "React, Tailwind, Google Apps Script", "2026-09-01", "2026-09-06", "5 วัน", "พี่ไมค์", "High", "Completed", "ระบบแสดงผลสถิติและกราฟทำงานถูกต้อง 100%", "https://script.google.com", 100, "100%"],
    ["PID-122", "Marketing", "จัดเตรียมแคมเปญเปิดตัวและคู่มือการใช้งาน", "จัดทำ Card สรุปสถานะ 4 กล่องพร้อมกราฟและคู่มือแนะนำระบบ", "Canva, Notion, Google Docs", "2026-09-02", "2026-09-07", "5 วัน", "พี่หน่อง", "Medium", "In progress", "คู่มือและภาพกราฟิกสำหรับเผยแพร่", "https://docs.google.com", 50, "50%"],
    ["PID-121", "DevOps", "เชื่อมต่อ Web App เข้ากับ Google Apps Script", "ติดตั้ง Web App และทดสอบการซิงค์ข้อมูลกับชีต", "Google Apps Script, REST API", "2026-09-03", "2026-09-09", "6 วัน", "พี่ตู้", "High", "In progress", "API บันทึกและดึงข้อมูลเสถียร", "https://script.google.com", 45, "45%"],
    ["PID-120", "Content", "Publish blog page & Case Study", "เขียนบทความแนะนำฟีเจอร์และกรณีศึกษาการใช้งาน", "WordPress, SEO Tools", "2026-09-01", "2026-09-08", "7 วัน", "พี่ไมค์", "Low", "Blocked", "บทความเผยแพร่บนเว็บบริษัท", "", 25, "25%"],
    ["PID-119", "Design System", "Add gradients and tokens to design system", "เพิ่มชุดโทนสีใน Tailwind CSS ให้รองรับแบรนด์ใหม่และ UI components", "Figma, Tailwind CSS, Lucide Icons", "2026-08-28", "2026-09-02", "5 วัน", "วรรณา", "Medium", "Completed", "ชุด UI Components พร้อมใช้งาน", "https://figma.com", 100, "100%"]
  ];

  taskSheet.getRange(2, 1, sampleTasks.length, taskHeaders.length).setValues(sampleTasks);
  taskSheet.setFrozenRows(1);
  taskSheet.autoResizeColumns(1, taskHeaders.length);

  // Data validation สำหรับ Status (Column K: Col 11)
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Todo", "In progress", "Completed", "Blocked"], true)
    .build();
  taskSheet.getRange("K2:K100").setDataValidation(statusRule);

  // Data validation สำหรับ Priority (Column J: Col 10)
  const priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["High", "Medium", "Low"], true)
    .build();
  taskSheet.getRange("J2:J100").setDataValidation(priorityRule);

  // 2. ชีต Employees (4 Columns: ID, Name, Phone, Project ID)
  let empSheet = ss.getSheetByName(SHEET_EMPLOYEES);
  if (!empSheet) {
    empSheet = ss.insertSheet(SHEET_EMPLOYEES);
  } else {
    empSheet.clear();
  }

  const empHeaders = [
    "ID",
    "Name",
    "Phone",
    "Project ID"
  ];
  empSheet.getRange(1, 1, 1, empHeaders.length)
    .setValues([empHeaders])
    .setBackground("#1e293b")
    .setFontColor("#ffffff")
    .setFontWeight("bold");

  const sampleEmployees = [
    ["E01", "พี่ไมค์", "081-445-6789", "Project 1"],
    ["E02", "พี่หน่อง", "089-112-3344", "แผนก/การตลาด"],
    ["E03", "พี่ตู้", "086-778-9900", "แผนก/ITW"],
    ["E04", "สมชาย", "085-334-5566", "แผนก/ITW"],
    ["E05", "วรรณา", "082-998-7711", "แผนก/ออกแบบ"]
  ];

  empSheet.getRange(2, 1, sampleEmployees.length, empHeaders.length).setValues(sampleEmployees);
  empSheet.setFrozenRows(1);
  empSheet.autoResizeColumns(1, empHeaders.length);

  SpreadsheetApp.getActiveSpreadsheet().toast("สร้างชีต Tasks (15 ฟิลด์) และ Employees (4 ฟิลด์) เรียบร้อยแล้ว!", "สำเร็จ", 5);
  return { success: true };
}

/**
 * ฟังก์ชันช่วยตรวจสอบและสร้างชีตหากยังไม่มี
 */
function checkAndInitSheets(ss) {
  if (!ss.getSheetByName(SHEET_TASKS) || !ss.getSheetByName(SHEET_EMPLOYEES)) {
    setupSheetAndSampleData();
  }
}

/**
 * ฟังก์ชันแปลงชีตเป็น Array of Objects
 * รองรับทั้งหัวตารางใหม่ 15 ฟิลด์ และหัวตารางเดิมเพื่อความเข้ากันได้อย่างสมบูรณ์
 */
function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const results = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue; // ข้ามแถวที่ไม่มี ID

    const item = {};
    headers.forEach(function(header, index) {
      let val = row[index];
      const hStr = String(header).trim();
      if ((hStr === "Subtasks" || hStr === "Checklist") && typeof val === "string" && val.trim().startsWith("[")) {
        try {
          val = JSON.parse(val);
        } catch (e) {
          val = [];
        }
      }
      item[hStr] = val;
    });

    // Map to unified schema supporting both new 15-column format and legacy format
    const taskId = String(item["Project ID"] || item["ID"] || item["id"] || "").trim();
    const title = item["Project Name"] || item["ProjectName"] || item["Category_Title"] || item["Title"] || item["title"] || "";
    const category = item["Category"] || item["category"] || item["Project"] || "Project 1";
    const project = item["Project"] || item["Category"] || "Project 1";
    const description = item["Description"] || item["description"] || "";
    const techStack = item["Tech Stack / Tools"] || item["TechStack"] || item["Tech Stack"] || item["techStack"] || "";
    const startDate = item["Start Date"] ? String(item["Start Date"]).substring(0, 10) : (item["StartDate"] ? String(item["StartDate"]).substring(0, 10) : "");
    const dueDate = item["Due Date"] ? String(item["Due Date"]).substring(0, 10) : (item["DueDate"] ? String(item["DueDate"]).substring(0, 10) : "");
    const duration = item["Duration"] || item["duration"] || "";
    const owner = item["Owner"] || item["owner"] || "";
    const priority = item["Priority"] || item["priority"] || "Medium";
    const status = item["Status"] || item["status"] || "Todo";
    const resultOutcome = item["Result / Outcome"] || item["ResultOutcome"] || item["resultOutcome"] || "";
    const projectLink = item["Project Link"] || item["ProjectLink"] || item["projectLink"] || "";
    
    let progress = 0;
    if (item["Project Progress"] !== undefined && item["Project Progress"] !== "") {
      progress = Number(item["Project Progress"]);
    } else if (item["Progress"] !== undefined && item["Progress"] !== "") {
      progress = Number(item["Progress"]);
    }
    const progressBar = item["Progress Bar"] || item["ProgressBar"] || (progress + "%");

    const mapped = {
      id: taskId,
      title: title,
      category: category,
      project: project,
      priority: priority,
      status: status,
      owner: owner,
      ownerPhone: item["OwnerPhone"] || item["Phone"] || "",
      ownerEmail: item["OwnerEmail"] || item["Email"] || "",
      techStack: techStack,
      startDate: startDate,
      dueDate: dueDate,
      duration: duration,
      description: description,
      resultOutcome: resultOutcome,
      projectLink: projectLink,
      progress: progress,
      progressBar: progressBar,
      subtasks: Array.isArray(item.Subtasks) ? item.Subtasks : [],
      name: item.Name || "",
      phone: item.Phone || "",
      projectId: item["Project ID"] || item["Project"] || "",
      email: item.Email || "",
      role: item.Role || "Team Member",
      tasksCount: item.TasksCount !== undefined ? Number(item.TasksCount) : 0
    };

    results.push(mapped);
  }
  return results;
}
`;

/**
 * ==============================================================================
 * 🌟 MODULAR GOOGLE APPS SCRIPT FILES (แยกตามหมวดหมู่เพื่อการดูแลรักษาง่าย)
 * ==============================================================================
 * ใน Google Apps Script (HTML Service) การแยกไฟล์เป็นหมวดหมู่จะช่วยให้โค้ดสะอาด
 * ไม่ปนกัน โดยอาศัยฟังก์ชัน include('ชื่อไฟล์') ใน Code.gs เพื่อดึงเนื้อหาแต่ละไฟล์
 * เข้ามาประกอบใน Index.html อัตโนมัติด้วยคำสั่ง <?!= include('ชื่อไฟล์'); ?>
 * ==============================================================================
 */

// 1. Styles.html - ฟอนต์ สไตล์สี สถานะ และ CSS
export const GAS_STYLES_HTML = `<!-- Styles.html: สไตล์และฟอนต์สำหรับระบบ Task Manager -->
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
  body { font-family: 'Sarabun', sans-serif; }
  .status-badge-completed { background-color: #ecfdf5; color: #047857; border-color: #a7f3d0; }
  .status-badge-inprogress { background-color: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
  .status-badge-blocked { background-color: #fff1f2; color: #be123c; border-color: #fecdd3; }
  .status-badge-todo { background-color: #f8fafc; color: #475569; border-color: #e2e8f0; }
</style>
`;

// 2. Navbar.html - ส่วนหัวด้านบน (Top Bar Header) ตามรูปที่ 2
export const GAS_NAVBAR_HTML = `<!-- Navbar.html: ส่วนหัวด้านบน (Top Navigation Bar) -->
<header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
  <div class="w-full px-4 sm:px-6 py-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
        <i data-lucide="check-square" class="w-5 h-5"></i>
      </div>
      <div class="flex items-center gap-2">
        <h1 class="text-lg font-bold tracking-tight text-slate-900">Task Manager</h1>
        <span class="hidden md:inline-block text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
          ระบบบริหารจัดการงาน
        </span>
      </div>
    </div>

    <div class="flex items-center gap-3 sm:gap-4">
      <!-- ปุ่มแสดงผลเต็มจอคอม (Fullscreen) -->
      <button onclick="toggleFullScreen()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition cursor-pointer shadow-2xs">
        <i data-lucide="maximize-2" class="w-3.5 h-3.5 text-indigo-600"></i>
        <span>เต็มจอคอม</span>
      </button>

      <!-- เกี่ยวกับ (About) -->
      <button onclick="openModal('modal-about')" class="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">
        <i data-lucide="help-circle" class="w-4 h-4 text-slate-500"></i>
        <span class="hidden sm:inline">เกี่ยวกับ</span>
      </button>

      <!-- User Avatar "A" -->
      <div class="flex items-center pl-2 border-l border-slate-200 shrink-0">
        <div class="flex h-8 w-8 min-w-[32px] min-h-[32px] shrink-0 aspect-square items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white shadow-xs select-none">
          A
        </div>
      </div>
    </div>
  </div>
</header>
`;

// 3. Sidebar.html - เมนูด้านข้าง (Sidebar Navigation) ตามรูปที่ 2
export const GAS_SIDEBAR_HTML = `<!-- Sidebar.html: เมนูด้านข้าง (Sidebar Navigation) -->
<aside class="w-full md:w-60 bg-white border-r border-slate-200 py-5 px-3 flex flex-col justify-between shrink-0 select-none min-h-[calc(100vh-61px)]">
  <div>
    <!-- Main Navigation Group -->
    <div class="space-y-1">
      <button onclick="switchTab('dashboard')" id="nav-dashboard" class="nav-btn w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-50/80 text-indigo-700">
        <i data-lucide="layout-grid" class="w-4.5 h-4.5 text-indigo-600"></i>
        <span>Dashboard</span>
      </button>
      <button onclick="switchTab('work')" id="nav-work" class="nav-btn w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
        <div class="flex items-center gap-3">
          <i data-lucide="check-square" class="w-4.5 h-4.5 text-slate-400"></i>
          <span>งานทั้งหมด</span>
        </div>
        <span id="badge-tasks-count" class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">0</span>
      </button>
      <button onclick="switchTab('employees')" id="nav-employees" class="nav-btn w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
        <div class="flex items-center gap-3">
          <i data-lucide="users" class="w-4.5 h-4.5 text-slate-400"></i>
          <span>พนักงาน</span>
        </div>
        <span id="badge-emp-count" class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">0</span>
      </button>
    </div>

    <!-- Divider line matching Image 2 -->
    <div class="border-t border-slate-200 my-4 mx-1"></div>

    <!-- Category Header: ตั้งค่า -->
    <div class="px-3 pb-2 text-xs font-medium text-slate-400">
      ตั้งค่า
    </div>

    <!-- Settings Group matching Image 2 -->
    <div class="space-y-1">
      <button onclick="openModal('modal-settings')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
        <i data-lucide="settings" class="w-4.5 h-4.5 text-slate-400"></i>
        <span>ตั้งค่า</span>
      </button>
      <button onclick="refreshData()" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
        <div class="flex items-center gap-3">
          <i data-lucide="file-spreadsheet" class="w-4.5 h-4.5 text-emerald-600"></i>
          <span>ซิงค์ Google Sheets</span>
        </div>
        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
      </button>
    </div>
  </div>

  <!-- Bottom Card -->
  <div class="pt-4">
    <div class="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-600">
      <div class="flex items-center gap-2 font-semibold text-slate-800 mb-1">
        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
        <span>Google Sheets Connected</span>
      </div>
      <p class="text-[11px] text-slate-500 leading-relaxed">
        เชื่อมต่อชีต Tasks และ Employees อัตโนมัติแบบเรียลไทม์
      </p>
    </div>
  </div>
</aside>
`;

// 4. Dashboard.html - หน้าแดชบอร์ดสรุปผล สถิติ KPI และกราฟ
export const GAS_DASHBOARD_HTML = `<!-- Dashboard.html: หน้าแดชบอร์ดสรุปผล สถิติ KPI และกราฟ Chart.js -->
<section id="tab-dashboard" class="tab-content space-y-6">
  <div>
    <h2 class="text-xl font-bold text-slate-900">Dashboard ภาพรวมงาน</h2>
    <p class="text-xs text-slate-500">สถิติความก้าวหน้าและการดำเนินงานทั้งหมด</p>
  </div>

  <!-- 4 Stat Metric Cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
      <span class="text-xs font-semibold text-slate-500">งานทั้งหมด</span>
      <div id="stat-total" class="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">0</div>
      <div class="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div class="h-full bg-slate-600 w-full"></div>
      </div>
    </div>
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
      <span class="text-xs font-semibold text-emerald-600">เสร็จสิ้นแล้ว</span>
      <div id="stat-completed" class="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">0</div>
      <div class="mt-2 h-1.5 w-full bg-emerald-50 rounded-full overflow-hidden">
        <div id="bar-completed" class="h-full bg-emerald-500" style="width: 0%"></div>
      </div>
    </div>
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
      <span class="text-xs font-semibold text-blue-600">กำลังทำอยู่</span>
      <div id="stat-inprogress" class="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">0</div>
      <div class="mt-2 h-1.5 w-full bg-blue-50 rounded-full overflow-hidden">
        <div id="bar-inprogress" class="h-full bg-blue-500" style="width: 0%"></div>
      </div>
    </div>
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
      <span class="text-xs font-semibold text-slate-600">ยังไม่เริ่ม (Todo)</span>
      <div id="stat-todo" class="text-2xl sm:text-3xl font-bold text-slate-700 mt-1">0</div>
      <div class="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div id="bar-todo" class="h-full bg-slate-400" style="width: 0%"></div>
      </div>
    </div>
  </div>

  <!-- CHARTS SECTION (Chart.js) -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <!-- Status Donut Chart -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <i data-lucide="pie-chart" class="w-4 h-4 text-indigo-600"></i>
          สัดส่วนสถานะงาน (Donut Chart)
        </span>
        <span class="text-[11px] text-slate-400">ภาพรวม</span>
      </div>
      <div class="h-[210px] relative flex items-center justify-center py-2">
        <canvas id="chart-status-donut"></canvas>
      </div>
    </div>

    <!-- Weekly Bar Chart (คำนวณตามสัปดาห์ W36, W37...) -->
    <!-- Weekly Activity Bar Chart (ครบ 52 สัปดาห์ตลอดทั้งปี) -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col justify-between">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <i data-lucide="bar-chart-3" class="w-4 h-4 text-indigo-600"></i>
            สถิติปริมาณงานรายสัปดาห์ตลอดทั้งปี (Annual Weekly Activity - W01 ถึง W52)
          </span>
          <p class="text-[11px] text-slate-400 mt-0.5">คำนวณแยกทุกสัปดาห์ครบทั้ง 52 สัปดาห์ตลอดทั้งปี 2026</p>
        </div>
        <div id="weekly-stat-badges" class="flex flex-wrap items-center gap-2 text-xs">
          <!-- Rendered by JS: W36 & W37 summary badges -->
        </div>
      </div>

      <!-- Filter Buttons for Period Selection -->
      <div class="flex flex-wrap items-center gap-1.5 py-2 text-xs">
        <button type="button" onclick="setGasWeekFilter('ALL')" id="gas-btn-week-ALL" class="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-medium text-[11px] shadow-xs">ตลอดทั้งปี (52 สัปดาห์ W01-W52)</button>
        <button type="button" onclick="setGasWeekFilter('CURRENT')" id="gas-btn-week-CURRENT" class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px]">ช่วงปัจจุบัน (W32-W40)</button>
        <button type="button" onclick="setGasWeekFilter('Q1')" id="gas-btn-week-Q1" class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px]">Q1 (W01-W13)</button>
        <button type="button" onclick="setGasWeekFilter('Q2')" id="gas-btn-week-Q2" class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px]">Q2 (W14-W26)</button>
        <button type="button" onclick="setGasWeekFilter('Q3')" id="gas-btn-week-Q3" class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px]">Q3 (W27-W39)</button>
        <button type="button" onclick="setGasWeekFilter('Q4')" id="gas-btn-week-Q4" class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px]">Q4 (W40-W52)</button>
      </div>

      <div class="w-full overflow-x-auto py-1">
        <div id="gas-weekly-chart-wrapper" style="min-width: 1200px; height: 215px;">
          <canvas id="chart-weekly-bar"></canvas>
        </div>
      </div>
      <div class="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <span>คำนวณครบ 52 สัปดาห์ตลอดทั้งปี (W01 ถึง W52) | เลื่อนแนวนอนหรือกดเลือกดูตามไตรมาสได้</span>
        <span class="text-indigo-600 font-semibold">อัปเดตตามกำหนดส่งและสถานะงานจริง</span>
      </div>
    </div>
  </div>

  <!-- Project / Owner Progress Bar Chart - แยกตามคน / ผู้รับผิดชอบ -->
  <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
    <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
      <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
        <i data-lucide="users" class="w-4 h-4 text-indigo-600"></i>
        งานปฏิบัติการแยกตามผู้รับผิดชอบ (แยกตามคน / Assigned to)
      </span>
      <span class="text-[11px] text-slate-400">สัดส่วนความคืบหน้าของแต่ละบุคคล</span>
    </div>
    <div class="h-[220px]">
      <canvas id="chart-project-bar"></canvas>
    </div>
  </div>

  <!-- Recent Tasks List on Dashboard -->
  <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-slate-900">งานล่าสุดที่กำลังดำเนินการ</h3>
      <button onclick="switchTab('work')" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
        ดูงานทั้งหมด &rarr;
      </button>
    </div>
    <div id="dashboard-recent-tasks" class="divide-y divide-slate-100">
      <!-- Rendered by JS -->
    </div>
  </div>
</section>
`;

// 5. WorkView.html - หน้ารายการงานทั้งหมด
export const GAS_WORKVIEW_HTML = `<!-- WorkView.html: หน้ารายการงานทั้งหมด (ตารางงาน, ค้นหา, กรองสถานะ) -->
<section id="tab-work" class="tab-content hidden space-y-4">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <h2 class="text-xl font-bold text-slate-900">งานทั้งหมด (Work)</h2>
      <p class="text-xs text-slate-500">คลิกที่แถวของงานเพื่อเปิดดูรายละเอียด (workdetail)</p>
    </div>
    <button onclick="openAddTaskModal()" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-4 text-xs font-semibold shadow-xs transition">
      <i data-lucide="plus" class="w-4 h-4"></i>
      <span>+ เพิ่มงานใหม่</span>
    </button>
  </div>

  <!-- Filter Controls -->
  <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
    <div class="flex-1 min-w-[200px] relative">
      <input type="text" id="filter-search" oninput="applyFilters()" placeholder="ค้นหางาน, ผู้รับผิดชอบ, PID..." class="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
      <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
    </div>
    <select id="filter-status" onchange="applyFilters()" class="text-xs py-1.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
      <option value="">ทุกสถานะ (All Status)</option>
      <option value="Completed">Completed (เสร็จแล้ว)</option>
      <option value="In progress">In progress (กำลังทำ)</option>
      <option value="Todo">Todo (ยังไม่เริ่ม)</option>
      <option value="Blocked">Blocked (ติดปัญหา)</option>
    </select>
    <select id="filter-priority" onchange="applyFilters()" class="text-xs py-1.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
      <option value="">ทุกความสำคัญ</option>
      <option value="High">High (สูง)</option>
      <option value="Medium">Medium (กลาง)</option>
      <option value="Low">Low (ต่ำ)</option>
    </select>
  </div>

  <!-- Tasks Table -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase">
          <tr>
            <th class="p-3">ID</th>
            <th class="p-3 min-w-[160px]">Category / Title</th>
            <th class="p-3">Project</th>
            <th class="p-3">Priority</th>
            <th class="p-3">Status</th>
            <th class="p-3 min-w-[110px]">ความก้าวหน้า</th>
            <th class="p-3">Checklist</th>
            <th class="p-3">Owner</th>
            <th class="p-3">กำหนดส่ง</th>
            <th class="p-3 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody id="tasks-table-body" class="divide-y divide-slate-100">
          <!-- Rows injected by JS -->
        </tbody>
      </table>
    </div>
    <div id="no-tasks-msg" class="hidden p-8 text-center text-xs text-slate-400">
      ไม่พบรายการงานตามเงื่อนไขที่ค้นหา
    </div>
  </div>
</section>
`;

// 6. EmployeesView.html - หน้ารายชื่อและภาระงานพนักงาน (แบบตาราง)
export const GAS_EMPLOYEESVIEW_HTML = `<!-- EmployeesView.html: หน้ารายชื่อและข้อมูลพนักงานแบบตาราง -->
<section id="tab-employees" class="tab-content hidden space-y-5">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold tracking-tight text-slate-900">รายชื่อพนักงาน</h2>
      <p class="text-xs sm:text-sm text-slate-500 mt-0.5">ข้อมูลติดต่อและภาระงานของทีมงานในระบบ</p>
    </div>
    <button onclick="openAddEmployeeModal()" class="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer">
      <i data-lucide="plus" class="w-4 h-4 stroke-[2.5]"></i>
      <span>+ เพิ่มพนักงาน</span>
    </button>
  </div>

  <!-- Search & Filter Toolbar -->
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
    <div class="relative flex-1">
      <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
      <input
        id="employee-search"
        type="text"
        oninput="renderEmployees()"
        placeholder="ค้นหาชื่อพนักงาน, รหัส, แผนก, เบอร์โทร..."
        class="w-full rounded-xl border-0 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600 transition outline-none"
      />
    </div>

    <div class="flex items-center gap-2">
      <select
        id="employee-dept-filter"
        onchange="renderEmployees()"
        class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="all">ทุกแผนก / โครงการ</option>
      </select>
    </div>
  </div>

  <!-- Employees Table (ตารางรายชื่อพนักงาน) -->
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs text-slate-600 border-collapse">
        <thead class="border-b border-slate-200 bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
          <tr>
            <th scope="col" class="px-5 py-3.5 w-24">ID</th>
            <th scope="col" class="px-5 py-3.5">Name / ชื่อพนักงาน</th>
            <th scope="col" class="px-5 py-3.5">Project / แผนก</th>
            <th scope="col" class="px-5 py-3.5">Number / เบอร์ติดต่อ</th>
            <th scope="col" class="px-5 py-3.5 text-center">งานที่รับผิดชอบ</th>
            <th scope="col" class="px-5 py-3.5 text-right w-24">จัดการ</th>
          </tr>
        </thead>
        <tbody id="employees-table-body" class="divide-y divide-slate-100">
          <!-- Rendered by JS -->
        </tbody>
      </table>
    </div>

    <div class="border-t border-slate-200 bg-slate-50/50 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
      <div id="employees-total-count">
        พนักงานทั้งหมด <strong>0</strong> คน
      </div>
    </div>
  </div>
</section>
`;

// 7. Modals.html - หน้าต่างป๊อปอัปทั้งหมด
export const GAS_MODALS_HTML = `<!-- Modals.html: หน้าต่างป๊อปอัปทั้งหมด (WorkDetail, AddTask, About, Settings) -->

<!-- 1. MODAL: WORK DETAIL -->
<div id="modal-workdetail" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 hidden">
  <div class="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" onclick="event.stopPropagation()">
    <!-- Header with ID, Title, and Edit Mode Toggle Button -->
    <div class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
      <div class="flex-1 mr-3">
        <span id="detail-id" class="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">PID-000</span>
        <h3 id="detail-title-view" class="text-base font-bold mt-1 text-white">รายละเอียดงาน</h3>
        <input type="text" id="detail-title-input" class="hidden w-full mt-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500" placeholder="ชื่อหัวข้องาน...">
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <!-- ปุ่มแก้ไขงาน (Edit Button) -->
        <button id="btn-toggle-edit-task" onclick="toggleTaskEditMode()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer border border-slate-700 transition">
          <i data-lucide="edit-3" class="w-3.5 h-3.5 text-indigo-400"></i>
          <span id="txt-edit-task">แก้ไขข้อมูล</span>
        </button>
        <button onclick="closeModal('modal-workdetail')" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
    </div>

    <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
      <!-- Project & Owner Info / Edit -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-slate-500 font-semibold mb-1">โครงการ / แผนก</label>
          <div id="detail-project-view" class="font-bold text-slate-800 text-sm">Project 1</div>
          <input type="text" id="detail-project-input" class="hidden w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs" placeholder="ชื่อโครงการ...">
        </div>
        <div>
          <label class="block text-slate-500 font-semibold mb-1">ผู้รับผิดชอบ</label>
          <div id="detail-owner-view" class="font-bold text-slate-800 text-sm">พี่ไมค์</div>
          <div id="detail-phone" class="text-slate-500 text-[11px] mt-0.5">081-445-6789</div>
          <select id="detail-owner-input" class="hidden w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white">
            <!-- populated by JS -->
          </select>
        </div>
      </div>

      <!-- Priority & Due Date -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-slate-500 font-semibold mb-1">ความสำคัญ (Priority)</label>
          <div id="detail-priority-view" class="font-bold text-slate-800 text-xs">-</div>
          <select id="detail-priority-input" class="hidden w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white">
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div>
          <label class="block text-slate-500 font-semibold mb-1">กำหนดส่ง (Due Date)</label>
          <div id="detail-duedate-view" class="text-slate-800 font-medium">2026-09-06</div>
          <input type="date" id="detail-duedate-input" class="hidden w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white">
        </div>
      </div>

      <!-- Status Buttons -->
      <div>
        <label class="block text-slate-500 font-semibold mb-1">สถานะงาน (Status)</label>
        <div class="grid grid-cols-4 gap-2" id="detail-status-buttons">
          <button onclick="setDetailStatus('Todo')" id="status-btn-Todo" class="p-2 rounded-xl border text-center font-bold text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer">Todo</button>
          <button onclick="setDetailStatus('In progress')" id="status-btn-In-progress" class="p-2 rounded-xl border text-center font-bold text-blue-600 border-slate-200 hover:bg-blue-50 cursor-pointer">In progress</button>
          <button onclick="setDetailStatus('Completed')" id="status-btn-Completed" class="p-2 rounded-xl border text-center font-bold text-emerald-600 border-slate-200 hover:bg-emerald-50 cursor-pointer">Completed</button>
          <button onclick="setDetailStatus('Blocked')" id="status-btn-Blocked" class="p-2 rounded-xl border text-center font-bold text-rose-600 border-slate-200 hover:bg-rose-50 cursor-pointer">Blocked</button>
        </div>
      </div>

      <!-- ความก้าวหน้า (Progress) -->
      <div class="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <i data-lucide="bar-chart-2" class="w-4 h-4 text-indigo-600"></i>
            <span>ความก้าวหน้า (Progress)</span>
          </span>
          <span id="detail-progress-badge" class="px-2.5 py-0.5 rounded-full font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
            0%
          </span>
        </div>
        <div class="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
          <div id="detail-progress-bar" class="bg-indigo-600 h-full transition-all duration-300" style="width: 0%"></div>
        </div>
        <div class="flex items-center gap-1.5 pt-1">
          <span class="text-[11px] text-slate-400 mr-1">ปรับด่วน:</span>
          <button type="button" onclick="setGasTaskProgress(0)" class="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold text-slate-600 cursor-pointer">0%</button>
          <button type="button" onclick="setGasTaskProgress(25)" class="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold text-slate-600 cursor-pointer">25%</button>
          <button type="button" onclick="setGasTaskProgress(50)" class="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold text-slate-600 cursor-pointer">50%</button>
          <button type="button" onclick="setGasTaskProgress(75)" class="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold text-slate-600 cursor-pointer">75%</button>
          <button type="button" onclick="setGasTaskProgress(100)" class="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold text-emerald-700 cursor-pointer">100%</button>
        </div>
      </div>

      <!-- รายการตรวจสอบ (Checklist / Subtasks) -->
      <div class="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <i data-lucide="check-square" class="w-4 h-4 text-indigo-600"></i>
            <span>รายการตรวจสอบ (Checklist / Subtasks)</span>
            <span id="detail-checklist-badge" class="text-slate-400 font-normal ml-1">(0 ข้อ)</span>
          </span>
        </div>
        
        <!-- Filter chips by assignee -->
        <div id="detail-subtask-filter-container" class="flex flex-wrap items-center gap-1 pb-1.5 border-b border-slate-100">
          <!-- Populated by JS -->
        </div>

        <!-- Checklist items container -->
        <div id="detail-subtasks-list" class="space-y-1.5">
          <!-- Populated by JS -->
        </div>

        <!-- Add Subtask Input -->
        <div class="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <input type="text" id="new-subtask-input" placeholder="+ เพิ่มข้อรายการตรวจสอบ..." class="w-full sm:flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <select id="new-subtask-assignee" class="px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 cursor-pointer">
              <option value="">👤 (ไม่ระบุคน)</option>
            </select>
            <button type="button" onclick="handleAddSubtaskGas()" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition shadow-2xs">
              เพิ่มข้อ
            </button>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-slate-500 font-semibold mb-1">รายละเอียดงาน (Description)</label>
        <p id="detail-desc-view" class="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed border border-slate-200">-</p>
        <textarea id="detail-desc-input" rows="3" class="hidden w-full p-3 border border-slate-200 rounded-xl text-xs" placeholder="รายละเอียดของงาน..."></textarea>
      </div>

      <!-- Modal Footer -->
      <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button onclick="deleteCurrentTask()" class="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
          <span>ลบงานนี้</span>
        </button>
        <div class="flex items-center gap-2">
          <button onclick="closeModal('modal-workdetail')" class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer">
            ปิด
          </button>
          <button id="btn-save-task-detail" onclick="saveDetailFullTaskChange()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5">
            <i data-lucide="check" class="w-4 h-4"></i>
            <span>บันทึกข้อมูล</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- 2. MODAL: ADD TASK -->
<div id="modal-add-task" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 hidden">
  <div class="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]" onclick="event.stopPropagation()">
    <div class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
      <div>
        <h3 class="text-base font-bold">+ เพิ่มงานใหม่ (บันทึกลง Sheet)</h3>
        <p class="text-xs text-slate-400">เลือกโหมด: การ์ดร่วม หรือ แจกตามคน (Template Checklist)</p>
      </div>
      <button onclick="closeModal('modal-add-task')" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>

    <!-- Mode Selector Tabs -->
    <div class="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
      <div class="grid grid-cols-2 gap-2 p-1 bg-slate-200/80 rounded-xl">
        <button type="button" id="gas-tab-mode-shared" onclick="setGasAddTaskMode('shared')" class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all bg-white text-indigo-700 shadow-xs cursor-pointer">
          <i data-lucide="users" class="w-4 h-4"></i>
          <span>การ์ดร่วม (Shared Subtasks)</span>
        </button>
        <button type="button" id="gas-tab-mode-template" onclick="setGasAddTaskMode('template')" class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all text-slate-600 hover:text-slate-900 cursor-pointer">
          <i data-lucide="copy" class="w-4 h-4"></i>
          <span>แจกการ์ดตามคน (Template Checklist)</span>
        </button>
      </div>
      <div id="gas-mode-desc" class="mt-2 text-[11px] text-slate-500">
        <strong>การ์ดร่วม 1 ใบ:</strong> มอบหมายผู้รับผิดชอบในแต่ละข้อ Checklist แยกกันได้
      </div>
    </div>

    <form onsubmit="handleAddSubmit(event)" class="p-6 space-y-3 text-xs overflow-y-auto flex-1">
      <div>
        <label class="block font-semibold text-slate-700 mb-1">ชื่องาน (Task Title) *</label>
        <input type="text" id="new-task-title" required placeholder="เช่น ออกแบบหน้าเว็บใหม่, ตรวจทานโค้ด..." class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">โครงการ / แผนก</label>
          <select id="new-task-project" class="w-full px-3 py-2 rounded-xl border border-slate-300">
            <option value="Project 1">Project 1</option>
            <option value="แผนก/ITW">แผนก/ITW</option>
            <option value="แผนก/การตลาด">แผนก/การตลาด</option>
            <option value="แผนก/ออกแบบ">แผนก/ออกแบบ</option>
          </select>
        </div>
        <div id="gas-field-owner-container">
          <label class="block font-semibold text-slate-700 mb-1">ผู้รับผิดชอบหลัก</label>
          <select id="new-task-owner" class="w-full px-3 py-2 rounded-xl border border-slate-300">
            <!-- Injected by JS -->
          </select>
        </div>
      </div>

      <!-- Mode 2: Employee Multi-select container -->
      <div id="gas-template-employees-container" class="hidden rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 space-y-2">
        <div class="flex items-center justify-between">
          <label class="font-bold text-slate-800 text-xs">เลือกพนักงานที่จะได้รับการ์ดนี้:</label>
          <button type="button" onclick="toggleAllGasEmployeesSelect()" class="text-indigo-600 text-[11px] font-semibold cursor-pointer">เลือกทุกคน/ยกเลิก</button>
        </div>
        <div id="gas-employees-checkboxes-grid" class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
          <!-- Injected by JS -->
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">ความสำคัญ</label>
          <select id="new-task-priority" class="w-full px-3 py-2 rounded-xl border border-slate-300">
            <option value="High">High (ด่วนมาก)</option>
            <option value="Medium" selected>Medium (ปานกลาง)</option>
            <option value="Low">Low (ปกติ)</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">กำหนดส่ง</label>
          <input type="date" id="new-task-duedate" class="w-full px-3 py-2 rounded-xl border border-slate-300">
        </div>
      </div>

      <!-- Checklist Section in Add Task -->
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <i data-lucide="check-square" class="w-3.5 h-3.5 text-indigo-600"></i>
            <span id="gas-add-checklist-heading">รายการตรวจสอบย่อย (Checklist)</span>
          </span>
        </div>
        <div id="gas-add-subtasks-list" class="space-y-1.5 max-h-36 overflow-y-auto">
          <!-- Injected by JS -->
        </div>
        <div class="flex items-center gap-2 pt-1">
          <input type="text" id="gas-add-subtask-title" placeholder="+ เพิ่มข้อรายการ..." class="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white">
          <select id="gas-add-subtask-assignee" class="px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 cursor-pointer">
            <option value="">👤 (ไม่ระบุคน)</option>
          </select>
          <button type="button" onclick="handleAddGasNewSubtaskItem()" class="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer">
            เพิ่ม
          </button>
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">รายละเอียดงาน</label>
        <textarea id="new-task-desc" rows="2" placeholder="ระบุข้อกำหนดของงาน..." class="w-full px-3 py-2 rounded-xl border border-slate-300"></textarea>
      </div>
      <div class="pt-3 border-t border-slate-100 flex justify-end gap-2 shrink-0">
        <button type="button" onclick="closeModal('modal-add-task')" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium cursor-pointer">ยกเลิก</button>
        <button type="submit" id="gas-submit-task-btn" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer">บันทึกงานลง Sheet</button>
      </div>
    </form>
  </div>
</div>

<!-- 3. MODAL: ABOUT -->
<div id="modal-about" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 hidden">
  <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" onclick="event.stopPropagation()">
    <div class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
          <i data-lucide="check-square" class="w-4 h-4"></i>
        </div>
        <h3 class="text-base font-bold">เกี่ยวกับ Task Manager</h3>
      </div>
      <button onclick="closeModal('modal-about')" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <div class="p-6 space-y-4 text-sm text-slate-600">
      <p class="leading-relaxed">
        ระบบบริหารจัดการงานที่เชื่อมต่อกับ <strong class="text-slate-900">Google Sheets</strong> เป็นฐานข้อมูล และรันผ่าน <strong class="text-slate-900">Google Apps Script (GAS)</strong> ตกแต่งด้วย Tailwind CSS และ Lucide Icons
      </p>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-xs text-slate-700">
        <div class="font-semibold text-slate-900">จุดเด่นของระบบ:</div>
        <div>• โครงสร้างแบบ Modular แยกเป็นไฟล์ย่อย (Navbar, Sidebar, Dashboard, WorkView, etc.)</div>
        <div>• ฐานข้อมูล Google Sheets คีย์ข้อมูลลงชีตได้โดยตรง</div>
        <div>• แสดง Dashboard กราฟสรุปผล Donut & Bar Chart</div>
        <div>• แตะดู WorkDetail เพื่อดูรายละเอียดงานและโทรหาผู้รับผิดชอบได้ทันที</div>
      </div>
      <div class="pt-2 flex justify-end">
        <button onclick="closeModal('modal-about')" class="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition">
          เข้าใจแล้ว
        </button>
      </div>
    </div>
  </div>
</div>

<!-- 4. MODAL: SETTINGS -->
<div id="modal-settings" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 hidden">
  <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" onclick="event.stopPropagation()">
    <div class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
      <h3 class="text-base font-bold">ตั้งค่าระบบ (Settings)</h3>
      <button onclick="closeModal('modal-settings')" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <div class="p-6 space-y-4 text-sm">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <div class="font-semibold text-slate-800 flex items-center gap-2">
          <i data-lucide="database" class="w-4 h-4 text-indigo-600"></i>
          <span>Google Sheets Database Status</span>
        </div>
        <p class="text-xs text-slate-500">
          ชีตฐานข้อมูล: แท็บ <code>Tasks</code> และ แท็บ <code>Employees</code>
        </p>
        <div class="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>พร้อมใช้งานบน Google Apps Script</span>
        </div>
      </div>
      <div class="pt-2 flex justify-end gap-2">
        <button onclick="refreshData(); closeModal('modal-settings')" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold">
          รีเฟรชข้อมูลชีต
        </button>
        <button onclick="closeModal('modal-settings')" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium">
          ปิด
        </button>
      </div>
    </div>
  </div>
</div>

<!-- 5. MODAL: ADD EMPLOYEE -->
<div id="modal-add-employee" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 hidden">
  <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" onclick="event.stopPropagation()">
    <div class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
      <div>
        <h3 class="text-base font-bold">เพิ่มพนักงานใหม่ (+ Add Employee)</h3>
        <p class="text-xs text-slate-400">บันทึกรายชื่อลงชีต Employees</p>
      </div>
      <button onclick="closeModal('modal-add-employee')" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <form onsubmit="submitAddEmployee(event)" class="p-6 space-y-4 text-xs">
      <div class="flex items-center justify-between">
        <span class="font-semibold text-slate-500 uppercase">รหัสพนักงาน</span>
        <span id="new-emp-id-badge" class="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
          E06
        </span>
      </div>
      <div>
        <label class="block font-semibold text-slate-700 mb-1">ชื่อพนักงาน (Name) *</label>
        <input type="text" id="new-emp-name" required placeholder="เช่น พี่ไมค์, สมชาย, วรรณา..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
      </div>
      <div>
        <label class="block font-semibold text-slate-700 mb-1">ตำแหน่งงาน (Role)</label>
        <input type="text" id="new-emp-role" placeholder="เช่น Team Lead, Full-Stack Dev..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
      </div>
      <div>
        <label class="block font-semibold text-slate-700 mb-1">แผนก / โครงการ (Department)</label>
        <select id="new-emp-project" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="แผนก/ITW">แผนก/ITW</option>
          <option value="Project 1">Project 1</option>
          <option value="แผนก/การตลาด">แผนก/การตลาด</option>
          <option value="แผนก/ออกแบบ">แผนก/ออกแบบ</option>
        </select>
      </div>
      <div>
        <label class="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ (Phone)</label>
        <input type="text" id="new-emp-phone" placeholder="เช่น 081-445-6789" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
      </div>
      <div>
        <label class="block font-semibold text-slate-700 mb-1">อีเมล (Email)</label>
        <input type="email" id="new-emp-email" placeholder="เช่น employee@company.com" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
      </div>
      <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
        <button type="button" onclick="closeModal('modal-add-employee')" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium cursor-pointer">ยกเลิก</button>
        <button type="submit" id="btn-save-new-emp" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer">บันทึกพนักงาน</button>
      </div>
    </form>
  </div>
</div>

<!-- 6. MODAL: EMPLOYEE DETAIL -->
<div id="modal-employee-detail" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 hidden">
  <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" onclick="event.stopPropagation()">
    <div class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span id="emp-detail-id" class="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">E01</span>
        <h3 class="text-base font-bold">ข้อมูลพนักงาน (Employee Detail)</h3>
      </div>
      <button onclick="closeModal('modal-employee-detail')" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <div class="p-6 space-y-4 text-xs">
      <div class="flex items-center gap-4">
        <div id="emp-detail-avatar" class="h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xl shrink-0">
          ม
        </div>
        <div>
          <h3 id="emp-detail-name" class="text-lg font-bold text-slate-900">ชื่อพนักงาน</h3>
          <p id="emp-detail-role" class="text-xs text-slate-500 mt-0.5">ตำแหน่งงาน</p>
          <span id="emp-detail-project" class="inline-block mt-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">แผนก</span>
        </div>
      </div>

      <div class="space-y-2 py-3 border-y border-slate-100 text-xs">
        <div class="flex items-center justify-between text-slate-600">
          <span class="flex items-center gap-2 text-slate-500">📞 เบอร์โทรศัพท์:</span>
          <span id="emp-detail-phone" class="font-medium text-slate-900 font-mono">-</span>
        </div>
        <div class="flex items-center justify-between text-slate-600">
          <span class="flex items-center gap-2 text-slate-500">✉️ อีเมล:</span>
          <span id="emp-detail-email" class="font-medium text-slate-900">-</span>
        </div>
      </div>

      <div>
        <div class="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>งานที่ได้รับมอบหมาย</span>
          <span id="emp-detail-task-count" class="text-indigo-600 font-bold">0 งาน</span>
        </div>
        <div id="emp-detail-tasks-list" class="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          <!-- Populated by JS -->
        </div>
      </div>

      <div class="pt-2 flex justify-end gap-2">
        <button id="btn-view-emp-tasks" onclick="goToEmployeeTasks()" class="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-medium text-white transition-colors cursor-pointer">
          ดูในหน้ารายการงาน
        </button>
        <button onclick="closeModal('modal-employee-detail')" class="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 transition-colors cursor-pointer">
          ปิด
        </button>
      </div>
    </div>
  </div>
</div>
`;

// 8. JavaScript.html - สคริปต์การทำงานฝั่ง Client
export const GAS_JAVASCRIPT_HTML = `<!-- JavaScript.html: โค้ดควบคุมระบบฝั่ง Client (Data, Charts, Modals, Google.script.run) -->
<script>
  // State
  let appTasks = [];
  let appEmployees = [];
  let currentDetailTask = null;
  let selectedStatusTemp = null;

  // Initial mock fallback if run standalone outside Apps Script
  const defaultSampleTasks = [
    { id: "PID-125", title: "Task 4: ประมวลผลสถิติรายสัปดาห์ (W37)", project: "แผนก/ITW", priority: "High", status: "In progress", owner: "พี่ตู้", ownerPhone: "086-778-9900", ownerEmail: "tu.itw@company.com", dueDate: "2026-09-11", description: "คำนวณยอดงาน W36, W37 แยกตามสถานะ", progress: 50 },
    { id: "PID-124", title: "Task 3: จัดเตรียมเอกสารส่งมอบงาน Sprint W37", project: "Project 1", priority: "Medium", status: "Completed", owner: "พี่ไมค์", ownerPhone: "081-445-6789", ownerEmail: "mike.lead@company.com", dueDate: "2026-09-09", description: "สรุปผลการดำเนินงานประจำสัปดาห์ที่ 37", progress: 100 },
    { id: "PID-123", title: "Task 1: จัดเตรียมระบบ Sheet", project: "Project 1", priority: "High", status: "Completed", owner: "พี่ไมค์", ownerPhone: "081-445-6789", ownerEmail: "mike.lead@company.com", dueDate: "2026-09-04", description: "พัฒนาหน้า Dashboard และตรวจสอบความถูกต้องของสถิติรายสัปดาห์", progress: 100 },
    { id: "PID-122", title: "Task 2: วางโครงร่างหน้า Dashboard", project: "แผนก/การตลาด", priority: "Medium", status: "In progress", owner: "พี่หน่อง", ownerPhone: "089-112-3344", ownerEmail: "nong.mkt@company.com", dueDate: "2026-09-05", description: "จัดทำ Card สรุปสถานะ 4 กล่องพร้อมกราฟ", progress: 60 },
    { id: "PID-121", title: "Write blog post for demo day", project: "แผนก/ITW", priority: "High", status: "In progress", owner: "พี่ตู้", ownerPhone: "086-778-9900", ownerEmail: "tu.itw@company.com", dueDate: "2026-09-05", description: "เขียนบทความแนะนำระบบ", progress: 45 },
    { id: "PID-120", title: "Publish blog page", project: "แผนก/การตลาด", priority: "Low", status: "Blocked", owner: "พี่ไมค์", ownerPhone: "081-445-6789", ownerEmail: "mike.lead@company.com", dueDate: "2026-09-08", description: "ติดปัญหาเรื่องสิทธิ์การเข้าถึง CMS ชั่วคราว", progress: 25 },
    { id: "PID-119", title: "Add gradients to design system", project: "แผนก/ออกแบบ", priority: "Medium", status: "Completed", owner: "พี่หน่อง", ownerPhone: "089-112-3344", ownerEmail: "nong.mkt@company.com", dueDate: "2026-09-02", description: "เพิ่มชุดโทนสีใน Tailwind CSS ให้รองรับแบรนด์ใหม่", progress: 100 }
  ];

  const defaultSampleEmployees = [
    { id: "E01", name: "พี่ไมค์", project: "Project 1", phone: "081-445-6789", email: "mike.lead@company.com", role: "Tech Lead / Project Manager", tasksCount: 4 },
    { id: "E02", name: "พี่หน่อง", project: "แผนก/การตลาด", phone: "089-112-3344", email: "nong.mkt@company.com", role: "Marketing Lead", tasksCount: 5 },
    { id: "E03", name: "พี่ตู้", project: "แผนก/ITW", phone: "086-778-9900", email: "tu.itw@company.com", role: "Senior Full-Stack Dev", tasksCount: 4 },
    { id: "E04", name: "สมชาย", project: "แผนก/ITW", phone: "085-334-5566", email: "somchai@company.com", role: "Frontend Developer", tasksCount: 2 },
    { id: "E05", name: "วรรณา", project: "แผนก/ออกแบบ", phone: "082-998-7711", email: "wanna.design@company.com", role: "UI/UX Designer", tasksCount: 3 }
  ];

  // Initialize
  window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadData();
  });

  function loadData() {
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler((res) => {
          if (res && res.success) {
            appTasks = res.tasks || [];
            appEmployees = res.employees || [];
            const conn = document.getElementById('connection-status');
            if (conn) conn.classList.remove('hidden');
          } else {
            appTasks = defaultSampleTasks;
            appEmployees = defaultSampleEmployees;
          }
          renderAll();
        })
        .withFailureHandler((err) => {
          console.error(err);
          appTasks = defaultSampleTasks;
          appEmployees = defaultSampleEmployees;
          renderAll();
        })
        .apiGetInitialData();
    } else {
      // Fallback for standalone preview
      appTasks = defaultSampleTasks;
      appEmployees = defaultSampleEmployees;
      renderAll();
    }
  }

  function refreshData() {
    loadData();
  }

  function renderAll() {
    updateBadges();
    renderDashboard();
    renderTasksTable();
    renderEmployees();
    populateOwnerDropdown();
    lucide.createIcons();
  }

  function updateBadges() {
    const bTasks = document.getElementById('badge-tasks-count');
    const bEmp = document.getElementById('badge-emp-count');
    if (bTasks) bTasks.innerText = appTasks.length;
    if (bEmp) bEmp.innerText = appEmployees.length;
  }

  let chartStatusInstance = null;
  let chartWeeklyInstance = null;
  let chartProjectInstance = null;
  let currentGasWeekFilter = 'ALL';

  function setGasWeekFilter(filter) {
    currentGasWeekFilter = filter;
    ['ALL', 'CURRENT', 'Q1', 'Q2', 'Q3', 'Q4'].forEach(function(f) {
      const btn = document.getElementById('gas-btn-week-' + f);
      if (btn) {
        if (f === filter) {
          btn.className = 'px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-medium text-[11px] shadow-xs';
        } else {
          btn.className = 'px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px]';
        }
      }
    });
    const wrapper = document.getElementById('gas-weekly-chart-wrapper');
    if (wrapper) {
      wrapper.style.minWidth = filter === 'ALL' ? '1200px' : '100%';
    }
    renderDashboard();
  }

  function renderDashboard() {
    const total = appTasks.length;
    const completed = appTasks.filter(t => t.status === 'Completed').length;
    const inprogress = appTasks.filter(t => t.status === 'In progress').length;
    const blocked = appTasks.filter(t => t.status === 'Blocked').length;
    const todo = appTasks.filter(t => t.status === 'Todo').length;

    const sTot = document.getElementById('stat-total');
    const sComp = document.getElementById('stat-completed');
    const sInprog = document.getElementById('stat-inprogress');
    const sTodo = document.getElementById('stat-todo');
    if (sTot) sTot.innerText = total;
    if (sComp) sComp.innerText = completed;
    if (sInprog) sInprog.innerText = inprogress;
    if (sTodo) sTodo.innerText = todo;

    const bComp = document.getElementById('bar-completed');
    const bInp = document.getElementById('bar-inprogress');
    const bTd = document.getElementById('bar-todo');
    if (bComp) bComp.style.width = total ? (completed / total * 100) + '%' : '0%';
    if (bInp) bInp.style.width = total ? (inprogress / total * 100) + '%' : '0%';
    if (bTd) bTd.style.width = total ? (todo / total * 100) + '%' : '0%';

    // Update interactive charts
    updateDashboardCharts(completed, inprogress, todo, blocked);

    const recentContainer = document.getElementById('dashboard-recent-tasks');
    if (recentContainer) {
      recentContainer.innerHTML = appTasks.slice(0, 5).map(t => \`
        <div onclick="openWorkDetail('\${t.id}')" class="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition">
          <div>
            <div class="font-bold text-xs text-slate-800">\${t.title}</div>
            <div class="text-[11px] text-slate-400 mt-0.5">\${t.id} • \${t.project} • ผู้รับผิดชอบ: \${t.owner}</div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border \${getStatusBadgeClass(t.status)}">
            \${t.status}
          </span>
        </div>
      \`).join('');
    }
  }

  function updateDashboardCharts(completed, inprogress, todo, blocked) {
    if (typeof Chart === 'undefined') return;

    // 1. Status Donut Chart
    const ctxDonut = document.getElementById('chart-status-donut');
    if (ctxDonut) {
      if (chartStatusInstance) chartStatusInstance.destroy();
      chartStatusInstance = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
          labels: ['เสร็จแล้ว', 'กำลังทำ', 'ติดปัญหา', 'ยังไม่เริ่ม'],
          datasets: [{
            data: [completed, inprogress, blocked, todo],
            backgroundColor: ['#10b981', '#3b82f6', '#f43f5e', '#94a3b8'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 10, font: { size: 11 } }
            }
          }
        }
      });
    }

    // Helper: แปลงวันที่เป็นเลขสัปดาห์ ISO (เช่น W36, W37)
    function getISOWeekLabel(dateStr) {
      if (!dateStr) return null;
      var d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      var target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      var dayNr = target.getUTCDay() || 7;
      target.setUTCDate(target.getUTCDate() + 4 - dayNr);
      var yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
      var weekNo = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      return 'W' + weekNo;
    }

    // 2. Weekly Bar Chart (คำนวณครบทั้ง 52 สัปดาห์ตลอดทั้งปี W01 ถึง W52)
    const ctxWeekly = document.getElementById('chart-weekly-bar');
    if (ctxWeekly) {
      if (chartWeeklyInstance) chartWeeklyInstance.destroy();

      // สร้างรายชื่อ 52 สัปดาห์ครบทั้งปี
      const all52WeekKeys = [];
      const weekStats = {};
      for (var w = 1; w <= 52; w++) {
        var k = 'W' + w;
        all52WeekKeys.push(k);
        weekStats[k] = { week: w, label: k, completed: 0, inprogress: 0, total: 0 };
      }

      var totalYearCompleted = 0;
      var totalYearInprogress = 0;
      var totalYearTasks = 0;

      appTasks.forEach(function(t) {
        const dStr = t.dueDate || t.startDate || t.updatedAt || t.createdAt;
        const wKey = getISOWeekLabel(dStr);
        if (wKey && weekStats[wKey]) {
          weekStats[wKey].total += 1;
          totalYearTasks += 1;
          if (t.status === 'Completed') {
            weekStats[wKey].completed += 1;
            totalYearCompleted += 1;
          } else if (t.status === 'In progress') {
            weekStats[wKey].inprogress += 1;
            totalYearInprogress += 1;
          }
        }
      });

      // กรองสัปดาห์ตาม Period Filter ที่ผู้ใช้เลือก
      var activeWeekKeys = all52WeekKeys;
      if (currentGasWeekFilter === 'CURRENT') {
        activeWeekKeys = all52WeekKeys.filter(function(k) {
          var n = parseInt(k.replace('W', ''), 10);
          return n >= 32 && n <= 40;
        });
      } else if (currentGasWeekFilter === 'Q1') {
        activeWeekKeys = all52WeekKeys.filter(function(k) {
          var n = parseInt(k.replace('W', ''), 10);
          return n >= 1 && n <= 13;
        });
      } else if (currentGasWeekFilter === 'Q2') {
        activeWeekKeys = all52WeekKeys.filter(function(k) {
          var n = parseInt(k.replace('W', ''), 10);
          return n >= 14 && n <= 26;
        });
      } else if (currentGasWeekFilter === 'Q3') {
        activeWeekKeys = all52WeekKeys.filter(function(k) {
          var n = parseInt(k.replace('W', ''), 10);
          return n >= 27 && n <= 39;
        });
      } else if (currentGasWeekFilter === 'Q4') {
        activeWeekKeys = all52WeekKeys.filter(function(k) {
          var n = parseInt(k.replace('W', ''), 10);
          return n >= 40 && n <= 52;
        });
      }

      // Update W36, W37 and whole-year summary badges
      const badgeContainer = document.getElementById('weekly-stat-badges');
      if (badgeContainer) {
        const w36 = weekStats['W36'] || { completed: 0, inprogress: 0 };
        const w37 = weekStats['W37'] || { completed: 0, inprogress: 0 };
        badgeContainer.innerHTML = 
          '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-slate-700 font-medium">' +
            '<strong class="text-emerald-800">ตลอดทั้งปี:</strong> เสร็จ <span class="text-emerald-700 font-bold">' + totalYearCompleted + '</span> | กำลังทำ <span class="text-blue-700 font-bold">' + totalYearInprogress + '</span>' +
          '</span>' +
          '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-slate-700 font-medium">' +
            '<strong class="text-indigo-700">W36 (สัปดาห์นี้):</strong> เสร็จ <span class="text-emerald-700 font-bold">' + w36.completed + '</span> | กำลังทำ <span class="text-blue-700 font-bold">' + w36.inprogress + '</span>' +
          '</span>' +
          '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">' +
            '<strong class="text-slate-800">W37 (ถัดไป):</strong> เสร็จ <span class="text-emerald-700 font-bold">' + w37.completed + '</span> | กำลังทำ <span class="text-blue-700 font-bold">' + w37.inprogress + '</span>' +
          '</span>';
      }

      chartWeeklyInstance = new Chart(ctxWeekly, {
        type: 'bar',
        data: {
          labels: activeWeekKeys,
          datasets: [
            {
              label: 'เสร็จสิ้น (Completed)',
              data: activeWeekKeys.map(function(k) { return weekStats[k].completed; }),
              backgroundColor: '#10b981',
              borderRadius: 3
            },
            {
              label: 'กำลังทำ (In progress)',
              data: activeWeekKeys.map(function(k) { return weekStats[k].inprogress; }),
              backgroundColor: '#3b82f6',
              borderRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', align: 'end', labels: { boxWidth: 10, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                title: function(items) {
                  return 'สัปดาห์ ' + items[0].label;
                },
                afterBody: function(items) {
                  const key = items[0].label;
                  const stat = weekStats[key] || { completed: 0, inprogress: 0, total: 0 };
                  return 'รวมงานทั้งสัปดาห์: ' + stat.total + ' งาน';
                }
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { grid: { color: '#f1f5f9' }, beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }
      });
    }

    // 3. Horizontal Stacked Bar Chart - แยกตามคน / ผู้รับผิดชอบ (Grouped by Person/Owner)
    const ctxProject = document.getElementById('chart-project-bar');
    if (ctxProject) {
      if (chartProjectInstance) chartProjectInstance.destroy();

      const ownerMap = {};
      appTasks.forEach(t => {
        const owner = t.owner || 'ไม่ระบุ';
        if (!ownerMap[owner]) ownerMap[owner] = { completed: 0, inprogress: 0, pending: 0, total: 0 };
        ownerMap[owner].total += 1;
        if (t.status === 'Completed') ownerMap[owner].completed += 1;
        else if (t.status === 'In progress') ownerMap[owner].inprogress += 1;
        else ownerMap[owner].pending += 1;
      });

      const ownerLabels = Object.keys(ownerMap).sort((a, b) => ownerMap[b].total - ownerMap[a].total);
      const compData = ownerLabels.map(p => ownerMap[p].completed);
      const inProgData = ownerLabels.map(p => ownerMap[p].inprogress);
      const pendingData = ownerLabels.map(p => ownerMap[p].pending);

      chartProjectInstance = new Chart(ctxProject, {
        type: 'bar',
        data: {
          labels: ownerLabels,
          datasets: [
            { label: 'เสร็จแล้ว', data: compData, backgroundColor: '#10b981' },
            { label: 'กำลังทำ', data: inProgData, backgroundColor: '#3b82f6' },
            { label: 'รอ/ติดปัญหา', data: pendingData, backgroundColor: '#cbd5e1' }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true, grid: { color: '#f1f5f9' } },
            y: { stacked: true, grid: { display: false } }
          },
          plugins: {
            legend: { position: 'top', align: 'end', labels: { boxWidth: 10, font: { size: 11 } } }
          }
        }
      });
    }
  }

  function renderTasksTable() {
    const searchInput = document.getElementById('filter-search');
    const search = (searchInput ? searchInput.value : '').toLowerCase();
    const stEl = document.getElementById('filter-status');
    const prEl = document.getElementById('filter-priority');
    const statusFilter = stEl ? stEl.value : '';
    const priorityFilter = prEl ? prEl.value : '';

    const filtered = appTasks.filter(t => {
      const matchesSearch = !search || 
        t.title.toLowerCase().includes(search) || 
        t.id.toLowerCase().includes(search) || 
        t.owner.toLowerCase().includes(search) ||
        t.project.toLowerCase().includes(search);
      const matchesStatus = !statusFilter || t.status === statusFilter;
      const matchesPriority = !priorityFilter || t.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    const tbody = document.getElementById('tasks-table-body');
    const noMsg = document.getElementById('no-tasks-msg');

    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (noMsg) noMsg.classList.remove('hidden');
      return;
    }

    if (noMsg) noMsg.classList.add('hidden');
    tbody.innerHTML = filtered.map(t => {
      const subtasks = t.subtasks || [];
      const completedSubtasks = subtasks.filter(s => s.completed).length;
      const progressVal = typeof t.progress === 'number'
        ? t.progress
        : (subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : (t.status === 'Completed' ? 100 : t.status === 'In progress' ? 50 : 0));

      return \`
      <tr onclick="openWorkDetail('\${t.id}')" class="hover:bg-indigo-50/40 cursor-pointer transition border-b border-slate-100">
        <td class="p-3 font-mono font-bold text-indigo-700 whitespace-nowrap">\${t.id}</td>
        <td class="p-3 font-semibold text-slate-900">\${t.title}</td>
        <td class="p-3 text-slate-600 whitespace-nowrap">\${t.project}</td>
        <td class="p-3 font-bold \${getPriorityColor(t.priority)}">\${t.priority}</td>
        <td class="p-3">
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border \${getStatusBadgeClass(t.status)}">
            \${t.status}
          </span>
        </td>
        <td class="p-3 whitespace-nowrap">
          <div class="flex items-center gap-2">
            <div class="w-14 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div class="bg-indigo-600 h-full rounded-full transition-all" style="width: \${progressVal}%"></div>
            </div>
            <span class="text-[11px] font-bold text-slate-700">\${progressVal}%</span>
          </div>
        </td>
        <td class="p-3 whitespace-nowrap">
          \${subtasks.length > 0 ? \`
            <span class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border \${completedSubtasks === subtasks.length ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}">
              <i data-lucide="check-square" class="w-3 h-3 text-indigo-500"></i>
              \${completedSubtasks}/\${subtasks.length}
            </span>
          \` : '<span class="text-[11px] text-slate-300">-</span>'}
        </td>
        <td class="p-3 text-slate-700 whitespace-nowrap">\${t.owner}</td>
        <td class="p-3 text-slate-500 whitespace-nowrap">\${t.dueDate || '-'}</td>
        <td class="p-3 text-right whitespace-nowrap" onclick="event.stopPropagation()">
          <button onclick="editWorkDetail('\${t.id}')" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 transition shadow-2xs cursor-pointer">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            <span>แก้ไข</span>
          </button>
        </td>
      </tr>
      \`;
    }).join('');
  }

  function renderEmployees() {
    const tbody = document.getElementById('employees-table-body');
    const totalCountEl = document.getElementById('employees-total-count');
    if (!tbody) return;

    // Populate department filter dropdown if needed
    const deptSelect = document.getElementById('employee-dept-filter');
    if (deptSelect && deptSelect.options.length <= 1) {
      const depts = Array.from(new Set(appEmployees.map(e => e.project))).filter(Boolean);
      depts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        deptSelect.appendChild(opt);
      });
    }

    const searchQuery = (document.getElementById('employee-search')?.value || '').toLowerCase().trim();
    const selectedDept = document.getElementById('employee-dept-filter')?.value || 'all';

    const filtered = appEmployees.filter(e => {
      const matchSearch =
        (e.name || '').toLowerCase().includes(searchQuery) ||
        (e.id || '').toLowerCase().includes(searchQuery) ||
        (e.phone || '').includes(searchQuery) ||
        (e.email || '').toLowerCase().includes(searchQuery) ||
        (e.project || '').toLowerCase().includes(searchQuery);

      const matchDept = selectedDept === 'all' || e.project === selectedDept;
      return matchSearch && matchDept;
    });

    if (totalCountEl) {
      totalCountEl.innerHTML = \`พนักงานทั้งหมด <strong>\${filtered.length}</strong> คน\`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = \`
        <tr>
          <td colspan="6" class="px-6 py-12 text-center text-slate-400">
            ไม่พบข้อมูลพนักงานที่ตรงกับคำค้นหา
          </td>
        </tr>
      \`;
      return;
    }

    tbody.innerHTML = filtered.map(e => {
      const empTasks = appTasks.filter(t => t.owner === e.name);
      const completedCount = empTasks.filter(t => t.status === 'Completed').length;
      const count = empTasks.length > 0 ? empTasks.length : (e.tasksCount || 0);
      const initial = (e.name || 'P').slice(0, 1);

      return \`
        <tr class="hover:bg-slate-50/80 transition-colors group cursor-pointer" onclick="openEmployeeDetailModal('\${e.id}')">
          <td class="px-5 py-3.5 font-mono font-medium text-slate-500 group-hover:text-indigo-600 whitespace-nowrap">
            \${e.id}
          </td>
          <td class="px-5 py-3.5 font-medium text-slate-900">
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0">
                \${initial}
              </div>
              <div>
                <div class="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">\${e.name}</div>
                <div class="text-[11px] text-slate-400">\${e.role || 'Team Member'}</div>
              </div>
            </div>
          </td>
          <td class="px-5 py-3.5 text-slate-600 font-medium whitespace-nowrap">
            <span class="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700">
              \${e.project}
            </span>
          </td>
          <td class="px-5 py-3.5 text-slate-600 whitespace-nowrap">
            <div class="flex flex-col text-xs">
              <span class="font-mono text-slate-800">📞 \${e.phone || '-'}</span>
              <span class="text-[11px] text-slate-400 font-sans mt-0.5">✉️ \${e.email || '-'}</span>
            </div>
          </td>
          <td class="px-5 py-3.5 text-center whitespace-nowrap">
            <div class="inline-flex items-center gap-2">
              <span class="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                \${count} งาน
              </span>
              \${completedCount > 0 ? \`<span class="text-[10px] text-emerald-600 font-medium">(เสร็จ \${completedCount})</span>\` : ''}
            </div>
          </td>
          <td class="px-5 py-3.5 text-right whitespace-nowrap" onclick="event.stopPropagation()">
            <div class="flex items-center justify-end gap-1.5">
              <button
                onclick="openEmployeeDetailModal('\${e.id}')"
                class="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-indigo-700 font-medium bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                title="ดูข้อมูลพนักงาน"
              >
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                <span>ดูข้อมูล</span>
              </button>
              <button
                onclick="filterTasksByEmployee('\${e.name}')"
                class="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                title="ดูงานทั้งหมดที่พนักงานคนนี้รับผิดชอบ"
              >
                <i data-lucide="folder-open" class="w-3.5 h-3.5"></i>
                <span>ดูงาน</span>
              </button>
            </div>
          </td>
        </tr>
      \`;
    }).join('');

    if (window.lucide) lucide.createIcons();
  }

  let selectedEmployeeForDetail = null;

  function openAddEmployeeModal() {
    const nums = appEmployees.map(e => {
      const num = parseInt((e.id || '').replace(/^E/i, ''), 10);
      return isNaN(num) ? 0 : num;
    });
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    const nextNum = max + 1;
    const nextId = 'E' + (nextNum < 10 ? '0' + nextNum : nextNum);

    const badge = document.getElementById('new-emp-id-badge');
    if (badge) badge.innerText = nextId;

    const nameInput = document.getElementById('new-emp-name');
    if (nameInput) nameInput.value = '';
    const roleInput = document.getElementById('new-emp-role');
    if (roleInput) roleInput.value = '';
    const phoneInput = document.getElementById('new-emp-phone');
    if (phoneInput) phoneInput.value = '';
    const emailInput = document.getElementById('new-emp-email');
    if (emailInput) emailInput.value = '';

    openModal('modal-add-employee');
  }

  function submitAddEmployee(e) {
    e.preventDefault();
    const name = (document.getElementById('new-emp-name')?.value || '').trim();
    if (!name) return;

    const id = document.getElementById('new-emp-id-badge')?.innerText.trim() || 'E01';
    const role = (document.getElementById('new-emp-role')?.value || '').trim() || 'Team Member';
    const project = document.getElementById('new-emp-project')?.value || 'แผนก/ITW';
    const phone = (document.getElementById('new-emp-phone')?.value || '').trim() || '08x-xxx-xxxx';
    const email = (document.getElementById('new-emp-email')?.value || '').trim() || (name.toLowerCase().replace(/\\s+/g, '') + '@company.com');

    const newEmp = {
      id: id,
      name: name,
      project: project,
      phone: phone,
      email: email,
      role: role,
      tasksCount: 0
    };

    appEmployees.push(newEmp);
    renderEmployees();
    populateOwnerDropdown();
    closeModal('modal-add-employee');

    const countEl = document.getElementById('sidebar-emp-count');
    if (countEl) countEl.innerText = appEmployees.length;

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run.apiSaveEmployee(newEmp);
    }
  }

  function openEmployeeDetailModal(empId) {
    const emp = appEmployees.find(e => e.id === empId);
    if (!emp) return;
    selectedEmployeeForDetail = emp;

    const idEl = document.getElementById('emp-detail-id');
    if (idEl) idEl.innerText = emp.id;
    const nameEl = document.getElementById('emp-detail-name');
    if (nameEl) nameEl.innerText = emp.name;
    const roleEl = document.getElementById('emp-detail-role');
    if (roleEl) roleEl.innerText = emp.role || 'Team Member';
    const projectEl = document.getElementById('emp-detail-project');
    if (projectEl) projectEl.innerText = emp.project;
    const phoneEl = document.getElementById('emp-detail-phone');
    if (phoneEl) phoneEl.innerText = emp.phone || '-';
    const emailEl = document.getElementById('emp-detail-email');
    if (emailEl) emailEl.innerText = emp.email || '-';

    const avatarEl = document.getElementById('emp-detail-avatar');
    if (avatarEl) {
      avatarEl.innerText = (emp.name || 'P').slice(0, 1);
    }

    // Populate assigned tasks
    const empTasks = appTasks.filter(t => t.owner === emp.name);
    const countEl = document.getElementById('emp-detail-task-count');
    if (countEl) {
      countEl.innerText = empTasks.length + ' งาน';
    }

    const tasksListEl = document.getElementById('emp-detail-tasks-list');
    if (tasksListEl) {
      if (empTasks.length === 0) {
        tasksListEl.innerHTML = '<div class="text-slate-400 text-center py-4">ยังไม่มีงานที่มอบหมายให้พนักงานคนนี้</div>';
      } else {
        tasksListEl.innerHTML = empTasks.map(t => {
          let statusBadgeClass = 'bg-slate-100 text-slate-600';
          if (t.status === 'Completed') statusBadgeClass = 'bg-emerald-50 text-emerald-700';
          else if (t.status === 'In progress') statusBadgeClass = 'bg-blue-50 text-blue-700';
          else if (t.status === 'Review') statusBadgeClass = 'bg-amber-50 text-amber-700';

          return \`
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs hover:bg-slate-100 transition">
              <div class="min-w-0 pr-2">
                <span class="font-mono text-[11px] text-slate-400 mr-2">\${t.id}</span>
                <span class="font-medium text-slate-800 truncate">\${t.title}</span>
              </div>
              <span class="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium \${statusBadgeClass}">
                \${t.status}
              </span>
            </div>
          \`;
        }).join('');
      }
    }

    openModal('modal-employee-detail');
    if (window.lucide) lucide.createIcons();
  }

  function goToEmployeeTasks() {
    if (!selectedEmployeeForDetail) return;
    const name = selectedEmployeeForDetail.name;
    closeModal('modal-employee-detail');
    filterTasksByEmployee(name);
  }

  function filterTasksByEmployee(ownerName) {
    const searchInput = document.getElementById('work-search');
    if (searchInput) {
      searchInput.value = ownerName;
    }
    switchTab('work');
    renderTasksTable();
  }

  function populateOwnerDropdown() {
    const select = document.getElementById('new-task-owner');
    if (select) {
      select.innerHTML = appEmployees.map(e => \`
        <option value="\${e.name}">\${e.name} (\${e.project})</option>
      \`).join('');
    }
    const editOwnerSelect = document.getElementById('detail-owner-input');
    if (editOwnerSelect) {
      editOwnerSelect.innerHTML = appEmployees.map(e => \`
        <option value="\${e.name}">\${e.name} (\${e.project})</option>
      \`).join('');
    }
  }

  function applyFilters() {
    renderTasksTable();
  }

  function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const targetTab = document.getElementById('tab-' + tabId);
    if (targetTab) targetTab.classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(el => {
      el.classList.remove('bg-indigo-50/80', 'text-indigo-700', 'font-semibold');
      el.classList.add('text-slate-600');
    });
    const activeBtn = document.getElementById('nav-' + tabId);
    if (activeBtn) {
      activeBtn.classList.add('bg-indigo-50/80', 'text-indigo-700', 'font-semibold');
      activeBtn.classList.remove('text-slate-600');
    }
    lucide.createIcons();
  }

  // Work Detail Modal State & Handlers
  let isWorkDetailEditMode = false;

  function editWorkDetail(taskId) {
    openWorkDetail(taskId, true);
  }

  function openWorkDetail(taskId, startInEditMode = false) {
    const task = appTasks.find(t => t.id === taskId);
    if (!task) return;
    currentDetailTask = { ...task, subtasks: task.subtasks ? [...task.subtasks] : [] };
    selectedStatusTemp = task.status;
    isWorkDetailEditMode = !!startInEditMode;

    populateOwnerDropdown();

    document.getElementById('detail-id').innerText = currentDetailTask.id;
    document.getElementById('detail-title-view').innerText = currentDetailTask.title;
    document.getElementById('detail-title-input').value = currentDetailTask.title;

    document.getElementById('detail-project-view').innerText = currentDetailTask.project;
    document.getElementById('detail-project-input').value = currentDetailTask.project;

    document.getElementById('detail-owner-view').innerText = currentDetailTask.owner;
    document.getElementById('detail-owner-input').value = currentDetailTask.owner;
    document.getElementById('detail-phone').innerText = currentDetailTask.ownerPhone || '-';

    document.getElementById('detail-priority-view').innerText = currentDetailTask.priority;
    document.getElementById('detail-priority-input').value = currentDetailTask.priority;

    document.getElementById('detail-duedate-view').innerText = currentDetailTask.dueDate || '-';
    document.getElementById('detail-duedate-input').value = currentDetailTask.dueDate || '';

    document.getElementById('detail-desc-view').innerText = currentDetailTask.description || 'ไม่มีรายละเอียดเพิ่มเติม';
    document.getElementById('detail-desc-input').value = currentDetailTask.description || '';

    updateDetailStatusButtons(currentDetailTask.status);
    updateProgressUI();
    renderGasSubtasks();
    applyWorkDetailEditModeUI();

    openModal('modal-workdetail');
    lucide.createIcons();
  }

  function toggleTaskEditMode() {
    isWorkDetailEditMode = !isWorkDetailEditMode;
    applyWorkDetailEditModeUI();
  }

  function applyWorkDetailEditModeUI() {
    const toggleBtnTxt = document.getElementById('txt-edit-task');
    if (toggleBtnTxt) toggleBtnTxt.innerText = isWorkDetailEditMode ? 'ดูตัวอย่าง' : 'แก้ไขข้อมูล';

    const viewElements = ['detail-title-view', 'detail-project-view', 'detail-owner-view', 'detail-priority-view', 'detail-duedate-view', 'detail-desc-view'];
    const inputElements = ['detail-title-input', 'detail-project-input', 'detail-owner-input', 'detail-priority-input', 'detail-duedate-input', 'detail-desc-input'];

    viewElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', isWorkDetailEditMode);
    });

    inputElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', !isWorkDetailEditMode);
    });
  }

  function setDetailStatus(status) {
    selectedStatusTemp = status;
    updateDetailStatusButtons(status);
    if (status === 'Completed') {
      setGasTaskProgress(100);
    } else if (status === 'Todo' && (currentDetailTask.progress || 0) === 100) {
      setGasTaskProgress(0);
    }
  }

  function updateDetailStatusButtons(activeStatus) {
    const statuses = ['Todo', 'In progress', 'Completed', 'Blocked'];
    statuses.forEach(st => {
      const btnId = 'status-btn-' + st.replace(' ', '-');
      const btn = document.getElementById(btnId);
      if (btn) {
        if (st === activeStatus) {
          btn.className = 'p-2 rounded-xl border text-center font-bold bg-indigo-600 text-white border-indigo-600 shadow-xs cursor-pointer';
        } else {
          btn.className = 'p-2 rounded-xl border text-center font-bold text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer';
        }
      }
    });
  }

  function setGasTaskProgress(pct) {
    if (!currentDetailTask) return;
    currentDetailTask.progress = pct;
    updateProgressUI();
  }

  function updateProgressUI() {
    if (!currentDetailTask) return;
    const subtasks = currentDetailTask.subtasks || [];
    let pct = typeof currentDetailTask.progress === 'number' ? currentDetailTask.progress : 0;
    if (subtasks.length > 0 && typeof currentDetailTask.progress !== 'number') {
      const doneCount = subtasks.filter(s => s.completed).length;
      pct = Math.round((doneCount / subtasks.length) * 100);
    }
    const badge = document.getElementById('detail-progress-badge');
    const bar = document.getElementById('detail-progress-bar');
    if (badge) badge.innerText = pct + '%';
    if (bar) bar.style.width = pct + '%';
  }

  let gasSubtaskFilter = 'all';

  function renderGasSubtasks() {
    const container = document.getElementById('detail-subtasks-list');
    const badge = document.getElementById('detail-checklist-badge');
    const filterContainer = document.getElementById('detail-subtask-filter-container');
    const assigneeSelect = document.getElementById('new-subtask-assignee');
    if (!container || !currentDetailTask) return;

    const subtasks = currentDetailTask.subtasks || [];
    const doneCount = subtasks.filter(s => s.completed).length;
    if (badge) badge.innerText = '(' + doneCount + '/' + subtasks.length + ' ข้อ)';

    // Populate new subtask assignee dropdown
    if (assigneeSelect) {
      const curVal = assigneeSelect.value;
      assigneeSelect.innerHTML = '<option value="">👤 (ไม่ระบุคน)</option>' +
        appEmployees.map(emp => '<option value="' + emp.name + '">👤 ' + emp.name + '</option>').join('');
      assigneeSelect.value = curVal;
    }

    // Render filter chips if any subtasks exist
    if (filterContainer) {
      if (subtasks.length > 0) {
        filterContainer.classList.remove('hidden');
        const assignees = Array.from(new Set(subtasks.map(s => s.assignee).filter(Boolean)));
        let chipsHtml = '<span class="text-[10px] text-slate-400 mr-1">กรอง:</span>';
        chipsHtml += '<button type="button" onclick="setGasSubtaskFilter(\\'all\\')" class="px-2 py-0.5 rounded-md text-[10px] font-semibold cursor-pointer ' +
          (gasSubtaskFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200') +
          '">ทั้งหมด (' + subtasks.length + ')</button>';

        assignees.forEach(name => {
          const count = subtasks.filter(s => s.assignee === name).length;
          const done = subtasks.filter(s => s.assignee === name && s.completed).length;
          chipsHtml += '<button type="button" onclick="setGasSubtaskFilter(\\'' + name + '\\')" class="px-2 py-0.5 rounded-md text-[10px] font-semibold cursor-pointer ' +
            (gasSubtaskFilter === name ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200') +
            '">👤 ' + name + ' (' + done + '/' + count + ')</button>';
        });

        if (subtasks.some(s => !s.assignee)) {
          const unassignedCount = subtasks.filter(s => !s.assignee).length;
          chipsHtml += '<button type="button" onclick="setGasSubtaskFilter(\\'unassigned\\')" class="px-2 py-0.5 rounded-md text-[10px] font-semibold cursor-pointer ' +
            (gasSubtaskFilter === 'unassigned' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200') +
            '">ไม่ระบุคน (' + unassignedCount + ')</button>';
        }
        filterContainer.innerHTML = chipsHtml;
      } else {
        filterContainer.classList.add('hidden');
        filterContainer.innerHTML = '';
      }
    }

    if (subtasks.length === 0) {
      container.innerHTML = '<div class="text-slate-400 text-xs py-1">ยังไม่มีข้อย่อยในรายการตรวจสอบ</div>';
      return;
    }

    const filtered = subtasks.filter(st => {
      if (gasSubtaskFilter === 'all') return true;
      if (gasSubtaskFilter === 'unassigned') return !st.assignee;
      return st.assignee === gasSubtaskFilter;
    });

    container.innerHTML = filtered.map(st => {
      const optionsHtml = '<option value="">👤 (ไม่ระบุคน)</option>' +
        appEmployees.map(emp => '<option value="' + emp.name + '" ' + (st.assignee === emp.name ? 'selected' : '') + '>👤 ' + emp.name + '</option>').join('');

      return \`
        <div class="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition gap-2">
          <label class="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
            <input type="checkbox" \${st.completed ? 'checked' : ''} onchange="toggleGasSubtask('\${st.id}')" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0">
            <span class="text-xs truncate \${st.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-semibold'}">\${st.title}</span>
          </label>
          <div class="flex items-center gap-2 shrink-0">
            <select onchange="changeGasSubtaskAssignee('\${st.id}', this.value)" class="text-[10px] font-medium rounded-md px-1.5 py-0.5 border cursor-pointer \${st.assignee ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-400 border-slate-200'}">
              \${optionsHtml}
            </select>
            <button type="button" onclick="deleteGasSubtask('\${st.id}')" class="text-slate-300 hover:text-rose-600 p-1 transition cursor-pointer">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      \`;
    }).join('');
    lucide.createIcons();
  }

  function setGasSubtaskFilter(filter) {
    gasSubtaskFilter = filter;
    renderGasSubtasks();
  }

  function changeGasSubtaskAssignee(stId, newAssignee) {
    if (!currentDetailTask || !currentDetailTask.subtasks) return;
    const item = currentDetailTask.subtasks.find(s => s.id === stId);
    if (item) {
      item.assignee = newAssignee || undefined;
      renderGasSubtasks();
    }
  }

  function toggleGasSubtask(stId) {
    if (!currentDetailTask || !currentDetailTask.subtasks) return;
    const item = currentDetailTask.subtasks.find(s => s.id === stId);
    if (item) {
      item.completed = !item.completed;
      const subtasks = currentDetailTask.subtasks;
      const doneCount = subtasks.filter(s => s.completed).length;
      currentDetailTask.progress = Math.round((doneCount / subtasks.length) * 100);
      updateProgressUI();
      renderGasSubtasks();
    }
  }

  function deleteGasSubtask(stId) {
    if (!currentDetailTask || !currentDetailTask.subtasks) return;
    currentDetailTask.subtasks = currentDetailTask.subtasks.filter(s => s.id !== stId);
    if (currentDetailTask.subtasks.length > 0) {
      const doneCount = currentDetailTask.subtasks.filter(s => s.completed).length;
      currentDetailTask.progress = Math.round((doneCount / currentDetailTask.subtasks.length) * 100);
    }
    updateProgressUI();
    renderGasSubtasks();
  }

  function handleAddSubtaskGas() {
    const input = document.getElementById('new-subtask-input');
    const assigneeSel = document.getElementById('new-subtask-assignee');
    if (!input || !input.value.trim() || !currentDetailTask) return;
    if (!currentDetailTask.subtasks) currentDetailTask.subtasks = [];
    currentDetailTask.subtasks.push({
      id: 'st-' + Date.now(),
      title: input.value.trim(),
      completed: false,
      assignee: assigneeSel && assigneeSel.value ? assigneeSel.value : undefined
    });
    input.value = '';
    const doneCount = currentDetailTask.subtasks.filter(s => s.completed).length;
    currentDetailTask.progress = Math.round((doneCount / currentDetailTask.subtasks.length) * 100);
    updateProgressUI();
    renderGasSubtasks();
  }

  function saveDetailFullTaskChange() {
    if (!currentDetailTask) return;

    if (isWorkDetailEditMode) {
      const titleInput = document.getElementById('detail-title-input');
      const projInput = document.getElementById('detail-project-input');
      const ownerInput = document.getElementById('detail-owner-input');
      const prioInput = document.getElementById('detail-priority-input');
      const dueInput = document.getElementById('detail-duedate-input');
      const descInput = document.getElementById('detail-desc-input');

      if (titleInput && titleInput.value.trim()) currentDetailTask.title = titleInput.value.trim();
      if (projInput && projInput.value.trim()) currentDetailTask.project = projInput.value.trim();
      if (ownerInput && ownerInput.value) currentDetailTask.owner = ownerInput.value;
      if (prioInput && prioInput.value) currentDetailTask.priority = prioInput.value;
      if (dueInput) currentDetailTask.dueDate = dueInput.value;
      if (descInput) currentDetailTask.description = descInput.value;
    }

    if (selectedStatusTemp) {
      currentDetailTask.status = selectedStatusTemp;
    }

    // Update in local array
    const idx = appTasks.findIndex(t => t.id === currentDetailTask.id);
    if (idx !== -1) {
      appTasks[idx] = { ...currentDetailTask };
    }

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(() => {
          renderAll();
          closeModal('modal-workdetail');
        })
        .apiSaveTask(currentDetailTask);
    } else {
      renderAll();
      closeModal('modal-workdetail');
    }
  }

  function deleteCurrentTask() {
    if (!currentDetailTask) return;
    if (!confirm('คุณแน่ใจว่าต้องการลบงาน ' + currentDetailTask.id + ' ใช่หรือไม่?')) return;

    const targetId = currentDetailTask.id;
    appTasks = appTasks.filter(t => t.id !== targetId);

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run.apiDeleteTask(targetId);
    }
    closeModal('modal-workdetail');
    renderAll();
  }

  // --- Add Task Modal Logic (Dual Mode: Shared & Template) ---
  let gasAddTaskMode = 'shared';
  let gasSharedSubtasks = [
    { id: '1', title: 'ตรวจสอบข้อกำหนดและรายละเอียดงาน', assignee: '' },
    { id: '2', title: 'เริ่มลงมือปฏิบัติงานตามขั้นตอน', assignee: '' }
  ];
  let gasTemplateChecklist = [
    'ตรวจสอบความพร้อมของงาน',
    'ดำเนินการปฏิบัติงานตามมาตรฐาน',
    'สรุปผลและรายงานความคืบหน้า'
  ];
  let gasSelectedEmployees = [];

  function setGasAddTaskMode(mode) {
    gasAddTaskMode = mode;
    const tabShared = document.getElementById('gas-tab-mode-shared');
    const tabTemplate = document.getElementById('gas-tab-mode-template');
    const desc = document.getElementById('gas-mode-desc');
    const ownerContainer = document.getElementById('gas-field-owner-container');
    const templateContainer = document.getElementById('gas-template-employees-container');
    const heading = document.getElementById('gas-add-checklist-heading');
    const submitBtn = document.getElementById('gas-submit-task-btn');
    const assigneeSelect = document.getElementById('gas-add-subtask-assignee');

    if (mode === 'shared') {
      if (tabShared) tabShared.className = 'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all bg-white text-indigo-700 shadow-xs cursor-pointer';
      if (tabTemplate) tabTemplate.className = 'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all text-slate-600 hover:text-slate-900 cursor-pointer';
      if (desc) desc.innerHTML = '<strong>การ์ดร่วม 1 ใบ:</strong> มอบหมายผู้รับผิดชอบในแต่ละข้อ Checklist แยกกันได้';
      if (ownerContainer) ownerContainer.classList.remove('hidden');
      if (templateContainer) templateContainer.classList.add('hidden');
      if (heading) heading.innerText = 'รายการ Checklist และผู้รับผิดชอบแต่ละข้อ';
      if (assigneeSelect) assigneeSelect.classList.remove('hidden');
      if (submitBtn) submitBtn.innerText = 'สร้างการ์ดร่วมลง Sheet';
    } else {
      if (tabTemplate) tabTemplate.className = 'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all bg-white text-indigo-700 shadow-xs cursor-pointer';
      if (tabShared) tabShared.className = 'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all text-slate-600 hover:text-slate-900 cursor-pointer';
      if (desc) desc.innerHTML = '<strong>Template Checklist:</strong> สร้างการ์ดแยกตามบุคคลให้อัตโนมัติด้วยชุด Checklist เดียวกัน';
      if (ownerContainer) ownerContainer.classList.add('hidden');
      if (templateContainer) templateContainer.classList.remove('hidden');
      if (heading) heading.innerText = 'ชุด Checklist แม่แบบ (ทุกคนจะได้รับ)';
      if (assigneeSelect) assigneeSelect.classList.add('hidden');
      if (submitBtn) submitBtn.innerText = 'สร้างการ์ดสำหรับ ' + gasSelectedEmployees.length + ' คนลง Sheet';
      renderGasAddTaskEmployeesCheckboxes();
    }
    renderGasAddSubtasksList();
    lucide.createIcons();
  }

  function renderGasAddTaskEmployeesCheckboxes() {
    const grid = document.getElementById('gas-employees-checkboxes-grid');
    if (!grid) return;
    grid.innerHTML = appEmployees.map(emp => {
      const isChecked = gasSelectedEmployees.includes(emp.name);
      return \`
        <label class="flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-all \${isChecked ? 'bg-white border-indigo-400 font-semibold text-indigo-950' : 'bg-white/60 border-slate-200 text-slate-600'}">
          <input type="checkbox" \${isChecked ? 'checked' : ''} onchange="toggleGasEmployeeSelect('\${emp.name}')" class="h-3.5 w-3.5 rounded text-indigo-600 focus:ring-indigo-500">
          <span class="truncate">\${emp.name}</span>
        </label>
      \`;
    }).join('');
  }

  function toggleGasEmployeeSelect(name) {
    if (gasSelectedEmployees.includes(name)) {
      gasSelectedEmployees = gasSelectedEmployees.filter(n => n !== name);
    } else {
      gasSelectedEmployees.push(name);
    }
    const submitBtn = document.getElementById('gas-submit-task-btn');
    if (submitBtn && gasAddTaskMode === 'template') {
      submitBtn.innerText = 'สร้างการ์ดสำหรับ ' + gasSelectedEmployees.length + ' คนลง Sheet';
    }
    renderGasAddTaskEmployeesCheckboxes();
  }

  function toggleAllGasEmployeesSelect() {
    if (gasSelectedEmployees.length === appEmployees.length) {
      gasSelectedEmployees = [];
    } else {
      gasSelectedEmployees = appEmployees.map(e => e.name);
    }
    const submitBtn = document.getElementById('gas-submit-task-btn');
    if (submitBtn && gasAddTaskMode === 'template') {
      submitBtn.innerText = 'สร้างการ์ดสำหรับ ' + gasSelectedEmployees.length + ' คนลง Sheet';
    }
    renderGasAddTaskEmployeesCheckboxes();
  }

  function renderGasAddSubtasksList() {
    const container = document.getElementById('gas-add-subtasks-list');
    if (!container) return;

    if (gasAddTaskMode === 'shared') {
      if (gasSharedSubtasks.length === 0) {
        container.innerHTML = '<div class="text-slate-400 text-xs py-1">ยังไม่มีข้อย่อย</div>';
        return;
      }
      container.innerHTML = gasSharedSubtasks.map((st, idx) => {
        const optionsHtml = '<option value="">👤 (ไม่ระบุคน)</option>' +
          appEmployees.map(emp => '<option value="' + emp.name + '" ' + (st.assignee === emp.name ? 'selected' : '') + '>👤 ' + emp.name + '</option>').join('');

        return \`
          <div class="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200 text-xs">
            <span class="text-slate-800 flex-1 truncate">\${st.title}</span>
            <div class="flex items-center gap-1.5 shrink-0">
              <select onchange="changeGasAddSharedAssignee('\${st.id}', this.value)" class="text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-1.5 py-0.5 cursor-pointer">
                \${optionsHtml}
              </select>
              <button type="button" onclick="removeGasAddSubtask('\${st.id}')" class="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        \`;
      }).join('');
    } else {
      if (gasTemplateChecklist.length === 0) {
        container.innerHTML = '<div class="text-slate-400 text-xs py-1">ยังไม่มีข้อรายการแม่แบบ</div>';
        return;
      }
      container.innerHTML = gasTemplateChecklist.map((item, idx) => \`
        <div class="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200 text-xs">
          <span class="text-slate-800 flex-1 truncate">\${idx + 1}. \${item}</span>
          <button type="button" onclick="removeGasAddSubtask(\${idx})" class="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      \`).join('');
    }
    lucide.createIcons();
  }

  function changeGasAddSharedAssignee(id, assignee) {
    const item = gasSharedSubtasks.find(s => s.id === id);
    if (item) item.assignee = assignee;
  }

  function handleAddGasNewSubtaskItem() {
    const titleInput = document.getElementById('gas-add-subtask-title');
    const assigneeSelect = document.getElementById('gas-add-subtask-assignee');
    if (!titleInput || !titleInput.value.trim()) return;

    if (gasAddTaskMode === 'shared') {
      gasSharedSubtasks.push({
        id: 'st-add-' + Date.now(),
        title: titleInput.value.trim(),
        assignee: assigneeSelect ? assigneeSelect.value : ''
      });
    } else {
      gasTemplateChecklist.push(titleInput.value.trim());
    }
    titleInput.value = '';
    renderGasAddSubtasksList();
  }

  function removeGasAddSubtask(target) {
    if (gasAddTaskMode === 'shared') {
      gasSharedSubtasks = gasSharedSubtasks.filter(s => s.id !== target);
    } else {
      gasTemplateChecklist = gasTemplateChecklist.filter((_, idx) => idx !== target);
    }
    renderGasAddSubtasksList();
  }

  function openAddTaskModal() {
    document.getElementById('new-task-title').value = '';
    document.getElementById('new-task-desc').value = '';
    document.getElementById('new-task-duedate').value = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    // Populate owner select
    const ownerSelect = document.getElementById('new-task-owner');
    if (ownerSelect) {
      ownerSelect.innerHTML = appEmployees.map(emp => '<option value="' + emp.name + '">👤 ' + emp.name + ' (' + emp.project + ')</option>').join('');
    }

    // Populate subtask assignee select
    const addAssigneeSelect = document.getElementById('gas-add-subtask-assignee');
    if (addAssigneeSelect) {
      addAssigneeSelect.innerHTML = '<option value="">👤 (ไม่ระบุคน)</option>' +
        appEmployees.map(emp => '<option value="' + emp.name + '">👤 ' + emp.name + '</option>').join('');
    }

    gasSelectedEmployees = appEmployees.slice(0, 3).map(e => e.name);
    setGasAddTaskMode('shared');
    openModal('modal-add-task');
  }

  function handleAddSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('new-task-title').value;
    const project = document.getElementById('new-task-project').value;
    const priority = document.getElementById('new-task-priority').value;
    const dueDate = document.getElementById('new-task-duedate').value;
    const description = document.getElementById('new-task-desc').value;

    // Calculate base PID
    const nums = appTasks.map(t => {
      const m = t.id.match(/PID-(\\\\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    });
    const nextNum = (nums.length > 0 ? Math.max(...nums) : 100) + 1;

    if (gasAddTaskMode === 'shared') {
      const owner = document.getElementById('new-task-owner').value;
      const ownerData = appEmployees.find(emp => emp.name === owner);
      const newId = 'PID-' + nextNum;

      const subtasksFormatted = gasSharedSubtasks.map((st, idx) => ({
        id: 'st-' + Date.now() + '-' + idx,
        title: st.title,
        completed: false,
        assignee: st.assignee || undefined
      }));

      const newTask = {
        id: newId,
        title: title,
        project: project,
        owner: owner,
        ownerPhone: ownerData ? ownerData.phone : '',
        ownerEmail: ownerData ? ownerData.email : '',
        ownerAvatar: ownerData ? ownerData.avatar : '',
        priority: priority,
        status: 'Todo',
        dueDate: dueDate,
        description: description,
        progress: 0,
        subtasks: subtasksFormatted
      };

      appTasks.unshift(newTask);

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.apiSaveTask(newTask);
      }
    } else {
      if (gasSelectedEmployees.length === 0) {
        alert('กรุณาเลือกพนักงานอย่างน้อย 1 คน');
        return;
      }

      const batchTasks = gasSelectedEmployees.map((empName, index) => {
        const emp = appEmployees.find(e => e.name === empName);
        const subtasksCopy = gasTemplateChecklist.map((itemTitle, subIdx) => ({
          id: 'st-tmpl-' + Date.now() + '-' + index + '-' + subIdx,
          title: itemTitle,
          completed: false,
          assignee: empName
        }));

        return {
          id: 'PID-' + (nextNum + index),
          title: title,
          project: project,
          owner: empName,
          ownerPhone: emp ? emp.phone : '',
          ownerEmail: emp ? emp.email : '',
          ownerAvatar: emp ? emp.avatar : '',
          priority: priority,
          status: 'Todo',
          dueDate: dueDate,
          description: description,
          progress: 0,
          subtasks: subtasksCopy
        };
      });

      // Prepend batch tasks
      batchTasks.reverse().forEach(t => appTasks.unshift(t));

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        if (google.script.run.apiSaveTasksBatch) {
          google.script.run.apiSaveTasksBatch(batchTasks);
        } else {
          batchTasks.forEach(t => google.script.run.apiSaveTask(t));
        }
      }
    }

    closeModal('modal-add-task');
    renderAll();
    switchTab('work');
  }

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
    lucide.createIcons();
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  // Utilities
  function getStatusBadgeClass(status) {
    if (status === 'Completed') return 'status-badge-completed';
    if (status === 'In progress') return 'status-badge-inprogress';
    if (status === 'Blocked') return 'status-badge-blocked';
    return 'status-badge-todo';
  }

  function getPriorityColor(priority) {
    if (priority === 'High') return 'text-rose-600';
    if (priority === 'Medium') return 'text-amber-600';
    return 'text-slate-500';
  }

  // ระบบแสดงผลเต็มหน้าจอคอมพิวเตอร์ (Fullscreen API)
  function toggleFullScreen() {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(function(e) {});
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(function(e) {});
        }
      }
    } catch (e) {
      console.warn('Fullscreen error:', e);
    }
  }
</script>
`;

// 9. Index.html (Modular Template) - โครงสร้างหลักที่ดึงแต่ละไฟล์เข้ามาด้วย <?!= include(...) ?>
export const GAS_INDEX_MODULAR_HTML = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Manager - ระบบบริหารจัดการงาน</title>
  <!-- Suppress Tailwind CDN production warning in console -->
  <script>
    (function() {
      const origWarn = console.warn;
      console.warn = function(...args) {
        if (typeof args[0] === 'string' && args[0].indexOf('cdn.tailwindcss.com') !== -1) return;
        origWarn.apply(console, args);
      };
    })();
  </script>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Chart.js CDN for Interactive Graphs -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  
  <!-- 🎨 ดึงสไตล์และฟอนต์จากไฟล์ Styles.html -->
  <?!= include('Styles'); ?>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">

  <!-- 🧭 ดึงส่วนหัวจากไฟล์ Navbar.html -->
  <?!= include('Navbar'); ?>

  <!-- 📑 พื้นที่หลัก: Sidebar + ส่วนแสดงเนื้อหาเต็มหน้าจอ -->
  <div class="flex-1 flex flex-col md:flex-row w-full">
    <!-- เมนูด้านข้างจากไฟล์ Sidebar.html -->
    <?!= include('Sidebar'); ?>

    <!-- พื้นที่แสดง View แต่ละหน้า -->
    <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <!-- 📊 หน้า Dashboard สถิติและกราฟ -->
      <?!= include('Dashboard'); ?>

      <!-- 📋 หน้ารายการงานทั้งหมด (Work) -->
      <?!= include('WorkView'); ?>

      <!-- 👥 หน้ารายชื่อพนักงาน (Employees) -->
      <?!= include('EmployeesView'); ?>
    </main>
  </div>

  <!-- 🪟 ดึงหน้าต่างป๊อปอัปทั้งหมดจากไฟล์ Modals.html -->
  <?!= include('Modals'); ?>

  <!-- ⚡ ดึงโค้ด JavaScript ควบคุมการทำงานจากไฟล์ JavaScript.html -->
  <?!= include('JavaScript'); ?>

</body>
</html>
`;

// 10. Index.html (Single-File Bundle) - รวมทุกอย่างในไฟล์เดียว สำหรับผู้ที่ต้องการก๊อปปี้แบบรวดเร็ว
export const GAS_INDEX_HTML = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Manager - ระบบบริหารจัดการงาน</title>
  <!-- Suppress Tailwind CDN production warning in console -->
  <script>
    (function() {
      const origWarn = console.warn;
      console.warn = function(...args) {
        if (typeof args[0] === 'string' && args[0].indexOf('cdn.tailwindcss.com') !== -1) return;
        origWarn.apply(console, args);
      };
    })();
  </script>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Chart.js CDN for Interactive Graphs -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  ${GAS_STYLES_HTML}
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">

  ${GAS_NAVBAR_HTML}

  <div class="flex-1 flex flex-col md:flex-row w-full">
    ${GAS_SIDEBAR_HTML}

    <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      ${GAS_DASHBOARD_HTML}
      ${GAS_WORKVIEW_HTML}
      ${GAS_EMPLOYEESVIEW_HTML}
    </main>
  </div>

  ${GAS_MODALS_HTML}

  ${GAS_JAVASCRIPT_HTML}
</body>
</html>
`;

export interface GasProjectFile {
  id: string;
  name: string;
  filename: string;
  type: 'gs' | 'html';
  category: 'backend' | 'entry' | 'layout' | 'views' | 'modals' | 'assets';
  categoryLabel: string;
  badge: string;
  description: string;
  content: string;
}

/**
 * รายการไฟล์ทั้งหมดของ Google Apps Script แบบแยกหมวดหมู่
 */
export const GAS_MODULAR_FILES: GasProjectFile[] = [
  {
    id: 'code_gs',
    name: 'Code.gs',
    filename: 'Code.gs',
    type: 'gs',
    category: 'backend',
    categoryLabel: 'Server Backend',
    badge: 'Apps Script GS',
    description: 'สคริปต์ฝั่งเซิร์ฟเวอร์ จัดการชีต, Web App doGet(), เมนูหัวชีต, และฟังก์ชัน include()',
    content: GAS_CODE_GS,
  },
  {
    id: 'index_modular',
    name: 'Index.html',
    filename: 'Index.html',
    type: 'html',
    category: 'entry',
    categoryLabel: 'Main Frame',
    badge: 'Modular Template',
    description: 'โครงสร้างหลักของหน้าเว็บ รวมทุกโมดูลด้วยคำสั่ง <?!= include(\'...\'); ?>',
    content: GAS_INDEX_MODULAR_HTML,
  },
  {
    id: 'navbar_html',
    name: 'Navbar.html',
    filename: 'Navbar.html',
    type: 'html',
    category: 'layout',
    categoryLabel: 'Layout & Nav',
    badge: 'Component',
    description: 'แถบเมนูด้านบนสีขาว สะอาดตา มีโลโก้, ปุ่ม "เกี่ยวกับ", และ Avatar "A"',
    content: GAS_NAVBAR_HTML,
  },
  {
    id: 'sidebar_html',
    name: 'Sidebar.html',
    filename: 'Sidebar.html',
    type: 'html',
    category: 'layout',
    categoryLabel: 'Layout & Nav',
    badge: 'Component',
    description: 'เมนูนำทางด้านข้าง (Dashboard, งานทั้งหมด, พนักงาน, ตั้งค่า, ซิงค์ชีต)',
    content: GAS_SIDEBAR_HTML,
  },
  {
    id: 'dashboard_html',
    name: 'Dashboard.html',
    filename: 'Dashboard.html',
    type: 'html',
    category: 'views',
    categoryLabel: 'Page Views',
    badge: 'View Component',
    description: 'หน้าแดชบอร์ดภาพรวม แสดงการ์ด KPI 4 ใบ, Donut Chart, และ Bar Chart',
    content: GAS_DASHBOARD_HTML,
  },
  {
    id: 'workview_html',
    name: 'WorkView.html',
    filename: 'WorkView.html',
    type: 'html',
    category: 'views',
    categoryLabel: 'Page Views',
    badge: 'View Component',
    description: 'ตารางงานทั้งหมด ระบบค้นหา กรองสถานะ และปุ่มเพิ่มงานใหม่',
    content: GAS_WORKVIEW_HTML,
  },
  {
    id: 'employeesview_html',
    name: 'EmployeesView.html',
    filename: 'EmployeesView.html',
    type: 'html',
    category: 'views',
    categoryLabel: 'Page Views',
    badge: 'View Component',
    description: 'การ์ดแสดงรายชื่อพนักงาน ข้อมูลติดต่อ และจำนวนงานที่ได้รับมอบหมาย',
    content: GAS_EMPLOYEESVIEW_HTML,
  },
  {
    id: 'modals_html',
    name: 'Modals.html',
    filename: 'Modals.html',
    type: 'html',
    category: 'modals',
    categoryLabel: 'Dialogs & Modals',
    badge: 'Popup Component',
    description: 'รวมหน้าต่างป๊อปอัป: ดูรายละเอียดงาน (WorkDetail), เพิ่มงาน, เกี่ยวกับ, ตั้งค่า',
    content: GAS_MODALS_HTML,
  },
  {
    id: 'styles_html',
    name: 'Styles.html',
    filename: 'Styles.html',
    type: 'html',
    category: 'assets',
    categoryLabel: 'CSS & Styles',
    badge: 'Stylesheet',
    description: 'แท็ก <style> กำหนดฟอนต์ Sarabun, ป้ายสีสถานะงาน (Badge), และสไตล์ย่อย',
    content: GAS_STYLES_HTML,
  },
  {
    id: 'javascript_html',
    name: 'JavaScript.html',
    filename: 'JavaScript.html',
    type: 'html',
    category: 'assets',
    categoryLabel: 'Client Scripts',
    badge: 'Client Logic',
    description: 'สคริปต์ฝั่ง Client เรียก google.script.run, วาดกราฟ Chart.js, และจัดการ State',
    content: GAS_JAVASCRIPT_HTML,
  },
];
