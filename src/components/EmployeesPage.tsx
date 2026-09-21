import React, { useState } from 'react';
import { Employee, StaffAttendance } from '../types';
import { 
  UserCheck, 
  Users, 
  Plus, 
  Search, 
  Phone, 
  DollarSign, 
  Clock, 
  CalendarCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  X, 
  Check 
} from 'lucide-react';

interface EmployeesPageProps {
  employees: Employee[];
  attendance: StaffAttendance[];
  onAddEmployee: (employee: Employee) => void;
  onRecordAttendance: (att: StaffAttendance) => void;
}

export default function EmployeesPage({
  employees,
  attendance,
  onAddEmployee,
  onRecordAttendance
}: EmployeesPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'attendance'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Today's date
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [form, setForm] = useState({
    name: '',
    role: 'cashier' as Employee['role'],
    roleTitle: 'Qasnaji (Cashier)',
    phone: '',
    salary: 250,
    shift: 'Subax (Morning)' as Employee['shift']
  });

  const filteredEmployees = employees.filter(e => {
    const q = searchQuery.toLowerCase().trim();
    return !q || e.name.toLowerCase().includes(q) || e.roleTitle.toLowerCase().includes(q) || e.phone.includes(q);
  });

  const totalMonthlyPayroll = employees.reduce((sum, e) => sum + e.salary, 0);

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert('Fadlan geli magaca iyo taleefanka shaqaalaha!');
      return;
    }

    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      name: form.name,
      role: form.role,
      roleTitle: form.roleTitle || form.role,
      phone: form.phone,
      salary: Number(form.salary) || 0,
      shift: form.shift,
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    onAddEmployee(newEmp);
    setShowAddModal(false);
    setForm({ name: '', role: 'cashier', roleTitle: 'Qasnaji (Cashier)', phone: '', salary: 250, shift: 'Subax (Morning)' });
  };

  const markAttendance = (emp: Employee, status: 'present' | 'absent' | 'late') => {
    const attRecord: StaffAttendance = {
      id: `att_${emp.id}_${selectedDate}`,
      employeeId: emp.id,
      employeeName: emp.name,
      role: emp.roleTitle,
      date: selectedDate,
      status
    };
    onRecordAttendance(attRecord);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#042954] text-[#ffae01] rounded-xl shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Shaqaalaha & Qasnajiyada (Staff & Cashiers)
            </h1>
            <p className="text-xs text-slate-500">
              Diiwaanka shaqaalaha, shaqo-wareegyada (shifts), iyo xaadirinta maalinlaha ah.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtabs toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'directory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Shaqaalaha
            </button>
            <button
              onClick={() => setActiveSubTab('attendance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'attendance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Xaadirinta (Attendance)
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-[#ffae01]" />
            <span>Ku dar Shaqaale</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tirada Guud ee Shaqaalaha
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {employees.length} <span className="text-xs font-medium text-slate-400">qof</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Qasnajiyada POS (Cashiers)
          </span>
          <div className="text-2xl font-black text-[#042954] mt-1">
            {employees.filter(e => e.role === 'cashier').length}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Shift-yada Subax & Galab
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Mushaharka Bisha (Monthly Payroll)
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ${totalMonthlyPayroll.toFixed(2)}
          </div>
        </div>
      </div>

      {activeSubTab === 'directory' ? (
        /* Staff Directory */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Raadi shaqaale, xilka, taleefanka..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#042954]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Magaca Shaqaalaha</th>
                  <th className="py-3 px-4">Xilka (Role)</th>
                  <th className="py-3 px-4">Taleefanka</th>
                  <th className="py-3 px-4">Shift-ka</th>
                  <th className="py-3 px-4 text-right">Mushaharka ($)</th>
                  <th className="py-3 px-4 text-center">Xaaladda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{e.name}</div>
                      <span className="text-[10px] text-slate-400">Shaqaaleysiin: {e.hireDate}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold text-[10px] rounded-lg">
                        {e.roleTitle}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{e.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{e.shift}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ${e.salary.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[10px] rounded-md">
                        Shaqeynaya
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Staff Daily Attendance Tracker */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Xaadirinta Maalinlaha ah ee Shaqaalaha Supermarket-ka
              </h3>
              <p className="text-xs text-slate-500">
                Calaamadee shaqaalaha jooga, maqan ama soo daahay taariikhda la doortay.
              </p>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            />
          </div>

          <div className="divide-y divide-slate-100">
            {employees.map(emp => {
              const record = attendance.find(a => a.employeeId === emp.id && a.date === selectedDate);
              const currentStatus = record?.status || 'present';

              return (
                <div key={emp.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{emp.name}</h4>
                    <p className="text-[11px] text-slate-500">{emp.roleTitle} • {emp.shift}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => markAttendance(emp, 'present')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Jooga</span>
                    </button>

                    <button
                      onClick={() => markAttendance(emp, 'late')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        currentStatus === 'late'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Soo Daahay</span>
                    </button>

                    <button
                      onClick={() => markAttendance(emp, 'absent')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        currentStatus === 'absent'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Maqan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 bg-[#042954] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#ffae01]" />
                <h3 className="text-sm font-bold font-display">Ku Dar Shaqaale Cusub</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Magaca Shaqaalaha (Full Name)*
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="tusaale: Maxamed Xasan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nooca Shaqada (Role)*
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => {
                      const r = e.target.value as Employee['role'];
                      const titles: Record<string, string> = {
                        cashier: 'Qasnaji (Cashier)',
                        inventory_mgr: 'Maamulaha Bakhaarka',
                        supervisor: 'Kormeere Guud',
                        cleaner: 'Nadiifiye',
                        accountant: 'Xisaabiye'
                      };
                      setForm({ ...form, role: r, roleTitle: titles[r] || r });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954] cursor-pointer"
                  >
                    <option value="cashier">Qasnaji (Cashier)</option>
                    <option value="inventory_mgr">Maamulaha Bakhaarka</option>
                    <option value="supervisor">Kormeere Guud</option>
                    <option value="cleaner">Nadiifiye</option>
                    <option value="accountant">Xisaabiye</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Shift-ka*
                  </label>
                  <select
                    value={form.shift}
                    onChange={(e) => setForm({ ...form, shift: e.target.value as Employee['shift'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-[#042954] cursor-pointer"
                  >
                    <option value="Subax (Morning)">Subax (Morning)</option>
                    <option value="Galab (Afternoon)">Galab (Afternoon)</option>
                    <option value="Habeen (Night)">Habeen (Night)</option>
                    <option value="Full Time">Full Time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Taleefanka (Phone)*
                </label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+25290..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:border-[#042954]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Mushaharka Bisha ($)*
                </label>
                <input
                  type="number"
                  required
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#042954]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#042954] hover:bg-[#031d3d] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#ffae01]" />
                  <span>Diiwaangeli</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
