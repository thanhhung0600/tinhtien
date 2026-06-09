"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

const defaultStats = {
    currentMonthLabel: "THÁNG 6, 2026",
    vehicleStats: [
        { id: "xe4Thai", name: "Xe 4 Thái", shortName: "4 THÁI", trips: 0, price: 0, total: 0, revenue: 0, fuel: 0, commission: 0, profit: 0, color: "bg-blue-500" },
        { id: "xe4Hoc", name: "Xe 4 Học", shortName: "4 HỌC", trips: 0, price: 0, total: 0, revenue: 0, fuel: 0, commission: 0, profit: 0, color: "bg-indigo-400" },
        { id: "xe7Xpander", name: "Xe 7 Xpander", shortName: "7 XPA", trips: 0, price: 0, total: 0, revenue: 0, fuel: 0, commission: 0, profit: 0, color: "bg-teal-400" },
        { id: "xe7Innova", name: "Xe 7 Innova", shortName: "7 INN", trips: 0, price: 0, total: 0, revenue: 0, fuel: 0, commission: 0, profit: 0, color: "bg-emerald-400" },
    ],
    totalActiveVehicles: 0,
    totals: {
        price: 0,
        revenue: 0,
        fuel: 0,
        commission: 0,
        profit: 0,
        total: 0,
    },
    dateRange: {
        from: "",
        to: "",
        label: "",
    },
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

function formatFullMoney(value) {
    return new Intl.NumberFormat("vi-VN").format(Math.round(value || 0));
}

function formatPercent(value) {
    return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value || 0)}%`;
}

function getSheetTotal(item) {
    return item.total ?? item.profit ?? item.revenue ?? 0;
}

function getSheetPrice(item) {
    return item.price ?? getSheetTotal(item) + (item.fuel ?? 0) + (item.commission ?? 0);
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
    isExporting,
    onPreviousMonth,
    onNextMonth,
    onCurrentMonth,
    onPreviewReport,
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
                    {isLoading ? (
                        <div className="text-[18px] font-black leading-none">-</div>
                    ) : (
                        <AnimatedNumber value={totalActiveVehicles} className="text-[18px] font-black leading-none" />
                    )}
                </div>

                {isLoading && (
                    <div className="h-7 px-2.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-black flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
                        Đang tải
                    </div>
                )}

                {!isLoading && (
                    <button
                        type="button"
                        onClick={onPreviewReport}
                        disabled={isExporting}
                        className="h-7 px-3 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                        {isExporting ? "ĐANG XUẤT" : "PDF"}
                    </button>
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
                    {isLoading ? (
                        <div className="text-[28px] font-black leading-none">-</div>
                    ) : (
                        <AnimatedNumber
                            value={totalActiveVehicles}
                            className="text-[28px] font-black leading-none"
                        />
                    )}
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

                                    {isLoading ? (
                                        <div className="text-center text-[14px] font-black text-blue-600">-</div>
                                    ) : (
                                        <AnimatedNumber
                                            value={item.trips}
                                            className="text-center text-[14px] font-black text-blue-600"
                                        />
                                    )}

                                    {isLoading ? (
                                        <div className="text-right text-[12px] font-black text-slate-700">-</div>
                                    ) : (
                                        <AnimatedNumber
                                            value={item.revenue}
                                            formatter={formatRevenue}
                                            className="text-right text-[12px] font-black text-slate-700"
                                        />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </motion.div>
    );
}

function PdfReport({
    reportRef,
    currentMonthLabel,
    dateRange,
    vehicleStats,
    totalActiveVehicles,
    totals,
    isPreviewOpen,
    isExporting,
    onClosePreview,
    onDownloadPdf,
    previewScale,
}) {
    const reportTotals = {
        price: totals.price ?? vehicleStats.reduce((sum, item) => sum + getSheetPrice(item), 0),
        fuel: totals.fuel ?? vehicleStats.reduce((sum, item) => sum + (item.fuel ?? 0), 0),
        commission: totals.commission ?? vehicleStats.reduce((sum, item) => sum + (item.commission ?? 0), 0),
        total: totals.total ?? totals.profit ?? totals.revenue ?? vehicleStats.reduce((sum, item) => sum + getSheetTotal(item), 0),
    };
    const profitPercent = reportTotals.price > 0 ? (reportTotals.total / reportTotals.price) * 100 : 0;
    const fuelPercent = reportTotals.price > 0 ? (reportTotals.fuel / reportTotals.price) * 100 : 0;
    const commissionPercent = reportTotals.price > 0 ? (reportTotals.commission / reportTotals.price) * 100 : 0;

    return (
        <div
            className={isPreviewOpen ? "fixed inset-0 z-[99990] bg-slate-950/55 backdrop-blur-sm p-3" : "fixed -left-[9999px] top-0 bg-white"}
        >
            <style jsx global>{`
                [data-pdf-report="true"],
                [data-pdf-report="true"] * {
                    -webkit-text-size-adjust: none;
                    text-size-adjust: none;
                }
            `}</style>

            {isPreviewOpen && (
                <div className="h-full flex flex-col gap-3">
                    <div className="shrink-0 rounded-2xl bg-white border border-slate-200 shadow-lg px-3 py-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <div className="text-[13px] font-black text-slate-700 leading-tight">Xem trước báo cáo</div>
                            <div className="text-[10px] font-bold text-slate-400 truncate">{dateRange?.label || currentMonthLabel}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onDownloadPdf}
                                disabled={isExporting}
                                className="h-8 px-3 rounded-xl bg-blue-500 text-white text-[11px] font-black active:scale-95 disabled:opacity-50"
                            >
                                {isExporting ? "ĐANG TẢI" : "TẢI PDF"}
                            </button>
                            <button
                                type="button"
                                onClick={onClosePreview}
                                disabled={isExporting}
                                aria-label="Đóng xem trước"
                                className="h-8 w-8 rounded-xl bg-slate-100 text-slate-600 text-[18px] font-black active:scale-95 disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-auto rounded-2xl bg-slate-200/80 p-2 sm:p-3">
                        <div
                            className="mx-auto"
                            style={{
                                width: 794 * previewScale,
                                height: 1123 * previewScale,
                                minHeight: 0,
                            }}
                        >
                            <div
                                className="origin-top-left shadow-2xl"
                                style={{
                                    width: 794,
                                    transform: `scale(${previewScale})`,
                                    transformOrigin: "top left",
                                }}
                            >
                                <PdfReportContent
                                    reportRef={reportRef}
                                    currentMonthLabel={currentMonthLabel}
                                    dateRange={dateRange}
                                    vehicleStats={vehicleStats}
                                    totalActiveVehicles={totalActiveVehicles}
                                    reportTotals={reportTotals}
                                    profitPercent={profitPercent}
                                    fuelPercent={fuelPercent}
                                    commissionPercent={commissionPercent}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isPreviewOpen && (
                <PdfReportContent
                    reportRef={reportRef}
                    currentMonthLabel={currentMonthLabel}
                    dateRange={dateRange}
                    vehicleStats={vehicleStats}
                    totalActiveVehicles={totalActiveVehicles}
                    reportTotals={reportTotals}
                    profitPercent={profitPercent}
                    fuelPercent={fuelPercent}
                    commissionPercent={commissionPercent}
                />
            )}
        </div>
    );
}

function PdfReportContent({
    reportRef,
    currentMonthLabel,
    dateRange,
    vehicleStats,
    totalActiveVehicles,
    reportTotals,
    profitPercent,
    fuelPercent,
    commissionPercent,
}) {
    return (
            <div
                ref={reportRef}
                data-pdf-report="true"
                style={{
                    width: 794,
                    minHeight: 1123,
                    padding: 48,
                    background: "#ffffff",
                    color: "#0f172a",
                    fontFamily: '"Segoe UI", Arial, Tahoma, sans-serif',
                    WebkitFontSmoothing: "antialiased",
                    WebkitTextSizeAdjust: "none",
                    textSizeAdjust: "none",
                    textRendering: "geometricPrecision",
                    lineHeight: 1.2,
                }}
            >
                <div style={{ borderBottom: "3px solid #2563eb", paddingBottom: 18, marginBottom: 28 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>
                        Báo cáo thống kê xe
                    </div>
                    <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: "#475569" }}>
                        {dateRange?.label || currentMonthLabel}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                    <div style={{ border: "1px solid #dbeafe", borderRadius: 12, padding: 18, background: "#eff6ff" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                            Tổng xe hoạt động
                        </div>
                        <div style={{ marginTop: 8, fontSize: 34, fontWeight: 900, color: "#2563eb" }}>
                            {totalActiveVehicles}
                        </div>
                    </div>

                    <div style={{ position: "relative", border: "1px solid #dcfce7", borderRadius: 12, padding: 18, background: "#f0fdf4" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                            Lợi nhuận
                        </div>
                        <div style={{ marginTop: 8, fontSize: 30, fontWeight: 900, color: "#16a34a" }}>
                            {formatFullMoney(reportTotals.total)}
                        </div>
                        <div style={{ position: "absolute", right: 12, bottom: 10, fontSize: 12, fontWeight: 900, color: "#16a34a" }}>
                            {formatPercent(profitPercent)}
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
                    <div style={{ position: "relative", border: "1px solid #fde68a", borderRadius: 10, padding: 14, background: "#fffbeb" }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                            Tổng giá tiền
                        </div>
                        <div style={{ marginTop: 6, fontSize: 20, fontWeight: 900, color: "#d97706" }}>
                            {formatFullMoney(reportTotals.price)}
                        </div>
                        <div style={{ position: "absolute", right: 10, bottom: 8, fontSize: 10, fontWeight: 900, color: "#d97706" }}>
                            100%
                        </div>
                    </div>
                    <div style={{ position: "relative", border: "1px solid #ddd6fe", borderRadius: 10, padding: 14, background: "#f5f3ff" }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                            Tiền xăng
                        </div>
                        <div style={{ marginTop: 6, fontSize: 20, fontWeight: 900, color: "#7c3aed" }}>
                            {formatFullMoney(reportTotals.fuel)}
                        </div>
                        <div style={{ position: "absolute", right: 10, bottom: 8, fontSize: 10, fontWeight: 900, color: "#7c3aed" }}>
                            {formatPercent(fuelPercent)}
                        </div>
                    </div>
                    <div style={{ position: "relative", border: "1px solid #bbf7d0", borderRadius: 10, padding: 14, background: "#f0fdf4" }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                            Hoa hồng
                        </div>
                        <div style={{ marginTop: 6, fontSize: 20, fontWeight: 900, color: "#16a34a" }}>
                            {formatFullMoney(reportTotals.commission)}
                        </div>
                        <div style={{ position: "absolute", right: 10, bottom: 8, fontSize: 10, fontWeight: 900, color: "#16a34a" }}>
                            {formatPercent(commissionPercent)}
                        </div>
                    </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: "#f1f5f9" }}>
                            <th style={{ textAlign: "left", padding: 12, border: "1px solid #e2e8f0" }}>Loại xe</th>
                            <th style={{ textAlign: "center", padding: 12, border: "1px solid #e2e8f0" }}>Chuyến</th>
                            <th style={{ textAlign: "right", padding: 12, border: "1px solid #e2e8f0" }}>Giá tiền</th>
                            <th style={{ textAlign: "right", padding: 12, border: "1px solid #e2e8f0" }}>Xăng</th>
                            <th style={{ textAlign: "right", padding: 12, border: "1px solid #e2e8f0" }}>Hoa hồng</th>
                            <th style={{ textAlign: "right", padding: 12, border: "1px solid #e2e8f0" }}>Lợi nhuận</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicleStats.map((item) => (
                            <tr key={item.id}>
                                <td style={{ padding: 12, border: "1px solid #e2e8f0", fontWeight: 700 }}>
                                    {item.name}
                                </td>
                                <td style={{ padding: 12, border: "1px solid #e2e8f0", textAlign: "center", fontWeight: 800 }}>
                                    {item.trips}
                                </td>
                                <td style={{ padding: 12, border: "1px solid #e2e8f0", textAlign: "right", fontWeight: 800 }}>
                                    {formatFullMoney(getSheetPrice(item))}
                                </td>
                                <td style={{ padding: 12, border: "1px solid #e2e8f0", textAlign: "right", fontWeight: 800 }}>
                                    {formatFullMoney(item.fuel)}
                                </td>
                                <td style={{ padding: 12, border: "1px solid #e2e8f0", textAlign: "right", fontWeight: 800 }}>
                                    {formatFullMoney(item.commission)}
                                </td>
                                <td style={{ padding: 12, border: "1px solid #e2e8f0", textAlign: "right", fontWeight: 800 }}>
                                    {formatFullMoney(getSheetTotal(item))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ marginTop: 28, fontSize: 12, color: "#64748b" }}>
                    Báo cáo được xuất từ ứng dụng nhập liệu.
                </div>
            </div>
    );
}

export function StatsPanel() {
    const [stats, setStats] = useState(defaultStats);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthState);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewScale, setPreviewScale] = useState(1);
    const [error, setError] = useState("");
    const [pdfStats, setPdfStats] = useState(defaultStats);
    const reportRef = useRef(null);
    const vehicleStats = stats.vehicleStats;
    const totalActiveVehicles = stats.totalActiveVehicles;
    const totals = stats.totals || defaultStats.totals;
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
                    const nextStats = {
                        currentMonthLabel: result.currentMonthLabel,
                        vehicleStats: result.vehicleStats,
                        totalActiveVehicles: result.totalActiveVehicles,
                        totals: result.totals || defaultStats.totals,
                        dateRange: result.dateRange || defaultStats.dateRange,
                    };

                    setStats(nextStats);
                    setPdfStats(nextStats);
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

    useEffect(() => {
        if (!isPreviewOpen) return;

        const updatePreviewScale = () => {
            const viewportWidth = window.visualViewport?.width || window.innerWidth;
            const availableWidth = Math.max(280, viewportWidth - 40);
            setPreviewScale(Math.min(1, availableWidth / 794));
        };

        updatePreviewScale();
        window.addEventListener("resize", updatePreviewScale);
        window.visualViewport?.addEventListener("resize", updatePreviewScale);

        return () => {
            window.removeEventListener("resize", updatePreviewScale);
            window.visualViewport?.removeEventListener("resize", updatePreviewScale);
        };
    }, [isPreviewOpen]);

    const refreshPdfStats = async () => {
        const params = new URLSearchParams({
            month: String(selectedMonth.month),
            year: String(selectedMonth.year),
        });
        const response = await fetch(`/api/stats?${params.toString()}&pdf=${Date.now()}`, { cache: "no-store" });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || "Không tải được dữ liệu PDF.");
        }

        setPdfStats({
            currentMonthLabel: result.currentMonthLabel,
            vehicleStats: result.vehicleStats,
            totalActiveVehicles: result.totalActiveVehicles,
            totals: result.totals || defaultStats.totals,
            dateRange: result.dateRange || defaultStats.dateRange,
        });
    };

    const openPdfPreview = async () => {
        if (isExporting || isLoading) return;

        try {
            setIsExporting(true);
            await refreshPdfStats();
            const viewportWidth = window.visualViewport?.width || window.innerWidth;
            const availableWidth = Math.max(280, viewportWidth - 40);
            setPreviewScale(Math.min(1, availableWidth / 794));
            setIsPreviewOpen(true);
        } catch (previewError) {
            console.error("PDF preview error:", previewError);
            setError("Không tải được bản xem trước PDF");
        } finally {
            setIsExporting(false);
        }
    };

    const downloadPdfReport = async () => {
        if (!reportRef.current || isExporting || isLoading) return;

        try {
            setIsExporting(true);
            await refreshPdfStats();

            if (document.fonts?.ready) {
                await document.fonts.ready;
            }

            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
                import("html2canvas"),
                import("jspdf"),
            ]);
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                backgroundColor: "#ffffff",
                useCORS: true,
                onclone: (clonedDocument) => {
                    const report = clonedDocument.querySelector("[data-pdf-report='true']");
                    if (report) {
                        report.style.fontFamily = '"Segoe UI", Arial, Tahoma, sans-serif';
                        report.style.webkitTextSizeAdjust = "none";
                        report.style.textSizeAdjust = "none";
                        report.style.lineHeight = "1.2";
                    }
                },
            });
            const imageData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const imageWidth = pageWidth - margin * 2;
            const imageHeight = (canvas.height * imageWidth) / canvas.width;
            const renderedHeight = Math.min(imageHeight, pageHeight - margin * 2);

            pdf.addImage(imageData, "PNG", margin, margin, imageWidth, renderedHeight);
            pdf.save(`bao-cao-${stats.currentMonthLabel.toLowerCase().replaceAll(" ", "-").replace(",", "")}.pdf`);
        } catch (exportError) {
            console.error("PDF export error:", exportError);
            setError("Không xuất được PDF");
        } finally {
            setIsExporting(false);
        }
    };

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
                    isExporting={isExporting}
                    onPreviousMonth={() => setSelectedMonth((currentMonth) => moveMonth(currentMonth, -1))}
                    onNextMonth={() => setSelectedMonth((currentMonth) => moveMonth(currentMonth, 1))}
                    onCurrentMonth={() => setSelectedMonth(getCurrentMonthState())}
                    onPreviewReport={openPdfPreview}
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

                <PdfReport
                    reportRef={reportRef}
                    currentMonthLabel={pdfStats.currentMonthLabel}
                    dateRange={pdfStats.dateRange}
                    vehicleStats={pdfStats.vehicleStats}
                    totalActiveVehicles={pdfStats.totalActiveVehicles}
                    totals={pdfStats.totals || defaultStats.totals}
                    isPreviewOpen={isPreviewOpen}
                    isExporting={isExporting}
                    onClosePreview={() => setIsPreviewOpen(false)}
                    onDownloadPdf={downloadPdfReport}
                    previewScale={previewScale}
                />
            </div>
        </motion.div>
    );
}
