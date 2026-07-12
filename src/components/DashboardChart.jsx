import { useState, useEffect } from "react";
import { Skeleton, message } from "antd";
import { fetchDashboardAnalyticsChart } from "../api/analyticsApi";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatMoney = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const DashboardChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChart = async () => {
    try {
      setLoading(true);

      const response = await fetchDashboardAnalyticsChart();

    //   console.log("Chart Response:", response);

      if (!response.success) {
        throw new Error("Unable to load chart.");
      }

      const capitalGrowth = response.charts.capitalGrowth;

      const formattedData = capitalGrowth.labels.map((month, index) => ({
        month,
        amount: capitalGrowth.capital[index],
        companyProfit: capitalGrowth.companyProfit[index],
        investorProfit: capitalGrowth.investorProfit[index],
      }));

      setChartData(formattedData);
    } catch (error) {
      console.error(error);

      message.error(
        error.message || "Failed to load dashboard chart."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChart();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1F2937] border border-slate-800 rounded-2xl p-6">
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: 180 }} />

        <Skeleton.Image
          active
          style={{
            width: "100%",
            height: 320,
            marginTop: 20,
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#1F2937] border border-slate-800 rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-white text-lg font-semibold">
          Monthly Capital Raised
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          Capital invested into the platform every month.
        </p>
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="capital" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#10B981"
                  stopOpacity={0.5}
                />

                <stop
                  offset="95%"
                  stopColor="#10B981"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tickFormatter={(value) =>
                value === 0
                  ? "₦0"
                  : `₦${(value / 1000000).toFixed(1)}M`
              }
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              formatter={(value) => formatMoney(value)}
              contentStyle={{
                background: "#111827",
                border: "1px solid #334155",
                borderRadius: 12,
                color: "#fff",
              }}
            />

            <Area
              type="monotone"
              dataKey="amount"
              stroke="#10B981"
              strokeWidth={3}
              fill="url(#capital)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;