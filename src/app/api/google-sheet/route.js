import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import path from 'path';

export async function POST(request) {
    try {
        const body = await request.json();
        const { loaiXe, ngay, noiDi, giaTien, xang, taiXe, hoaHong } = body;

        // 1. Xác định đường dẫn trỏ thẳng tới file JSON cấu hình ở bước 1
        const credentialsPath = path.join(process.cwd(), 'google-credentials.json');

        // 2. Tự động nạp dữ liệu xác thực từ file JSON gốc (Không sợ lỗi định dạng chuỗi)
        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        
        // ID trang tính Google Sheet của bạn
        const spreadsheetId = "1yLna6sOzhmoo4wHrgE6AhQFanDH83eTaV6YbV4Jxrzg"; 
        
        // Phân phối luồng dữ liệu vào đúng tab theo tên loại xe chọn ngoài UI
        const targetSheetName = loaiXe ? loaiXe.trim() : "Xe 4 chỗ";
        const range = `${targetSheetName}!A:F`; 

        // Đóng gói dữ liệu hàng mảng 2 chiều
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