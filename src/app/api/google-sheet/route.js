import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
    try {
        const body = await request.json();
        const { loaiXe, ngay, noiDi, giaTien, xang, taiXe, hoaHong } = body;

        let auth;
        
        // 1. KIỂM TRA ĐƯỜNG DẪN FILE JSON DƯỚI LOCALHOST (Tên chuẩn có chữ 's')
        const credentialsPath = path.join(process.cwd(), 'google-credentials.json');

        if (fs.existsSync(credentialsPath)) {
            // NẾU CHẠY LOCAL: Thấy file google-credentials.json -> Đọc file luôn cho chuẩn xác
            auth = new google.auth.GoogleAuth({
                keyFile: credentialsPath,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        } else {
            // NẾU CHẠY VERCEL: Không thấy file vật lý -> Chuyển sang đọc biến môi trường
            const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
            if (!credentialsJson) {
                throw new Error("Không tìm thấy file google-credentials.json dưới local và cũng thiếu biến GOOGLE_CREDENTIALS_JSON trên Vercel!");
            }
            auth = new google.auth.GoogleAuth({
                credentials: JSON.parse(credentialsJson),
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        }

        // 2. Khởi tạo kết nối với dữ liệu bảng tính Google Sheets
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = "1yLna6sOzhmoo4wHrgE6AhQFanDH83eTaV6YbV4Jxrzg"; 
        
        const targetSheetName = loaiXe ? loaiXe.trim() : "Xe 4 chỗ";
        const range = `${targetSheetName}!A:F`; 

        const values = [[ngay, noiDi, giaTien, xang, taiXe, hoaHong]];

        // 3. Tiến hành đẩy dữ liệu lên Google Sheets
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: values
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Google Sheets API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}