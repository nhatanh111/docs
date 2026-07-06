// src/MockData.js

export const VALIDATION_LIMITS = {
  so_cho: { min: 1, max: 50, label: "1 đến 50 chỗ" },
  ChoNgoi: { min: 1, max: 50, label: "1 đến 50 chỗ" },
  SoNguoiToiDa: { min: 1, max: 50, label: "1 đến 50 người" },
  so_nguoi: { min: 1, max: 50, label: "1 đến 50 người" },
  so_nguoi_tgia_laiphu: { min: 1, max: 50, label: "1 đến 50 người" },
  mtn_laiphu: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  MTNLaiPhu: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  muc_trachnhiem_laiphu: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  PhiBHLaiPhu: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  PhiBHTNDSBB: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  phi_tndsbb: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  phi_lpx: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  phi_moto: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  phi_laiphu: { min: 0, max: 200000000, label: "Tối đa 200M VNĐ" },
  TongPhi: { min: 1, max: 500000000, label: "1 đến 500M VNĐ" },
  TotalFee: { min: 1, max: 500000000, label: "1 đến 500M VNĐ" }
};

export const DEFAULT_ENDPOINTS = [
  {
    id: "auth-api-keys",
    category: "portal.categories.auth",
    method: "POST",
    path: "/api/pvi/v1/oauth2/token",
    description: "portal.endpoints.auth_token",
    requestSample: { client_id: "PARTNER_ANBIEN_ID", client_secret: "pvi_secret_key_abc123", grant_type: "client_credentials" },
    responseFormat: { status: "success", access_token: "eyJhbGciOiJIUzI1Ni...", expires_in: 86400, token_type: "Bearer" }
  },
  {
    id: "auth-signature",
    category: "portal.categories.auth",
    method: "HASH",
    path: "Thuật toán băm: MD5",
    description: "portal.endpoints.auth_signature",
    isCustomPage: true,
    pageType: "signature"
  },
  {
    id: "auth-headers",
    category: "portal.categories.auth",
    method: "INFO",
    path: "HTTP Headers bắt buộc kèm theo",
    description: "portal.endpoints.auth_headers",
    isCustomPage: true,
    pageType: "headers"
  },
  {
    id: "api-calculate-premium-moto",
    category: "portal.categories.moto",
    method: "POST",
    path: "/api/pvi/v1/insurance/moto/calculate",
    description: "portal.endpoints.moto_calc",
    requestSample: { CpId: "nguyễn văn a", Sign: "7ac110780f2d5902", loai_xe: "MOTO_01", muc_trachnhiem_laiphu: 20000000, so_nguoi_tgia_laiphu: 2 },
    responseFormat: { Status: "00", Message: "Tính phí xe máy thành công", Data: { phi_moto: 66000, phi_laiphu: 40000, TongPhi: 106000 } }
  },
  {
    id: "api-insert-moto",
    category: "portal.categories.moto",
    method: "POST",
    path: "/api/pvi/v1/insurance/insert-moto",
    description: "portal.endpoints.moto_insert",
    requestSample: { CpId: "nguyễn văn a", Sign: "b2c3d4e5f6g7h8i9", ten_nguoimua_bh: "Trần Thị B", so_dienthoai: "0912345678", TongPhi: 106000, ma_giaodich: "GD_MOTO_992" },
    responseFormat: { Status: "00", Message: "Cấp đơn xe máy thành công", TotalFee: 106000, Data: { so_gcn: "GCN/MOTO/2026/002" } }
  },
  {
    id: "api-calculate-premium-oto",
    category: "portal.categories.oto",
    method: "POST",
    path: "/api/pvi/v1/insurance/calculate-premium",
    description: "portal.endpoints.oto_calc",
    requestSample: { CpId: "nguyễn văn a", Sign: "41d8e12a0f2d5902", ma_loaixe: "X01", so_cho: 5, thamgia_laiphu: true, so_nguoi: 5, mtn_laiphu: 50000000 },
    responseFormat: { Status: "00", Message: "Tính phí ô tô thành công", Data: { PhiBHTNDSBB: 437000, PhiBHLaiPhu: 100000, ThueVAT: 53700, TongPhi: 590700 } }
  },
  {
    id: "api-insert-oto",
    category: "portal.categories.oto",
    method: "POST",
    path: "/api/pvi/v1/insurance/insert-oto",
    description: "portal.endpoints.oto_insert",
    requestSample: { CpId: "nguyễn văn a", Sign: "a1b2c3d4e5f6g7h8", TenKH: "Nguyễn Văn A", DienThoai: "0901234567", ChoNgoi: 5, TongPhi: 590700, SoKhung: "RLH43219876", SoMay: "2AZ123456" },
    responseFormat: { Status: "00", Message: "Cấp đơn ô tô thành công", TotalFee: 590700, Data: { ma_giaodich: "GD_OTO_2026_01", so_gcn: "GCN/OTO/2026/001", Pr_key: 1256789 } }
  },
  {
    id: "api-get-car-categories",
    category: "portal.categories.catalog",
    method: "POST",
    path: "/api/pvi/v1/categories/vehicle",
    description: "portal.endpoints.catalog_vehicle",
    requestSample: { CpId: "nguyễn văn a", Sign: "9cb100780f2d5902", type: "OTO" },
    responseFormat: { Status: "00", Message: "Lấy dữ liệu danh mục thành công", Data: [{ Value: "X01", Text: "Xe ô tô dưới 6 chỗ không kinh doanh vận tải" }] }
  },
  {
    id: "api-query-order",
    category: "portal.categories.order",
    method: "POST",
    path: "/api/pvi/v1/insurance/query-order",
    description: "portal.endpoints.order_query",
    requestSample: { CpId: "nguyễn văn a", Sign: "8eb100780f2d5902", ma_giaodich: "GD_OTO_2026_01" },
    responseFormat: { Status: "00", Message: "Thành công", Data: { ma_giaodich: "GD_OTO_2026_01", so_gcn: "GCN/OTO/2026/001", trang_thai: "ACTIVATED", ngay_phathanh: "11/06/2026 10:30" } }
  },
  {
    id: "api-download-pdf",
    category: "portal.categories.order",
    method: "POST",
    path: "/api/pvi/v1/insurance/download-pdf",
    description: "portal.endpoints.order_pdf",
    requestSample: { CpId: "nguyễn văn a", Sign: "1cb100780f2d5902", so_gcn: "GCN/OTO/2026/001" },
    responseFormat: { Status: "00", Message: "Thành công", link: "https://e-cert.pvi.com.vn/download/pdf/GCN-OTO-2026.pdf", media_type: "application/pdf" }
  },
  {
    id: "api-submit-claim",
    category: "portal.categories.claim",
    method: "POST",
    path: "/api/pvi/v1/claim/register",
    description: "portal.endpoints.claim_register",
    requestSample: { CpId: "nguyễn văn a", Sign: "5ab100780f2d5902", so_gcn: "GCN/OTO/2026/001", mo_ta_su_co: "Xe va chạm quẹt vào dải phân cách", hinh_anh_hieng_truong: ["https://image-store.com/claim/img01.jpg"] },
    responseFormat: { Status: "00", Message: "Tiếp nhận thành công", Data: { claim_id_str: "CLAIM_2026_9921", status_code: 200 } }
  },
  {
    id: "api-einvoice-issue",
    category: "portal.categories.einvoice",
    method: "POST",
    path: "/api/pvi/v1/einvoice/issue",
    description: "portal.endpoints.einvoice_issue",
    requestSample: { CpId: "nguyễn văn a", so_gcn: "GCN/OTO/2026/001", MaSoThue: "0101234567", TenDonVi: "Công ty TNHH A", DiaChiHoaDon: "Quận 1, TP. HCM" },
    responseFormat: { Status: "00", Message: "Phát hành hóa đơn thành công", MaSoBaoMat: "INV-99281-2026", LinkHoaDon: "https://einvoice.pvi.com.vn/view/inv-99281" }
  },
  {
    id: "api-recon-daily",
    category: "portal.categories.recon",
    method: "POST",
    path: "/api/pvi/v1/finance/reconciliation",
    description: "portal.endpoints.recon_daily",
    requestSample: { CpId: "nguyễn văn a", NgayDoiSoat: "11/06/2026", LoaiAnChi: "OTO" },
    responseFormat: { Status: "00", Message: "Trùng khớp dữ liệu đối soát", TongSoDon: 142, TongDoanhThu: 76230000, TrangThaiDoiSoat: "MATCHED" }
  },
  {
    id: "api-agent-commission",
    category: "portal.categories.agent",
    method: "POST",
    path: "/api/pvi/v1/agent/commission-query",
    description: "portal.endpoints.agent_commission",
    requestSample: { CpId: "nguyễn văn a", AgentCode: "SUB_AG_HCM_01", MaLoaiAnChi: "MOTO" },
    responseFormat: { Status: "00", Message: "Lấy cấu hình thành công", TyleChietKhau: 0.15, PhisauChietKhau: 85000 }
  },
  {
    id: "api-endorse-cancel",
    category: "portal.categories.endorse",
    method: "POST",
    path: "/api/pvi/v1/endorsement/cancel-order",
    description: "portal.endpoints.endorse_cancel",
    requestSample: { CpId: "nguyễn văn a", so_gcn: "GCN/OTO/2026/001", LyDoHuy: "Khách hàng bán xe, đổi sang đơn vị khác" },
    responseFormat: { Status: "00", Message: "Yêu cầu hủy đơn đã được tiếp nhận", TrangThaiDon: "PENDING_CANCELLATION", PhiHoanLaiDuKien: 320000 }
  },
  {
    id: "api-crm-renewal-check",
    category: "portal.categories.crm",
    method: "POST",
    path: "/api/pvi/v1/crm/renewal-check",
    description: "portal.endpoints.crm_renewal",
    requestSample: { CpId: "nguyễn văn a", SoNgaySapHetHan: 30, ChiNhanhQuanLy: "HCM" },
    responseFormat: { Status: "00", Message: "Tìm thấy dữ liệu tái tục", DanhSachSapHetHan: [{ SoGCN: "GCN/OTO/2025/882", TenKhachHang: "Vũ Văn C", NgayHetHan: "12/07/2026" }] }
  },
  {
    id: "api-uw-risk-assess",
    category: "portal.categories.uw",
    method: "POST",
    path: "/api/pvi/v1/underwriting/risk-assess",
    description: "portal.endpoints.uw_risk",
    requestSample: { CpId: "nguyễn văn a", GiaTriXe: 6500000000, MụcDichSuDung: "Vận tải hạng nặng chuyên dụng" },
    responseFormat: { Status: "01", Message: "Vượt hạn mức duyệt tự động - Chuyển chuyên viên", KquaThamDinh: "REFER_TO_UW", MaHoSoThamDinh: "UW-OTO-2026-009" }
  },
  {
    id: "api-reinsurance-share",
    category: "portal.categories.reinsurance",
    method: "POST",
    path: "/api/pvi/v1/reinsurance/share-assess",
    description: "portal.endpoints.reinsurance_share",
    requestSample: { CpId: "nguyễn văn a", TongMucTrachNhiem: 15000000000, MaNghiepVu: "KỸ THUẬT TÀI SẢN XE" },
    responseFormat: { Status: "00", Message: "Phân bổ thành công", TyLeGiuLai: 0.20, TyLeTaiPhanGiao: 0.80, NhaTaiBaoHiemGoc: "PVI RE" }
  },
  {
    id: "ref-dictionary",
    category: "portal.categories.ref",
    method: "DATA",
    path: "Từ điển dữ liệu toàn bộ hệ thống",
    description: "portal.endpoints.ref_dictionary",
    isCustomPage: true,
    pageType: "dictionary"
  },
  {
    id: "ref-status-codes",
    category: "portal.categories.ref",
    method: "CODE",
    path: "Mã lỗi quy ước hệ thống Core PVI",
    description: "portal.endpoints.ref_errors",
    isCustomPage: true,
    pageType: "error-codes"
  },
  {
    id: "changelog-versions",
    category: "portal.categories.changelog",
    method: "VER",
    path: "Nhật ký nâng cấp phiên bản",
    description: "portal.endpoints.changelog_versions",
    isCustomPage: true,
    pageType: "changelog"
  }
];

// Các phần còn lại giữ nguyên từ file cũ:
export const ERROR_CODES_DATA = [
  ["00", "Success - Giao dịch thành công hoàn tất cấp ấn chỉ"],
  ["01", "Invalid Signature - Chữ ký bảo mật không hợp lệ hoặc sai thuật toán băm"],
  ["02", "Missing CpId - Thiếu mã định danh duy nhất của Đối tác (Partner ID)"],
  ["03", "Missing Parameter - Thiếu các trường dữ liệu bắt buộc trong Request Payload JSON"],
  ["04", "Policy Not Found - Không tìm thấy Số giấy chứng nhận bảo hiểm trên Core"],
  ["05", "Internal Error - Hệ thống Core PVI gặp sự cố xử lý gián đoạn dịch vụ"]
];

export const FIELD_DICTIONARY = {
  client_id: "ID cổng ứng dụng phục vụ lấy Access Token OAuth2 bảo mật kết nối",
  client_secret: "Mật khẩu ứng dụng bí mật kết nối an toàn cấp cao hệ thống",
  grant_type: "Phương thức cấp quyền xác thực tài khoản (Mặc định: client_credentials)",
  access_token: "Chuỗi Access Token đại diện cho phiên kết nối hợp lệ của đối tác",
  expires_in: "Thời gian hiệu lực của Access Token tính bằng giây (Mặc định: 86400s = 24h)",
  token_type: "Loại Token định dạng cấu trúc mã hóa xác thực (Bearer token)",
  Sign: "Chữ ký bảo mật kết nối mã hóa dạng chuỗi băm MD5",
  CpId: "Mã định danh duy nhất của Đối tác được PVI cấp phát",
  TenKH: "Họ và tên khách hàng đại diện mua đơn ấn chỉ",
  so_cho: "Số chỗ ngồi đăng ký chính thức của phương tiện xe",
  mtn_laiphu: "Mức trách nhiệm bảo hiểm tai nạn lái phụ xe lựa chọn",
  so_nguoi: "Số người tham gia bảo hiểm tai nạn ngồi trên xe",
  TongPhi: "Tổng số tiền phí bảo hiểm đối tác cần gạch nợ thanh toán",
  Status: "Mã trạng thái phản hồi kết quả (Mặc định 00 là thành công)",
  Message: "Thông báo mô tả chi tiết kết quả xử lý giao dịch hệ thống",
  TotalFee: "Tổng phí bảo hiểm cuối cùng đã bao gồm thuế VAT",
  Data: "Dữ liệu hoặc danh sách mảng chứa các đối tượng nghiệp vụ trả về",
  so_gcn: "Số Giấy chứng nhận bảo hiểm chính thức do hệ thống PVI cấp phát",
  ma_giaodich: "Mã đối tác tự sinh để quản lý đối soát đơn hàng",
  NgayDoiSoat: "Ngày thực hiện đối soát dữ liệu dòng tiền kế toán (DD/MM/YYYY)",
  TongSoDon: "Tổng số lượng đơn hàng bảo hiểm phát sinh trong kỳ đối soát",
  TongDoanhThu: "Tổng số tiền doanh thu phí bảo hiểm tích lũy thu được",
  AgentCode: "Mã quản lý duy nhất của Đại lý hoặc CTV cấp dưới",
  TyleChietKhau: "Tỷ lệ hoa hồng chiết khấu được hưởng thương mại (Ví dụ: 0.15 = 15%)"
};

export const SUPPORTED_LANGUAGES = [
  { id: 'curl', name: 'cURL', icon: '💻' },
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'nodejs', name: 'Node.js', icon: '🟩' },
  { id: 'php', name: 'PHP', icon: '🐘' },
  { id: 'go', name: 'Go', icon: '🐹' },
  { id: 'ruby', name: 'Ruby', icon: '💎' },
  { id: 'java', name: 'Java (OkHttp)', icon: '☕' },
  { id: 'csharp', name: 'C# (.NET)', icon: '🔷' },
  { id: 'swift', name: 'Swift', icon: '🦅' },
  { id: 'kotlin', name: 'Kotlin', icon: '🎯' },
  { id: 'rust', name: 'Rust', icon: '🦀' },
  { id: 'dart', name: 'Dart', icon: '🎯' },
];

// Hàm generateLanguageSnippet giữ nguyên
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const generateLanguageSnippet = (langId, endpoint, currentBodyText) => {
  if (!endpoint || !endpoint.path) return "";
  const domain = "https://api.pvi.com.vn";
  const fullUrl = `${domain}${endpoint.path}`;
  const method = endpoint.method || 'POST';

  let bodyJson = "{}";
  try {
    if (currentBodyText) {
      bodyJson = JSON.stringify(JSON.parse(currentBodyText), null, 2);
    }
  } catch (e) {
    bodyJson = String(currentBodyText);
  }

  const methodUpper = method.toUpperCase();
  const methodLower = method.toLowerCase();

  switch (langId) {
    case 'curl':
      let curl = `curl --location '${fullUrl}' \\\n`;
      curl += `--method '${methodUpper}' \\\n`;
      curl += `--header 'Content-Type: application/json' \\\n`;
      curl += `--header 'Authorization: Bearer YOUR_ACCESS_TOKEN'`;
      if (['POST', 'PUT', 'PATCH'].includes(methodUpper)) {
        curl += ` \\\n--data '${bodyJson.replace(/\n/g, '\n  ')}'`;
      }
      return curl;
    case 'javascript':
      return `const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", "Bearer YOUR_ACCESS_TOKEN");

const requestOptions = {
  method: "${methodUpper}",
  headers: myHeaders,
  body: JSON.stringify(${bodyJson.replace(/\n/g, '\n  ')}),
  redirect: "follow"
};

fetch("${fullUrl}", requestOptions)
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error('Error:', error));`;
    case 'python':
      return `import requests
import json

url = "${fullUrl}"
payload = ${bodyJson.replace(/true/g, 'True').replace(/false/g, 'False').replace(/\n/g, '\n')}
headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
}

response = requests.request("${methodUpper}", url, headers=headers, json=payload)
print(response.json())`;
    case 'nodejs':
      return `const axios = require('axios');

let data = ${bodyJson.replace(/\n/g, '\n')};

let config = {
  method: '${methodLower}',
  maxBodyLength: Infinity,
  url: '${fullUrl}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  data: data
};

axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });`;
    case 'php':
      return `<?php
$client = new \\GuzzleHttp\\Client();
$headers = [
  'Content-Type' => 'application/json',
  'Authorization' => 'Bearer YOUR_ACCESS_TOKEN'
];
$body = '${bodyJson.replace(/\n/g, '\n  ')}';
$request = new \\GuzzleHttp\\Psr7\\Request('${methodUpper}', '${fullUrl}', $headers, $body);
$response = $client->send($request);
echo $response->getBody();`;
    case 'go':
      return `package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "io/ioutil"
  "net/http"
)

func main() {
  url := "${fullUrl}"
  method := "${methodUpper}"

  var data = ${bodyJson.replace(/\n/g, '\n  ')}

  payload, _ := json.Marshal(data)
  client := &http.Client{}
  req, _ := http.NewRequest(method, url, bytes.NewBuffer(payload))

  req.Header.Add("Content-Type", "application/json")
  req.Header.Add("Authorization", "Bearer YOUR_ACCESS_TOKEN")

  res, _ := client.Do(req)
  defer res.Body.Close()

  body, _ := ioutil.ReadAll(res.Body)
  fmt.Println(string(body))
}`;
    case 'ruby':
      return `require 'uri'
require 'net/http'
require 'json'

url = URI("${fullUrl}")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::${capitalize(methodLower)}.new(url)
request["Content-Type"] = "application/json"
request["Authorization"] = "Bearer YOUR_ACCESS_TOKEN"
request.body = ${bodyJson.replace(/\n/g, '\n')}

response = http.request(request)
puts response.read_body`;
    case 'java':
      return `import okhttp3.*;

public class Main {
  public static void main(String[] args) throws Exception {
    OkHttpClient client = new OkHttpClient();

    MediaType mediaType = MediaType.parse("application/json");
    RequestBody body = RequestBody.create(mediaType, ${bodyJson.replace(/\n/g, '\n  ')});

    Request request = new Request.Builder()
      .url("${fullUrl}")
      .method("${methodUpper}", body)
      .addHeader("Content-Type", "application/json")
      .addHeader("Authorization", "Bearer YOUR_ACCESS_TOKEN")
      .build();

    Response response = client.newCall(request).execute();
    System.out.println(response.body().string());
  }
}`;
    case 'csharp':
      return `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program
{
  static async Task Main()
  {
    using var client = new HttpClient();
    var url = "${fullUrl}";
    var content = new StringContent(${bodyJson.replace(/\n/g, '\n  ')}, Encoding.UTF8, "application/json");

    var request = new HttpRequestMessage
    {
      Method = HttpMethod.${capitalize(methodLower)},
      RequestUri = new Uri(url),
      Content = content
    };
    request.Headers.Add("Authorization", "Bearer YOUR_ACCESS_TOKEN");

    var response = await client.SendAsync(request);
    var result = await response.Content.ReadAsStringAsync();
    Console.WriteLine(result);
  }
}`;
    case 'swift':
      return `import Foundation

let url = URL(string: "${fullUrl}")!
var request = URLRequest(url: url)
request.httpMethod = "${methodUpper}"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.setValue("Bearer YOUR_ACCESS_TOKEN", forHTTPHeaderField: "Authorization")

let parameters: [String: Any] = ${bodyJson.replace(/\n/g, '\n  ')}

request.httpBody = try! JSONSerialization.data(withJSONObject: parameters)

let task = URLSession.shared.dataTask(with: request) { data, response, error in
  guard let data = data else { return }
  let result = try? JSONSerialization.jsonObject(with: data)
  print(result ?? "No data")
}
task.resume()`;
    case 'kotlin':
      return `import okhttp3.*

fun main() {
  val client = OkHttpClient()

  val mediaType = MediaType.parse("application/json")
  val body = RequestBody.create(mediaType, ${bodyJson.replace(/\n/g, '\n  ')})

  val request = Request.Builder()
    .url("${fullUrl}")
    .method("${methodUpper}", body)
    .addHeader("Content-Type", "application/json")
    .addHeader("Authorization", "Bearer YOUR_ACCESS_TOKEN")
    .build()

  val response = client.newCall(request).execute()
  println(response.body()?.string())
}`;
    case 'rust':
      return `use reqwest;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let data = ${bodyJson.replace(/\n/g, '\n  ')};

    let response = client
        .request(reqwest::Method::from_bytes(b"${methodUpper}")?, "${fullUrl}")
        .header("Content-Type", "application/json")
        .header("Authorization", "Bearer YOUR_ACCESS_TOKEN")
        .json(&data)
        .send()
        .await?;

    let body = response.text().await?;
    println!("{}", body);
    Ok(())
}`;
    case 'dart':
      return `import 'package:http/http.dart' as http;
import 'dart:convert';

void main() async {
  final url = Uri.parse("${fullUrl}");
  final headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
  };
  final body = ${bodyJson.replace(/\n/g, '\n  ')};

  final response = await http.${methodLower}(
    url,
    headers: headers,
    body: jsonEncode(body),
  );

  print(response.body);
}`;
    default:
      return "";
  }
};
