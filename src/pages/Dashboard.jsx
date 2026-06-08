import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  ArrowUpRight, 
  Percent, 
  Calculator,
  Building
} from "lucide-react";
import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { message, Skeleton } from "antd";

// 🔌 Connects directly to your analytics API layer
import { fetchDashboardAnalytics } from "../api/analyticsApi";

// Motion animation presets
const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

// Standard local currency formatter helper
const formatNaira = (value) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);
};

// Simplified chart axis numerical formatter (e.g., 2M, 500k)
const formatAxisValues = (num) => {
  if (num >= 1000000) return `₦ ${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `₦ ${(num / 1000).toFixed(0)}k`;
  return `₦ ${num}`;
};

const Dashboard = () => {
  // 💾 Core Dynamic Data States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profit Split Calculator Local State
  const [calcAmount, setCalcAmount] = useState("100000");
  
  const totalProfitGenerated = parseFloat(calcAmount) || 0;
  const companyCut = totalProfitGenerated * 0.55;
  const investorCut = totalProfitGenerated * 0.45;

  // 🔄 Request live backend data calculations on component mount
  useEffect(() => {
    const loadSystemAnalytics = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        message.error(err?.message || "Failed to communicate with analytics engine database nodes.");
      } finally {
        setLoading(false);
      }
    };

    loadSystemAnalytics();
  }, []);

  // 💀 Skeleton Loader View (Perfect Dark Theme Matching)
  if (loading) {
    return (
      <div className="space-y-6 bg-[#1F1F1F] min-h-screen p-4">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton.Button active style={{ width: 220, height: 28, backgroundColor: '#2A2A2A' }} />
          <Skeleton.Input active style={{ width: 420, height: 16, backgroundColor: '#2A2A2A' }} />
        </div>

        {/* Card Row Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border border-slate-800 rounded-xl bg-[#1F2937] h-32 flex flex-col justify-between">
              <Skeleton.Input active size="small" style={{ width: '60%', backgroundColor: '#2A2A2A' }} />
              <Skeleton.Button active style={{ width: '80%', height: 32, backgroundColor: '#2A2A2A' }} />
            </div>
          ))}
        </div>

        {/* Main Content Splitted Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 border border-slate-800 rounded-xl bg-[#1F2937] h-80 lg:col-span-2 space-y-4">
            <Skeleton.Input active style={{ width: '40%', backgroundColor: '#2A2A2A' }} />
            <div className="w-full h-56 bg-[#181F2A] animate-pulse rounded-lg" />
          </div>
          <div className="p-5 border border-slate-800 rounded-xl bg-[#1F2937] h-80 flex flex-col justify-between">
            <Skeleton.Input active style={{ width: '50%', backgroundColor: '#2A2A2A' }} />
            <div className="space-y-3 w-full">
              <div className="h-10 bg-[#181F2A] animate-pulse w-full" />
              <div className="h-20 bg-[#181F2A] animate-pulse w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safe fallback bindings if the database response collections match empty states
  const summary = analyticsData?.summaryCards || { totalAssetUnderManagement: 0, totalRegisteredUsers: 0, totalPoolsDeployed: 0 };
  const charts = analyticsData?.chartData || [];

  // Derived dashboard company values calculated over real-time database AUM pools
  const dynamicTotalCompanyCut = summary.totalAssetUnderManagement * 0.55;
  const dynamicTotalInvestorCut = summary.totalAssetUnderManagement * 0.45;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6 bg-[#1F1F1F] min-h-screen text-[#9CA3AF] p-4"
    >
      
      {/* Title Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Investor Dashboard
          <span className="text-[10px] font-mono bg-[#090A0F] border border-slate-800 text-[#34D399] px-2 py-0.5 font-bold uppercase tracking-widest rounded">LIVE DATA</span>
        </h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">Real-time breakdown of your investments and profit distributions.</p>
      </motion.div>

      {/* 1. Core Financial Metrics */}
      <motion.div 
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Card 1 */}
        <motion.div 
          variants={fadeInUp}
          className="p-5 border border-slate-800 rounded-xl bg-[#1F2937] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider block">Total Capital AUM</span>
            <h3 className="text-2xl font-bold text-white">{formatNaira(summary.totalAssetUnderManagement)}</h3>
            <span className="text-xs font-semibold text-[#34D399] flex items-center gap-1">
              <TrendingUp size={12} /> Actively investing across {summary.totalPoolsDeployed} Pools
            </span>
          </div>
          <div className="w-11 h-11 bg-[#090A0F] text-[#34D399] rounded-lg flex items-center justify-center font-bold text-xl">
            ₦
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div 
          variants={fadeInUp}
          className="p-5 border border-slate-800 rounded-xl bg-[#1F2937] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider block">Estimated Investor Payout (45%)</span>
            <h3 className="text-2xl font-bold text-[#34D399]">{formatNaira(dynamicTotalInvestorCut)}</h3>
            <span className="text-xs text-[#9CA3AF] block">Aggregated yield allocations in tracking matrix</span>
          </div>
          <div className="p-3 bg-[#090A0F] text-[#34D399] rounded-lg">
            <Percent size={20} />
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div 
          variants={fadeInUp}
          className="p-5 border border-slate-800 rounded-xl bg-[#1F2937] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider block">Company Management Cut (55%)</span>
            <h3 className="text-2xl font-bold text-slate-300">{formatNaira(dynamicTotalCompanyCut)}</h3>
            <span className="text-xs text-[#9CA3AF] block">Covers platform fees and system maintenance</span>
          </div>
          <div className="p-3 bg-[#090A0F] text-[#9CA3AF] rounded-lg">
            <Building size={20} />
          </div>
        </motion.div>
      </motion.div>

      {/* 2. Main Analytics & Interactive Split Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Simple Bar Chart Layout */}
        <motion.div 
          variants={fadeInUp}
          className="p-5 border border-slate-800 rounded-xl bg-[#1F2937] space-y-4 lg:col-span-2"
        >
          <div>
            <h3 className="font-bold text-white text-base">Monthly Profit Distribution Flow</h3>
            <p className="text-xs text-[#9CA3AF]">Comparing gross capital gains against your personal 45% payout.</p>
          </div>

          <div className="h-64 w-full">
            {charts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                No monthly historical investment inflows generated yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} tickFormatter={formatAxisValues} />
                  <Tooltip 
                    cursor={{ fill: '#090A0F', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#fff', borderRadius: '8px' }}
                    formatter={(value) => [formatNaira(value)]}
                  />
                  <Bar dataKey="NetProfit" fill="#4B5563" radius={[4, 4, 0, 0]} name="Gross Pool Profit" barSize={24} />
                  <Bar dataKey="YourShare" fill="#34D399" radius={[4, 4, 0, 0]} name="Your Payout (45%)" barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Dynamic Interactive Split Tool Card */}
        <motion.div 
          variants={fadeInUp}
          className="p-5 border border-slate-800 rounded-xl bg-[#1F2937] flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Calculator size={18} className="text-[#34D399]" />
              <h3 className="font-bold text-base">Split Estimator</h3>
            </div>
            
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Input any target investment return amount below to accurately compute how the returns divide up automatically.
            </p>

            {/* Input Box Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#9CA3AF] block">Hypothetical Return Amount (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm font-semibold">₦</span>
                <input 
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2.5 bg-[#090A0F] border border-slate-700 rounded-lg text-sm font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
                />
              </div>
            </div>

            {/* Real-Time Mathematical Output Feed */}
            <div className="bg-[#090A0F] border border-slate-800 rounded-lg p-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#9CA3AF] font-medium">Your Return (45%):</span>
                <span className="font-bold text-[#34D399] text-sm">{formatNaira(investorCut)}</span>
              </div>
              <div className="h-px bg-slate-800" />
              <div className="flex justify-between items-center">
                <span className="text-[#9CA3AF] font-medium">Company Fee (55%):</span>
                <span className="font-bold text-slate-300">{formatNaira(companyCut)}</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2.5 border border-slate-700 hover:border-[#3B82F6] hover:bg-[#090A0F] text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 group">
            Review Investment Policies
            <ArrowUpRight size={14} className="text-[#9CA3AF] group-hover:text-white transition-colors" />
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;