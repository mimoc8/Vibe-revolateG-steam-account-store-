"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis dataKey="name" stroke="#666" tick={{ fill: "#999" }} />
        <YAxis stroke="#666" tick={{ fill: "#999" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderColor: "rgba(0, 255, 255, 0.3)",
            boxShadow: "0 0 10px rgba(0, 255, 255, 0.2)",
            color: "#fff",
          }}
          itemStyle={{ color: "#0ff" }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#0ff"
          strokeWidth={3}
          dot={{ fill: "#0ff", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: "#fff" }}
          style={{
            filter: "drop-shadow(0px 0px 8px rgba(0, 255, 255, 0.8))",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
