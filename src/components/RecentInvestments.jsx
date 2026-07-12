import { Skeleton, Empty, Tag } from "antd";
import {
  ArrowRight,
  CalendarDays,
  Hash,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

const formatMoney = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const statusColor = {
  pending: "gold",
  running: "blue",
  completed: "green",
  archived: "default",
};

const RecentInvestments = ({
  investments = [],
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-[#1F2937] border border-slate-800 rounded-2xl p-6">
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }

  return (
    <div className="bg-[#1F2937] border border-slate-800 rounded-2xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-semibold text-lg">
            Recent Investments
          </h2>

          <p className="text-slate-400 text-sm">
            Latest investments on the platform
          </p>
        </div>
      </div>

      {investments.length === 0 ? (
        <Empty
          description={
            <span className="text-slate-400">
              No investments found
            </span>
          }
        />
      ) : (
        <div className="space-y-4">

          {investments.map((item) => (
            <Link
              key={item.investmentId}
              to={`/dashboard/investments/${item.investmentId}`}
              className="block"
            >
              <div className="rounded-xl border border-slate-700 bg-[#111827] hover:border-emerald-500 transition-all duration-200 p-4">

                <div className="flex gap-4">

                  <img
                    src={item.image?.url}
                    alt={item.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />

                  <div className="flex-1">

                    <div className="flex justify-between items-start">

                      <h3 className="text-white font-semibold">
                        {item.title}
                      </h3>

                      <Tag color={statusColor[item.status]}>
                        {item.status}
                      </Tag>

                    </div>

                    <div className="mt-3 space-y-2">

                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Hash size={15} />
                        {item.reference}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Wallet size={15} />
                        {formatMoney(item.totalAllocated)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <CalendarDays size={15} />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>

                    </div>

                  </div>

                  <ArrowRight
                    className="text-slate-500 self-center"
                    size={20}
                  />

                </div>

              </div>
            </Link>
          ))}

        </div>
      )}
    </div>
  );
};

export default RecentInvestments;