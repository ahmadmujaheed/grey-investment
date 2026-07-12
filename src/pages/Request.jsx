import { useEffect, useState } from "react";
import { message, Popconfirm, Skeleton, Tabs, Tag } from "antd";
import { CheckCircle, RefreshCw, XCircle } from "lucide-react";

import {
  approveWithdrawalApi,
  rejectWithdrawalApi,
  fetchAllWithdrawalsApi,
} from "../api/withdrawalApi";

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
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "pending":
      return "warning";
    default:
      return "default";
  }
};

const Requests = () => {
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const response = await fetchAllWithdrawalsApi();

      // Response format: { success: true, count: 3, requests: [] }
      setAllRequests(response?.requests || []);
    } catch (error) {
      console.error(
        "Fetch withdrawals error:",
        error?.response?.data || error.message,
      );

      message.error("Failed to load withdrawal requests.");
      setAllRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (requestId, action) => {
    try {
      setActionLoadingId(requestId);

      if (action === "approve") {
        await approveWithdrawalApi(requestId);
      } else {
        await rejectWithdrawalApi(requestId);
      }

      message.success(
        action === "approve"
          ? "Withdrawal approved successfully."
          : "Withdrawal rejected successfully.",
      );

      // Reload requests to show the new status and updated allocation balance.
      await loadData();
    } catch (error) {
      console.error(
        "Withdrawal action error:",
        error?.response?.data || error.message,
      );

      message.error(
        error?.response?.data?.message ||
          `Failed to ${action} withdrawal request.`,
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingData = allRequests.filter(
    (request) => request.status === "pending",
  );

  const approvedData = allRequests.filter(
    (request) => request.status === "approved",
  );

  const rejectedData = allRequests.filter(
    (request) => request.status === "rejected",
  );

  const stats = {
    total: allRequests.length,
    pending: pendingData.length,
    approved: approvedData.length,
    rejected: rejectedData.length,
  };

  const renderTable = (data) => (
    <div className="border border-slate-800 bg-[#1F2937] overflow-x-auto">
      <table className="min-w-[1100px] w-full text-left border-collapse text-xs">
        <thead className="bg-[#090A0F] text-slate-400 border-b border-slate-800">
          <tr>
            <th className="p-4 uppercase tracking-wider font-semibold text-[10px]">
              Investor
            </th>
            <th className="p-4 uppercase tracking-wider font-semibold text-[10px]">
              Investment
            </th>
            <th className="p-4 text-right uppercase tracking-wider font-semibold text-[10px]">
              Requested
            </th>
            <th className="p-4 text-right uppercase tracking-wider font-semibold text-[10px]">
              Available Balance
            </th>
            <th className="p-4 uppercase tracking-wider font-semibold text-[10px]">
              Bank Details
            </th>
            <th className="p-4 uppercase tracking-wider font-semibold text-[10px]">
              Requested On
            </th>
            <th className="p-4 uppercase tracking-wider font-semibold text-[10px]">
              Status
            </th>
            <th className="p-4 text-center uppercase tracking-wider font-semibold text-[10px]">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-800/70 text-slate-300">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="p-10 text-center text-[#9CA3AF] italic"
              >
                No withdrawal requests found.
              </td>
            </tr>
          ) : (
            data.map((request) => {
              const availableBalance = Number(
                request.allocation?.remainingWithdrawable ??
                  request.allocation?.availableToWithdraw ??
                  0,
              );

              const isProcessing = actionLoadingId === request._id;

              return (
                <tr
                  key={request._id}
                  className="hover:bg-[#090A0F]/30 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-bold text-white">
                      {request.user?.name || "Unknown user"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                      {request.user?.email || "No email"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                      {request.user?.phone || "No phone"}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold capitalize text-white">
                      {request.investment?.title || "Unknown investment"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                      {request.investment?.reference || "No reference"}
                    </p>
                  </td>

                  <td className="p-4 text-right font-mono font-bold text-white whitespace-nowrap">
                    {formatCurrency(request.amount)}
                  </td>

                  <td className="p-4 text-right font-mono font-bold text-[#34D399] whitespace-nowrap">
                    {formatCurrency(availableBalance)}
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-white">
                      {request.bankName || "—"}
                    </p>
                    <p className="mt-0.5 text-[10px] font-mono text-[#9CA3AF]">
                      {request.accountNumber || "—"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                      {request.accountName || "—"}
                    </p>
                  </td>

                  <td className="p-4 text-[#9CA3AF] whitespace-nowrap">
                    {formatDate(request.createdAt)}
                  </td>

                  <td className="p-4">
                    <Tag
                      color={getStatusColor(request.status)}
                      className="m-0 text-[10px] font-bold uppercase"
                    >
                      {request.status || "unknown"}
                    </Tag>

                    {request.approvedAt && (
                      <p className="mt-1 text-[10px] text-[#9CA3AF]">
                        {formatDate(request.approvedAt)}
                      </p>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    {request.status === "pending" ? (
                      <div className="flex items-center justify-center gap-3">
                        <Popconfirm
                          title="Approve withdrawal?"
                          description={`Approve ${formatCurrency(
                            request.amount,
                          )} for ${request.user?.name || "this investor"}?`}
                          okText="Approve"
                          cancelText="Cancel"
                          okButtonProps={{
                            className: "bg-emerald-600",
                            loading: isProcessing,
                          }}
                          onConfirm={() =>
                            handleAction(request._id, "approve")
                          }
                        >
                          <button
                            disabled={isProcessing}
                            className="text-[#34D399] hover:text-emerald-300 disabled:opacity-40 cursor-pointer"
                            title="Approve withdrawal"
                          >
                            <CheckCircle size={18} />
                          </button>
                        </Popconfirm>

                        <Popconfirm
                          title="Reject withdrawal?"
                          description={`Reject ${formatCurrency(
                            request.amount,
                          )} for ${request.user?.name || "this investor"}?`}
                          okText="Reject"
                          cancelText="Cancel"
                          okButtonProps={{
                            danger: true,
                            loading: isProcessing,
                          }}
                          onConfirm={() =>
                            handleAction(request._id, "reject")
                          }
                        >
                          <button
                            disabled={isProcessing}
                            className="text-rose-500 hover:text-rose-300 disabled:opacity-40 cursor-pointer"
                            title="Reject withdrawal"
                          >
                            <XCircle size={18} />
                          </button>
                        </Popconfirm>
                      </div>
                    ) : (
                      <span className="text-[#9CA3AF]">—</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Withdrawal Requests
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Review, approve, or reject investor withdrawal requests.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 border border-slate-700 bg-[#1F2937] px-3 py-2 text-xs font-bold text-[#9CA3AF] hover:text-white hover:bg-[#090A0F] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Pending", value: stats.pending, color: "text-amber-400" },
          {
            label: "Approved",
            value: stats.approved,
            color: "text-[#34D399]",
          },
          { label: "Rejected", value: stats.rejected, color: "text-rose-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-slate-800 bg-[#1F2937] p-5"
          >
            <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold">
              {stat.label}
            </span>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-slate-800 bg-[#1F2937] p-5">
        <Tabs
          className="custom-tabs"
          items={[
            {
              key: "pending",
              label: `Pending (${stats.pending})`,
              children: loading ? <Skeleton active /> : renderTable(pendingData),
            },
            {
              key: "approved",
              label: `Approved (${stats.approved})`,
              children: loading ? (
                <Skeleton active />
              ) : (
                renderTable(approvedData)
              ),
            },
            {
              key: "rejected",
              label: `Rejected (${stats.rejected})`,
              children: loading ? (
                <Skeleton active />
              ) : (
                renderTable(rejectedData)
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Requests;