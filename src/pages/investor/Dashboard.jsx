import { useEffect, useState } from "react";
import {
  Wallet,
  ShieldCheck,
  TrendingUp,
  Clock,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
// 🔌 Import Ant Design Skeleton components
import { Skeleton } from "antd";
import { useAuthStore } from "../../store/useAuthStore";
import { fetchInvestorAnalytics } from "../../api/analyticsApi";

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);

  const [data, setData] = useState({
    summaryCards: {
      totalCapitalInvested: 0,
      totalYieldEarned: 0,
      activePoolsCount: 0,
      nextPayoutSchedule: "N/A",
    },
    recentContracts: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchInvestorAnalytics();
      console.log(result);

      if (result.status === "success") {
        setData({
          summaryCards: result.summaryCards,
          recentContracts: result.recentContracts,
        });
      }
    } catch (err) {
      console.error("Dashboard calculation error:", err);
      setError(
        err.response?.data?.message || "Failed to sync pipeline analytics.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAnalytics();
  }, []);

  // Graceful Error Intercept Gate
  if (error) {
    return (
      <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center max-w-xl mx-auto my-12 backdrop-blur-md">
        <p className="text-rose-400 font-medium text-sm">{error}</p>
        <button
          onClick={getAnalytics}
          className="mt-4 px-5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={14} />
          Retry Connection
        </button>
      </div>
    );
  }

  const { summaryCards, recentContracts } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-slate-200 p-1">
      {/* 🚀 Welcome Message Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1F2937] to-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-800/80 shadow-xl shadow-[#090A0F]/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#34D399]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-[#34D399] to-emerald-400 bg-clip-text text-transparent">
                {user?.name || "Investor"}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
              Secure client access portal. Monitoring your real-time asset nodes
              and historical yield metrics.
            </p>
          </div>
          <div className="shrink-0 self-start sm:self-center flex items-center gap-2 bg-[#090A0F]/40 px-3.5 py-2 border border-slate-800 rounded-xl shadow-inner">
            <span className="w-2 h-2 bg-[#34D399] rounded-full animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">
              Node Active
            </span>
          </div>
        </div>
      </div>

      {/* 📊 Personal Metric Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Capital Invested */}
        <div className="bg-gradient-to-b from-[#1F2937] to-[#18202F] border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-all group shadow-md min-h-[128px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider block">
              Total Capital Invested
            </span>
            <div className="p-2 bg-[#090A0F]/40 rounded-xl group-hover:bg-[#090A0F]/60 transition-colors">
              <Wallet size={18} className="text-[#34D399]" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton.Button
                active
                size="small"
                className="w-32 block !bg-slate-800/50"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                ₦
                {summaryCards.totalCapitalInvested.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </span>
            )}
          </div>
        </div>

        {/* My Active Pools */}
        <div className="bg-gradient-to-b from-[#1F2937] to-[#18202F] border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-all group shadow-md min-h-[128px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider block">
              My Active Pools
            </span>
            <div className="p-2 bg-[#090A0F]/40 rounded-xl group-hover:bg-[#090A0F]/60 transition-colors">
              <ShieldCheck size={18} className="text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton.Button
                active
                size="small"
                className="w-24 block !bg-slate-800/50"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {summaryCards.activePoolsCount}{" "}
                <span className="text-xs font-medium text-slate-400">
                  {summaryCards.activePoolsCount === 1
                    ? "Pool Allocation"
                    : "Pool Allocations"}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Total Yield Earned */}
        <div className="bg-gradient-to-b from-[#1F2937] to-[#18202F] border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-all group shadow-md min-h-[128px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider block">
              Total Yield Accrued
            </span>
            <div className="p-2 bg-[#090A0F]/40 rounded-xl group-hover:bg-[#090A0F]/60 transition-colors">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton.Button
                active
                size="small"
                className="w-28 block !bg-slate-800/50"
              />
            ) : (
              <span className="text-2xl font-bold text-emerald-400 tracking-tight block font-mono">
                ₦
                {summaryCards.totalYieldEarned.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </span>
            )}
          </div>
        </div>

        {/* Next Distribution Window */}
        <div className="bg-gradient-to-b from-[#1F2937] to-[#18202F] border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-all group shadow-md min-h-[128px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider block">
              Next Payout Cycle
            </span>
            <div className="p-2 bg-[#090A0F]/40 rounded-xl group-hover:bg-[#090A0F]/60 transition-colors">
              <Clock size={18} className="text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton.Button
                active
                size="small"
                className="w-36 block !bg-slate-800/50"
              />
            ) : (
              <span className="text-lg font-bold text-slate-200 block truncate tracking-wide">
                {summaryCards.nextPayoutSchedule}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 📃 Live Dynamic Portfolio Table Allocation */}
      <div className="bg-[#1F2937] border border-slate-800/60 rounded-2xl overflow-hidden shadow-lg shadow-[#090A0F]/20">
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-[#1F2937] to-[#192231]">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Your Capital Allocations
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Asset contract listings tied explicitly to your cryptographic user
            token signature.
          </p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            // 📝 Clean multi-row layout skeleton matching standard table architecture
            <div className="p-6 space-y-4 bg-[#1F2937]/40">
              <Skeleton
                active
                paragraph={{ rows: 3 }}
                title={false}
                className="custom-table-skeleton"
              />
            </div>
          ) : recentContracts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs font-medium bg-[#1F2937]">
              No active investment pools linked to your account profile yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#090A0F]/30 text-slate-400 border-b border-slate-800 font-semibold tracking-wider text-[11px] uppercase">
                  <th className="p-4 pl-6">Asset Pool Name</th>
                  <th className="p-4">Principal Deposited</th>
                  <th className="p-4">Profit Earned</th>
                  <th className="p-4">Total</th>
                  <th className="p-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300 bg-[#1F2937]/40">
                {recentContracts.map((contract, index) => {
                  const nameOfPool =
                    contract.poolName ||
                    contract.poolId?.name ||
                    contract.pool?.name ||
                    "Asset Pool Deployment";
                  const returnRate =
                    contract.yieldRate ||
                    contract.poolId?.yieldRate ||
                    contract.pool?.yieldRate ||
                    "12% ARR";

                  return (
                    <motion.tr
                      key={contract._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      className="hover:bg-[#090A0F]/20 transition-all group"
                    >
                      <td className="p-4 pl-6 font-bold text-white group-hover:text-[#34D399] transition-colors">
                        {nameOfPool}
                      </td>
                      <td className="p-4 font-mono text-slate-200">
                        ₦
                        {(
                          contract.principalAmount ||
                          contract.amount ||
                          0
                        ).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        ₦
                        {(
                          contract.yieldAccrued ||
                          contract.totalYield ||
                          0
                        ).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 font-semibold text-emerald-400">
                        ₦
                        {(
                          (contract.principalAmount || contract.amount || 0) +
                          (contract.yieldAccrued || contract.totalYield || 0)
                        ).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            contract.status?.toLowerCase() === "active"
                              ? "bg-emerald-500/10 text-[#34D399] border-emerald-500/10"
                              : "bg-slate-500/10 text-slate-400 border-slate-800"
                          }`}
                        >
                          {contract.status || "Active"}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
