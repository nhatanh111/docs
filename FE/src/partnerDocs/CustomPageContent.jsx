import React from 'react';
import { FIELD_DICTIONARY, ERROR_CODES_DATA } from '../MockData';

export default function CustomPageContent({ type }) {
  if (type === "overview") {
    return (
      <div className="space-y-6 text-left">
        <p className="text-sm text-slate-600 leading-relaxed">
          Chào mừng đối tác đến với tài liệu kỹ thuật tích hợp cổng thông tin điện tử bảo hiểm <strong>A Hub</strong>. Hệ thống hỗ trợ xử lý luồng tính toán phí và phát hành ấn chỉ tự động kết nối Core Insurance của PVI Đông Đô.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-slate-200 bg-slate-50 rounded-xl p-4">
            <div className="font-bold text-slate-800 text-xs uppercase mb-1">Môi trường Sandbox</div>
            <code className="text-blue-600 font-mono text-xs break-all block">https://sandbox-api.pvi.vn</code>
          </div>
          <div className="border border-slate-200 bg-slate-50 rounded-xl p-4">
            <div className="font-bold text-slate-800 text-xs uppercase mb-1">Môi trường Production</div>
            <code className="text-emerald-600 font-mono text-xs break-all block">https://api.pvi.vn</code>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
          <strong className="block mb-1 font-bold">📌 Lưu ý tích hợp:</strong>
          Mọi cổng payload gửi lên đều bắt buộc mã hóa định dạng UTF-8, cấu trúc JSON ứng với phương thức giao dịch POST bảo mật.
        </div>
      </div>
    );
  }

  if (type === "headers") {
    return (
      <div className="space-y-4 text-left">
        <p className="text-xs text-slate-600">Mọi cuộc gọi API lõi nghiệp vụ từ phía Đối tác đều bắt buộc phải khai báo cấu hình danh sách HTTP Headers dưới đây:</p>
        <pre className="bg-slate-50 border p-4 rounded-xl font-mono text-xs text-slate-700 leading-relaxed">{`{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer eyJhbGciOiJIUzI1Ni...",\n  "CpId": "PARTNER_ID_AN_BIEN",\n  "Sign": "8cc21a24890c2918bb1237a892b11a12"\n}`}</pre>
      </div>
    );
  }

  if (type === "dictionary") {
    return (
      <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm text-left">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3 font-semibold text-slate-700 text-left">Trường (Field Key)</th>
              <th className="p-3 font-semibold text-slate-700 text-left">Ý nghĩa giải nghĩa tham số hệ thống</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {Object.entries(FIELD_DICTIONARY).map(([key, desc]) => (
              <tr key={key} className="hover:bg-slate-50/40">
                <td className="p-3 font-mono font-bold text-slate-900">{key}</td>
                <td className="p-3 text-slate-600 font-medium">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "error-codes") {
    return (
      <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm text-left">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3 font-semibold text-slate-700 w-24 text-center">Mã Code</th>
              <th className="p-3 font-semibold text-slate-700 text-left">Định nghĩa chi tiết lỗi nghiệp vụ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ERROR_CODES_DATA.map(([code, desc]) => (
              <tr key={code} className="hover:bg-slate-50/40">
                <td className="p-3 font-mono font-bold text-red-600 text-center bg-slate-50/30">{code}</td>
                <td className="p-3 font-medium text-slate-600 text-left">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "changelog") {
    return (
      <div className="space-y-4 text-left font-sans">
        <div className="border rounded-xl p-4 bg-slate-50/50">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-bold text-slate-900 text-sm">v1.3.0 Stable Release</span>
            <span className="bg-emerald-50 text-emerald-600 text-[9px] px-1.5 py-0.5 rounded font-black border border-emerald-100">LATEST</span>
          </div>
          <ul className="list-disc ml-5 text-xs text-slate-600 space-y-1">
            <li>Cập nhật bổ sung 10 API nghiệp vụ: Khai báo bồi thường, Đối soát kế toán, CRM, Tái bảo hiểm.</li>
            <li>Tối ưu cơ chế Validate kiểm tra trường dữ liệu (Validation Limits) trên Sandbox Portal.</li>
          </ul>
        </div>
        <div className="border rounded-xl p-4 bg-slate-50/20">
          <span className="font-bold text-slate-800 text-xs block mb-1">v1.2.0 Release</span>
          <p className="text-xs text-slate-500">Mã hóa nâng cao tốc độ tải file PDF chứng nhận điện tử Core Insurance.</p>
        </div>
      </div>
    );
  }

  return null;
}
