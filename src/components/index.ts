/**
 * Clean Barrel Exports for Components
 * Categorized by module for maintainability and readability
 */

// Layout components (Navbar, Sidebar)
export { Navbar } from './layout/Navbar';
export { Sidebar } from './layout/Sidebar';

// Dashboard module
export { DashboardView } from './dashboard/DashboardView';

// Work / Task management module
export { WorkView } from './work/WorkView';
export { WorkDetailModal } from './work/WorkDetailModal';
export { AddTaskModal } from './work/AddTaskModal';

// Employees module
export { EmployeesView } from './employees/EmployeesView';
export { AddEmployeeModal } from './employees/AddEmployeeModal';

// Google Sheets & Apps Script module
export { GoogleSheetGuideView } from './sheets/GoogleSheetGuideView';

// Settings & Modals
export { SettingsView } from './settings/SettingsView';
export { AboutModal } from './modals/AboutModal';

// Common UI components
export { MultiSelectDropdown } from './common/MultiSelectDropdown';
