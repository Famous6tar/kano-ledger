import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCompactMoney } from "@/lib/format";

export function FlowChart({ data = [] }) {
  return (
    <div className="card-surface overflow-hidden">
      <header className="flex items-center justify-between border-b border-border/70 px-5 py-4">
        <div>
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground">
            Daily flow
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Credit given vs. money in · last 14 days
          </p>
        </div>
      </header>
      <div className="p-4">
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data} barGap={2} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatCompactMoney(v)}
                width={60}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v) => formatCompactMoney(v)}
              />
              <Bar dataKey="credit" name="Credit" fill="hsl(38 92% 50%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="paid" name="Payment" fill="hsl(var(--brand))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-4 text-[0.7rem] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(38 92% 50%)" }} />
            Credit
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            Payment
          </span>
        </div>
      </div>
    </div>
  );
}