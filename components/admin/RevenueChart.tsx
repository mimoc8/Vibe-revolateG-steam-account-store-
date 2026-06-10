"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}tr`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toString();
};

export default function RevenueChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ff" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#0ff" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#666" 
          tick={{ fill: "#999", fontSize: 12 }} 
          tickLine={false}
          axisLine={{ stroke: '#333' }}
        />
        <YAxis 
          stroke="#666" 
          tick={{ fill: "#999", fontSize: 12 }} 
          tickFormatter={formatCurrency}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(10, 10, 10, 0.9)",
            borderColor: "rgba(0, 255, 255, 0.2)",
            boxShadow: "0 0 20px rgba(0, 255, 255, 0.15)",
            color: "#fff",
            borderRadius: "8px",
          }}
          itemStyle={{ color: "#0ff", fontWeight: "bold" }}
          formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} đ`, "Doanh thu"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#0ff"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorRevenue)"
          activeDot={{ r: 6, fill: "#fff", stroke: "#0ff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
