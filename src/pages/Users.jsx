import { useState } from "react";
import { 
  UserPlus, 
  Users as UsersIcon, 
  TrendingUp, 
  ShieldCheck, 
  Mail, 
  Calendar,
  Phone,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { message } from "antd";

// Mock Database of Initial Users
const initialUsers = [
  { id: "u1", name: "Femi Adebayo", email: "femi@investmentpool.ng", phone: "+234 803 111 2222", joinedDate: "12 May 2025", totalInvested: 1500000, activeTiers: 1 },
  { id: "u2", name: "Chidi Okechukwu", email: "chidi.o@fintech.ng", phone: "+234 816 333 4444", joinedDate: "29 Jan 2025", totalInvested: 3000000, activeTiers: 1 },
  { id: "u3", name: "Aminu Umar", email: "aminu.umar@vanguard.ng", phone: "+234 905 555 6666", joinedDate: "18 Aug 2025", totalInvested: 1000000, activeTiers: 1 },
  { id: "u4", name: "Chioma Nnaji", email: "chioma.nnaji@outlook.com", phone: "+234 708 777 8888", joinedDate: "05 Nov 2025", totalInvested: 0, activeTiers: 0 },
  { id: "u5", name: "Blessing Egbe", email: "blessing.egbe@gmail.com", phone: "+234 812 999 0000", joinedDate: "14 Feb 2026", totalInvested: 0, activeTiers: 0 },
  { id: "u6", name: "Tunde Bakare", email: "tunde.bakare@prime.ng", phone: "+234 809 123 4567", joinedDate: "03 Mar 2026", totalInvested: 0, activeTiers: 0 }
];

const Users = () => {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Create User Form States
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPhone) return;

    // Email duplication safety check
    if (users.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase())) {
      message.error("A user with this email address is already registered.");
      return;
    }

    const newUser = {
      id: `u${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone,
      joinedDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      totalInvested: 0,
      activeTiers: 0
    };

    setUsers([newUser, ...users]);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPhone("");
    setIsModalOpen(false);
    message.success("New investor profile registered successfully!");
  };

  // Filter logic for quick searching across rows
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute high-level system analytics counters
  const totalUsersCount = users.length;
  const activeInvestorsCount = users.filter(u => u.totalInvested > 0).length;
  const totalPlatformCapital = users.reduce((sum, u) => sum + u.totalInvested, 0);

  return (
    <div className="space-y-6 bg-white min-h-screen text-slate-800 p-6">
      
      {/* Upper Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Investor Accounts</h1>
          <p className="text-sm text-slate-500 mt-0.5">Review registered client balances and provision credential records.</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-none transition-colors shrink-0"
        >
          <UserPlus size={16} />
          Register Investor
        </button>
      </div>

      {/* Metric Summaries Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-slate-200 p-4 bg-slate-50/50 flex items-center gap-4 rounded-none">
          <div className="p-2.5 bg-emerald-50 text-emerald-700">
            <UsersIcon size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Total Profiles</span>
            <span className="text-lg font-extrabold text-slate-900">{totalUsersCount} Users</span>
          </div>
        </div>

        <div className="border border-slate-200 p-4 bg-slate-50/50 flex items-center gap-4 rounded-none">
          <div className="p-2.5 bg-blue-50 text-blue-700">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Funded Stakeholders</span>
            <span className="text-lg font-extrabold text-slate-900">{activeInvestorsCount} Active</span>
          </div>
        </div>

        <div className="border border-slate-200 p-4 bg-slate-50/50 flex items-center gap-4 rounded-none">
          <div className="p-2.5 bg-amber-50 text-amber-700">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Total Asset Volume</span>
            <span className="text-lg font-extrabold text-slate-900">₦{totalPlatformCapital.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Action Strip */}
      <div className="flex items-center max-w-xs border border-slate-200 bg-white px-3 py-1.5 focus-within:border-emerald-500 transition-colors">
        <Search size={16} className="text-slate-400 mr-2 shrink-0" />
        <input 
          type="text"
          placeholder="Filter by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs bg-transparent text-slate-800 focus:outline-none font-medium"
        />
      </div>

      {/* Structural Data Table Element Wrapper */}
      <div className="border border-slate-200 bg-white rounded-none overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4 font-bold">Investor Identity</th>
              <th className="p-4 font-bold">Contact Channels</th>
              <th className="p-4 font-bold">Join Date</th>
              <th className="p-4 font-bold text-center">Allocated Pools</th>
              <th className="p-4 font-bold text-right">Total Portfolio Base</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-medium italic">
                  No matching registered database records found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Name column */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-none bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono tracking-wide">ID: #{user.id}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Contacts Column */}
                  <td className="p-4 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail size={12} className="text-slate-400 shrink-0" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone size={12} className="text-slate-400 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  </td>
                  
                  {/* Date Column */}
                  <td className="p-4 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{user.joinedDate}</span>
                    </div>
                  </td>
                  
                  {/* Allocations Counter Column */}
                  <td className="p-4 text-center font-bold text-slate-800">
                    {user.activeTiers} pools
                  </td>
                  
                  {/* Financial Base Column */}
                  <td className="p-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                    ₦{user.totalInvested.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* REGISTRATION OVERLAY MODAL CONTAINER DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Layer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" 
            />
            
            {/* Modal Body Card Panel */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-none w-full max-w-sm p-6 relative z-10 space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900">
                  <UserPlus size={18} className="text-emerald-600" />
                  <h3 className="font-bold text-base">Register Profile</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Create a verified system account instance to register capital flows inside pool packages.
              </p>

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 block">Full Legal Name</label>
                  <input 
                    type="text" 
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Olumide Balogun"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-none font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 block">Corporate / Personal Email</label>
                  <input 
                    type="email" 
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="olumide@domain.ng"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-none font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 block">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="e.g. +234 803 123 4567"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-none font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-none transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-none transition-colors"
                  >
                    Provision Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Users;