import { useState, useEffect } from "react";
import { 
  Plus, 
  Users, 
  ArrowLeft, 
  FolderPlus, 
  UserPlus, 
  UploadCloud,
  Trash2,
  Coins,
  Percent
} from "lucide-react";
import { motion } from "motion/react";
import { Upload, message } from "antd";

// Mock Database of Available Users to Select From
const availableUsers = [
  { id: "u1", name: "Femi Adebayo" },
  { id: "u2", name: "Chidi Okechukwu" },
  { id: "u3", name: "Aminu Umar" },
  { id: "u4", name: "Chioma Nnaji" },
  { id: "u5", name: "Blessing Egbe" },
  { id: "u6", name: "Tunde Bakare" }
];

// Mock Data for Initial Packages
const initialPackages = [
  {
    id: 1,
    name: "Real Estate Alpha",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&auto=format&fit=crop&q=60",
    totalAmount: 5500000,
    investorsCount: 3,
    investors: [
      { name: "John Doe", amount: 1500000 },
      { name: "Sarah Jenkins", amount: 2500000 },
      { name: "Michael Chang", amount: 1500000 },
    ]
  },
  {
    id: 2,
    name: "SaaS Tech Fund",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&auto=format&fit=crop&q=60",
    totalAmount: 4200000,
    investorsCount: 2,
    investors: [
      { name: "David Miller", amount: 3000000 },
      { name: "Emma Watson", amount: 1200000 },
    ]
  },
  {
    id: 3,
    name: "Green Energy Bond",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&auto=format&fit=crop&q=60",
    totalAmount: 5500000,
    investorsCount: 2,
    investors: [
      { name: "Alice Smith", amount: 5000000 },
      { name: "Robert Downey", amount: 500000 },
    ]
  },
  {
    id: 4,
    name: "Crypto Blue Chip",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&auto=format&fit=crop&q=60",
    totalAmount: 1050000,
    investorsCount: 2,
    investors: [
      { name: "Chris Evans", amount: 200000 },
      { name: "Jessica Alba", amount: 850000 },
    ]
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

const Investment = () => {
  // Master packages list state layer
  const [packages, setPackages] = useState(() => {
    const savedPackages = sessionStorage.getItem("investment_packages");
    return savedPackages ? JSON.parse(savedPackages) : initialPackages;
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Persistent Screen Workspace Configurator Hook
  const [selectedPackage, setSelectedPackage] = useState(() => {
    const savedPackageId = sessionStorage.getItem("selectedPackageId");
    if (savedPackageId) {
      const savedPackages = sessionStorage.getItem("investment_packages");
      const currentPools = savedPackages ? JSON.parse(savedPackages) : initialPackages;
      const foundPkg = currentPools.find(pkg => pkg.id === Number(savedPackageId));
      return foundPkg || null;
    }
    return null;
  });

  // Creation State Hooks
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  // Add User State Hooks
  const [selectedInvestorName, setSelectedInvestorName] = useState("");
  const [newInvestorAmount, setNewInvestorAmount] = useState("");

  // Yield Calculator Distribution Inputs State Hook 
  const [inputProfitAmount, setInputProfitAmount] = useState("");

  // Side Effect 1: Auto-save packages modifications to storage
  useEffect(() => {
    sessionStorage.setItem("investment_packages", JSON.stringify(packages));
  }, [packages]);

  // Side Effect 2: Keep track of navigation position during browser reloads
  useEffect(() => {
    if (selectedPackage) {
      sessionStorage.setItem("selectedPackageId", selectedPackage.id.toString());
    } else {
      sessionStorage.removeItem("selectedPackageId");
    }
  }, [selectedPackage]);

  // Side Effect 3: Sync selected workspace UI parameters cleanly when mutations complete
  useEffect(() => {
    if (selectedPackage) {
      const freshPackageInstance = packages.find(pkg => pkg.id === selectedPackage.id);
      if (freshPackageInstance) {
        setSelectedPackage(freshPackageInstance);
      }
    }
  }, [packages]);

  // Ant Design Image Upload Handler
  const antdUploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    showUploadList: false,
    beforeUpload(file) {
      const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("You can only upload JPG/PNG files!");
        return Upload.LIST_IGNORE;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
      return false; 
    },
  };

  const handleCreateInvestment = (e) => {
    e.preventDefault();
    if (!newName || !newAmount) return;

    const newPackage = {
      id: Date.now(),
      name: newName,
      image: uploadedImageUrl || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=60",
      totalAmount: parseFloat(newAmount),
      investorsCount: 0,
      investors: []
    };

    setPackages([newPackage, ...packages]);
    setNewName("");
    setNewAmount("");
    setUploadedImageUrl("");
    setIsCreateOpen(false);
    message.success("Investment tier deployed successfully!");
  };

  const handleAddInvestor = (e) => {
    e.preventDefault();
    if (!selectedInvestorName || !newInvestorAmount) return;

    const addedAmount = parseFloat(newInvestorAmount);

    const updatedPackages = packages.map((pkg) => {
      if (pkg.id === selectedPackage.id) {
        const updatedInvestors = [
          ...pkg.investors,
          { name: selectedInvestorName, amount: addedAmount }
        ];
        
        return {
          ...pkg,
          investors: updatedInvestors,
          investorsCount: updatedInvestors.length,
          totalAmount: pkg.totalAmount + addedAmount
        };
      }
      return pkg;
    });

    setPackages(updatedPackages);
    setSelectedInvestorName("");
    setNewInvestorAmount("");
    message.success("Investor appended to roster successfully!");
  };

  const handleRemoveInvestor = (investorIndex) => {
    const investorToRemove = selectedPackage.investors[investorIndex];

    const updatedPackages = packages.map((pkg) => {
      if (pkg.id === selectedPackage.id) {
        const updatedInvestors = pkg.investors.filter((_, idx) => idx !== investorIndex);
        
        return {
          ...pkg,
          investors: updatedInvestors,
          investorsCount: updatedInvestors.length,
          totalAmount: Math.max(0, pkg.totalAmount - investorToRemove.amount) 
        };
      }
      return pkg;
    });

    setPackages(updatedPackages);
    message.info("Investor removed from pool roster.");
  };

  // Fractional Payout Calculation Matrix Engine Split Core Logic
  const handleDistributeProfit = (e) => {
    e.preventDefault();
    const profit = parseFloat(inputProfitAmount);
    
    if (!profit || profit <= 0) {
      message.error("Please enter a valid profit distribution value.");
      return;
    }
    if (selectedPackage.investors.length === 0 || selectedPackage.totalAmount === 0) {
      message.error("Cannot distribute profit to an empty asset pool.");
      return;
    }

    const companyShare = profit * 0.55;
    const investorsTotalShare = profit * 0.45;

    const updatedPackages = packages.map((pkg) => {
      if (pkg.id === selectedPackage.id) {
        const updatedInvestors = pkg.investors.map((inv) => {
          const investorPoolRatio = inv.amount / pkg.totalAmount;
          const individualProfitCut = investorsTotalShare * investorPoolRatio;
          return {
            ...inv,
            amount: Math.round(inv.amount + individualProfitCut)
          };
        });

        return {
          ...pkg,
          investors: updatedInvestors,
          totalAmount: Math.round(pkg.totalAmount + investorsTotalShare)
        };
      }
      return pkg;
    });

    setPackages(updatedPackages);
    setInputProfitAmount("");
    message.success(`Split Logged: ₦${companyShare.toLocaleString()} (55%) to corporate vault & ₦${investorsTotalShare.toLocaleString()} (45%) added to investor stakes.`);
  };

  return (
    <div className="space-y-6 bg-[#1F1F1F] min-h-screen text-[#9CA3AF] p-4">
      
      {/* CASE A: ROOT GALLERY GRID INTERFACE VIEW */}
      {!selectedPackage ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Investment Tiers</h1>
              <p className="text-sm text-[#9CA3AF] mt-0.5">Manage pool configurations and view co-investor distribution metrics.</p>
            </div>
            
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#34D399] hover:bg-[#06D6A0] text-[#090A0F] font-bold text-sm px-4 py-2.5 rounded-none transition-colors shrink-0"
            >
              <Plus size={16} />
              Create Investment
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.id}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                onClick={() => setSelectedPackage(pkg)}
                className="group cursor-pointer border border-slate-800 rounded-none overflow-hidden bg-[#1F2937] hover:border-[#34D399]/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 w-full overflow-hidden bg-[#090A0F] relative rounded-none">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-none"
                    />
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-white text-base group-hover:text-[#34D399] transition-colors">
                      {pkg.name}
                    </h3>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-medium">
                        <span className="text-[#34D399] font-bold text-sm">₦</span>
                        <span>Pool Size: <strong className="text-white">₦{pkg.totalAmount.toLocaleString()}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-medium">
                        <Users size={14} className="text-[#9CA3AF]" />
                        <span>Active Investors: <strong className="text-white">{pkg.investors.length} members</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="w-full text-center py-2 bg-[#090A0F] rounded-none text-xs font-bold text-[#9CA3AF] group-hover:bg-[#34D399] group-hover:text-[#090A0F] transition-colors">
                    View Roster & Audit
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        
        /* CASE B: SAME-PAGE INLINE DETAILED EXPLORATION WORKSPACE */
        <motion.div 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <button 
              onClick={() => setSelectedPackage(null)}
              className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white text-sm font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Packages</span>
            </button>
            <span className="text-xs font-mono bg-[#1F2937] text-[#9CA3AF] px-2 py-1 uppercase tracking-wider border border-slate-800">Asset ID: #{selectedPackage.id}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Content Column: Graphic Panel and Active Investors List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="border border-slate-800 bg-[#1F2937] rounded-none overflow-hidden">
                <div className="h-56 w-full bg-[#090A0F]">
                  <img src={selectedPackage.image} alt="" className="w-full h-full object-cover rounded-none" />
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#34D399] bg-[#090A0F] px-2 py-0.5 rounded-none border border-slate-800">Active Distribution Group</span>
                    <h2 className="text-2xl font-bold text-white mt-1">{selectedPackage.name}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 text-xs font-semibold">
                    <div>
                      <span className="text-[#9CA3AF] block">Total Pool Vault Asset Base</span>
                      <span className="text-xl font-bold text-[#34D399]">₦{selectedPackage.totalAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[#9CA3AF] block">Current Stakeholder Headcount</span>
                      <span className="text-xl font-bold text-white">{selectedPackage.investors.length} Members</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stakeholders Ledger Node Output */}
              <div className="border border-slate-800 bg-[#1F2937] p-6 space-y-4 rounded-none">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Pool Stakeholders Roster</h3>
                {selectedPackage.investors.length === 0 ? (
                  <p className="text-xs font-medium text-[#9CA3AF] italic py-2">No individual ledger entries mapped to this asset segment yet.</p>
                ) : (
                  <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto pr-1">
                    {selectedPackage.investors.map((inv, idx) => {
                      const percentageOwned = selectedPackage.totalAmount > 0 
                        ? ((inv.amount / selectedPackage.totalAmount) * 100).toFixed(1) 
                        : 0;

                      return (
                        <div key={idx} className="flex justify-between items-center text-sm py-3 first:pt-0 last:pb-0 group/row">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-none bg-[#090A0F] text-[#34D399] font-bold flex items-center justify-center text-xs">{inv.name.charAt(0)}</div>
                            <div>
                              <span className="font-bold text-white block">{inv.name}</span>
                              <span className="text-[10px] text-[#9CA3AF] font-medium">Pool Share: {percentageOwned}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono font-extrabold text-[#34D399]">₦{inv.amount.toLocaleString()}</span>
                            
                            <button
                              onClick={() => handleRemoveInvestor(idx)}
                              title="Remove Investor"
                              className="text-[#9CA3AF] hover:text-rose-400 transition-colors p-1"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Control Panel column */}
            <div className="space-y-6">
              
              {/* NEW CONTROL PANEL: Yield Distribution Engine */}
              <div className="border border-slate-800 bg-[#1F2937] p-5 space-y-4 rounded-none">
                <div className="flex items-center gap-2 text-white">
                  <Coins size={18} className="text-[#34D399]" />
                  <h3 className="font-bold text-base">Distribute Pool Profit</h3>
                </div>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Trigger equity splits. **55%** will be transferred to corporate margins, and **45%** will split dynamically across investors relative to their pool holdings.
                </p>

                <form onSubmit={handleDistributeProfit} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#9CA3AF] block">Total Profit Earned (₦)</label>
                    <input 
                      type="number" 
                      required
                      value={inputProfitAmount}
                      onChange={(e) => setInputProfitAmount(e.target.value)}
                      placeholder="e.g. 1000000"
                      className="w-full px-3 py-2 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
                    />
                  </div>

                  {/* Real-time Math Output Split Matrix */}
                  {parseFloat(inputProfitAmount) > 0 && (
                    <div className="bg-[#090A0F] border border-slate-800 p-3 space-y-2 font-medium text-[11px] text-[#9CA3AF]">
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span>Company Cut (55%):</span>
                        <strong className="text-white font-mono">₦{(parseFloat(inputProfitAmount) * 0.55).toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between pt-0.5 text-[#34D399]">
                        <span>Investors Split Pool (45%):</span>
                        <strong className="font-mono">₦{(parseFloat(inputProfitAmount) * 0.45).toLocaleString()}</strong>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-sm rounded-none transition-colors mt-2 flex items-center justify-center gap-1.5"
                  >
                    <Percent size={14} />
                    Execute Distribution Breakdown
                  </button>
                </form>
              </div>

              {/* User Allocation Block */}
              <div className="border border-slate-800 bg-[#1F2937] p-5 space-y-4 rounded-none">
                <div className="flex items-center gap-2 text-white">
                  <UserPlus size={18} className="text-[#34D399]" />
                  <h3 className="font-bold text-base">Add User to Pool</h3>
                </div>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Allocate collected capital holdings from client configurations directly into this active asset line.
                </p>

                <form onSubmit={handleAddInvestor} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#9CA3AF] block">Select Investor</label>
                    <select
                      required
                      value={selectedInvestorName}
                      onChange={(e) => setSelectedInvestorName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all cursor-pointer"
                    >
                      <option value="" disabled className="text-[#9CA3AF]">-- Select Registered User --</option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.name} className="bg-[#1F2937] text-white">
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#9CA3AF] block">Injected Capital Holding (₦)</label>
                    <input 
                      type="number" 
                      required
                      value={newInvestorAmount}
                      onChange={(e) => setNewInvestorAmount(e.target.value)}
                      placeholder="e.g. 500000"
                      className="w-full px-3 py-2 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#34D399] hover:bg-[#06D6A0] text-[#090A0F] font-bold text-sm rounded-none transition-colors mt-2"
                  >
                    Confirm Allocation
                  </button>
                </form>
              </div>

            </div>

          </div>
        </motion.div>
      )}

      {/* CREATE NEW PACKAGE MODAL CONTAINER OVERLAY */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOpen(false)} className="absolute inset-0 bg-[#090A0F]/70 backdrop-blur-xs" />
          
          <div className="bg-[#1F2937] border border-slate-800 rounded-none w-full max-w-sm p-6 relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FolderPlus size={18} className="text-[#34D399]" />
                <h3 className="font-bold text-base">New Investment Tier</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-[#9CA3AF] hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateInvestment} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#9CA3AF] block">Investment Package Name</label>
                <input 
                  type="text" 
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Premium Agro Fund"
                  className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#9CA3AF] block">Target Capital Size (₦)</label>
                <input 
                  type="number" 
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 10000000"
                  className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#9CA3AF] block">Package Banner Image</label>
                <Upload.Dragger {...antdUploadProps} className="bg-[#090A0F] border border-dashed border-slate-800 rounded-none p-4 text-center cursor-pointer block hover:border-[#34D399] transition-all">
                  {uploadedImageUrl ? (
                    <div className="h-24 w-full overflow-hidden relative">
                      <img src={uploadedImageUrl} alt="Upload preview" className="w-full h-full object-cover rounded-none" />
                    </div>
                  ) : (
                    <div className="space-y-1 py-2 flex flex-col items-center">
                      <UploadCloud size={24} className="text-[#9CA3AF] mx-auto" />
                      <p className="text-[11px] font-medium text-[#9CA3AF]">Click or drag image file here to import banner</p>
                    </div>
                  )}
                </Upload.Dragger>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#34D399] hover:bg-[#06D6A0] text-[#090A0F] font-bold text-sm rounded-none transition-colors mt-2"
              >
                Deploy Package
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Investment;