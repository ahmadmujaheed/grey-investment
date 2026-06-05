import { useState } from "react";
import { 
  UserPlus, 
  Users as UsersIcon, 
  TrendingUp, 
  ShieldCheck, 
  Mail, 
  Calendar,
  Phone,
  Search,
  Eye,
  ArrowLeft,
  Briefcase,
  TrendingDown,
  ArrowUpRight,
  Download,
  History,
  Layers,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { message } from "antd";

// Mock Database of Initial Users with Investment and Profit Trackers
const initialUsers = [
  { id: "u1", name: "Femi Adebayo", email: "femi@investmentpool.ng", phone: "+234 803 111 2222", joinedDate: "12 May 2025", totalInvested: 1500000, totalProfit: 185000, activeTiers: 1 },
  { id: "u2", name: "Chidi Okechukwu", email: "chidi.o@fintech.ng", phone: "+234 816 333 4444", joinedDate: "29 Jan 2025", totalInvested: 3000000, totalProfit: 420000, activeTiers: 2 },
  { id: "u3", name: "Aminu Umar", email: "aminu.umar@vanguard.ng", phone: "+234 905 555 6666", joinedDate: "18 Aug 2025", totalInvested: 1000000, totalProfit: 95000, activeTiers: 1 },
  { id: "u4", name: "Chioma Nnaji", email: "chioma.nnaji@outlook.com", phone: "+234 708 777 8888", joinedDate: "05 Nov 2025", totalInvested: 0, totalProfit: 0, activeTiers: 0 },
  { id: "u5", name: "Blessing Egbe", email: "blessing.egbe@gmail.com", phone: "+234 812 999 0000", joinedDate: "14 Feb 2026", totalInvested: 0, totalProfit: 0, activeTiers: 0 },
  { id: "u6", name: "Tunde Bakare", email: "tunde.bakare@prime.ng", phone: "+234 809 123 4567", joinedDate: "03 Mar 2026", totalInvested: 0, totalProfit: 0, activeTiers: 0 }
];

// Mock Performance Growth Metrics over 6 Months (for rendering custom data charts)
const mockChartData = [
  { month: "Jan", balance: 40, profit: 10 },
  { month: "Feb", balance: 55, profit: 25 },
  { month: "Mar", balance: 70, profit: 45 },
  { month: "Apr", balance: 65, profit: 60 },
  { month: "May", balance: 85, profit: 75 },
  { month: "Jun", balance: 100, profit: 95 }
];

const fadeInUpRow = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.03, duration: 0.22, ease: "easeOut" }
  })
};

const Users = () => {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); 
  const [activeTab, setActiveTab] = useState("overview"); // Tab state tracker for user details view
  
  // Create User Form States
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPhone) return;

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
      totalProfit: 0,
      activeTiers: 0
    };

    setUsers([newUser, ...users]);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPhone("");
    setIsModalOpen(false);
    message.success("New investor profile registered successfully!");
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsersCount = users.length;
  const activeInvestorsCount = users.filter(u => u.totalInvested > 0).length;
  const totalPlatformCapital = users.reduce((sum, u) => sum + u.totalInvested, 0);

  return (
    <div className="space-y-6 bg-white min-h-screen text-slate-800 p-6">
      
      <AnimatePresence mode="wait">
        {!selectedUser ? (
          /* VIEW 1: MASTER LIST ROSTER DIRECTORY */
          <motion.div 
            key="list-panel"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="space-y-6"
          >
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

            <div className="border border-slate-200 bg-white rounded-none overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4 font-bold">Investor Identity</th>
                    <th className="p-4 font-bold">Contact Channels</th>
                    <th className="p-4 font-bold">Join Date</th>
                    <th className="p-4 font-bold text-right">Principal Invested</th>
                    <th className="p-4 font-bold text-right">Net Profit Yield</th>
                    <th className="p-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium italic">
                        No matching registered database records found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <motion.tr 
                        key={user.id}
                        custom={idx}
                        variants={fadeInUpRow}
                        initial="hidden"
                        animate="visible"
                        className="hover:bg-slate-50/60 transition-colors"
                      >
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
                        
                        <td className="p-4 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone size={12} className="text-slate-400 shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        </td>
                        
                        <td className="p-4 text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" />
                            <span>{user.joinedDate}</span>
                          </div>
                        </td>
                        
                        <td className="p-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                          ₦{user.totalInvested.toLocaleString()}
                        </td>

                        <td className="p-4 text-right font-mono font-extrabold text-emerald-600 text-sm">
                          ₦{user.totalProfit.toLocaleString()}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => { setSelectedUser(user); setActiveTab("overview"); }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-all inline-flex items-center justify-center"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          /* VIEW 2: PREMIUM HIGH-FIDELITY DETAILED INVESTOR DASHBOARD PAGE */
          <motion.div 
            key="profile-panel"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="space-y-6"
          >
            {/* Top Navigation Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <button 
                onClick={() => setSelectedUser(null)}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Return to Investor Roster</span>
              </button>
              
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors">
                  <Download size={14} /> Export Vault Audit
                </button>
                <span className="text-xs font-mono bg-slate-900 text-slate-100 px-2.5 py-1.5 tracking-wider">UID: #{selectedUser.id}</span>
              </div>
            </div>

            {/* Profile Overview Banner Block */}
            <div className="border border-slate-200 bg-slate-50/60 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 text-white font-black flex items-center justify-center text-2xl tracking-wide shrink-0">
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedUser.name}</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><Mail size={13} className="text-slate-400" /> {selectedUser.email}</span>
                    <span className="flex items-center gap-1"><Phone size={13} className="text-slate-400" /> {selectedUser.phone}</span>
                    <span className="flex items-center gap-1"><Calendar size={13} className="text-slate-400" /> Joined {selectedUser.joinedDate}</span>
                  </div>
                </div>
              </div>
              
              {/* Account Status Tag */}
              <div className="text-right">
                <span className={`text-xs font-bold font-mono uppercase px-3 py-1 border tracking-wider inline-block ${
                  selectedUser.totalInvested > 0 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-slate-100 text-slate-400 border-slate-200"
                }`}>
                  {selectedUser.totalInvested > 0 ? "● Capital Active" : "○ Unfunded Account"}
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1.5">KYC Verified Tier 1</p>
              </div>
            </div>

            {/* Central Financial Summary Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-slate-200 bg-white p-5 space-y-2 rounded-none">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Active Principal</span>
                <div className="text-2xl font-black text-slate-900 font-mono">₦{selectedUser.totalInvested.toLocaleString()}</div>
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 pt-1.5 border-t border-slate-100">
                  <Briefcase size={12} className="text-slate-400" /> Linked to {selectedUser.activeTiers} capital pools
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-5 space-y-2 rounded-none">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Net Capital Gains</span>
                <div className="text-2xl font-black text-emerald-600 font-mono">₦{selectedUser.totalProfit.toLocaleString()}</div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 pt-1.5 border-t border-slate-100">
                  <ArrowUpRight size={12} /> +{(selectedUser.totalInvested > 0 ? ((selectedUser.totalProfit / selectedUser.totalInvested) * 100).toFixed(1) : 0)}% Realized ROI
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-5 space-y-2 rounded-none">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Combined Valuation</span>
                <div className="text-2xl font-black text-blue-700 font-mono">₦{(selectedUser.totalInvested + selectedUser.totalProfit).toLocaleString()}</div>
                <div className="text-[11px] font-semibold text-slate-400 block pt-1.5 border-t border-slate-100 truncate">
                  Withdrawable balance equity total
                </div>
              </div>
            </div>

            {/* Layout Tabbed Controls Block */}
            <div className="border-b border-slate-200 flex gap-6 text-xs font-bold">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`pb-2 tracking-wide uppercase flex items-center gap-1.5 border-b-2 transition-all ${activeTab === "overview" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                <Activity size={14} /> Analytics & Growth
              </button>
              <button 
                onClick={() => setActiveTab("pools")}
                className={`pb-2 tracking-wide uppercase flex items-center gap-1.5 border-b-2 transition-all ${activeTab === "pools" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                <Layers size={14} /> Active Allocations ({selectedUser.activeTiers})
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                className={`pb-2 tracking-wide uppercase flex items-center gap-1.5 border-b-2 transition-all ${activeTab === "history" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                <History size={14} /> Ledger Audit Trail
              </button>
            </div>

            {/* Dynamic Content Panel rendering based on selection */}
            <div className="pt-2">
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  
                  {/* Embedded Custom HTML Data Chart Element (Left Column) */}
                  <div className="lg:col-span-2 border border-slate-200 p-6 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Portfolio Performance Graph</h4>
                        <p className="text-[11px] text-slate-400">Yield accumulation trend against capital base over the last 2 quarters.</p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold font-mono">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-900 block" /> Principal</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 block" /> Earnings</span>
                      </div>
                    </div>

                    {/* Pure CSS/HTML Graph Implementation Container */}
                    {selectedUser.totalInvested === 0 ? (
                      <div className="h-56 bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-4">
                        <TrendingDown size={24} className="text-slate-300 mb-1" />
                        <span className="text-xs font-bold text-slate-400">No chart trends available</span>
                        <p className="text-[10px] text-slate-400 max-w-xs mt-0.5">Asset metrics will chart once capital is allocated to operational pool lines.</p>
                      </div>
                    ) : (
                      <div className="pt-6">
                        {/* Bars Canvas Frame */}
                        <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-l border-slate-200 pb-1 relative">
                          
                          {/* Optional Background Grid Guideline Rules */}
                          <div className="absolute left-0 right-0 border-t border-slate-100 top-1/4 pointer-events-none" />
                          <div className="absolute left-0 right-0 border-t border-slate-100 top-2/4 pointer-events-none" />
                          <div className="absolute left-0 right-0 border-t border-slate-100 top-3/4 pointer-events-none" />

                          {mockChartData.map((data, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                              
                              {/* Hover tooltip for metric data visibility */}
                              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 pointer-events-none transition-opacity font-mono z-10 whitespace-nowrap">
                                Cap: {data.balance}%, Pft: {data.profit}%
                              </div>

                              {/* Stacked bar structure components */}
                              <div className="w-full flex gap-1 items-end h-full justify-center px-1">
                                <div 
                                  style={{ height: `${data.balance}%` }} 
                                  className="w-1/2 bg-slate-900 hover:bg-slate-700 transition-colors"
                                />
                                <div 
                                  style={{ height: `${data.profit}%` }} 
                                  className="w-1/2 bg-emerald-500 hover:bg-emerald-400 transition-colors"
                                />
                              </div>
                              
                              <span className="text-[10px] font-bold text-slate-400 font-mono mt-1 absolute top-full">{data.month}</span>
                            </div>
                          ))}
                        </div>
                        {/* Padding fix layout block for chart labels */}
                        <div className="h-5" /> 
                      </div>
                    )}
                  </div>

                  {/* Admin Configuration Actions Side-Card (Right Column) */}
                  <div className="border border-slate-200 bg-white p-5 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Manual Ledger Adjustments</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Administrative tools to directly override or top up client variables.</p>
                    </div>

                    <div className="space-y-2 pt-1">
                      <button 
                        onClick={() => message.info("Mock action: Initialize Capital Infusion Flow")}
                        className="w-full text-left border border-slate-200 px-3 py-2.5 hover:bg-slate-50 font-semibold text-xs flex justify-between items-center group transition-colors"
                      >
                        <div>
                          <div className="text-slate-800 font-bold">Inject Investment Principal</div>
                          <div className="text-[10px] text-slate-400 font-normal">Top up account base assets via bank wire tracking.</div>
                        </div>
                        <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
                      </button>

                      <button 
                        onClick={() => message.info("Mock action: Launch Profit Distribution Protocol")}
                        className="w-full text-left border border-slate-200 px-3 py-2.5 hover:bg-slate-50 font-semibold text-xs flex justify-between items-center group transition-colors"
                      >
                        <div>
                          <div className="text-slate-800 font-bold">Distribute Direct Dividend</div>
                          <div className="text-[10px] text-slate-400 font-normal">Manually allocate profit yield margins into account profile.</div>
                        </div>
                        <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {activeTab === "pools" && (
                <div className="border border-slate-200 bg-white rounded-none p-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Linked Asset Sub-Pools</h4>
                  {selectedUser.totalInvested === 0 ? (
                    <p className="text-xs text-slate-400 italic">No pool allocations active for this registered profile context.</p>
                  ) : (
                    <div className="border border-slate-100 text-xs">
                      <div className="bg-slate-50 p-3 border-b border-slate-100 grid grid-cols-3 font-bold text-slate-500">
                        <span>Pool Line Class</span>
                        <span className="text-right">Committed Stake</span>
                        <span className="text-right">Performance State</span>
                      </div>
                      <div className="p-3 grid grid-cols-3 border-b border-slate-100 font-semibold">
                        <span className="text-slate-900 font-bold">Premium Real Estate Pool #A</span>
                        <span className="text-right font-mono text-slate-800">₦{selectedUser.totalInvested.toLocaleString()}</span>
                        <span className="text-right text-emerald-600 font-bold">Active / Compounding</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="border border-slate-200 bg-white rounded-none p-6 text-xs space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">System Activity Audit Trail</h4>
                  <div className="space-y-3 border-l-2 border-slate-100 pl-4 ml-2">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500" />
                      <div className="font-bold text-slate-800">Account Base Database Object Provisioned</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedUser.joinedDate} — System Automated Process</div>
                    </div>
                    {selectedUser.totalInvested > 0 && (
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-blue-500" />
                        <div className="font-bold text-slate-800">Inbound Bank Wire Finalization Confirmation</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">22 Oct 2025 — Approved by Audit Node #014</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* REGISTRATION OVERLAY MODAL CONTAINER DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
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