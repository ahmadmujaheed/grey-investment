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
import { Upload, message, Popconfirm, Skeleton, Select, Tag } from "antd";
import { HiOutlineArchiveBoxArrowDown } from "react-icons/hi2";
import { IoCloseOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";

// 🔌 Import your live central API layer operations
import {
  fetchAllInvestments,
  createInvestment,
  distributeInvestmentProfits,
  archiveInvestmentPackage,
  fetchAllUsers,
  fetchArchivedInvestments,
  restoreInvestmentPackage,
  editInvestment,
  updateInvestmentStatus,
} from "../api/investmentApi";
import { Link } from "react-router-dom";

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const Investment = () => {
  // Core application data states
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]); // 👥 Stores platform users registry
  const [loading, setLoading] = useState(true);

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

  const [investmentStatus, setInvestmentStatus] = useState("");

  const [gettingArchived, setGettingArchived] = useState(false);
  const [gettingActive, setGettingActive] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const [isRemoving, setIsRemoving] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [companyPercent, setCompanyPercent] = useState("");
  const [investorPercent, setInvestorPercent] = useState("");

  const [selectedSource, setSelectedSource] = useState("capital");
  const [availableProfit, setAvailableProfit] = useState(0);

  const openEditModal = (pkg) => {
    setNewName(pkg.title);
    setNewAmount(pkg.targetAmount);
    setEditingId(pkg._id);
    setIsEditMode(true);
    setIsCreateOpen(true);
  };

  // 1. Fetch main pool listings from the server instances on component mount
  const loadPlatformAssets = async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      const response = await fetchAllInvestments();

      // FIX: If your API returns { data: [...] }, use response.data
      // If it returns the array directly, keep as is.
      // setPackages(Array.isArray(response) ? response : response?.investments || []);
      setPackages(response?.investments || []);
    } catch (error) {
      message.error("Failed to load investment package configurations.");
    } finally {
      setLoading(false);
    }
  };

  // console.log(packages, "this is the investment");

 

  // console.log(users);

  useEffect(() => {
    loadPlatformAssets(true);
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

  const handleSaveInvestment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", newName);
      formData.append("targetAmount", newAmount);
      if (rawUploadFile) formData.append("image", rawUploadFile);

      if (isEditMode) {
        // 1. Await the response from your backend
        const response = await editInvestment(editingId, formData);
        message.success("Investment updated!");

        // 2. CRITICAL: Update the detailed view state directly
        if (selectedPackage && selectedPackage._id === editingId) {
          setSelectedPackage(response.package); // This forces the progress bar to recalculate
        }
      } else {
        await createInvestment(formData);
        message.success("Investment created!");
      }

      // 3. Refresh the full list to ensure the gallery is accurate
      await loadPlatformAssets(true);

      // Close modal and reset
      setIsCreateOpen(false);
      setIsEditMode(false);
    } catch (error) {
      message.error("Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  // 3. DELETE: Deletes an asset package completely
  const handleArchivePackage = async (investmentId) => {
    try {
      setLoading(true);
      await archiveInvestmentPackage(investmentId);
      message.warning("Investment package tier removed from platform catalog.");

      if (selectedPackage && selectedPackage._id === investmentId) {
        setSelectedPackage(null);
      }
      await loadPlatformAssets(true);
    } catch (error) {
      message.error("Failed to remove investment tier.");
    } finally {
      setLoading(false);
    }
  };

  

  const getArchivedInvestments = async () => {
    try {
      setGettingArchived(true);
      const response = await fetchArchivedInvestments();
      // Ensure we always set an array
      setPackages(response?.investments || []);
      // setInvestmentStatus("archived");
    } catch (error) {
      message.error("Failed to load archived investment packages.");
    } finally {
      setGettingArchived(false);
    }
  };

  const getActiveInvestments = async () => {
    try {
      setGettingActive(true);
      const response = await fetchAllInvestments();
      // Ensure we always set an array
      setPackages(response?.investments || []);
      // setInvestmentStatus("active");
    } catch (error) {
      message.error("Failed to load active investment packages.");
    } finally {
      setGettingActive(false);
    }
  };

 
  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await updateInvestmentStatus(selectedPackage._id, newStatus);

      setSelectedPackage((prev) => ({ ...prev, status: newStatus }));

      message.success(`Status set to ${newStatus}`);
    } catch (error) {
      message.error("Status update failed");
    } finally {
      setLoading(false);
    }
  };

  // console.log(selectedPackage);

  return (
    <div className="space-y-6 bg-[#1F1F1F] min-h-screen text-[#9CA3AF]">
      {/* CASE A: ROOT GALLERY GRID INTERFACE VIEW */}
  
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

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setNewName("");
                  setNewAmount("");
                  setIsCreateOpen(true);
                }}
                className="flex items-center justify-center gap-2 bg-[#34D399] hover:bg-[#06D6A0] text-[#090A0F] font-bold text-sm px-4 py-2.5 rounded-none transition-colors shrink-0 cursor-pointer"
              >
                <Plus size={16} />
                Create Investment
              </button>
              <button
                onClick={getActiveInvestments}
                className="flex items-center justify-center gap-2 bg-[#34D399] hover:bg-[#06D6A0] text-[#090A0F] font-bold text-sm px-4 py-2.5 rounded-none transition-colors shrink-0 cursor-pointer"
              >
                {gettingActive ? "Please Wait..." : "Get Active Investment"}
              </button>
              <button
                onClick={getArchivedInvestments}
                className="flex items-center justify-center gap-2 bg-[#34D399] hover:bg-[#06D6A0] text-[#090A0F] font-bold text-sm px-4 py-2.5 rounded-none transition-colors shrink-0 cursor-pointer"
              >
                {gettingArchived ? "Please Wait..." : "Get Archived Investment"}
              </button>
            </div>
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
          ) : packages?.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 bg-[#1F2937]/30">
              <p className="text-sm italic text-[#9CA3AF]">
                No archived investment packages yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {packages?.map((pkg) => (
                <motion.div
                  key={pkg._id}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  // onClick={() => setSelectedPackage(pkg)}
                  className="group cursor-pointer border border-slate-800 rounded-none overflow-hidden bg-[#1F2937] hover:border-[#34D399]/60 transition-all flex flex-col justify-between relative"
                >
                  <div>
                    <div className="h-40 w-full overflow-hidden bg-[#090A0F] relative rounded-none">
                      <img
                        src={
                          pkg.image?.url ||
                          "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=60"
                        }
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-none"
                      />

                      <div
                        className="absolute top-2 right-2 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {pkg.status !== "archived" && (
                          <div className="flex items-center gap-3">
                            <Popconfirm
                              title="Archive Investment Package"
                              description="Are you absolutely sure you want to archive this investment package?"
                              onConfirm={() => handleArchivePackage(pkg._id)}
                              okText="Yes, Archive"
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
                                <HiOutlineArchiveBoxArrowDown size={13} />
                              </button>
                            </Popconfirm>

                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-white text-base group-hover:text-[#34D399] transition-colors truncate capitalize">
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
                              ₦{pkg.totalAllocated?.toLocaleString() || 0}
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
                              {pkg.investorCount || 0} members
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Link to={`/dashboard/investment/${pkg?._id}`}>
                      <div className="w-full text-center py-2 bg-[#090A0F] rounded-none text-xs font-bold text-[#9CA3AF] group-hover:bg-[#34D399] group-hover:text-[#090A0F] transition-colors">
                        View Roster & Audit
                      </div>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
    
  

      {/* CREATE/EDIT PACKAGE MODAL OVERLAY */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() =>
              !loading && (setIsCreateOpen(false), setIsEditMode(false))
            }
            className="absolute inset-0 bg-[#090A0F]/70 backdrop-blur-xs"
          />

          <div className="bg-[#1F2937] border border-slate-800 rounded-none w-full max-w-sm p-6 relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FolderPlus size={18} className="text-[#34D399]" />
                <h3 className="font-bold text-base">
                  {isEditMode ? "Edit Investment Tier" : "New Investment Tier"}
                </h3>
              </div>
              <button
                onClick={() => (setIsCreateOpen(false), setIsEditMode(false))}
                disabled={loading}
                className="text-[#9CA3AF] hover:text-white font-bold text-sm disabled:opacity-30 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInvestment} className="space-y-4 text-xs">
              {/* Title Input */}
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

              {/* Target Amount Input */}
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

              {/* Image Upload (Only show for new creation or optional update) */}

              <div className="space-y-1.5">
                <label className="font-bold text-[#9CA3AF] block">
                  Package Banner Image
                </label>
                <Upload.Dragger
                  {...antdUploadProps}
                  disabled={loading}
                  className="bg-[#090A0F] border border-dashed border-slate-800 p-4 text-center cursor-pointer block hover:border-[#34D399]"
                >
                  {previewImageUrl ? (
                    <img
                      src={previewImageUrl}
                      alt="preview"
                      className="h-24 w-full object-cover"
                    />
                  ) : (
                    <div className="py-2 flex flex-col items-center">
                      <UploadCloud
                        size={24}
                        className="text-[#9CA3AF] mx-auto"
                      />
                      <p className="text-[11px] text-[#9CA3AF]">
                        Click or drag to import banner
                      </p>
                    </div>
                  )}
                </Upload.Dragger>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#34D399] hover:bg-[#06D6A0] disabled:bg-slate-800 text-[#090A0F] font-bold text-sm rounded-none transition-colors mt-2 cursor-pointer"
              >
                {loading
                  ? "Processing..."
                  : isEditMode
                    ? "Save Changes"
                    : "Deploy Package"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investment;
