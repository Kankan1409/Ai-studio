/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express governing permissions and
 * limitations under the License.
 */

import React, { useState, useEffect } from 'react';
import { X, UserCheck, Trash2, Phone, Mail, Briefcase, Building, Layers } from 'lucide-react';
import { Employee } from '../../types';

interface EditEmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onUpdateEmployee: (updated: Employee, originalId?: string) => void;
  onDeleteEmployee: (empId: string) => void;
  projects: string[];
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  employee,
  onClose,
  onUpdateEmployee,
  onDeleteEmployee,
  projects,
}) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [project, setProject] = useState('');
  const [projectId, setProjectId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (employee) {
      setId(employee.id || '');
      setName(employee.name || '');
      setProject(employee.project || projects[0] || 'แผนก/ITW');
      setProjectId(employee.projectId || employee.project || '');
      setPhone(employee.phone || '');
      setEmail(employee.email || '');
      setRole(employee.role || 'Team Member');
      setAvatar(employee.avatar || '');
      setShowDeleteConfirm(false);
    }
  }, [employee, projects]);

  if (!isOpen || !employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: Employee = {
      ...employee,
      id: id.trim() || employee.id,
      name: name.trim(),
      project: project.trim() || 'แผนก/ITW',
      projectId: projectId.trim() || project.trim(),
      phone: phone.trim() || '-',
      email: email.trim() || '-',
      role: role.trim() || 'Team Member',
      avatar: avatar.trim() || employee.avatar,
    };

    onUpdateEmployee(updated, employee.id);
    onClose();
  };

  const handleDelete = () => {
    onDeleteEmployee(employee.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="edit-employee-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/80 flex items-center justify-center text-white font-bold">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">แก้ไขข้อมูลพนักงาน</h3>
              <p className="text-xs text-slate-400">อัปเดตข้อมูลหรือลบรายชื่อพนักงาน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Delete Confirmation Alert Box */}
        {showDeleteConfirm && (
          <div className="p-4 m-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <Trash2 className="h-4 w-4 text-rose-600" />
              ยืนยันการลบพนักงานคนนี้?
            </div>
            <p className="text-xs text-rose-700">
              คุณกำลังจะลบ <strong>{employee.name}</strong> ({employee.id}) ออกจากระบบ
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-white border border-rose-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                id="confirm-delete-employee-btn"
                onClick={handleDelete}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-2xs cursor-pointer"
              >
                ยืนยันลบพนักงาน
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Employee ID and Avatar preview */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm ring-2 ring-white">
                  {(name || 'E').slice(0, 1)}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                  รหัสพนักงาน (ID)
                </label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="font-mono text-xs font-bold text-indigo-700 bg-white border border-slate-300 rounded px-2 py-0.5 w-24 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              งานในระบบ: <strong>{employee.tasksCount || 0}</strong> งาน
            </span>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อ-นามสกุล หรือชื่อเล่น *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น พี่ไมค์, สมชาย, วรรณา..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ตำแหน่ง (Role)
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="เช่น Frontend Developer..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                แผนก / โครงการ
              </label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="เช่น แผนก/ITW หรือชื่อโครงการ"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Project IDs assigned */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
              รหัสงานที่รับผิดชอบ (Project ID)
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="เช่น AI-001, AI-002, PID-123 (คั่นด้วยจุลภาค)"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              ระบบจะนับและเชื่อมโยงงานใน Tasks กับพนักงานคนนี้โดยตรง
            </p>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" /> เบอร์โทรศัพท์
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-400" /> อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL รูปภาพโปรไฟล์ (Avatar - ไม่บังคับ)
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Actions: Delete on left, Cancel & Save on right */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>ลบพนักงาน</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                id="submit-edit-employee-btn"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
