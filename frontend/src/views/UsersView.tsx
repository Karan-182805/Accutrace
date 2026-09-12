import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Building2, 
  Mail, 
  Phone, 
  MoreVertical, 
  UserCheck, 
  UserX,
  X
} from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { SystemUser } from '../types';

export const UsersView: React.FC = () => {
  const [usersList, setUsersList] = useState<SystemUser[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Administrator' | 'Enforcement Officer' | 'Reviewer'>('Enforcement Officer');
  const [newUserZone, setNewUserZone] = useState('North Zone - Delhi NCR');

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.department.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const newUser: SystemUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: newUserName,
      role: newUserRole,
      department: 'Legal Metrology Enforcement Dept',
      zone: newUserZone,
      status: 'Active',
      lastActive: 'Just now',
      email: newUserEmail || `${newUserName.toLowerCase().replace(/\s+/g, '.')}@legalmetrology.gov.in`,
      phone: '+91 98100 00000'
    };

    setUsersList([newUser, ...usersList]);
    setShowAddModal(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const toggleUserStatus = (id: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-900 text-white rounded font-mono">USER MANAGEMENT</span>
            <span className="text-xs text-slate-500 font-medium">Access Control Directory</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Enforcement Officers & System Users</h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage authorized enforcement officers, district controllers, and lab reviewers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow flex items-center gap-2 transition-all shrink-0"
        >
          <UserPlus size={16} />
          Add Enforcement Officer
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search officer name, department, or role..."
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 text-slate-900"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Officer Name</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold">Department & Zone</th>
                <th className="py-3 px-4 font-bold">Contact</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Last Active</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{u.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${u.role === 'Administrator' ? 'bg-purple-100 text-purple-800' : u.role === 'Enforcement Officer' ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-800'}`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{u.department}</div>
                    <div className="text-[10px] text-slate-500">{u.zone}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    <div>{u.email}</div>
                    <div className="text-[10px] font-mono text-slate-400">{u.phone}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{u.lastActive}</td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors ${u.status === 'Active' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'}`}
                    >
                      {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Add New Enforcement User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Inspector A. K. Verma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="ak.verma@legalmetrology.gov.in"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">System Access Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Enforcement Officer">Enforcement Officer</option>
                  <option value="Reviewer">Reviewer / Verification Specialist</option>
                  <option value="Administrator">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Enforcement Zone / District</label>
                <input
                  type="text"
                  value={newUserZone}
                  onChange={(e) => setNewUserZone(e.target.value)}
                  placeholder="e.g. North Zone - Delhi NCR"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold shadow"
                >
                  Add Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
