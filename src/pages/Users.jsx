import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  ArrowUpRight,
  Download,
  ArrowDownLeft,
  Wallet,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { message } from "antd";
import { fetchAllUsers, provisionNewUser } from "../api/userApi";

const fadeInUpRow = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.03, duration: 0.22, ease: "easeOut" }
  })
};

// --- SKELETON LOADERS FOR DASHBOARD SECTIONS ---
const StatisticsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
    {[1, 2, 3].map((n) => (
      <div key={n} className="border border-slate-800 p-4 bg-[#1F2937] flex items-center gap-4 rounded-none">
        <div className="w-10 h-10 bg-[#090A0F] rounded-none shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-slate-800 w-1/3 rounded-none" />
          <div className="h-5 bg-slate-800 w-1/2 rounded-none" />
        </div>
      </div>
    ))}
  </div>
);

const RosterTableSkeleton = () => (
  <div className="border border-slate-800 bg-[#1F2937] rounded-none overflow-x-auto animate-pulse">
    <div className="h-10 bg-[#090A0F] w-full" />
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="flex justify-between items-center py-2 border-b border-slate-800/50">
          <div className="flex items-center gap-3 w-1/4">
            <div className="w-8 h-8 bg-slate-800 rounded-none shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-slate-800 w-3/4 rounded-none" />
              <div className="h-2 bg-slate-800 w-1/2 rounded-none" />
            </div>
          </div>
          <div className="h-3 bg-slate-800 w-1/6 rounded-none" />
          <div className="h-3 bg-slate-800 w-1/12 rounded-none" />
          <div className="h-3 bg-slate-800 w-1/12 rounded-none" />
          <div className="h-5 bg-slate-800 w-8 rounded-none" />
        </div>
      ))}
    </div>
  </div>
);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdFromUrl = searchParams.get("id");
  
  const [selectedUser, setSelectedUser] = useState(null);

  // Create User Form States
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");

  // Load platform users catalog from remote API core mapping engine
const loadUsersData = async () => {
  try {
    setLoading(true);
    const data = await fetchAllUsers();
    
    // Map the incoming data to ensure all fields exist
    const processedUsers = data.map(user => ({
      ...user,
      totalInvested: user.totalInvested || 0,
      totalProfit: user.totalProfit || 0,
      totalInbound: user.totalInbound || 0,
      investmentsList: user.investmentsList || [],
      inboundHistory: user.inboundHistory || []
    }));
    
    setUsers(processedUsers);
  } catch (error) {
    message.error("Failed to load user data.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadUsersData();
  }, []);

  // Sync state view node with browser routing deep-link indicators
  useEffect(() => {
    if (userIdFromUrl && users.length > 0) {
      const user = users.find(u => (u.id === userIdFromUrl || u._id === userIdFromUrl));
      if (user) setSelectedUser(user);
    } else {
      setSelectedUser(null);
    }
  }, [userIdFromUrl, users]);

  const handleSelectUser = (user) => {
    if (user) {
      setSearchParams({ id: user.id || user._id });
    } else {
      setSearchParams({});
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPhone) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone
      };

      const responseData = await provisionNewUser(payload);
      
      // Structure response record properties to gracefully populate immediate React UI states
      const structuredUser = {
        id: responseData.user._id, 
        name: responseData.user.name,
        email: responseData.user.email,
        phone: responseData.user.phone,
        joinedDate: new Date(responseData.user.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }),
        totalInvested: 0,
        totalInbound: 0,
        totalProfit: 0,
        activeTiers: 0,
        investmentsList: [],
        inboundHistory: []
      };

      setUsers([structuredUser, ...users]);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPhone("");
      setIsModalOpen(false);
      message.success(responseData.message || "New investor profile registered successfully!");
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to provision workspace profile parameters.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsersCount = users.length;
  const activeInvestorsCount = users.filter(u => u.totalInvested > 0).length;
  const totalPlatformCapital = users.reduce((sum, u) => sum + (u.totalInvested || 0), 0);

  return (
    <div className="space-y-6 bg-[#1F1F1F] min-h-screen text-[#9CA3AF] p-6">
      
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Investor Accounts</h1>
                <p className="text-sm text-[#9CA3AF] mt-0.5">Review registered client balances and provision credential records.</p>
              </div>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-[#34D399] hover:bg-[#06D6A0] text-[#090A0F] font-bold text-sm px-4 py-2.5 rounded-none transition-colors shrink-0 cursor-pointer"
              >
                <UserPlus size={16} />
                Register Investor
              </button>
            </div>

            {/* Platform Metrics Section Wrapper */}
            {loading ? <StatisticsSkeleton /> : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-slate-800 p-4 bg-[#1F2937] flex items-center gap-4 rounded-none">
                  <div className="p-2.5 bg-[#090A0F] text-[#34D399]">
                    <UsersIcon size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#9CA3AF] block">Total Profiles</span>
                    <span className="text-lg font-semibold text-white">{totalUsersCount} Users</span>
                  </div>
                </div>

                <div className="border border-slate-800 p-4 bg-[#1F2937] flex items-center gap-4 rounded-none">
                  <div className="p-2.5 bg-[#090A0F] text-[#3B82F6]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#9CA3AF] block">Funded Stakeholders</span>
                    <span className="text-lg font-semibold text-white">{activeInvestorsCount} Active</span>
                  </div>
                </div>

                <div className="border border-slate-800 p-4 bg-[#1F2937] flex items-center gap-4 rounded-none">
                  <div className="p-2.5 bg-[#090A0F] text-amber-500">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#9CA3AF] block">Total Asset Volume</span>
                    <span className="text-lg font-semibold text-white">₦{totalPlatformCapital.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Input Control */}
            <div className="flex items-center max-w-xs border border-slate-800 bg-[#1F2937] px-3 py-1.5 focus-within:border-[#34D399] transition-colors">
              <Search size={16} className="text-[#9CA3AF] mr-2 shrink-0" />
              <input 
                type="text"
                placeholder="Filter by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs bg-transparent text-white focus:outline-none font-medium placeholder-[#9CA3AF]"
              />
            </div>

            {/* Main Roster Dynamic Table Segment */}
            {loading ? <RosterTableSkeleton /> : (
              <div className="border border-slate-800 bg-[#1F2937] rounded-none overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#090A0F] border-b border-slate-800 font-bold text-[#9CA3AF] uppercase tracking-wider">
                      <th className="p-4 font-bold">Investor Identity</th>
                      <th className="p-4 font-bold">Contact Channels</th>
                      <th className="p-4 font-bold">Join Date</th>
                      <th className="p-4 font-bold text-right">Principal Invested</th>
                      <th className="p-4 font-bold text-right">Net Profit Yield</th>
                      <th className="p-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium text-[#9CA3AF]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#9CA3AF] font-medium italic">
                          No matching registered database records found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, idx) => (
                        <motion.tr 
                          key={user.id || user._id}
                          custom={idx}
                          variants={fadeInUpRow}
                          initial="hidden"
                          animate="visible"
                          className="hover:bg-[#090A0F]/40 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#090A0F] text-white font-semibold flex items-center justify-center text-lg capitalize shrink-0">
                                {user.name ? user.name.charAt(0) : "?"}
                              </div>
                              <div>
                                <div className="font-semibold capitalize text-white text-sm">{user.name}</div>
                                {/* <div className="text-[10px] text-[#9CA3AF] font-mono tracking-wide">ID: #{user.id || user._id}</div> */}
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-4 space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[#9CA3AF]">
                              <Mail size={12} className="text-[#9CA3AF] shrink-0" />
                              <span className="truncate max-w-40">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#9CA3AF]">
                              <Phone size={12} className="text-[#9CA3AF] shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          </td>
                          
                          <td className="p-4 text-[#9CA3AF]">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-[#9CA3AF]" />
                              <span>{user.joinedDate}</span>
                            </div>
                          </td>
                          
                          <td className="p-4 text-right font-mono font-extrabold text-white text-sm">
                            ₦{(user.totalInvested || 0).toLocaleString()}
                          </td>

                          <td className="p-4 text-right font-mono font-extrabold text-[#34D399] text-sm">
                            ₦{(user.totalProfit || 0).toLocaleString()}
                          </td>

                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleSelectUser(user)}
                              className="p-1.5 text-[#9CA3AF] hover:text-[#34D399] hover:bg-[#090A0F] transition-all inline-flex items-center justify-center cursor-pointer"
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
            )}
          </motion.div>
        ) : (
          /* VIEW 2: COMPACT, UNIFIED SIMPLIFIED DETAILS VIEW */
          <motion.div 
            key="profile-panel"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="space-y-6"
          >
            {/* Minimal Header Navigation */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <button 
                onClick={() => handleSelectUser(null)}
                className="inline-flex items-center gap-1.5 text-[#9CA3AF] hover:text-white text-xs font-bold transition-colors group cursor-pointer"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Roster</span>
              </button>
              
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-2.5 py-1 border border-slate-800 text-[11px] font-bold hover:bg-[#1F2937] transition-colors text-[#9CA3AF] cursor-pointer">
                  <Download size={12} /> Audit Trail
                </button>
                <span className="text-[10px] font-mono bg-[#1F2937] text-[#9CA3AF] px-2 py-1 border border-slate-800">ID: #{selectedUser.id || selectedUser._id}</span>
              </div>
            </div>

            {/* Compact Identification Card */}
            <div className="border border-slate-800 bg-[#1F2937] p-4 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#090A0F] text-white font-bold flex items-center justify-center text-lg shrink-0">
                  {selectedUser.name ? selectedUser.name.charAt(0) : "?"}
                </div>
                <div>
                  <h2 className="text-lg font-semibold capitalize text-white tracking-tight">{selectedUser.name}</h2>
                  <div className="flex items-center gap-x-3 text-[11px] text-[#9CA3AF] font-medium">
                    <span className="flex items-center gap-1"><Mail size={11} className="text-[#9CA3AF]" /> {selectedUser.email}</span>
                    <span className="flex items-center gap-1"><Phone size={11} className="text-[#9CA3AF]" /> {selectedUser.phone}</span>
                    <span className="text-slate-700">|</span>
                    <span>Enrolled: {selectedUser.joinedDate}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase bg-[#090A0F] border border-slate-800 text-[#34D399] px-2 py-0.5">
                ● Active Profile
              </span>
            </div>

            {/* Streamlined Core Figures Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-slate-800 p-4 bg-[#1F2937] space-y-1">
                <span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <ArrowDownLeft size={12} className="text-[#3B82F6]" /> Inbound Capital (Sent In)
                </span>
                <div className="text-xl font-extrabold text-white font-mono">₦{(selectedUser.totalInbound || 0).toLocaleString()}</div>
              </div>

              <div className="border border-slate-800 p-4 bg-[#1F2937] space-y-1">
                <span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Briefcase size={12} className="text-amber-500" /> Placed Principal (Invested)
                </span>
                <div className="text-xl font-extrabold text-amber-500 font-mono">₦{(selectedUser.totalInvested || 0).toLocaleString()}</div>
              </div>

              <div className="border border-slate-800 p-4 bg-[#1F2937] space-y-1">
                <span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Coins size={12} className="text-[#34D399]" /> Accumulated Yield (Profit)
                </span>
                <div className="text-xl font-extrabold text-[#34D399] font-mono">₦{(selectedUser.totalProfit || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* UNIFIED ADMINISTRATIVE DATA GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Box 1: Placed Investment Allocations */}
              <div className="border border-slate-800 bg-[#1F2937] p-4 space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Active Investment Placements</h4>
                  <p className="text-[11px] text-[#9CA3AF]">Capital actively assigned to operational pool positions.</p>
                </div>
                {!selectedUser.investmentsList || selectedUser.investmentsList.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] italic bg-[#090A0F] p-3 text-center border border-slate-800">No current asset placements found.</p>
                ) : (
                  <div className="border border-slate-800 overflow-hidden bg-[#090A0F]">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-[#1F2937] border-b border-slate-800 font-bold text-[#9CA3AF]">
                          <th className="p-2">Asset Pool Class</th>
                          <th className="p-2 text-right">Committed</th>
                          <th className="p-2 text-right">Profit</th>
                          <th className="p-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-medium text-[#9CA3AF]">
                        {selectedUser.investmentsList.map((inv, idx) => (
                          <tr key={inv.reference || idx} className="hover:bg-[#1F2937]/40">
                            <td className="p-2 font-bold capitalize text-white">{inv.poolName}</td>
                            <td className="p-2 text-right font-mono text-white">₦{inv.amount.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono text-[#34D399] font-bold">₦{inv.yieldEarned.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono text-[#34D399] font-bold">
  ₦{(inv.amount + inv.yieldEarned).toLocaleString()}
</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Box 2: Inbound Capital Flow Logs */}
              <div className="border border-slate-800 bg-[#1F2937] p-4 space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Inbound Receipts History</h4>
                  <p className="text-[11px] text-[#9CA3AF]">Chronological history of external funding events into account wallet balance.</p>
                </div>
                {!selectedUser.inboundHistory || selectedUser.inboundHistory.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] italic bg-[#090A0F] p-3 text-center border border-slate-800">No historical deposit records found.</p>
                ) : (
                  <div className="border border-slate-800 overflow-hidden bg-[#090A0F]">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-[#1F2937] border-b border-slate-800 font-bold text-[#9CA3AF]">
                          <th className="p-2">Ingress Channel</th>
                          <th className="p-2">Clear Date</th>
                          <th className="p-2 text-right">Inbound Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-medium text-[#9CA3AF]">
                        {selectedUser.inboundHistory.map((txn, idx) => (
                          <tr key={txn.reference || idx} className="hover:bg-[#1F2937]/40">
                            <td className="p-2 font-semibold text-white">{txn.method}</td>
                            <td className="p-2 text-[#9CA3AF]">{txn.date}</td>
                            <td className="p-2 text-right font-mono text-[#3B82F6] font-bold">₦{txn.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Quick Micro Action Controllers */}
            {/* <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[11px]">
              <span className="font-bold text-[#9CA3AF] uppercase tracking-wider text-[10px]">Admin Quick Tasks:</span>
              <button 
                onClick={() => message.info("Task action: Record Inbound Cash Deposit")}
                className="px-2 py-1 border border-slate-800 text-[#9CA3AF] hover:bg-[#1F2937] font-semibold bg-[#090A0F] cursor-pointer"
              >
                + Log Inbound Funding
              </button>
              <button 
                onClick={() => message.info("Task action: Place Available Funds to Pool")}
                className="px-2 py-1 border border-slate-800 text-[#9CA3AF] hover:bg-[#1F2937] font-semibold bg-[#090A0F] cursor-pointer"
              >
                → Allocate Investment
              </button>
            </div> */}

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
              onClick={() => !isSubmitting && setIsModalOpen(false)} 
              className="absolute inset-0 bg-[#090A0F]/70 backdrop-blur-xs" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              className="bg-[#1F2937] border border-slate-800 rounded-none w-full max-w-sm p-6 relative z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white">
                  <UserPlus size={18} className="text-[#34D399]" />
                  <h3 className="font-bold text-base">Register Profile</h3>
                </div>
                <button 
                  onClick={() => !isSubmitting && setIsModalOpen(false)} 
                  disabled={isSubmitting}
                  className="text-[#9CA3AF] hover:text-white font-bold text-sm disabled:opacity-30 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Create a verified system account instance to register capital flows inside pool packages.
              </p>

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#9CA3AF] block">Full Legal Name</label>
                  <input 
                    type="text" 
                    required
                    disabled={isSubmitting}
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Olumide Balogun"
                    className="w-full px-3 py-2 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#9CA3AF] block">Corporate / Personal Email</label>
                  <input 
                    type="email" 
                    required
                    disabled={isSubmitting}
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="olumide@domain.ng"
                    className="w-full px-3 py-2 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#9CA3AF] block">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    disabled={isSubmitting}
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="e.g. +234 803 123 4567"
                    className="w-full px-3 py-2 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/3 py-2.5 border border-slate-800 hover:bg-[#090A0F] text-[#9CA3AF] font-bold text-sm rounded-none transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-[#34D399] hover:bg-[#06D6A0] disabled:bg-slate-800 disabled:text-slate-500 text-[#090A0F] disabled:cursor-not-allowed font-bold text-sm rounded-none transition-colors cursor-pointer"
                  >
                    {isSubmitting ? "Provisioning..." : "Provision Profile"}
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