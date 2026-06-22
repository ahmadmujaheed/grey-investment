import { useEffect, useState } from "react";
import {
  Wallet,
  ShieldCheck,
  TrendingUp,
  Clock,
  RefreshCw,
  Landmark,
} from "lucide-react";
import { motion } from "motion/react";
import { Skeleton } from "antd";
import { useAuthStore } from "../../store/useAuthStore";
import { fetchInvestorAnalytics } from "../../api/analyticsApi";

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState({
    summaryCards: {
      totalPrincipal: 0,
      totalYield: 0,
      availableBalance: 0,
      totalCollected: 0,
      activePoolsCount: 0,
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

      // console.log("Fetched analytics data:", result); // Debug log to inspect the structure of the result

      if (result?.status === "success") {
        setData({
          summaryCards: {
            ...result.summaryCards,
            availableBalance: result.summaryCards.availableBalance || 0,
            totalCollected: result.summaryCards.totalCollected || 0,
          },
          recentContracts: result.recentContracts || [],
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

  if (error) {
    return (
      <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center max-w-xl mx-auto my-12 backdrop-blur-md">
        <p className="text-rose-400 font-medium text-sm">{error}</p>
        <button
          onClick={getAnalytics}
          className="mt-4 px-5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={14} /> Retry Connection
        </button>
      </div>
    );
  }

  const { summaryCards, recentContracts } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-slate-200 p-1">
      {/* 🚀 Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1F2937] to-[#111827] p-8 rounded-2xl border border-slate-800 shadow-xl">
        <h1 className="text-3xl font-extrabold text-white">
          Welcome back, <span className="text-[#34D399]">{user?.name}</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Secure client access portal. Monitoring your asset nodes.
        </p>
      </div>

      {/* 📊 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Total Money Invested",
            val: summaryCards.totalPrincipal,
            icon: Wallet,
            color: "text-[#34D399]",
          },
         
          {
            label: "Profit",
            val: summaryCards.totalYield,
            icon: TrendingUp,
            color: "text-emerald-400",
          },
           {
            label: "withdrawable Balance",
            val: summaryCards.availableBalance,
            icon: Landmark,
            color:
              summaryCards.availableBalance < 0
                ? "text-rose-400"
                : "text-white",
          },
          {
            label: "Total Collected",
            val: summaryCards.totalCollected,
            icon: Clock,
            color: "text-amber-400",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-[#1F2937] border border-slate-800 p-5 rounded-2xl shadow-md"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-[#9CA3AF] uppercase">
                {item.label}
              </span>
              <item.icon size={18} className={item.color} />
            </div>
            {loading ? (
              <Skeleton.Button active size="small" />
            ) : (
              <span className={`text-2xl font-bold ${item.color}`}>
                ₦{(item.val || 0).toLocaleString()}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 📃 Full Investment Allocation View */}
      <div className="bg-[#1F2937] border border-slate-800/60 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-[#1F2937] to-[#192231]">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Your Capital Allocations
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Comprehensive view of all your active investment pools and total
            asset performance.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#090A0F]/30 text-slate-400 border-b border-slate-800 font-semibold tracking-wider text-[11px] uppercase">
                <th className="p-4 pl-6">Asset Pool Name</th>
                <th className="p-4">Principal Deposited</th>
                <th className="p-4">Profit Earned</th>
                <th className="p-4">Total Value</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300 bg-[#1F2937]/40">
              {recentContracts.map((contract) => (
                <tr
                  key={contract._id}
                  className="hover:bg-[#090A0F]/20 transition-all"
                >
                  <td className="p-4 pl-6 font-bold text-white">
                    {contract.poolName || "Asset Pool"}
                  </td>
                  <td className="p-4 font-mono">
                    ₦
                    {contract.principalAmount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-4 font-mono text-emerald-400">
                    ₦
                    {contract.yieldAccrued?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-4 font-semibold text-white">
                    ₦
                    {(
                      (contract.principalAmount || 0) +
                      (contract.yieldAccrued || 0)
                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border border-emerald-500/20 bg-emerald-500/10 text-[#34D399]">
                      {contract.status || "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
