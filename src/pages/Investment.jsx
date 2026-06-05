import { useState } from "react";
import { 
  Plus, 
  Users, 
  ArrowLeft, 
  FolderPlus, 
  UserPlus, 
  UploadCloud,
  Trash2 // Imported for the delete action
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
    totalAmount: 25000000,
    investorsCount: 3,
    investors: [
      { name: "John Doe", amount: 1500000 },
      { name: "Sarah Jenkins", amount: 2500000 },
      { name: "Michael Chang", amount: 1000000 },
    ]
  },
  {
    id: 2,
    name: "SaaS Tech Fund",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&auto=format&fit=crop&q=60",
    totalAmount: 18000000,
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
    totalAmount: 42000000,
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
    totalAmount: 9500000,
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
  const [packages, setPackages] = useState(initialPackages);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Creation State Hooks
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  // Add User State Hooks
  const [selectedInvestorName, setSelectedInvestorName] = useState("");
  const [newInvestorAmount, setNewInvestorAmount] = useState("");

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
        
        const newPkgState = {
          ...pkg,
          investors: updatedInvestors,
          investorsCount: updatedInvestors.length,
          totalAmount: pkg.totalAmount + addedAmount
        };
        
        setSelectedPackage(newPkgState);
        return newPkgState;
      }
      return pkg;
    });

    setPackages(updatedPackages);
    setSelectedInvestorName("");
    setNewInvestorAmount("");
    message.success("Investor appended to roster successfully!");
  };

  // NEW: Handler logic to remove mistakenly added investor from the specific package
  const handleRemoveInvestor = (investorIndex) => {
    const investorToRemove = selectedPackage.investors[investorIndex];

    const updatedPackages = packages.map((pkg) => {
      if (pkg.id === selectedPackage.id) {
        // Filter out the selected investor by its array index reference
        const updatedInvestors = pkg.investors.filter((_, idx) => idx !== investorIndex);
        
        const newPkgState = {
          ...pkg,
          investors: updatedInvestors,
          investorsCount: updatedInvestors.length,
          // Subtract their holding back out from the total package calculation pool
          totalAmount: Math.max(0, pkg.totalAmount - investorToRemove.amount) 
        };

        setSelectedPackage(newPkgState);
        return newPkgState;
      }
      return pkg;
    });

    setPackages(updatedPackages);
    message.info("Investor removed from pool roster.");
  };

  return (
    <div className="space-y-6 bg-white min-h-screen text-slate-800 p-4">
      
      {/* CASE A: ROOT GALLERY GRID INTERFACE VIEW */}
      {!selectedPackage ? (
        <>
          {/* Upper Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Investment Tiers</h1>
              <p className="text-sm text-slate-500 mt-0.5">Manage pool configurations and view co-investor distribution metrics.</p>
            </div>
            
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-none transition-colors shrink-0"
            >
              <Plus size={16} />
              Create Investment
            </button>
          </div>

          {/* 4-Column Grid System */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.id}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                onClick={() => setSelectedPackage(pkg)}
                className="group cursor-pointer border border-slate-200 rounded-none overflow-hidden bg-white hover:border-emerald-500/60 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Picture Component at Top */}
                  <div className="h-40 w-full overflow-hidden bg-slate-50 relative rounded-none">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-none"
                    />
                  </div>

                  {/* Card Meta Content */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                      {pkg.name}
                    </h3>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                        <span className="text-slate-400 font-bold text-sm">₦</span>
                        <span>Pool Size: <strong className="text-slate-800">₦{pkg.totalAmount.toLocaleString()}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                        <Users size={14} className="text-slate-400" />
                        <span>Active Investors: <strong className="text-slate-800">{pkg.investorsCount} members</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="w-full text-center py-2 bg-slate-50 rounded-none text-xs font-bold text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
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
          {/* Back Controls Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <button 
              onClick={() => setSelectedPackage(null)}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Packages</span>
            </button>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 uppercase tracking-wider">Asset ID: #{selectedPackage.id}</span>
          </div>

          {/* Detailed Workspace Core Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Content Column: Graphic Panel and Active Investors List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="border border-slate-200 bg-white rounded-none overflow-hidden">
                <div className="h-56 w-full bg-slate-100">
                  <img src={selectedPackage.image} alt="" className="w-full h-full object-cover rounded-none" />
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-none">Active Distribution Group</span>
                    <h2 className="text-2xl font-bold text-slate-900 mt-1">{selectedPackage.name}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs font-semibold">
                    <div>
                      <span className="text-slate-400 block">Total Pool Vault Asset Base</span>
                      <span className="text-xl font-bold text-slate-900">₦{selectedPackage.totalAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Current Stakeholder Headcount</span>
                      <span className="text-xl font-bold text-slate-900">{selectedPackage.investorsCount} Members</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stakeholders Ledger Node Output with Delete Capability */}
              <div className="border border-slate-200 bg-white p-6 space-y-4 rounded-none">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Pool Stakeholders Roster</h3>
                {selectedPackage.investors.length === 0 ? (
                  <p className="text-xs font-medium text-slate-400 italic py-2">No individual ledger entries mapped to this asset segment yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                    {selectedPackage.investors.map((inv, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm py-3 first:pt-0 last:pb-0 group/row">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-none bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">{inv.name.charAt(0)}</div>
                          <span className="font-bold text-slate-800">{inv.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono font-extrabold text-slate-900">₦{inv.amount.toLocaleString()}</span>
                          
                          {/* Trash button appears on item hover or stays visible on small devices */}
                          <button
                            onClick={() => handleRemoveInvestor(idx)}
                            title="Remove Investor"
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel Layout: Real-Time Add Users Tool Module Form */}
            <div className="border border-slate-200 bg-white p-5 space-y-4 rounded-none">
              <div className="flex items-center gap-2 text-slate-900">
                <UserPlus size={18} className="text-emerald-600" />
                <h3 className="font-bold text-base">Add User to Pool</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manually allocate newly collected capital holdings from client investments directly into this package pool block.
              </p>

              <form onSubmit={handleAddInvestor} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 block">Select Investor</label>
                  <select
                    required
                    value={selectedInvestorName}
                    onChange={(e) => setSelectedInvestorName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-none font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="" disabled>-- Select Registered User --</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 block">Injected Capital Holding (₦)</label>
                  <input 
                    type="number" 
                    required
                    value={newInvestorAmount}
                    onChange={(e) => setNewInvestorAmount(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-none font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-none transition-colors mt-2"
                >
                  Confirm Allocation
                </button>
              </form>
            </div>

          </div>
        </motion.div>
      )}

      {/* CREATE NEW PACKAGE MODAL CONTAINER OVERLAY */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
          
          <div className="bg-white border border-slate-200 rounded-none w-full max-w-sm p-6 relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-900">
                <FolderPlus size={18} className="text-emerald-600" />
                <h3 className="font-bold text-base">New Investment Tier</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateInvestment} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 block">Investment Package Name</label>
                <input 
                  type="text" 
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Premium Agro Fund"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-none font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 block">Target Capital Size (₦)</label>
                <input 
                  type="number" 
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 10000000"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-none font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Integrated AntD Native Upload Component */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 block">Package Banner Image</label>
                <Upload.Dragger {...antdUploadProps} className="bg-slate-50 border border-dashed border-slate-200 rounded-none p-4 text-center cursor-pointer block hover:border-emerald-500 transition-all">
                  {uploadedImageUrl ? (
                    <div className="h-24 w-full overflow-hidden relative">
                      <img src={uploadedImageUrl} alt="Upload preview" className="w-full h-full object-cover rounded-none" />
                    </div>
                  ) : (
                    <div className="space-y-1 py-2 flex flex-col items-center">
                      <UploadCloud size={24} className="text-slate-400 mx-auto" />
                      <p className="text-[11px] font-medium text-slate-500">Click or drag image file here to import banner</p>
                    </div>
                  )}
                </Upload.Dragger>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-none transition-colors mt-2"
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