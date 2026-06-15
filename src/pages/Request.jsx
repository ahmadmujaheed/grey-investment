import { useState, useEffect } from "react";
import { Popconfirm, Tag, message, Tabs, Skeleton, Card } from "antd";
import { CheckCircle, XCircle } from "lucide-react";
import { useRequestStore } from "../store/useRequestStore";
import { approveWithdrawalApi, rejectWithdrawalApi, fetchAllWithdrawalsApi } from "../api/withdrawalApi";

const Requests = () => {
  const { requests, fetchRequests } = useRequestStore();
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    await fetchRequests(); // Fetches pending from store
    const all = await fetchAllWithdrawalsApi(); // Fetch all history
    setAllRequests(all);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (id, action) => {
    try {
      if (action === "approve") await approveWithdrawalApi(id);
      else await rejectWithdrawalApi(id);
      message.success(`Request ${action}ed`);
      loadData(); // Refresh UI
    } catch (error) { message.error("Action failed"); }
  };

  // Filtered data for tabs
  const pendingData = allRequests.filter(r => r.status === 'pending');
  const approvedData = allRequests.filter(r => r.status === 'approved');
  const rejectedData = allRequests.filter(r => r.status === 'rejected');

  const stats = {
    total: allRequests.length,
    pending: pendingData.length,
    approved: approvedData.length,
    rejected: rejectedData.length
  };

  const renderTable = (data) => (
    <div className="border border-slate-800 bg-[#1F2937] overflow-hidden shadow-lg rounded-none">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-[#090A0F]/30 text-slate-400 border-b border-slate-800">
          <tr>
            {['Investor', 'Phone', 'Amount', 'Bank', 'Status', 'Actions'].map(h => 
              <th key={h} className="p-4 uppercase tracking-wider font-semibold text-[11px]">{h}</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40 text-slate-300">
          {data.map((req) => (
            <tr key={req._id} className="hover:bg-[#090A0F]/20 transition-all">
              <td className="p-4 font-bold text-white">{req.user?.name || "N/A"}</td>
              <td className="p-4">{req.user?.phone || "---"}</td>
              <td className="p-4 font-mono">₦{req.amount?.toLocaleString()}</td>
              <td className="p-4">{req.bankName}</td>
              <td className="p-4">
                <Tag color={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'error' : 'warning'}>
                  {req.status.toUpperCase()}
                </Tag>
              </td>
              <td className="p-4">
                {req.status === 'pending' ? (
                  <div className="flex gap-3">
                    <Popconfirm title="Approve?" onConfirm={() => handleAction(req._id, "approve")}>
                      <CheckCircle className="text-[#34D399] cursor-pointer hover:text-emerald-400" size={16} />
                    </Popconfirm>
                    <Popconfirm title="Reject?" onConfirm={() => handleAction(req._id, "reject")}>
                      <XCircle className="text-rose-500 cursor-pointer hover:text-rose-400" size={16} />
                    </Popconfirm>
                  </div>
                ) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 text-slate-200">
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-5">
        {[ { label: 'Total', val: stats.total }, { label: 'Pending', val: stats.pending }, 
           { label: 'Approved', val: stats.approved }, { label: 'Rejected', val: stats.rejected } ].map((s, i) => (
          <div key={i} className="bg-[#1F2937] border border-slate-800 p-5 rounded-2xl shadow-md">
            <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">{s.label}</span>
            <div className="text-2xl font-bold text-white mt-1">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#1F2937] border border-slate-800 rounded-2xl p-6">
        <Tabs className="custom-tabs" items={[
          { key: 'pending', label: `Pending (${stats.pending})`, children: loading ? <Skeleton active /> : renderTable(pendingData) },
          { key: 'approved', label: `Approved (${stats.approved})`, children: loading ? <Skeleton active /> : renderTable(approvedData) },
          { key: 'rejected', label: `Rejected (${stats.rejected})`, children: loading ? <Skeleton active /> : renderTable(rejectedData) }
        ]} />
      </div>
    </div>
  );
};

export default Requests;