"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

const defaultStats = {
    currentMonthLabel: "THÁNG 6, 2026",
    vehicleStats: [
        { id: "xe4Thai", name: "Xe 4 Thái", shortName: "4 THÁI", trips: 0, revenue: 0, color: "bg-blue-500" },
        { id: "xe4Hoc", name: "Xe 4 Học", shortName: "4 HỌC", trips: 0, revenue: 0, color: "bg-indigo-400" },
        { id: "xe7Xpander", name: "Xe 7 Xpander", shortName: "7 XPA", trips: 0, revenue: 0, color: "bg-teal-400" },
        { id: "xe7Innova", name: "Xe 7 Innova", shortName: "7 INN", trips: 0, revenue: 0, color: "bg-emerald-400" },
    ],
    totalActiveVehicles: 0,
};

function getCurrentMonthState() {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function getMonthLabel({ year, month }) {
    return `THÁNG ${month}, ${year}`;
}

function moveMonth({ year, month }, offset) {
    const date = new Date(year, month - 1 + offset, 1);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function formatRevenue(value) {
    if (Math.abs(value) < 1_000_000) {
        return new Intl.NumberFormat("vi-VN").format(Math.round(value));
    }

    const millionValue = value / 1_000_000;
    return `${millionValue % 1 === 0 ? millionValue.toFixed(0) : millionValue.toFixed(1)}M`;
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

function MonthToolbar({
    currentMonthLabel,
    totalActiveVehicles,
    isLoading,
    onPreviousMonth,
    onNextMonth,
    onCurrentMonth,
}) {
    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[34px_1fr_34px] items-center gap-2">
                <button
                    type="button"
                    onClick={onPreviousMonth}
                    disabled={isLoading}
                    aria-label="Tháng trước"
                    className="h-8 rounded-xl bg-white border border-slate-200 text-slate-500 shadow-[0_3px_10px_rgba(15,23,42,0.12)] text-[21px] leading-none font-black active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                    ‹
                </button>

                <button
                    type="button"
                    onClick={onCurrentMonth}
                    disabled={isLoading}
                    aria-label="Về tháng hiện tại"
                    className="h-8 rounded-xl bg-white border border-slate-200 shadow-[0_3px_10px_rgba(15,23,42,0.12)] flex items-center justify-center text-blue-600 text-[12px] font-black tracking-[0.08em] active:scale-[0.98] transition-all disabled:opacity-60 disabled:active:scale-100"
                >
                    {currentMonthLabel}
                </button>

                <button
                    type="button"
                    onClick={onNextMonth}
                    disabled={isLoading}
                    aria-label="Tháng sau"
                    className="h-8 rounded-xl bg-white border border-slate-200 text-slate-500 shadow-[0_3px_10px_rgba(15,23,42,0.12)] text-[21px] leading-none font-black active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                    ›
                </button>
            </div>

            <div className="flex items-center justify-between gap-2">
                <div className="min-w-[132px] min-h-9 rounded-lg bg-blue-500 px-3 py-2 text-white shadow-[0_4px_10px_rgba(59,130,246,0.2)] flex items-center justify-center gap-2">
                    <span className="text-[9px] font-black uppercase leading-tight text-blue-100">Tổng xe hoạt động</span>
                    <AnimatedNumber value={totalActiveVehicles} className="text-[18px] font-black leading-none" />
                </div>

                {isLoading && (
                    <div className="h-7 px-2.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-black flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
                        Đang tải
                    </div>
                )}
            </div>
        </div>
    );
}

function MonthlySummary({ vehicleStats, maxTripCount, totalActiveVehicles, isLoading }) {
    const isEmpty = !isLoading && totalActiveVehicles === 0;

    return (
        <motion.div
            key="monthly"
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 18 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="flex flex-col gap-2"
        >
            <section className="hidden rounded-xl bg-blue-500 px-3 py-2 text-white shadow-[0_5px_14px_rgba(59,130,246,0.2)]">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[9px] font-black uppercase text-blue-100 leading-tight">
                            Tổng xe hoạt động
                        </div>
                        <div className="text-[9px] font-bold text-blue-100 mt-0.5">trong tháng</div>
                    </div>
                    <AnimatedNumber
                        value={totalActiveVehicles}
                        className="text-[28px] font-black leading-none"
                    />
                </div>
            </section>

            <section className={`rounded-xl bg-slate-50 border border-slate-200 px-2.5 py-2 shadow-[0_5px_14px_rgba(15,23,42,0.06)] transition-opacity ${isLoading ? "opacity-55" : "opacity-100"}`}>
                <div className="grid grid-cols-[1fr_44px_64px] px-1 pb-1.5 text-[8px] font-black uppercase text-slate-400">
                    <div>Loại xe</div>
                    <div className="text-center">Xe</div>
                    <div className="text-right">Doanh thu</div>
                </div>

                {isEmpty ? (
                    <div className="rounded-lg bg-white border border-slate-100 px-3 py-6 text-center text-[11px] font-bold text-slate-400">
                        Chưa có dữ liệu tháng này
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {vehicleStats.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", damping: 22, stiffness: 260, delay: 0.05 + index * 0.04 }}
                                className="rounded-lg bg-white border border-slate-100 px-2 py-1.5"
                            >
                                <div className="grid grid-cols-[1fr_44px_64px] items-center gap-1">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${item.color}`} />
                                            <span className="text-[10px] font-black text-slate-700 truncate">
                                                {item.name}
                                            </span>
                                        </div>
                                        <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(6, (item.trips / maxTripCount) * 100)}%` }}
                                                transition={{ duration: 0.55, ease: "easeOut", delay: 0.12 + index * 0.04 }}
                                                className={`h-full rounded-full ${item.color}`}
                                            />
                                        </div>
                                    </div>

                                    <AnimatedNumber
                                        value={item.trips}
                                        className="text-center text-[14px] font-black text-blue-600"
                                    />

                                    <AnimatedNumber
                                        value={item.revenue}
                                        formatter={formatRevenue}
                                        className="text-right text-[12px] font-black text-slate-700"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </motion.div>
    );
}

export function StatsPanel() {
    const [stats, setStats] = useState(defaultStats);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthState);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const vehicleStats = stats.vehicleStats;
    const totalActiveVehicles = stats.totalActiveVehicles;
    const maxTripCount = Math.max(...vehicleStats.map((item) => item.trips), 1);

    useEffect(() => {
        let isMounted = true;

        async function loadStats() {
            try {
                setIsLoading(true);
                setError("");

                const params = new URLSearchParams({
                    month: String(selectedMonth.month),
                    year: String(selectedMonth.year),
                });
                const response = await fetch(`/api/stats?${params.toString()}`, { cache: "no-store" });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || "Không thể tải thống kê.");
                }

                if (isMounted) {
                    setStats({
                        currentMonthLabel: result.currentMonthLabel,
                        vehicleStats: result.vehicleStats,
                        totalActiveVehicles: result.totalActiveVehicles,
                    });
                }
            } catch (loadError) {
                console.error("Stats load error:", loadError);
                if (isMounted) setError("Không tải được dữ liệu Sheet");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        loadStats();

        return () => {
            isMounted = false;
        };
    }, [selectedMonth]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="flex-1 flex flex-col"
        >
            <div className="w-[306px] max-w-full mx-auto flex flex-col gap-2 pb-3">
                <MonthToolbar
                    currentMonthLabel={isLoading ? getMonthLabel(selectedMonth) : stats.currentMonthLabel}
                    totalActiveVehicles={totalActiveVehicles}
                    isLoading={isLoading}
                    onPreviousMonth={() => setSelectedMonth((currentMonth) => moveMonth(currentMonth, -1))}
                    onNextMonth={() => setSelectedMonth((currentMonth) => moveMonth(currentMonth, 1))}
                    onCurrentMonth={() => setSelectedMonth(getCurrentMonthState())}
                />

                {error && (
                    <div className="rounded-lg bg-red-50 border border-red-100 px-2.5 py-1 text-[9px] font-bold text-red-500 text-center">
                        {error}
                    </div>
                )}

                <MonthlySummary
                    vehicleStats={vehicleStats}
                    maxTripCount={maxTripCount}
                    totalActiveVehicles={totalActiveVehicles}
                    isLoading={isLoading}
                />
            </div>
        </motion.div>
    );
}
