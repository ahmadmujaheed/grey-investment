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
  Percent,
} from "lucide-react";
import { motion } from "motion/react";
import { Upload, message, Popconfirm, Skeleton, Select } from "antd";

// 🔌 Import your live central API layer operations
import {
  fetchAllInvestments,
  createInvestment,
  allocateInvestorToPool,
  distributeInvestmentProfits,
  deleteInvestmentPackage,
  fetchAllUsers,
} from "../api/investmentApi";

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const Investment = () => {
  // Core application data states
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]); // 👥 Stores platform users registry
  const [loading, setLoading] = useState(true);
  const [allocate, setAllocate] = useState(false);
  const [distribute, setDistribute] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Creation form data state parameters
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [rawUploadFile, setRawUploadFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  // Account linkage tracking inputs
  const [targetUserId, setTargetUserId] = useState(undefined);
  const [newInvestorAmount, setNewInvestorAmount] = useState("");

  // Profit distribution context logic parameters
  const [inputProfitAmount, setInputProfitAmount] = useState("");

  // 1. Fetch main pool listings from the server instances on component mount
  const loadPlatformAssets = async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      const data = await fetchAllInvestments();
      setPackages(data);

      if (selectedPackage) {
        const structuralMatch = data.find(
          (pkg) => pkg._id === selectedPackage._id,
        );
        if (structuralMatch) {
          setSelectedPackage(structuralMatch);
        }
      }
    } catch (error) {
      message.error("Failed to load investment package configurations.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all registered users to populate the allocation dropdown matrix
  const loadPlatformUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to pool application user index records:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformAssets(true);
    loadPlatformUsers();
  }, []);

  // Ant Design Custom Dragger Pipeline Configurer
  const antdUploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    showUploadList: false,
    beforeUpload(file) {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("You can only upload JPG/PNG files!");
        return Upload.LIST_IGNORE;
      }

      setRawUploadFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
      return false;
    },
  };

  // 2. CREATE: Deploys fresh package structure using form payload context mapping
  const handleCreateInvestment = async (e) => {
    e.preventDefault();
    if (!newName || !newAmount) return;

    try {
      setLoading(true);
      const payloadFormData = new FormData();
      payloadFormData.append("title", newName);
      payloadFormData.append("targetAmount", newAmount);
      if (rawUploadFile) {
        payloadFormData.append("image", rawUploadFile);
      }

      await createInvestment(payloadFormData);
      message.success("Investment package deployed successfully!");

      setNewName("");
      setNewAmount("");
      setRawUploadFile(null);
      setPreviewImageUrl("");
      setIsCreateOpen(false);

      await loadPlatformAssets(true);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Error creating package tier.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. DELETE: Deletes an asset package completely
  const handleDeletePackage = async (packageId) => {
    try {
      setLoading(true);
      await deleteInvestmentPackage(packageId);
      message.warning("Investment package tier removed from platform catalog.");

      if (selectedPackage && selectedPackage._id === packageId) {
        setSelectedPackage(null);
      }
      await loadPlatformAssets(true);
    } catch (error) {
      message.error("Failed to remove investment tier.");
    } finally {
      setLoading(false);
    }
  };

  // 4. LINK ALLOCATION: Binds structural capital allocation values to user profiles
  const handleAddInvestor = async (e) => {
    e.preventDefault();
    setAllocate(true);
    if (!targetUserId || !newInvestorAmount) {
      message.error(
        "Please pick a target platform member and set an injection amount.",
      );
      return;
    }

    try {
      // ⚡ Optimistic Local Update: Don't flip the root loading skeleton back on
      const data = await allocateInvestorToPool(selectedPackage._id, {
        user: targetUserId,
        amount: newInvestorAmount,
      });

      message.success("Investor allocation bound to pool roster successfully!");

      // Update inline workspace state directly using populated data from payload response
      setSelectedPackage(data.package);

      // Synced update to background packages matrix without resetting views
      setPackages((prev) =>
        prev.map((p) => (p._id === data.package._id ? data.package : p)),
      );

      setTargetUserId(undefined);
      setNewInvestorAmount("");
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Error assigning stakeholder parameters to pool instance.",
      );
    } finally {
      setAllocate(false);
    }
  };

  // 5. DISTRIBUTE: Triggers equity splits and ends funding cycle
  const handleDistributeProfit = async (e) => {
    e.preventDefault();
    const profit = parseFloat(inputProfitAmount);

    setDistribute(true);

    if (!profit || profit <= 0) {
      message.error("Please enter a valid profit distribution value.");
      return;
    }

    try {
      // setLoading(true);
      const data = await distributeInvestmentProfits(
        selectedPackage._id,
        profit,
      );

      const companyShare = profit * 0.55;
      const investorsTotalShare = profit * 0.45;

      message.success(
        `Split Logged: ₦${companyShare.toLocaleString()} (55%) to corporate vault & ₦${investorsTotalShare.toLocaleString()} (45%) added to investor stakes.`,
      );

      setSelectedPackage(data.updatedPackage);
      setInputProfitAmount("");
      await loadPlatformAssets(false);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Profit allocation process initialization failure.",
      );
    } finally {
      setDistribute(false);
    }
  };

  return (
    <div className="space-y-6 bg-[#1F1F1F] min-h-screen text-[#9CA3AF] p-4">
      {/* CASE A: ROOT GALLERY GRID INTERFACE VIEW */}
      {!selectedPackage ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Investment Tiers
              </h1>
              <p className="text-sm text-[#9CA3AF] mt-0.5">
                Manage pool configurations and view co-investor distribution
                metrics.
              </p>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#34D399] hover:bg-[#06D6A0] text-[#090A0F] font-bold text-sm px-4 py-2.5 rounded-none transition-colors shrink-0 cursor-pointer"
            >
              <Plus size={16} />
              Create Investment
            </button>
          </div>

          {loading && packages.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="border border-slate-800 bg-[#1F2937] p-4 space-y-4"
                >
                  <Skeleton.Input
                    active
                    size="large"
                    className="w-full !h-36 !bg-slate-800/40"
                    block
                  />
                  <Skeleton
                    active
                    paragraph={{ rows: 2 }}
                    title={true}
                    className="custom-skeleton"
                  />
                </div>
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 bg-[#1F2937]/30">
              <p className="text-sm italic text-[#9CA3AF]">
                No active investment packages deployed on server database
                environments yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {packages.map((pkg) => (
                <motion.div
                  key={pkg._id}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setSelectedPackage(pkg)}
                  className="group cursor-pointer border border-slate-800 rounded-none overflow-hidden bg-[#1F2937] hover:border-[#34D399]/60 transition-all flex flex-col justify-between relative"
                >
                  <div>
                    <div className="h-40 w-full overflow-hidden bg-[#090A0F] relative rounded-none">
                      <img
                        src={
                          pkg.image ||
                          "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=60"
                        }
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-none"
                      />

                      <div
                        className="absolute top-2 right-2 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Popconfirm
                          title="Delete Investment Package"
                          description="Are you absolutely sure you want to drop this tier package from the platform database catalog completely?"
                          onConfirm={() => handleDeletePackage(pkg._id)}
                          okText="Yes, Delete"
                          cancelText="Cancel"
                          placement="topRight"
                          okButtonProps={{
                            danger: true,
                            className:
                              "bg-rose-600 hover:bg-rose-500 rounded-none text-xs font-semibold",
                          }}
                          cancelButtonProps={{
                            className:
                              "border-slate-700 text-slate-300 hover:text-white rounded-none text-xs",
                          }}
                        >
                          <button
                            title="Delete Investment Package"
                            className="bg-[#090A0F]/80 border border-slate-800 p-2 text-[#9CA3AF] hover:text-rose-400 hover:bg-[#090A0F] transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </Popconfirm>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-white text-base group-hover:text-[#34D399] transition-colors truncate">
                          {pkg.title}
                        </h3>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-extrabold tracking-wider border ${
                            pkg.status === "active"
                              ? "bg-green-950/40 text-green-400 border-green-900/60"
                              : "bg-slate-950/40 text-slate-400 border-slate-800"
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-medium">
                          <span className="text-[#34D399] font-bold text-sm">
                            ₦
                          </span>
                          <span>
                            Pool Active Size:{" "}
                            <strong className="text-white">
                              ₦{pkg.totalAmount?.toLocaleString() || 0}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-medium">
                          <span className="text-slate-400 font-bold text-xs">
                            Target:
                          </span>
                          <span>
                            Cap Threshold:{" "}
                            <strong className="text-slate-200">
                              ₦{pkg.targetAmount?.toLocaleString() || 0}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-medium">
                          <Users size={14} className="text-[#9CA3AF]" />
                          <span>
                            Active Investors:{" "}
                            <strong className="text-white">
                              {pkg.investors?.length || 0} members
                            </strong>
                          </span>
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
          )}
        </>
      ) : (
        /* CASE B: INLINE DETAILED WORKSPACE VIEW */
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <button
              onClick={() => setSelectedPackage(null)}
              className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Packages</span>
            </button>

            <div className="flex items-center gap-3">
              <Popconfirm
                title="Delete Investment Package"
                description="Are you absolutely sure you want to drop this tier package from the platform database catalog completely?"
                onConfirm={() => handleDeletePackage(selectedPackage._id)}
                okText="Yes, Delete"
                cancelText="Cancel"
                placement="bottomRight"
                okButtonProps={{
                  danger: true,
                  className:
                    "bg-rose-600 hover:bg-rose-500 rounded-none text-xs font-semibold",
                }}
                cancelButtonProps={{
                  className:
                    "border-slate-700 text-slate-300 hover:text-white rounded-none text-xs",
                }}
              >
                <button className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider bg-rose-950/20 border border-rose-900/40 px-3 py-1 transition-colors cursor-pointer">
                  <Trash2 size={13} />
                  Delete Package
                </button>
              </Popconfirm>

              <span className="text-xs font-mono bg-[#1F2937] text-[#9CA3AF] px-2 py-1 uppercase tracking-wider border border-slate-800">
                Asset ID: #{selectedPackage._id}
              </span>
            </div>
          </div>

          {loading && packages.length === 0 ? (
            <div className="p-6 border border-slate-800 bg-[#1F2937]">
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column Ledger Layout Output */}
              <div className="lg:col-span-2 space-y-6">
                <div className="border border-slate-800 bg-[#1F2937] rounded-none overflow-hidden">
                  <div className="h-56 w-full bg-[#090A0F]">
                    <img
                      src={
                        selectedPackage.image ||
                        "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=60"
                      }
                      alt=""
                      className="w-full h-full object-cover rounded-none"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#34D399] bg-[#090A0F] px-2 py-0.5 rounded-none border border-slate-800">
                        Lifecycle Status Context Matrix:{" "}
                        {selectedPackage.status}
                      </span>
                      <h2 className="text-2xl font-bold text-white mt-1">
                        {selectedPackage.title}
                      </h2>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-4 text-xs font-semibold">
                      <div>
                        <span className="text-[#9CA3AF] block">
                          Current Capital Asset Base
                        </span>
                        <span className="text-xl font-bold text-[#34D399]">
                          ₦{selectedPackage.totalAmount?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#9CA3AF] block">
                          Target Cap Ceiling Bar
                        </span>
                        <span className="text-xl font-bold text-blue-400">
                          ₦{selectedPackage.targetAmount?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#9CA3AF] block">
                          Stakeholder Headcount
                        </span>
                        <span className="text-xl font-bold text-white">
                          {selectedPackage.investors?.length || 0} Members
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stakeholders Ledger Grid Node Output */}
                <div className="border border-slate-800 bg-[#1F2937] p-6 space-y-4 rounded-none">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Top Pool Stakeholders Roster
                  </h3>
                  {!selectedPackage.investors ||
                  selectedPackage.investors.length === 0 ? (
                    <p className="text-xs font-medium text-[#9CA3AF] italic py-2">
                      No individual user ledger entries mapped to this asset
                      segment yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto pr-1">
                      {selectedPackage.investors.map((inv, idx) => {
                        const percentageOwned =
                          selectedPackage.totalAmount > 0
                            ? (
                                (inv.amount / selectedPackage.totalAmount) *
                                100
                              ).toFixed(1)
                            : 0;

                        return (
                          <div
                            key={inv._id || idx}
                            className="flex justify-between items-center text-sm py-3 first:pt-0 last:pb-0 group/row"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-none bg-[#090A0F] text-[#34D399] font-bold flex items-center justify-center text-xs uppercase">
                                {inv.user?.name ? inv.user.name.charAt(0) : "U"}
                              </div>
                              <div>
                                {/* 👥 Swapped text out to render clean user details instead of raw ID */}
                                <span className="text-xs font-bold text-white block truncate max-w-xs">
                                  {inv.user?.name || "Unknown User"}
                                </span>
                                <span className="text-[10px] text-[#9CA3AF] font-medium block">
                                  {inv.user?.email || "No email available"}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Pool Equity Share: {percentageOwned}% |
                                  Linked:{" "}
                                  {inv.allocatedAt
                                    ? new Date(
                                        inv.allocatedAt,
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-mono font-extrabold text-[#34D399]">
                                ₦{inv.amount?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side Control Panel Column Actions */}
              <div className="space-y-6">
                {/* PANEL: Yield Distribution Execution Block */}
                <div className="border border-slate-800 bg-[#1F2937] p-5 space-y-4 rounded-none">
                  <div className="flex items-center gap-2 text-white">
                    <Coins size={18} className="text-[#34D399]" />
                    <h3 className="font-bold text-base">
                      Distribute Pool Profit
                    </h3>
                  </div>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    Trigger equity splits. **55%** will be transferred to
                    corporate margins, and **45%** will split dynamically across
                    investors relative to their pool holdings.
                  </p>

                  <form
                    onSubmit={handleDistributeProfit}
                    className="space-y-4 text-xs"
                  >
                    <div className="space-y-1.5">
                      <label className="font-bold text-[#9CA3AF] block">
                        Total Profit Earned (₦)
                      </label>
                      <input
                        type="number"
                        required
                        disabled={selectedPackage.status === "completed"}
                        value={inputProfitAmount}
                        onChange={(e) => setInputProfitAmount(e.target.value)}
                        placeholder="e.g. 1000000"
                        className="w-full px-3 py-2 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all disabled:opacity-40"
                      />
                    </div>

                    {parseFloat(inputProfitAmount) > 0 && (
                      <div className="bg-[#090A0F] border border-slate-800 p-3 space-y-2 font-medium text-[11px] text-[#9CA3AF]">
                        <div className="flex justify-between border-b border-slate-800 pb-1.5">
                          <span>Company Cut (55%):</span>
                          <strong className="text-white font-mono">
                            ₦
                            {(
                              parseFloat(inputProfitAmount) * 0.55
                            ).toLocaleString()}
                          </strong>
                        </div>
                        <div className="flex justify-between pt-0.5 text-[#34D399]">
                          <span>Investors Split Pool (45%):</span>
                          <strong className="font-mono">
                            ₦
                            {(
                              parseFloat(inputProfitAmount) * 0.45
                            ).toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={
                        selectedPackage.status === "completed" ||
                        distribute
                      }
                      className="w-full py-2.5 bg-[#3B82F6] hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm rounded-none transition-colors mt-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {distribute ? (
                        <>
                          {/* Optional: Simple inline CSS loading spinner */}
                          <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                          Processing Splits...
                        </>
                      ) : selectedPackage.status === "completed" ? (
                        <>
                          <Percent size={14} />
                          Yield Lifecycle Concluded
                        </>
                      ) : (
                        <>
                          <Percent size={14} />
                          Execute Distribution Breakdown
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* PANEL: Allocation Engine Node Form */}
                {/* PANEL: Allocation Engine Node Form */}
<div className="border border-slate-800 bg-[#1F2937] p-5 space-y-4 rounded-none">
  <div className="flex items-center gap-2 text-white">
    <UserPlus size={18} className="text-[#34D399]" />
    <h3 className="font-bold text-base">Add User to Pool</h3>
  </div>
  <p className="text-xs text-[#9CA3AF] leading-relaxed">
    Allocate collected capital holdings into this active
    platform asset pool. Choose a target platform user registry
    entry.
  </p>

  <form
    onSubmit={handleAddInvestor}
    className="space-y-4 text-xs"
  >
    <div className="space-y-1.5">
      <label className="font-bold text-[#9CA3AF] block">
        Select Platform Member
      </label>
      
      {/* 🌟 Ant Design Select with full Tailwind styles and targeted token overrides */}
      <Select
        showSearch
        loading={usersLoading}
        placeholder="Search by name or email context..."
        optionFilterProp="label"
        value={targetUserId}
        onChange={(value) => setTargetUserId(value)}
        disabled={selectedPackage.status === "completed"}
        className="w-full h-9 rounded-none"
        dropdownStyle={{ backgroundColor: '#090A0F', border: '1px solid #1E293B' }}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: '#090A0F',
            borderColor: '#1E293B',
            borderRadius: '0px',
            color: '#FFFFFF'
          })
        }}
        /* 👇 FIX: Swapped user._id to user.id to match your backend formatted payload structural outputs */
        options={users.map((user) => ({
          value: user.id, 
          label: `${user.name || "Unnamed User"} (${user.email || "No email"})`,
        }))}
      />
    </div>

    <div className="space-y-1.5">
      <label className="font-bold text-[#9CA3AF] block">
        Injected Capital Holding (₦)
      </label>
      <input
        type="number"
        required
        value={newInvestorAmount}
        disabled={selectedPackage.status === "completed"}
        onChange={(e) => setNewInvestorAmount(e.target.value)}
        placeholder="e.g. 500000"
        className="w-full px-3 py-2 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all disabled:opacity-40"
      />
    </div>

    <button
      type="submit"
      disabled={selectedPackage.status === "completed"}
      className="w-full py-2.5 bg-[#34D399] hover:bg-[#06D6A0] disabled:bg-slate-800 disabled:text-slate-500 text-[#090A0F] font-bold text-sm rounded-none transition-colors mt-2 cursor-pointer"
    >
      {allocate
        ? "Allocating to Pool..."
        : "Confirm Allocation"}
    </button>
  </form>
</div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* CREATE PACKAGE MODAL OVERLAY */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !loading && setIsCreateOpen(false)}
            className="absolute inset-0 bg-[#090A0F]/70 backdrop-blur-xs"
          />

          <div className="bg-[#1F2937] border border-slate-800 rounded-none w-full max-w-sm p-6 relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FolderPlus size={18} className="text-[#34D399]" />
                <h3 className="font-bold text-base">New Investment Tier</h3>
              </div>
              <button
                onClick={() => !loading && setIsCreateOpen(false)}
                disabled={loading}
                className="text-[#9CA3AF] hover:text-white font-bold text-sm disabled:opacity-30 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleCreateInvestment}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label className="font-bold text-[#9CA3AF] block">
                  Investment Package Name
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Premium Agro Fund"
                  className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#9CA3AF] block">
                  Target Capital Size Ceiling (₦)
                </label>
                <input
                  type="number"
                  required
                  disabled={loading}
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 10000000"
                  className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#9CA3AF] block">
                  Package Banner Image
                </label>
                <Upload.Dragger
                  {...antdUploadProps}
                  disabled={loading}
                  className="bg-[#090A0F] border border-dashed border-slate-800 rounded-none p-4 text-center cursor-pointer block hover:border-[#34D399] transition-all disabled:opacity-40"
                >
                  {previewImageUrl ? (
                    <div className="h-24 w-full overflow-hidden relative">
                      <img
                        src={previewImageUrl}
                        alt="Upload preview"
                        className="w-full h-full object-cover rounded-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1 py-2 flex flex-col items-center">
                      <UploadCloud
                        size={24}
                        className="text-[#9CA3AF] mx-auto"
                      />
                      <p className="text-[11px] font-medium text-[#9CA3AF]">
                        Click or drag image file here to import banner
                      </p>
                    </div>
                  )}
                </Upload.Dragger>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#34D399] hover:bg-[#06D6A0] disabled:bg-slate-800 disabled:text-slate-500 text-[#090A0F] font-bold text-sm rounded-none transition-colors mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? "Deploying Assets..." : "Deploy Package"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investment;
