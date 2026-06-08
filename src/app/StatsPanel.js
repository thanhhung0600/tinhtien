"use client";

import { useEffect, useState } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";

const currentMonthLabel = "THÁNG 6, 2026";
const maxVehicleBarHeight = 66;
const maxTrendBarHeight = 68;
const trendChartHeight = 132;
const trendChartWidth = 272;
const trendChartHorizontalPadding = 28;

const vehicleCounts = {
    xe4Thai: 18,
    xe4Hoc: 4,
    xe7Xpander: 19,
    xe7Innova: 3,
};

const totalActiveVehicles = 45;
const monthlyRevenue = 128_500_000;

const vehicleStats = [
    { label: ["4", "THÁI"], value: vehicleCounts.xe4Thai, color: "bg-blue-500" },
    { label: ["4", "HỌC"], value: vehicleCounts.xe4Hoc, color: "bg-indigo-400" },
    { label: ["7", "XPA"], value: vehicleCounts.xe7Xpander, color: "bg-teal-400" },
    { label: ["7", "INN"], value: vehicleCounts.xe7Innova, color: "bg-emerald-400" },
];

const monthlyTrend = [
    { label: "THÁNG 3", value: 8 },
    { label: "THÁNG 4", value: 14 },
    { label: "THÁNG 5", value: 22 },
    { label: "THÁNG 6", value: totalActiveVehicles },
];

const maxVehicleCount = Math.max(...vehicleStats.map((item) => item.value), 1);
const maxTrendValue = Math.max(...monthlyTrend.map((item) => item.value), 1);

function getBarHeight(value, maxValue, maxHeight) {
    if (value <= 0) return 0;
    return Math.max(8, Math.round((value / maxValue) * maxHeight));
}

function formatRevenue(value) {
    const millionValue = value / 1_000_000;
    return `${millionValue % 1 === 0 ? millionValue.toFixed(0) : millionValue.toFixed(1)}M`;
}

function getTrendPoint(index, value) {
    const usableWidth = trendChartWidth - trendChartHorizontalPadding * 2;
    const x = trendChartHorizontalPadding + (usableWidth / (monthlyTrend.length - 1)) * index;
    const barHeight = getBarHeight(value, maxTrendValue, maxTrendBarHeight);
    const y = trendChartHeight - barHeight - 1;

    return { x, y, barHeight };
}

function AnimatedNumber({ value, className, formatter = Math.round }) {
    const motionValue = useMotionValue(0);
    const displayValue = useTransform(motionValue, (latest) => formatter(latest));

    useEffect(() => {
        const controls = animate(motionValue, value, {
            duration: 0.9,
            ease: "easeOut",
        });

        return controls.stop;
    }, [motionValue, value]);

    return <motion.div className={className}>{displayValue}</motion.div>;
}

function MonthToolbar({ mode, onToggleMode }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[34px_1fr_34px] items-center gap-2">
                <button
                    type="button"
                    aria-label="Tháng trước"
                    className="h-8 rounded-xl bg-white border border-slate-200 text-slate-500 shadow-[0_3px_10px_rgba(15,23,42,0.12)] text-[21px] leading-none font-black active:scale-95"
                >
                    ‹
                </button>

                <div className="h-8 rounded-xl bg-white border border-slate-200 shadow-[0_3px_10px_rgba(15,23,42,0.12)] flex items-center justify-center text-blue-600 text-[12px] font-black tracking-[0.08em]">
                    {currentMonthLabel}
                </div>

                <button
                    type="button"
                    aria-label="Tháng sau"
                    className="h-8 rounded-xl bg-white border border-slate-200 text-slate-500 shadow-[0_3px_10px_rgba(15,23,42,0.12)] text-[21px] leading-none font-black active:scale-95"
                >
                    ›
                </button>
            </div>

            <button
                type="button"
                onClick={onToggleMode}
                className="self-end h-7 px-3 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black active:scale-95 transition-all"
            >
                {mode === "monthly" ? "XU HƯỚNG" : "THÁNG NÀY"}
            </button>
        </div>
    );
}

function MonthlySummary() {
    return (
        <motion.div
            key="monthly"
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 18 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="grid grid-cols-[170px_128px] gap-2"
        >
            <section className="rounded-xl bg-slate-50 border border-slate-200 px-2 pt-2 pb-1.5 shadow-[0_5px_14px_rgba(15,23,42,0.06)]">
                <div className="h-[96px] flex items-end justify-between gap-1 border-b border-slate-200">
                    {vehicleStats.map((item) => (
                        <div
                            key={item.label.join("-")}
                            className="flex-1 h-full flex flex-col items-center justify-end min-w-0"
                        >
                            <AnimatedNumber
                                value={item.value}
                                className="text-[10px] font-black text-slate-700 mb-1"
                            />
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{
                                    height: getBarHeight(item.value, maxVehicleCount, maxVehicleBarHeight),
                                }}
                                transition={{ type: "spring", damping: 18, stiffness: 140, delay: 0.08 }}
                                className={`w-4 ${item.color} rounded-t-lg`}
                            />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-4 gap-0.5 pt-1.5">
                    {vehicleStats.map((item) => (
                        <div
                            key={item.label.join("-")}
                            className="text-center text-[7px] font-black text-slate-500 leading-[0.95] min-w-0"
                        >
                            <span className="block">{item.label[0]}</span>
                            <span className="block">{item.label[1]}</span>
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid grid-rows-2 gap-2">
                <section className="rounded-xl bg-blue-500 px-3 py-2 text-white shadow-[0_5px_14px_rgba(59,130,246,0.2)]">
                    <div className="text-[9px] font-black uppercase text-blue-100 leading-tight">
                        Xe hoạt động
                    </div>
                    <AnimatedNumber
                        value={totalActiveVehicles}
                        className="text-[24px] font-black leading-none mt-1.5"
                    />
                    <div className="text-[9px] font-bold text-blue-100 mt-0.5">trong tháng</div>
                </section>

                <section className="rounded-xl bg-emerald-400 px-3 py-2 text-white shadow-[0_5px_14px_rgba(16,185,129,0.18)]">
                    <div className="text-[9px] font-black uppercase text-emerald-50 leading-tight">
                        Doanh thu
                    </div>
                    <AnimatedNumber
                        value={monthlyRevenue}
                        formatter={formatRevenue}
                        className="text-[18px] font-black leading-none mt-1.5"
                    />
                    <div className="text-[9px] font-bold text-emerald-50 mt-0.5">tạm tính</div>
                </section>
            </div>
        </motion.div>
    );
}

function TrendSummary() {
    const trendPoints = monthlyTrend.map((item, index) => getTrendPoint(index, item.value));

    return (
        <motion.section
            key="trend"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="rounded-xl bg-slate-50 border border-slate-200 px-2.5 pt-2 pb-1.5 shadow-[0_5px_14px_rgba(15,23,42,0.06)]"
        >
            <div className="text-[10px] font-black text-slate-400 mb-1">
                XU HƯỚNG 4 THÁNG: <span className="text-blue-600">TỔNG HỢP</span>
            </div>

            <div className="relative h-[132px] border-b border-slate-200">
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-0"
                    viewBox={`0 0 ${trendChartWidth} ${trendChartHeight}`}
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <motion.polyline
                        points={trendPoints.map((point) => `${point.x},${point.y}`).join(" ")}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.65, ease: "easeOut", delay: 0.18 }}
                    />
                </svg>

                {monthlyTrend.map((item, index) => {
                    const point = trendPoints[index];

                    return (
                    <div
                        key={item.label}
                        className="absolute bottom-0 z-10 flex flex-col items-center"
                        style={{ left: `${(point.x / trendChartWidth) * 100}%`, transform: "translateX(-50%)" }}
                    >
                        <AnimatedNumber value={item.value} className="text-[10px] font-black text-slate-700 mb-1" />
                        <div className="relative flex items-end justify-center">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{
                                    height: point.barHeight,
                                }}
                                transition={{
                                    type: "spring",
                                    damping: 18,
                                    stiffness: 140,
                                    delay: 0.12 + index * 0.04,
                                }}
                                className="w-4 rounded-t-lg bg-slate-400"
                            />
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4 + index * 0.04, type: "spring", damping: 12 }}
                                className="absolute -top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100"
                            />
                        </div>
                    </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-4 pt-1.5">
                {monthlyTrend.map((item) => (
                    <div key={item.label} className="text-center text-[8px] font-black text-slate-500">
                        {item.label}
                    </div>
                ))}
            </div>
        </motion.section>
    );
}

export function StatsPanel() {
    const [mode, setMode] = useState("monthly");

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="flex-1 flex flex-col"
        >
            <div className="w-[306px] max-w-full mx-auto flex flex-col gap-2">
                <MonthToolbar
                    mode={mode}
                    onToggleMode={() => setMode((currentMode) => (currentMode === "monthly" ? "trend" : "monthly"))}
                />

                <AnimatePresence mode="wait" initial={false}>
                    {mode === "monthly" ? <MonthlySummary /> : <TrendSummary />}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
