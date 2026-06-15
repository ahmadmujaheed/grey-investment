import { useEffect, useState } from "react";
import { Wallet, X } from "lucide-react"; // Added X icon
import { message, Skeleton, Drawer, Table, Tag } from "antd";
import { useAuthStore } from "../../store/useAuthStore";
import {
  fetchUserWithdrawalHistory,
  requestWithdrawalApi,
} from "../../api/withdrawalApi";
import { NIGERIAN_BANKS } from "../../utils/bank";
import { fetchInvestorAnalytics } from "../../api/analyticsApi";

const Profile = () => {
  const { user, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(true);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Restored
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    bankName: NIGERIAN_BANKS[0].name,
    accountName: "",
    accountNumber: "",
  });
  const [error, setError] = useState(null); 

  const [data, setData] = useState({
    summaryCards: { availableBalance: 0, totalCollected: 0 },
    recentContracts: [],
  });
  const [availableBalance, setAvailableBalance] = useState(0);

  const getAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchInvestorAnalytics();

      if (result?.status === "success") {
        setAvailableBalance(result.summaryCards.availableBalance || 0);
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

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setSyncing(false);
    };
    init();
  }, [checkAuth]);

  const loadHistory = async () => {
    try {
      const data = await fetchUserWithdrawalHistory();
      setHistory(data);
      setIsHistoryOpen(true); // Open the drawer
    } catch {
      message.error("Failed to load history");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestWithdrawalApi(formData);
      message.success("Withdrawal request submitted!");
      setIsWithdrawOpen(false);
    } catch (err) {
      message.error("Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  if (syncing)
    return (
      <div className="max-w-5xl mx-auto p-10">
        <Skeleton active />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Identity Overview */}
      <div className="bg-[#1F2937] border border-slate-800 p-8 rounded-none">
        <h2 className="text-lg font-bold text-white mb-6">User Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
              Full Name
            </p>
            <p className="text-white font-semibold">{user?.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
              Email
            </p>
            <p className="text-white font-semibold">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Financial Hub */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-none flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-white">Financial Hub</h2>
          <p className="text-[#9CA3AF] text-xs">
            Manage your capital and monitor transactions.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={loadHistory}
            className="px-6 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-none hover:bg-slate-700 cursor-pointer"
          >
            View History
          </button>
          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="px-6 py-2.5 bg-[#34D399] text-[#090A0F] text-xs font-bold rounded-none hover:bg-[#06D6A0] cursor-pointer"
          >
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* History Drawer */}
      <Drawer
        title="Transaction History"
        width={500}
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      >
        <Table
          dataSource={history}
          rowKey="_id"
          columns={[
            {
              title: "Amount",
              dataIndex: "amount",
              render: (a) => `₦${a.toLocaleString()}`,
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (s) => (
                <Tag color={s === "approved" ? "green" : "gold"}>{s}</Tag>
              ),
            },
          ]}
        />
      </Drawer>

      {/* Withdrawal Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !loading && setIsWithdrawOpen(false)}
            className="absolute inset-0 bg-[#090A0F]/70 backdrop-blur-xs"
          />
          <div className="bg-[#1F2937] border border-slate-800 rounded-none w-full max-w-sm p-6 relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-white">
                Request Withdrawal
              </h3>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
              {/* Amount Input */}
              <input
                type="number"
                placeholder="Amount"
                required
                className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white focus:outline-none focus:border-[#34D399]"
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData({ ...formData, amount: val });
                }}
              />

              {/* Validation Warning */}
              {formData.amount > availableBalance && (
                <p className="text-red-500 text-[10px] -mt-2">
                  Amount exceeds your available principal: ₦
                  {availableBalance.toLocaleString()}
                </p>
              )}

              <select
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

              <input
                type="text"
                placeholder="Account Name"
                required
                className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white"
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Account Number"
                required
                className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white"
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
              />

              {/* Submit Button with conditional disabling */}
              <button
                type="submit"
                disabled={
                  loading ||
                  formData.amount > availableBalance ||
                  !formData.amount
                }
                className={`w-full py-3 font-bold transition-all ${
                  loading ||
                  formData.amount > availableBalance ||
                  !formData.amount
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-[#34D399] text-[#090A0F] hover:bg-[#28b485]"
                }`}
              >
                {loading ? "Processing..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
