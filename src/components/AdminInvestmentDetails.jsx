import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import { message, Popconfirm, Select, Tag } from "antd";
import { ArrowLeft, Coins, UserPlus } from "lucide-react";
import { HiOutlineArchiveBoxArrowDown } from "react-icons/hi2";
import { FaRegEdit } from "react-icons/fa";

import {
  fetchInvestmentById,
  fetchAllUsers,
  addInvestorToPool,
  distributeInvestmentProfits,
  adminSetWithdrawalAmount,
  removeInvestorFromPool,
} from "../api/investmentApi";
import { Link } from "react-router-dom";

const AdminInvestmentDetails = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [investmentDetails, setInvestmentDetails] = useState(null);

  const [inputProfitAmount, setInputProfitAmount] = useState("");
  const [companyPercent, setCompanyPercent] = useState("");
  const [investorPercent, setInvestorPercent] = useState("");
  const [distribute, setDistribute] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [targetUserId, setTargetUserId] = useState(undefined);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSource, setSelectedSource] = useState("capital");

  // The user's investment/allocation from which funds will be reinvested
  const [sourceAllocationId, setSourceAllocationId] = useState(undefined);
  const [walletBalance, setWalletBalance] = useState(0);

  const [newInvestorAmount, setNewInvestorAmount] = useState("");
  const [allocate, setAllocate] = useState(false);

  const [addWithdrawable, setAddWithdrawable] = useState(null);
  const [withdrawableLimit, setWithdrawableLimit] = useState("");
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [limitLoading, setLimitLoading] = useState(false);

  const addMoney = async () => {
    if (!addWithdrawable?.allocationId) {
      message.error("Allocation was not found.");
      return;
    }

    const amount = Number(withdrawableLimit);

    if (!amount || amount < 0) {
      message.warning("Enter a valid withdrawable amount.");
      return;
    }

    // Prevent a limit larger than the profit the investor has earned.
    const maximumAllowed = Number(
      addWithdrawable.totalInvestment ?? addWithdrawable.totalValue ?? 0,
    );

    if (amount > maximumAllowed) {
      message.warning(
        `Withdrawal limit cannot be more than the investor's total of ${formatCurrency(maximumAllowed)}.`,
      );
      return;
    }

    const payload = {
      allocationId: addWithdrawable.allocationId,
      withdrawableLimit: amount,
    };

    try {
      setLimitLoading(true);

      await adminSetWithdrawalAmount(payload);

      message.success("Withdrawable limit updated.");
      setIsLimitModalOpen(false);
      setAddWithdrawable(null);
      setWithdrawableLimit("");

      await Promise.all([loadInvestmentDetails(), loadPlatformUsers()]);
    } catch (error) {
      console.error("Failed to update limit:", error);
      message.error(
        error?.response?.data?.message || "Failed to update withdrawal limit.",
      );
    } finally {
      setLimitLoading(false);
    }
  };

  const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green";
      case "pending":
        return "orange";
      case "paused":
        return "volcano";
      case "completed":
        return "blue";
      default:
        return "default";
    }
  };

  const loadInvestmentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchInvestmentById(id);
      setInvestmentDetails(response);
      console.log(response);
    } catch (error) {
      console.error("Error fetching investment details:", error);
      message.error("Unable to load investment details.");
    } finally {
      setLoading(false);
    }
  };

  const loadPlatformUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await fetchAllUsers();
      setUsers(data?.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      message.error("Unable to load platform users.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadInvestmentDetails();
    }
  }, [id]);

  useEffect(() => {
    loadPlatformUsers();
  }, []);

  // const handleSourceChange = (source) => {
  //   setSelectedSource(source);
  //   setSourceAllocationId(undefined);
  //   setWalletBalance(0);
  //   setNewInvestorAmount("");
  // };

  // const handleSourceAllocationSelect = (allocationId) => {
  //   setSourceAllocationId(allocationId);

  //   const allocation = selectedUser?.allocations?.find(
  //     (item) => String(item._id || item.id) === String(allocationId),
  //   );

  //   const availableAmount = Number(allocation?.remainingWithdrawable || 0);

  //   setWalletBalance(availableAmount);

  //   // Automatically prefill amount with the allocation's withdrawable amount.
  //   setNewInvestorAmount(String(availableAmount));
  // };

  // const handleAmountChange = (event) => {
  //   const value = event.target.value;
  //   const numericValue = Number(value);

  //   if (selectedSource === "profit" && numericValue > walletBalance) {
  //     message.warning(
  //       `Maximum reinvestment amount is ${formatCurrency(walletBalance)}`,
  //     );
  //     setNewInvestorAmount(String(walletBalance));
  //     return;
  //   }

  //   setNewInvestorAmount(value);
  // };

  const handleUserSelect = (userId) => {
    const user = users.find(
      (item) => String(item._id || item.id) === String(userId),
    );

    setTargetUserId(userId);
    setSelectedUser(user || null);

    setSourceAllocationId(undefined);
    setWalletBalance(0);
    setNewInvestorAmount("");
  };

  const handleSourceChange = (source) => {
    setSelectedSource(source);

    setSourceAllocationId(undefined);
    setWalletBalance(0);
    setNewInvestorAmount("");
  };

  const getAvailableBalance = (allocation) =>
    Number(
      allocation?.availableBalance ??
        allocation?.availableToWithdraw ??
        allocation?.remainingWithdrawable ??
        0,
    );

  const handleSourceAllocationSelect = (allocationId) => {
    const allocation = selectedUser?.allocations?.find(
      (item) =>
        String(item.allocationId || item._id || item.id) ===
        String(allocationId),
    );

    const availableBalance = getAvailableBalance(allocation);

    setSourceAllocationId(allocationId);
    setWalletBalance(availableBalance);

    // Prefill input with the available balance.
    setNewInvestorAmount(String(availableBalance));
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;
    const amount = Number(value);

    if (selectedSource === "profit" && amount > walletBalance) {
      message.warning(
        `Only ${formatCurrency(walletBalance)} is available for reinvestment.`,
      );

      setNewInvestorAmount(String(walletBalance));
      return;
    }

    setNewInvestorAmount(value);
  };

  const handleAddInvestor = async (event) => {
    event.preventDefault();

    const amount = Number(newInvestorAmount);
    const investmentId = id;

    if (!investmentId) {
      message.error("Investment ID is missing.");
      return;
    }

    if (!targetUserId) {
      message.warning("Please select a user.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      message.warning("Enter a valid investment amount.");
      return;
    }

    if (selectedSource === "profit" && !sourceAllocationId) {
      message.warning("Please select the source investment.");
      return;
    }

    if (selectedSource === "profit" && amount > walletBalance) {
      message.warning(
        `Only ${formatCurrency(walletBalance)} is available for reinvestment.`,
      );
      return;
    }

    const payload = {
      userId: targetUserId,
      amount,
      isReinvestment: selectedSource === "profit",
      sourceAllocationId:
        selectedSource === "profit" ? sourceAllocationId : undefined,
    };

    try {
      setAllocate(true);

      await addInvestorToPool(investmentId, payload);

      message.success(
        selectedSource === "profit"
          ? "Reinvestment completed successfully."
          : "Investor added successfully.",
      );

      setTargetUserId(undefined);
      setSelectedUser(null);
      setSelectedSource("capital");
      setSourceAllocationId(undefined);
      setWalletBalance(0);
      setNewInvestorAmount("");

      await Promise.all([loadInvestmentDetails(), loadPlatformUsers()]);
    } catch (error) {
      console.error("Allocation failed:", error);

      message.error(
        error?.response?.data?.message || "Investment allocation failed.",
      );
    } finally {
      setAllocate(false);
    }
  };

  // const handleAddInvestor = async (event) => {
  //   event.preventDefault();

  //   const amount = Number(newInvestorAmount);

  //   if (!targetUserId) {
  //     message.warning("Please select a user.");
  //     return;
  //   }

  //   if (!Number.isFinite(amount) || amount <= 0) {
  //     message.warning("Enter a valid investment amount.");
  //     return;
  //   }

  //   if (selectedSource === "profit" && !sourceAllocationId) {
  //     message.warning("Please select the source investment.");
  //     return;
  //   }

  //   if (selectedSource === "profit" && amount > walletBalance) {
  //     message.warning(
  //       `Only ${formatCurrency(walletBalance)} is available for reinvestment.`,
  //     );
  //     return;
  //   }

  //   const poolId = investmentDetails?.investment?._id || id;

  //   const payload = {
  //     userId: targetUserId,
  //     amount,
  //     isReinvestment: selectedSource === "profit",
  //     sourceAllocationId:
  //       selectedSource === "profit" ? sourceAllocationId : undefined,
  //   };

  //   try {
  //     setAllocate(true);

  //     await addInvestorToPool(poolId, payload);

  //     message.success(
  //       selectedSource === "profit"
  //         ? "Reinvestment completed successfully."
  //         : "Investor added successfully.",
  //     );

  //     setTargetUserId(undefined);
  //     setSelectedUser(null);
  //     setSelectedSource("capital");
  //     setSourceAllocationId(undefined);
  //     setWalletBalance(0);
  //     setNewInvestorAmount("");

  //     await Promise.all([loadInvestmentDetails(), loadPlatformUsers()]);
  //   } catch (error) {
  //     console.error("Allocation failed:", error);

  //     message.error(
  //       error?.response?.data?.message || "Investment allocation failed.",
  //     );
  //   } finally {
  //     setAllocate(false);
  //   }
  // };

  // const handleDistributeProfit = async (event) => {
  //   event.preventDefault();

  //   const poolId = investmentDetails?.investment?._id || id;

  //   // console.log(poolId)

  //   try {
  //     setDistribute(true);

  //    const res = await distributeInvestmentProfits(poolId, {
  //       totalProfit: inputProfitAmount,
  //       companyShare: companyPercent,
  //       investorShare: investorPercent,
  //     });

  //     console.log(res)
  //     message.success("Profit distribution completed.");
  //     await Promise.all([loadInvestmentDetails(), loadPlatformUsers()]);
  //   } catch (error) {
  //     console.error(error);
  //     message.error("Failed to distribute profit.");
  //   } finally {
  //     setDistribute(false);
  //   }
  // };

  const handleDistributeProfit = async (event) => {
  event.preventDefault();

  const poolId = investmentDetails?.investment?._id || id;

  try {
    setDistribute(true);

    const res = await distributeInvestmentProfits(poolId, {
      totalProfit: inputProfitAmount,
      companyShare: companyPercent,
      investorShare: investorPercent,
    });

    console.log(res);
    message.success("Profit distribution completed.");
    await Promise.all([loadInvestmentDetails(), loadPlatformUsers()]);
  } catch (error) {
    console.error(error);
    message.error("Failed to distribute profit.");
  } finally {
    setDistribute(false);
  }
};

  const withdrawableAllocations = (selectedUser?.allocations || []).filter(
    (allocation) =>
      !allocation.isClosed && Number(allocation.remainingWithdrawable || 0) > 0,
  );

  const removeInvestor = async (investor) => {
    const investmentId = id;
    const allocationId = investor.allocationId || investor._id;

    if (!investmentId || !allocationId) {
      message.error("Investment or allocation ID is missing.");
      return;
    }

    try {
      await removeInvestorFromPool(investmentId, allocationId);

      message.success("Investor removed successfully.");

      await Promise.all([loadInvestmentDetails(), loadPlatformUsers()]);
    } catch (error) {
      console.error("Remove investor failed:", error);

      message.error(
        error?.response?.data?.message || "Failed to remove investor.",
      );
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-sm font-semibold text-slate-400">
        Loading investment details...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link to="/dashboard/investment">
          <button className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white text-sm font-semibold transition-colors cursor-pointer">
            <ArrowLeft size={16} />
            <span>Back to Packages</span>
          </button>
        </Link>

        <div className="flex items-center gap-3">
          <Popconfirm
            title="Archive Investment Package"
            description="Are you sure you want to archive this investment package?"
            okText="Yes, Archive"
            cancelText="Cancel"
          >
            <button className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider bg-rose-950/20 border border-rose-900/40 px-3 py-1 cursor-pointer">
              <HiOutlineArchiveBoxArrowDown size={13} />
              Archive Package
            </button>
          </Popconfirm>

          <button className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider bg-rose-950/20 border border-rose-900/40 px-3 py-1 cursor-pointer">
            <FaRegEdit size={13} />
            Edit Package
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-slate-800 bg-[#1F2937] rounded-none overflow-hidden">
            <div className="h-56 w-full bg-[#090A0F] relative">
              <Tag
                color={getStatusColor(investmentDetails?.investment?.status)}
                className="absolute! top-2 right-2 px-3 py-1 font-semibold uppercase"
              >
                {investmentDetails?.investment?.status}
              </Tag>

              <img
                src={
                  investmentDetails?.investment?.image?.url ||
                  "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=60"
                }
                className="w-full h-full object-cover"
                alt={investmentDetails?.investment?.title || "Investment"}
              />
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mt-1 capitalize">
                {investmentDetails?.investment?.title}
              </h2>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-4 text-xs font-semibold">
                <div>
                  <span className="text-[#9CA3AF] block">Target Cap</span>
                  <span className="text-xl font-bold text-blue-400">
                    {formatCurrency(
                      investmentDetails?.investment?.targetAmount,
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-[#9CA3AF] block">Current Capital</span>
                  <span className="text-xl font-bold text-[#34D399]">
                    {formatCurrency(
                      investmentDetails?.investment?.totalAllocated,
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-[#9CA3AF] block">Members</span>
                  <span className="text-xl font-bold text-white">
                    {investmentDetails?.investors?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-800 bg-[#1F2937] rounded-none">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase">
                Stakeholders Roster
              </h3>
            </div>

            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#090A0F]/50 text-[10px] font-bold uppercase text-[#9CA3AF] border-b border-slate-800">
              <div className="col-span-2">User</div>
              <div className="col-span-2 text-right">Principal</div>
              <div className="col-span-2 text-right">Profit</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2 text-right">Withdrawable</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            <div className="divide-y divide-slate-800">
              {investmentDetails?.investors?.map((investor, index) => (
                <div
                  key={investor.allocationId || index}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#111827]"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    {/* <div className="w-8 h-8 rounded-full bg-[#090A0F] text-[#34D399] flex items-center justify-center font-bold text-sm">
                      {investor.user?.name?.charAt(0) || "U"}
                    </div> */}

                    <div>
                      <p className="text-xs font-bold text-white">
                        {investor.user?.name || "Unknown"}
                      </p>
                      <p className="text-[10px] text-[#9CA3AF]">
                        {investor.user?.email || "No email"}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 text-right text-xs font-mono font-bold text-white">
                    {formatCurrency(investor.principal)}
                  </div>

                  <div className="col-span-2 text-right text-xs font-mono font-bold text-[#34D399]">
                    {formatCurrency(investor.profitEarned)}
                  </div>

                  <div className="col-span-2 text-right text-xs font-mono font-bold text-blue-400">
                    {formatCurrency(investor.totalInvestment)}
                  </div>
                  <div className="col-span-2 text-right text-xs font-mono font-bold text-blue-400">
                    {formatCurrency(investor.withdrawableLimit || 0)}
                  </div>

                  <div className="col-span-2 text-right">
                    {investmentDetails?.investment?.status === "completed" ? (
                      <button
                        onClick={() => {
                          setAddWithdrawable(investor);
                          setWithdrawableLimit(
                            String(investor.withdrawableLimit || 0),
                          );
                          setIsLimitModalOpen(true);
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase cursor-pointer"
                      >
                        Set Limit
                      </button>
                    ) : (
                      <Popconfirm
                        title="Remove investor?"
                        description={`Are you sure you want to remove ${
                          investor.user?.name || "this investor"
                        } from this investment pool?`}
                        okText="Yes, remove"
                        cancelText="Cancel"
                        okButtonProps={{
                          danger: true,
                        }}
                        onConfirm={() => removeInvestor(investor)}
                      >
                        <button className="text-[10px] text-rose-500 hover:text-rose-400 font-bold uppercase cursor-pointer">
                          Remove
                        </button>
                      </Popconfirm>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-slate-800 bg-[#1F2937] p-5 space-y-4 rounded-none">
            <div className="flex items-center gap-2 text-white">
              <Coins size={18} className="text-[#34D399]" />
              <h3 className="font-bold text-base">Distribute Pool Profit</h3>
            </div>

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
                  value={inputProfitAmount}
                  onChange={(event) => setInputProfitAmount(event.target.value)}
                  disabled={
                    investmentDetails?.investment?.status === "completed"
                  }
                  placeholder="e.g. 1000000"
                  className="w-full px-3 py-2 bg-[#090A0F] border border-slate-800 font-semibold text-white focus:outline-none focus:border-[#3B82F6] disabled:opacity-40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#9CA3AF] block">
                    Company %
                  </label>

                  <input
                    type="number"
                    required
                    disabled={
                      investmentDetails?.investment?.status === "completed"
                    }
                    value={companyPercent}
                    onChange={(event) => setCompanyPercent(event.target.value)}
                    className="w-full px-3 py-2 bg-[#090A0F] border border-slate-800 text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#9CA3AF] block">
                    Investor %
                  </label>

                  <input
                    type="number"
                    required
                    disabled={
                      investmentDetails?.investment?.status === "completed"
                    }
                    value={investorPercent}
                    onChange={(event) => setInvestorPercent(event.target.value)}
                    className="w-full px-3 py-2 bg-[#090A0F] border border-slate-800 text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  distribute ||
                  investmentDetails?.investment?.status === "completed" ||
                  Number(companyPercent) + Number(investorPercent) !== 100
                }
                className="w-full py-2.5 bg-[#3B82F6] hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm"
              >
                {distribute
                  ? "Processing..."
                  : "Execute Distribution Breakdown"}
              </button>
            </form>
          </div>

          <div className="border border-slate-800 bg-[#1F2937] p-5 space-y-4 rounded-none">
            <div className="flex items-center gap-2 text-white">
              <UserPlus size={18} className="text-[#34D399]" />
              <h3 className="font-bold text-base">Add User to Pool</h3>
            </div>

            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Allocate fresh capital or reinvest a user&apos;s withdrawable
              balance into this investment.
            </p>

            {/* <form onSubmit={handleAddInvestor} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#9CA3AF] block">
                  Select Platform Member
                </label>

                <Select
                  showSearch
                  loading={usersLoading}
                  placeholder="Search by name or email..."
                  optionFilterProp="label"
                  value={targetUserId}
                  onChange={handleUserSelect}
                  disabled={
                    investmentDetails?.investment?.status === "completed"
                  }
                  className="w-full h-9 rounded-none"
                  options={users.map((user) => ({
                    value: user._id || user.id,
                    label: `${user.name} (${user.email})`,
                  }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-1 bg-[#090A0F] p-0.5">
                <button
                  type="button"
                  onClick={() => handleSourceChange("capital")}
                  className={`py-1.5 text-[10px] font-bold transition-all ${
                    selectedSource === "capital"
                      ? "bg-slate-800 text-white"
                      : "text-[#9CA3AF]"
                  }`}
                >
                  FRESH CAPITAL
                </button>

                <button
                  type="button"
                  onClick={() => handleSourceChange("profit")}
                  className={`py-1.5 text-[10px] font-bold transition-all ${
                    selectedSource === "profit"
                      ? "bg-[#34D399] text-[#090A0F]"
                      : "text-[#9CA3AF]"
                  }`}
                >
                  WITHDRAWABLE BALANCE
                </button>
              </div>

              {selectedSource === "profit" && (
                <>
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#9CA3AF] block">
                      Select Source Investment
                    </label>

                    <Select
                      placeholder={
                        selectedUser
                          ? "Choose investment to reinvest from"
                          : "Select a user first"
                      }
                      value={sourceAllocationId}
                      onChange={handleSourceAllocationSelect}
                      disabled={!selectedUser}
                      className="w-full h-9 rounded-none"
                      options={withdrawableAllocations.map((allocation) => ({
                        value: allocation._id || allocation.id,
                        label: `${
                          allocation.investment?.title || "Unknown investment"
                        } — ${formatCurrency(
                          allocation.remainingWithdrawable,
                        )}`,
                      }))}
                    />
                  </div>

                  {selectedUser && withdrawableAllocations.length === 0 && (
                    <p className="text-[11px] text-red-400">
                      This user has no withdrawable balance available for
                      reinvestment.
                    </p>
                  )}

                  <div className="flex justify-between items-center px-3 py-2 bg-[#090A0F] border border-[#34D399]/20">
                    <span className="text-[10px] text-[#9CA3AF] uppercase">
                      Available to reinvest
                    </span>

                    <span className="text-sm font-mono font-bold text-[#34D399]">
                      {formatCurrency(walletBalance)}
                    </span>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-[#9CA3AF] block">
                  {selectedSource === "profit"
                    ? "Amount to Reinvest (₦)"
                    : "Injected Capital (₦)"}
                </label>

                <input
                  type="number"
                  required
                  min={0}
                  max={selectedSource === "profit" ? walletBalance : undefined}
                  value={newInvestorAmount}
                  onChange={handleAmountChange}
                  disabled={
                    investmentDetails?.investment?.status === "completed" ||
                    investmentDetails?.investment?.status === "archived" ||
                    (selectedSource === "profit" &&
                      (!sourceAllocationId || walletBalance <= 0))
                  }
                  placeholder={
                    selectedSource === "profit"
                      ? `Max ${formatCurrency(walletBalance)}`
                      : "e.g. 500000"
                  }
                  className="w-full px-3 py-2 bg-[#090A0F] border border-slate-800 font-semibold text-white focus:outline-none focus:border-[#34D399] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={
                  allocate ||
                  investmentDetails?.investment?.status === "completed" ||
                  investmentDetails?.investment?.status === "archived" ||
                  (selectedSource === "profit" && !sourceAllocationId)
                }
                className="w-full py-2.5 bg-[#34D399] hover:bg-[#06D6A0] disabled:bg-slate-800 disabled:text-slate-500 text-[#090A0F] font-bold text-sm"
              >
                {allocate ? "Allocating..." : "Confirm Allocation"}
              </button>
            </form> */}

            <form onSubmit={handleAddInvestor} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#9CA3AF] block">
                  Select Platform Member
                </label>

                <Select
                  showSearch
                  loading={usersLoading}
                  placeholder="Search by name or email..."
                  optionFilterProp="label"
                  value={targetUserId}
                  onChange={handleUserSelect}
                  className="w-full h-9 rounded-none"
                  options={users.map((user) => ({
                    value: user._id || user.id,
                    label: `${user.name} (${user.email})`,
                  }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-1 bg-[#090A0F] p-0.5">
                <button
                  type="button"
                  onClick={() => handleSourceChange("capital")}
                  className={`py-1.5 text-[10px] font-bold ${
                    selectedSource === "capital"
                      ? "bg-slate-800 text-white"
                      : "text-[#9CA3AF]"
                  }`}
                >
                  FRESH CAPITAL
                </button>

                <button
                  type="button"
                  onClick={() => handleSourceChange("profit")}
                  className={`py-1.5 text-[10px] font-bold ${
                    selectedSource === "profit"
                      ? "bg-[#34D399] text-[#090A0F]"
                      : "text-[#9CA3AF]"
                  }`}
                >
                  AVAILABLE BALANCE
                </button>
              </div>

              {selectedSource === "profit" && (
                <>
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#9CA3AF] block">
                      Select Source Investment
                    </label>

                    <Select
                      placeholder={
                        selectedUser
                          ? "Choose investment to reinvest from"
                          : "Select a user first"
                      }
                      disabled={!selectedUser}
                      value={sourceAllocationId}
                      onChange={handleSourceAllocationSelect}
                      className="w-full h-9 rounded-none"
                      options={(selectedUser?.allocations || [])
                        .filter(
                          (allocation) =>
                            !allocation.isClosed &&
                            getAvailableBalance(allocation) > 0,
                        )
                        .map((allocation) => ({
                          value:
                            allocation.allocationId ||
                            allocation._id ||
                            allocation.id,
                          label: `${
                            allocation.investment?.title || "Source investment"
                          } — ${formatCurrency(getAvailableBalance(allocation))}`,
                        }))}
                    />
                  </div>

                  <div className="flex items-center justify-between border border-[#34D399]/20 bg-[#090A0F] px-3 py-2">
                    <span className="text-[10px] uppercase text-[#9CA3AF]">
                      Available balance
                    </span>

                    <span className="font-mono text-sm font-bold text-[#34D399]">
                      {formatCurrency(walletBalance)}
                    </span>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-[#9CA3AF] block">
                  {selectedSource === "profit"
                    ? "Amount to Reinvest (₦)"
                    : "Fresh Investment Amount (₦)"}
                </label>

                <input
                  type="number"
                  required
                  min="1"
                  max={selectedSource === "profit" ? walletBalance : undefined}
                  value={newInvestorAmount}
                  onChange={handleAmountChange}
                  disabled={
                    selectedSource === "profit" &&
                    (!sourceAllocationId || walletBalance <= 0)
                  }
                  placeholder={
                    selectedSource === "profit"
                      ? `Maximum: ${formatCurrency(walletBalance)}`
                      : "e.g. 500000"
                  }
                  className="w-full px-3 py-2 bg-[#090A0F] border border-slate-800 font-semibold text-white focus:outline-none focus:border-[#34D399] disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={
                  allocate ||
                  !targetUserId ||
                  (selectedSource === "profit" && !sourceAllocationId)
                }
                className="w-full py-2.5 bg-[#34D399] hover:bg-[#06D6A0] disabled:bg-slate-800 disabled:text-slate-500 text-[#090A0F] font-bold text-sm"
              >
                {allocate
                  ? "Processing..."
                  : selectedSource === "profit"
                    ? "Confirm Reinvestment"
                    : "Confirm Investment"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {isLimitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm bg-[#1F2937] border border-slate-700 p-6 text-white shadow-2xl">
            <h3 className="font-bold">Set Withdrawable Limit</h3>

            <p className="mt-1 text-xs text-[#9CA3AF]">
              {addWithdrawable?.user?.name || "Investor"}
            </p>

            {/* <p className="mt-3 text-xs text-[#9CA3AF]">
              Maximum available:{" "}
              <span className="font-bold text-[#34D399]">
                {formatCurrency(
                  Math.max(
                    0,
                    Number(addWithdrawable?.profitEarned || 0) -
                      Number(addWithdrawable?.profitWithdrawn || 0),
                  ),
                )}
              </span>
            </p> */}

            <input
              type="number"
              min="0"
              max={addWithdrawable?.totalInvestment - withdrawableLimit ?? 0}
              value={withdrawableLimit}
              placeholder="Enter withdrawable amount"
              onChange={(event) => setWithdrawableLimit(event.target.value)}
              className="w-full mt-3 px-3 py-2 bg-[#090A0F] border border-slate-700 text-white focus:outline-none focus:border-[#34D399]"
            />

            <p className="mt-3 text-xs text-[#9CA3AF]">
              Investor total:{" "}
              <span className="font-bold text-[#34D399]">
                {formatCurrency(
                  addWithdrawable?.totalInvestment - withdrawableLimit ?? 0,
                )}
              </span>
            </p>

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setIsLimitModalOpen(false);
                  setAddWithdrawable(null);
                  setWithdrawableLimit("");
                }}
                disabled={limitLoading}
                className="px-4 py-2 text-xs font-bold bg-slate-700 hover:bg-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={addMoney}
                disabled={limitLoading}
                className="px-4 py-2 text-xs bg-[#34D399] hover:bg-[#06D6A0] disabled:opacity-50 text-[#090A0F] font-bold"
              >
                {limitLoading ? "Updating..." : "Update Limit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminInvestmentDetails;
