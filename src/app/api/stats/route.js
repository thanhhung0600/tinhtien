import { NextResponse } from "next/server";
import { google } from "googleapis";
import path from "path";
import fs from "fs";

const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || "1yLna6sOzhmoo4wHrgE6AhQFanDH83eTaV6YbV4Jxrzg";

const vehicleSheets = [
    { id: "xe4Thai", name: "Xe 4 Thái", shortName: "4 THÁI", color: "bg-blue-500" },
    { id: "xe4Hoc", name: "Xe 4 Học", shortName: "4 HỌC", color: "bg-indigo-400" },
    { id: "xe7Xpander", name: "Xe 7 Xpander", shortName: "7 XPA", color: "bg-teal-400" },
    { id: "xe7Innova", name: "Xe 7 Innova", shortName: "7 INN", color: "bg-emerald-400" },
];

function getGoogleAuth() {
    const credentialsPath = path.join(process.cwd(), "google-credentials.json");

    if (fs.existsSync(credentialsPath)) {
        return new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });
    }

    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    if (!credentialsJson) {
        throw new Error("Thiếu google-credentials.json hoặc GOOGLE_CREDENTIALS_JSON.");
    }

    return new google.auth.GoogleAuth({
        credentials: JSON.parse(credentialsJson),
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
}

function quoteSheetName(sheetName) {
    return `'${sheetName.replaceAll("'", "''")}'`;
}

function parseSheetDate(value) {
    if (value === null || value === undefined || value === "") return null;

    if (typeof value === "number") {
        const epoch = Date.UTC(1899, 11, 30);
        return new Date(epoch + value * 24 * 60 * 60 * 1000);
    }

    const text = String(value).trim();
    const isoMatch = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (isoMatch) {
        return new Date(Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])));
    }

    const localMatch = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (localMatch) {
        return new Date(Date.UTC(Number(localMatch[3]), Number(localMatch[2]) - 1, Number(localMatch[1])));
    }

    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseMoney(value) {
    if (typeof value === "number") return value;
    if (value === null || value === undefined || value === "") return 0;

    const normalized = String(value).replace(/[^\d-]/g, "");
    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : 0;
}

function getMonthKey(date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatDateLabel(date) {
    return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

function getRecentMonths(year, monthIndex) {
    return Array.from({ length: 4 }, (_, index) => {
        const date = new Date(Date.UTC(year, monthIndex - 3 + index, 1));
        return {
            key: getMonthKey(date),
            label: `THÁNG ${date.getUTCMonth() + 1}`,
            value: 0,
        };
    });
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const now = new Date();
        const year = Number(searchParams.get("year")) || now.getUTCFullYear();
        const month = Number(searchParams.get("month")) || now.getUTCMonth() + 1;
        const monthIndex = month - 1;
        const currentMonthKey = `${year}-${String(month).padStart(2, "0")}`;
        const monthlyTrend = getRecentMonths(year, monthIndex);
        const trendByMonth = new Map(monthlyTrend.map((item) => [item.key, item]));
        let firstDataDate = null;
        let lastDataDate = null;

        const sheets = google.sheets({ version: "v4", auth: getGoogleAuth() });
        const response = await sheets.spreadsheets.values.batchGet({
            spreadsheetId,
            ranges: vehicleSheets.map((sheet) => `${quoteSheetName(sheet.name)}!A2:G`),
            valueRenderOption: "FORMATTED_VALUE",
            dateTimeRenderOption: "FORMATTED_STRING",
        });

        const valueRanges = response.data.valueRanges || [];

        const vehicleStats = vehicleSheets.map((sheet, sheetIndex) => {
            const rows = valueRanges[sheetIndex]?.values || [];
            let trips = 0;
            let price = 0;
            let fuel = 0;
            let commission = 0;
            let profit = 0;

            rows.forEach((row) => {
                const date = parseSheetDate(row[0]);
                if (!date) return;

                const rowMonthKey = getMonthKey(date);
                const trendItem = trendByMonth.get(rowMonthKey);
                if (trendItem) trendItem.value += 1;

                if (rowMonthKey === currentMonthKey) {
                    const rowPrice = parseMoney(row[2]);
                    const rowFuel = parseMoney(row[3]);
                    const rowCommission = parseMoney(row[5]);
                    const hasProfitCell = row[6] !== null && row[6] !== undefined && row[6] !== "";
                    const rowProfit = hasProfitCell ? parseMoney(row[6]) : rowPrice - rowFuel - rowCommission;

                    if (!firstDataDate || date < firstDataDate) firstDataDate = date;
                    if (!lastDataDate || date > lastDataDate) lastDataDate = date;

                    trips += 1;
                    price += rowPrice;
                    fuel += rowFuel;
                    commission += rowCommission;
                    profit += rowProfit;
                }
            });

            return {
                ...sheet,
                trips,
                price,
                total: profit,
                revenue: profit,
                fuel,
                commission,
                profit,
                averageRevenue: trips > 0 ? profit / trips : 0,
            };
        });

        const totalActiveVehicles = vehicleStats.reduce((sum, item) => sum + item.trips, 0);
        const totals = vehicleStats.reduce(
            (summary, item) => ({
                price: summary.price + item.price,
                revenue: summary.revenue + item.revenue,
                fuel: summary.fuel + item.fuel,
                commission: summary.commission + item.commission,
                profit: summary.profit + item.profit,
                total: summary.total + item.total,
            }),
            { price: 0, revenue: 0, fuel: 0, commission: 0, profit: 0, total: 0 }
        );

        const dateRange = firstDataDate && lastDataDate
            ? {
                from: formatDateLabel(firstDataDate),
                to: formatDateLabel(lastDataDate),
                label: `Dữ liệu từ ngày ${formatDateLabel(firstDataDate)} đến ngày ${formatDateLabel(lastDataDate)}`,
            }
            : {
                from: "",
                to: "",
                label: "Chưa có dữ liệu trong tháng này",
            };
        return NextResponse.json({
            success: true,
            currentMonthLabel: `THÁNG ${month}, ${year}`,
            vehicleStats,
            totalActiveVehicles,
            totals,
            dateRange,
            monthlyTrend,
        });
    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
