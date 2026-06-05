import { useState } from "react";
import { 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
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

// Clean historical earnings data
const monthlyEarningsData = [
  { month: "Jan", NetProfit: 2400, YourShare: 1080 },
  { month: "Feb", NetProfit: 3500, YourShare: 1575 },
  { month: "Mar", NetProfit: 4100, YourShare: 1845 },
  { month: "Apr", NetProfit: 5800, YourShare: 2610 },
  { month: "May", NetProfit: 7200, YourShare: 3240 },
];

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

const Dashboard = () => {
  // Profit Split Calculator State
  const [calcAmount, setCalcAmount] = useState("1000");
  
  const totalProfitGenerated = parseFloat(calcAmount) || 0;
  const companyCut = (totalProfitGenerated * 0.55).toFixed(2);
  const investorCut = (totalProfitGenerated * 0.45).toFixed(2);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6 bg-white min-h-screen text-slate-800 p-4"
    >
      
      {/* Title Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Investor Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Real-time breakdown of your investments and profit distributions.</p>
      </motion.div>

      {/* 1. Core Financial Metrics */}
      <motion.div 
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Card 1 */}
        <motion.div 
          variants={fadeInUp}
          className="p-5 border border-slate-200 rounded-xl bg-white flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Your Deposited Principal</span>
            <h3 className="text-2xl font-bold text-slate-900">$10,000.00</h3>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp size={12} /> Actively investing
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign size={20} />
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div 
          variants={fadeInUp}
          className="p-5 border border-slate-200 rounded-xl bg-white flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Your Earnings (45% Share)</span>
            <h3 className="text-2xl font-bold text-emerald-600">+$3,240.00</h3>
            <span className="text-xs text-slate-400 block">Total profit paid out to date</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Percent size={20} />
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div 
          variants={fadeInUp}
          className="p-5 border border-slate-200 rounded-xl bg-white flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Company Management Cut (55%)</span>
            <h3 className="text-2xl font-bold text-slate-700">$3,960.00</h3>
            <span className="text-xs text-slate-400 block">Covers platform fees and system maintenance</span>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
            <Building size={20} />
          </div>
        </motion.div>
      </motion.div>

      {/* 2. Main Analytics & Interactive Split Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Simple Bar Chart Layout */}
        <motion.div 
          variants={fadeInUp}
          className="p-5 border border-slate-200 rounded-xl bg-white space-y-4 lg:col-span-2"
        >
          <div>
            <h3 className="font-bold text-slate-900 text-base">Monthly Profit Distribution Flow</h3>
            <p className="text-xs text-slate-400">Comparing gross capital gains against your personal 45% payout.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyEarningsData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="NetProfit" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="Gross Pool Profit" barSize={24} />
                <Bar dataKey="YourShare" fill="#10B981" radius={[4, 4, 0, 0]} name="Your Payout (45%)" barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Dynamic Interactive Split Tool Card */}
        <motion.div 
          variants={fadeInUp}
          className="p-5 border border-slate-200 rounded-xl bg-white flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Calculator size={18} className="text-emerald-600" />
              <h3 className="font-bold text-base">Split Estimator</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Input any target investment return amount below to accurately compute how the returns divide up automatically.
            </p>

            {/* Input Box Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 block">Hypothetical Return Amount ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
                <input 
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Real-Time Mathematical Output Feed */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Your Return (45%):</span>
                <span className="font-bold text-emerald-600 text-sm">${investorCut}</span>
              </div>
              <div className="h-px bg-slate-200/60" />
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Company Fee (55%):</span>
                <span className="font-bold text-slate-700">${companyCut}</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 group">
            Review Investment Policies
            <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;