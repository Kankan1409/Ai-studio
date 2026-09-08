/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Navbar,
  Sidebar,
  DashboardView,
  WorkView,
  WorkDetailModal,
  AddTaskModal,
  EmployeesView,
  AddEmployeeModal,
  GoogleSheetGuideView,
  SettingsView,
  AboutModal,
} from './components';
import { Task, Employee, ActiveTab, TaskStatus } from './types';
import { INITIAL_TASKS, INITIAL_EMPLOYEES, PROJECTS_LIST } from './data/mockData';
import { syncDataFromSource } from './utils/sheetSync';

// Ensure every task has a unique ID to prevent React duplicate key collisions
function ensureUniqueTaskIds(taskList: Task[]): Task[] {
  if (!Array.isArray(taskList)) return [];
  const seen = new Set<string>();
  return taskList.map((task, idx) => {
    let finalId = (task.id || '').trim();
    if (!finalId || seen.has(finalId)) {
      let counter = 1;
      let candidate = finalId ? `${finalId}-${counter}` : `PID-${120 + idx}`;
      while (seen.has(candidate)) {
        counter++;
        candidate = finalId ? `${finalId}-${counter}` : `PID-${120 + idx + counter}`;
      }
      finalId = candidate;
    }
    seen.add(finalId);
    if (finalId !== task.id) {
      return { ...task, id: finalId };
    }
    return task;
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Persistent storage in localStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tm_tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return ensureUniqueTaskIds(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return ensureUniqueTaskIds(INITIAL_TASKS);
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('tm_employees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_EMPLOYEES;
  });

  // Modals state
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Auto-sync from Google Sheets if configured as live source
  useEffect(() => {
    const dataSource = localStorage.getItem('tm_data_source');
    const gasUrl = localStorage.getItem('tm_gas_url');
    if (dataSource === 'gas' && gasUrl?.trim()) {
      syncDataFromSource(gasUrl.trim())
        .then((result) => {
          if (result.success) {
            setTasks(ensureUniqueTaskIds(result.tasks));
            setEmployees(result.employees);
          }
        })
        .catch((err) => {
          console.warn('Auto-sync from sheet failed on startup:', err);
        });
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tm_employees', JSON.stringify(employees));
  }, [employees]);

  // Handler: Update entire task
  const handleUpdateTask = (updated: Task, originalId?: string) => {
    const targetId = originalId || updated.id;
    setTasks((prev) => prev.map((t) => (t.id === targetId ? updated : t)));
    if (selectedTaskForDetail?.id === targetId) {
      setSelectedTaskForDetail(updated);
    }
  };

  // Handler: Update status only
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              progress: newStatus === 'Completed' ? 100 : t.progress,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              progress: newStatus === 'Completed' ? 100 : prev.progress,
            }
          : null
      );
    }
  };

  // Handler: Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail(null);
    }
  };

  // Handler: Add new task(s)
  const handleAddTask = (newTasks: Task | Task[]) => {
    const toAdd = Array.isArray(newTasks) ? newTasks : [newTasks];
    setTasks((prev) => ensureUniqueTaskIds([...toAdd, ...prev]));
  };

  // Handler: Add new employee
  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees((prev) => [...prev, newEmployee]);
  };

  // Handler: Update employee
  const handleUpdateEmployee = (updated: Employee, originalId?: string) => {
    const targetId = originalId || updated.id;
    setEmployees((prev) => prev.map((e) => (e.id === targetId ? updated : e)));
  };

  // Handler: Delete employee
  const handleDeleteEmployee = (empId: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== empId));
  };

  // Handler: Reset mock data
  const handleResetData = () => {
    setTasks(INITIAL_TASKS);
    setEmployees(INITIAL_EMPLOYEES);
    localStorage.removeItem('tm_tasks');
    localStorage.removeItem('tm_employees');
    setSelectedTaskForDetail(null);
  };

  const [workSearchQuery, setWorkSearchQuery] = useState<string>('');
  const [filterEmployee, setFilterEmployee] = useState<Employee | null>(null);

  // Handler: Jump to work view filtered by employee
  const handleFilterEmployeeTasks = (employee: Employee) => {
    setFilterEmployee(employee);
    setWorkSearchQuery('');
    setActiveTab('work');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Navbar matching Image 2 */}
      <Navbar onOpenAbout={() => setIsAboutModalOpen(true)} />

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tasksCount={tasks.length}
          employeesCount={employees.length}
        />

        {/* Content View: Full width on computer screens */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:px-10 w-full bg-slate-50">
          <div className="w-full">
            {activeTab === 'dashboard' && (
              <DashboardView
                tasks={tasks}
                setActiveTab={setActiveTab}
                onSelectTask={(task) => setSelectedTaskForDetail(task)}
              />
            )}

            {activeTab === 'work' && (
              <WorkView
                tasks={tasks}
                employees={employees}
                initialSearchQuery={workSearchQuery}
                filterEmployee={filterEmployee}
                onClearEmployeeFilter={() => setFilterEmployee(null)}
                onSelectTask={(task) => setSelectedTaskForDetail(task)}
                onAddTaskClick={() => setIsAddTaskModalOpen(true)}
                onUpdateTaskStatus={handleUpdateTaskStatus}
              />
            )}

            {activeTab === 'employees' && (
              <EmployeesView
                employees={employees}
                tasks={tasks}
                onAddEmployeeClick={() => setIsAddEmployeeModalOpen(true)}
                onFilterEmployeeTasks={handleFilterEmployeeTasks}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
              />
            )}

            {activeTab === 'sheets_guide' && (
              <GoogleSheetGuideView tasks={tasks} employees={employees} />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                tasks={tasks}
                employees={employees}
                onResetData={handleResetData}
                setActiveTab={setActiveTab}
                onSyncData={(newTasks, newEmployees) => {
                  setTasks(newTasks);
                  setEmployees(newEmployees);
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Work Detail Modal: Opened from work or dashboard ("workdetail กดเอาจากwork นะ") */}
      {selectedTaskForDetail && (
        <WorkDetailModal
          task={selectedTaskForDetail}
          employees={employees}
          isOpen={true}
          onClose={() => setSelectedTaskForDetail(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <AddTaskModal
          isOpen={true}
          onClose={() => setIsAddTaskModalOpen(false)}
          onAddTask={handleAddTask}
          employees={employees}
          projects={PROJECTS_LIST}
          existingTasks={tasks}
        />
      )}

      {/* Add Employee Modal */}
      {isAddEmployeeModalOpen && (
        <AddEmployeeModal
          isOpen={true}
          onClose={() => setIsAddEmployeeModalOpen(false)}
          onAddEmployee={handleAddEmployee}
          projects={PROJECTS_LIST}
          existingEmployees={employees}
        />
      )}

      {/* About Modal */}
      {isAboutModalOpen && (
        <AboutModal
          isOpen={true}
          onClose={() => setIsAboutModalOpen(false)}
          onOpenSheetsGuide={() => setActiveTab('sheets_guide')}
        />
      )}
    </div>
  );
}
