import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { message, Tag, Skeleton } from "antd";
import { Wallet, TrendingUp, ShieldCheck, X } from "lucide-react";
import { fetchUserInvestments } from "../../api/investmentApi";
import { requestWithdrawalApi } from "../../api/withdrawalApi";
import { NIGERIAN_BANKS } from "../../utils/bank";

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal/Management States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [formData, setFormData] = useState({
    amount: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  });

  useEffect(() => {
    const loadInvestments = async () => {
      try {
        setLoading(true);
        const res = await fetchUserInvestments();
        setInvestments(res.data || []);
      } catch (err) {
        message.error("Could not load investment data.");
      } finally {
        setLoading(false);
      }
    };
    loadInvestments();
  }, []);

  // Update handleWithdraw
//   const handleWithdraw = async (e) => {
//     e.preventDefault();
//     try {
//       await requestWithdrawalApi({
//         ...formData,
//         investmentId: selectedInv._id,
//         source: "capital",
//       });
//       message.success("Withdrawal request submitted successfully.");
//       setIsModalOpen(false);
//     } catch (err) {
//       message.error("Failed to submit request.");
//     }
//   };
const handleWithdraw = async (e) => {
    e.preventDefault();

    // 1. Validate against current stake
    if (formData.amount > selectedInv.amount) {
      message.error("Withdrawal amount cannot exceed your current stake.");
      return;
    }

    try {
      await requestWithdrawalApi({
        ...formData,
        investmentId: selectedInv._id,
        source: "capital",
      });

      // 2. Optimistic UI Update: Recalculate local state
      setInvestments((prevInvestments) =>
        prevInvestments.map((inv) =>
          inv._id === selectedInv._id
            ? { ...inv, status: "pending" } // Optionally mark as pending
            : inv
        )
      );

      message.success("Withdrawal request submitted successfully.");
      setIsModalOpen(false);
      setFormData({ amount: "", bankName: "", accountName: "", accountNumber: "" });
    } catch (err) {
      message.error("Failed to submit request. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green";
      case "pending":
        return "orange";
      case "completed":
        return "blue";
      case "paused":
        return "volcano";
      default:
        return "default";
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Principal"
          value="₦1,250,000"
          icon={<Wallet />}
        />
        <StatCard title="Total Yield" value="₦305,000" icon={<TrendingUp />} />
        <StatCard
          title="Active Pools"
          value={investments.length}
          icon={<ShieldCheck />}
        />
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div className="border border-slate-800 rounded-none overflow-hidden">
          <div className="grid grid-cols-5 bg-[#090A0F] border-b border-slate-800 text-[#9CA3AF] text-xs font-bold uppercase tracking-wider">
            <div className="p-4">Pool Title</div>
            <div className="p-4">Principal</div>
            <div className="p-4">Profit</div>
            <div className="p-4">Status</div>
            <div className="p-4">Action</div>
          </div>

          <div className="divide-y divide-slate-800 font-medium text-[#9CA3AF]">
            <AnimatePresence>
              {investments.map((inv) => (
                <motion.div
                  key={inv._id}
                  className="grid grid-cols-5 p-4 items-center hover:bg-[#0F111A] transition-colors"
                >
                  <span className="font-semibold text-white capitalize">
                    {inv.title}
                  </span>
                  <span>₦{inv.amount.toLocaleString()}</span>
                  <span className="text-[#34D399]">
                    +₦{inv.profitCollected.toLocaleString()}
                  </span>
                  <span>
                    <Tag color={getStatusColor(inv.status)}>
                      {inv.status.toUpperCase()}
                    </Tag>
                  </span>
                  <div>
                    {inv.status === "pending" ? (
                      <button
                        onClick={() => {
                          setSelectedInv(inv);
                          setNewAmount(inv.amount);
                          setIsModalOpen(true);
                        }}
                        className="text-[#34D399] hover:text-white transition-colors cursor-pointer"
                      >
                        <Wallet size={16} />
                      </button>
                    ) : (
                      <span className="text-slate-700 text-xs italic">
                        Locked
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-[#090A0F]/70 backdrop-blur-xs"
          />
          <div className="bg-[#1F2937] border border-slate-800 rounded-none w-full max-w-sm p-6 relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-white">
                Adjust Investment
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#090A0F] p-3 border border-slate-800">
              <p className="text-[10px] text-[#9CA3AF] uppercase">
                Current Stake
              </p>
              <p className="text-lg font-bold text-white">
                ₦{selectedInv?.amount.toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-3 text-xs">
              {/* Amount */}
              <input
                type="number"
                placeholder="Amount"
                required
                className={`w-full px-3 py-2.5 bg-[#090A0F] border ${
                  formData.amount > selectedInv?.amount
                    ? "border-red-500"
                    : "border-slate-800"
                } text-white`}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value),
                  })
                }
              />

              {/* Validation Message */}
              {formData.amount > selectedInv?.amount && (
                <p className="text-red-500 text-[10px]">
                  Amount exceeds your stake of ₦
                  {selectedInv?.amount.toLocaleString()}
                </p>
              )}

              {/* Bank Select */}
              <select
                required
                className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white"
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
              >
                <option value="">Select a Bank</option>
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b.code} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>

              {/* Account Name */}
              <input
                type="text"
                placeholder="Account Name"
                required
                className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white"
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
              />

              {/* Account Number */}
              <input
                type="number"
                placeholder="Account Number"
                required
                className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white"
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
              />

              <button
                type="submit"
                className="w-full py-3 font-bold bg-[#34D399] text-[#090A0F] hover:bg-[#28b485]"
              >
                Submit Withdrawal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="p-4 border border-slate-800 bg-[#090A0F] rounded-none flex items-center gap-4">
    <div className="p-2 bg-slate-900 rounded-full text-[#34D399]">{icon}</div>
    <div>
      <p className="text-slate-400 text-[11px] uppercase tracking-wider">
        {title}
      </p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  </div>
);

export default Investments;
