import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Eye,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import { message, Popconfirm, Tag } from "antd";
import { motion, AnimatePresence } from "motion/react";

import {
  fetchAllUsers,
  fetchUserById,
  provisionNewUser,
  resetUserPassword,
} from "../api/userApi";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "green";
    case "completed":
      return "blue";
    case "pending":
      return "orange";
    case "paused":
      return "volcano";
    default:
      return "default";
  }
};

const getAvailableBalance = (allocation) =>
  Number(
    allocation?.availableBalance ??
      allocation?.remainingWithdrawable ??
      allocation?.availableToWithdraw ??
      0,
  );

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");

  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);

  const loadUsersData = async () => {
    try {
      setLoading(true);

      const data = await fetchAllUsers();

      // Your response is: { success, count, users }
      setUsers(data?.users || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  const openUserDetailsModal = async (user) => {
    setSelectedUser(user);
    setIsUserDetailsModalOpen(true);

    try {
      setDetailsLoading(true);

      const response = await fetchUserById(user._id || user.id);

      // Supports APIs that return { user: {...} } or just {...}.
      const fullUser = response?.user || response?.data?.user || response;

      setSelectedUser(fullUser);
    } catch (error) {
      console.error(error);
      message.error("Could not load full user details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeUserDetailsModal = () => {
    setIsUserDetailsModalOpen(false);
    setSelectedUser(null);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (!newUserName || !newUserEmail || !newUserPhone) {
      message.warning("Please complete all registration fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      await provisionNewUser({
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone,
      });

      message.success("New investor registered successfully.");

      setNewUserName("");
      setNewUserEmail("");
      setNewUserPhone("");
      setIsCreateModalOpen(false);

      await loadUsersData();
    } catch (error) {
      console.error(error);

      message.error(
        error?.response?.data?.message || "Failed to register investor.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
  const userId = selectedUser?._id || selectedUser?.id;

  if (!userId) {
    message.error("User ID is missing.");
    return;
  }

  try {
    await resetUserPassword({ userId });

    message.success("Password reset successfully.");
  } catch (error) {
    message.error(
      error?.response?.data?.message || "Failed to reset password."
    );
  }
};

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return users;

    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phone?.includes(search),
    );
  }, [users, searchTerm]);

  const metrics = useMemo(() => {
    const totalCapital = users.reduce(
      (total, user) =>
        total +
        (user.allocations || []).reduce(
          (allocationTotal, allocation) =>
            allocationTotal + Number(allocation.principal || 0),
          0,
        ),
      0,
    );

    const fundedUsers = users.filter(
      (user) => (user.allocations || []).length > 0,
    ).length;

    return {
      totalUsers: users.length,
      fundedUsers,
      totalCapital,
    };
  }, [users]);

  return (
    <div className="min-h-screen space-y-6 bg-[#1F1F1F] text-[#9CA3AF]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Investor Accounts
          </h1>
          <p className="mt-0.5 text-sm text-[#9CA3AF]">
            Review registered investors, balances, and investment allocations.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#34D399] hover:bg-[#06D6A0] text-[#090A0F] font-bold text-sm px-4 py-2.5 transition-colors cursor-pointer"
        >
          <UserPlus size={16} />
          Register Investor
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-slate-800 p-4 bg-[#1F2937] flex items-center gap-4">
          <div className="p-2.5 bg-[#090A0F] text-[#34D399]">
            <UsersIcon size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#9CA3AF] block">
              Total Profiles
            </span>
            <span className="text-lg font-semibold text-white">
              {metrics.totalUsers} Users
            </span>
          </div>
        </div>

        <div className="border border-slate-800 p-4 bg-[#1F2937] flex items-center gap-4">
          <div className="p-2.5 bg-[#090A0F] text-[#3B82F6]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#9CA3AF] block">
              Funded Investors
            </span>
            <span className="text-lg font-semibold text-white">
              {metrics.fundedUsers} Active
            </span>
          </div>
        </div>

        <div className="border border-slate-800 p-4 bg-[#1F2937] flex items-center gap-4">
          <div className="p-2.5 bg-[#090A0F] text-amber-500">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#9CA3AF] block">
              Total Principal
            </span>
            <span className="text-lg font-semibold text-white">
              {formatCurrency(metrics.totalCapital)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center max-w-sm border border-slate-800 bg-[#1F2937] px-3 py-2 focus-within:border-[#34D399] transition-colors">
        <Search size={16} className="text-[#9CA3AF] mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full text-xs bg-transparent text-white focus:outline-none font-medium placeholder-[#9CA3AF]"
        />
      </div>

      <div className="border border-slate-800 bg-[#1F2937] overflow-x-auto">
        <table className="min-w-[850px] w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#090A0F] border-b border-slate-800 font-bold text-[#9CA3AF] uppercase tracking-wider">
              <th className="p-4">Investor Identity</th>
              <th className="p-4">Contact Channels</th>
              <th className="p-4">Join Date</th>
              <th className="p-4 text-right">Investments</th>
              <th className="p-4 text-right">Principal Invested</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800 font-medium text-[#9CA3AF]">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center">
                  Loading investor records...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center italic">
                  No matching investor records found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const totalInvested = (user.allocations || []).reduce(
                  (sum, allocation) => sum + Number(allocation.principal || 0),
                  0,
                );

                return (
                  <tr
                    key={user._id || user.id}
                    className="hover:bg-[#090A0F]/40 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#090A0F] text-white font-semibold flex items-center justify-center text-lg capitalize shrink-0">
                          {user.name?.charAt(0) || "?"}
                        </div>

                        <div>
                          <p className="font-semibold capitalize text-white text-sm">
                            {user.name}
                          </p>
                          <p className="mt-0.5 text-[10px] uppercase text-[#9CA3AF]">
                            {user.role || "user"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="shrink-0" />
                        <span>{user.email || "—"}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="shrink-0" />
                        <span>{user.phone || "—"}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </td>

                    <td className="p-4 text-right font-mono text-white">
                      {(user.allocations || []).length}
                    </td>

                    <td className="p-4 text-right font-mono font-extrabold text-[#34D399] text-sm">
                      {formatCurrency(totalInvested)}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => openUserDetailsModal(user)}
                        title="View investor details"
                        className="p-1.5 text-[#9CA3AF] hover:text-[#34D399] hover:bg-[#090A0F] transition-all inline-flex items-center justify-center cursor-pointer"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isUserDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={closeUserDetailsModal}
            className="absolute inset-0 bg-[#090A0F]/70 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-slate-800 bg-[#1F2937] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-base text-white">
                  Investor Profile Details
                </h3>
                <p className="mt-0.5 text-xs text-[#9CA3AF]">
                  Review investor details and all investment allocations.
                </p>
              </div>

              <button
                type="button"
                onClick={closeUserDetailsModal}
                className="text-[#9CA3AF] hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-12 text-center text-sm text-[#9CA3AF]">
                Loading investor information...
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#090A0F] border border-slate-800 p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 shrink-0 rounded-full bg-[#1F2937] border border-slate-700 text-[#34D399] flex items-center justify-center text-lg font-bold">
                      {selectedUser?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-white capitalize">
                        {selectedUser?.name || "Unknown user"}
                      </h3>
                      <p className="truncate text-xs text-[#9CA3AF]">
                        {selectedUser?.email || "No email"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag
                      color={selectedUser?.role === "admin" ? "blue" : "green"}
                      className="m-0 uppercase font-bold"
                    >
                      {selectedUser?.role || "user"}
                    </Tag>

                    <Popconfirm
                      title="Reset user password?"
                      description="The password will be reset to the default password."
                      okText="Reset"
                      cancelText="Cancel"
                      onConfirm={handleResetPassword}
                    >
                      <button className="px-3 py-1.5 border border-rose-500/40 bg-rose-950/20 text-[10px] font-bold uppercase text-rose-400 hover:bg-rose-950/40 cursor-pointer">
                        Reset Password
                      </button>
                    </Popconfirm>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border border-slate-800 bg-[#090A0F] p-3">
                    <p className="text-[10px] uppercase font-bold text-[#9CA3AF]">
                      Phone Number
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {selectedUser?.phone || "—"}
                    </p>
                  </div>

                  <div className="border border-slate-800 bg-[#090A0F] p-3">
                    <p className="text-[10px] uppercase font-bold text-[#9CA3AF]">
                      Withdrawable Balance
                    </p>
                    <p className="mt-1 text-sm font-mono font-bold text-[#34D399]">
                      {formatCurrency(selectedUser?.withdrawableLimit)}
                    </p>
                  </div>

                  <div className="border border-slate-800 bg-[#090A0F] p-3">
                    <p className="text-[10px] uppercase font-bold text-[#9CA3AF]">
                      Registered
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {formatDate(selectedUser?.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="border border-slate-800 overflow-x-auto">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#090A0F] border-b border-slate-800">
                    <h4 className="text-xs uppercase font-bold text-white">
                      Investment Allocations
                    </h4>

                    <span className="text-xs text-[#9CA3AF]">
                      {selectedUser?.allocations?.length || 0} allocation(s)
                    </span>
                  </div>

                  <table className="min-w-[900px] w-full text-left text-xs">
                    <thead className="bg-[#1F2937] text-[10px] uppercase text-[#9CA3AF]">
                      <tr>
                        <th className="px-4 py-3">Investment</th>
                        <th className="px-4 py-3 text-right">Principal</th>
                        <th className="px-4 py-3 text-right">Profit</th>
                        <th className="px-4 py-3 text-right">Total Value</th>
                        <th className="px-4 py-3 text-right">Limit</th>
                        <th className="px-4 py-3 text-right">
                          Available Balance
                        </th>
                        <th className="px-4 py-3 text-right">
                          Reinvest
                        </th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800">
                      {(selectedUser?.allocations || []).length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-8 text-center text-[#9CA3AF]"
                          >
                            This user has no investment allocations.
                          </td>
                        </tr>
                      ) : (
                        selectedUser.allocations.map((allocation) => (
                          <tr
                            key={allocation._id || allocation.id}
                            className="bg-[#1F2937] hover:bg-[#111827]"
                          >
                            <td className="px-4 py-3">
                              <p className="font-bold text-white capitalize!">
                                {allocation.investment?.title ||
                                  "Unknown investment"}
                              </p>
                              <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                                {allocation.investment?.reference ||
                                  "No reference"}
                              </p>
                            </td>

                            <td className="px-4 py-3 text-right font-mono text-white">
                              {formatCurrency(allocation.principal)}
                            </td>

                            <td className="px-4 py-3 text-right font-mono text-[#34D399]">
                              {formatCurrency(allocation.profitEarned)}
                            </td>

                            <td className="px-4 py-3 text-right font-mono text-blue-400">
                              {formatCurrency(
                                allocation.totalValue ??
                                  Number(allocation.principal || 0) +
                                    Number(allocation.profitEarned || 0),
                              )}
                            </td>

                            <td className="px-4 py-3 text-right font-mono text-amber-400">
                              {formatCurrency(allocation.withdrawableLimit)}
                            </td>

                            <td className="px-4 py-3 text-right font-mono font-bold text-[#34D399]">
                              {formatCurrency(getAvailableBalance(allocation))}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-[#34D399]">
                              {formatCurrency(allocation?.amountReinvested || 0)}
                            </td>

                            <td className="px-4 py-3 text-right">
                              <Tag
                                color={getStatusColor(allocation.status)}
                                className="m-0 text-[10px] uppercase"
                              >
                                {allocation?.investment?.status || "unknown"}
                              </Tag>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

     <AnimatePresence mode="wait">
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
                Create a verified system account instance to register capital
                flows inside pool packages.
              </p>

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#9CA3AF] block">
                    Full Legal Name
                  </label>
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
                  <label className="font-bold text-[#9CA3AF] block">
                    Corporate / Personal Email
                  </label>
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
                  <label className="font-bold text-[#9CA3AF] block">
                    Phone Number
                  </label>
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
