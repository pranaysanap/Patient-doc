"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const heartData = [
    { time: "10:00", bpm: 72 },
    { time: "10:05", bpm: 75 },
    { time: "10:10", bpm: 78 },
    { time: "10:15", bpm: 74 },
    { time: "10:20", bpm: 71 },
    { time: "10:25", bpm: 73 },
    { time: "10:30", bpm: 76 },
];

export default function HeartRateChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={heartData}>
                <defs>
                    <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                />
                <Area type="monotone" dataKey="bpm" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorBpm)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
