import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  Landmark,
  Clock,
  RefreshCw,
  X
} from "lucide-react";
import { Skeleton, Popover, Button } from "antd";
import { fetchInvestmentById } from "../../api/investmentApi";
import { NIGERIAN_BANKS } from "../../utils/bank";

const InvestmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [loading, setLoading] = useState(false);

  const [details, setDetails] = useState(location.state?.contract || null);
  const [loading, setLoading] = useState(!location.state?.contract);
  const [formData, setFormData] = useState({
    amount: "",
    bankName: NIGERIAN_BANKS[0].name,
    accountName: "",
    accountNumber: "",
    source: "profit",
  });
  const [error, setError] = useState(null);
  const [availableBalance, setAvailableBalance] = useState(0);

   const handleWithdraw = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        // Ensure 'source' is included
        await requestWithdrawalApi({ ...formData, source: "profit" });
        message.success("Withdrawal request submitted!");
        setIsWithdrawOpen(false);
      } catch (err) {
        // The server is telling you exactly why it failed
        console.error(err.response?.data);
        message.error(err.response?.data?.message || "Withdrawal failed");
      } finally {
        setLoading(false);
      }
    };


    const handleConfirm = async () => {
  setPopoverOpen(false); // Close popover
  await handleWithdraw(new Event("submit")); // Trigger your submit logic
};

  useEffect(() => {
    if (!details) {
      const loadData = async () => {
        try {
          setLoading(true);
          const response = await fetchInvestmentById(id);
          setDetails(response.data);
        } catch (error) {
          console.error("Error loading investment:", error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [id, details]);

  const metrics = [
    {
      label: "Principal",
      val: details?.totalPrincipal,
      icon: Wallet,
      color: "text-emerald-400",
    },
    {
      label: "Yield Earned",
      val: details?.totalYield,
      icon: TrendingUp,
      color: "text-blue-400",
    },
    {
      label: "Available",
      val: details?.availableBalance,
      icon: Landmark,
      color: "text-white",
    },
    {
      label: "Total Collected",
      val: details?.totalCollected,
      icon: Clock,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 text-slate-200">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      {/* 📊 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metrics.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#1F2937] border border-slate-800 p-5 rounded-2xl shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[#9CA3AF] uppercase">
                {item.label}
              </span>
              <item.icon size={16} className={item.color} />
            </div>
            {loading ? (
              <Skeleton.Input active size="small" style={{ width: 80 }} />
            ) : (
              <span className={`text-xl font-bold ${item.color}`}>
                ₦{item.val?.toLocaleString()}
              </span>
            )}
          </div>
        ))}
      </div>

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

            <Popover
              content={
                <div className="p-2 space-y-3">
                  <p className="text-xs">Are these account details correct?</p>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      onClick={() => setPopoverOpen(false)}
                      disabled={isSubmitting} // Disable "No" while submitting
                    >
                      No
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      className="bg-[#34D399] border-none text-[#090A0F]"
                      loading={isSubmitting} // This triggers the Ant Design loader
                      onClick={async () => {
                        setIsSubmitting(true); // Start loader
                        await handleConfirm(); // Your existing logic
                        setIsSubmitting(false); // Stop loader (or it closes anyway on submit)
                      }}
                    >
                      Yes, Send
                    </Button>
                  </div>
                </div>
              }
              title={<span className="text-xs">Confirm Details</span>}
              trigger="click"
              open={popoverOpen}
              onOpenChange={(visible) => setPopoverOpen(visible)}
            >
              <button
                type="button"
                className="w-full py-3 font-bold bg-[#34D399] text-[#090A0F] hover:bg-[#28b485] transition-all"
              >
                Submit Request
              </button>
            </Popover>
          </form>
        </div>
      </div>
    )}

      {/* 📋 Detail Table / Info Section */}
      <div className="bg-[#1F2937] border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h3 className="text-lg font-semibold mb-6 border-b border-slate-700 pb-4">
          Investment Summary
        </h3>
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InfoRow label="Pool Name" value={details?.poolName} />
            <InfoRow label="Status" value={details?.status} isBadge />
            <InfoRow
              label="Created At"
              value={new Date(details?.createdAt).toLocaleDateString()}
            />
            <InfoRow
              label="Action"
              value={
                <button
            onClick={() => setIsWithdrawOpen(true)}
            className="px-6 py-2.5 bg-[#34D399] text-[#090A0F] text-xs font-bold rounded-none hover:bg-[#06D6A0] cursor-pointer"
          >
                  Request Withdrawal
                </button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, isBadge }) => (
  <div className="flex justify-between border-b border-slate-800 py-2">
    <span className="text-slate-400">{label}</span>
    {isBadge ? (
      <span className="bg-slate-700 px-2 py-1 rounded text-xs uppercase font-bold">
        {value}
      </span>
    ) : (
      <span className="font-medium text-white">{value}</span>
    )}

   
  </div>
);

export default InvestmentDetails;
