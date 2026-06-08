"use client";

const GOOGLE_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/1yLna6sOzhmoo4wHrgE6AhQFanDH83eTaV6YbV4Jxrzg/edit?gid=0#gid=0";

export const APP_TABS = {
    INPUT: "input",
    STATS: "stats",
};

export function AppTabs({ activeTab, onTabChange }) {
    const textTabs = [
        { id: APP_TABS.INPUT, label: "NHẬP LIỆU" },
        { id: APP_TABS.STATS, label: "THỐNG KÊ" },
    ];

    return (
        <div className="relative z-20 flex items-end gap-1 w-full max-w-[360px] overflow-visible pl-7 pr-7">
            {textTabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange(tab.id)}
                        className={`w-[108px] text-[13px] font-black tracking-[0.1em] transition-all active:scale-[0.98] ${
                            isActive
                                ? "h-[52px] bg-white text-blue-600 rounded-t-[22px] rounded-b-none shadow-none pb-2"
                                : "h-11 bg-blue-500 text-white rounded-full shadow-[0_8px_20px_rgba(59,130,246,0.24)] mb-2 hover:bg-blue-600"
                        }`}
                    >
                        {tab.label}
                    </button>
                );
            })}

            <a
                href={GOOGLE_SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto mb-2 w-11 h-11 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(59,130,246,0.24)] active:scale-95 transition-all"
                title="Mở Google Sheet"
                aria-label="Mở Google Sheet"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                </svg>
            </a>
        </div>
    );
}
