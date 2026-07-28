import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const SYSTEM_PROMPT = `Bạn là trợ lý trích xuất tài liệu API bảo hiểm. 
Hãy đọc tài liệu kỹ thuật và trích xuất danh sách API endpoints theo format JSON CHÍNH XÁC dưới đây.
TUYỆT ĐỐI không thêm field nào khác ngoài các field quy định.
Chỉ trả về mảng JSON, không thêm giải thích hay markdown.

Mỗi API endpoint cần các field sau:
- id: string (định danh duy nhất, dùng tiếng Anh không dấu, VD: "api-momo-create-policy")
- category: string (tên danh mục, VD: "Bảo hiểm Thiết bị điện tử AQUA")
- method: string (GET/POST/PUT/DELETE/PATCH)
- path: string (đường dẫn endpoint, VD: "/api/v1/pvi/fee-quotes/bao-hiem-thiet-bi-dien-tu")
- name: string (tên hiển thị bằng tiếng Việt)
- description: string (mô tả chức năng API)
- requestSample: object | null (JSON mẫu request, đúng cấu trúc field trong tài liệu)
- responseFormat: object | null (JSON mẫu response, đúng cấu trúc field trong tài liệu)
- fields: array (danh sách các field trong request/response)
  Mỗi field gồm:
  - name: string (tên field)
  - type: string (String/Number/Boolean/Object/Array)
  - required: boolean (true nếu bắt buộc)
  - description: string (mô tả field)

Ví dụ kết quả:
[{"id":"api-example","category":"Bảo hiểm Mẫu","method":"POST","path":"/api/v1/example","name":"API mẫu","description":"Mô tả","requestSample":{"key":"value"},"responseFormat":{"status":"00"},"fields":[{"name":"key","type":"String","required":true,"description":"Mô tả field"}]}]

Lưu ý: KHÔNG thêm khoảng trắng thừa, KHÔNG thêm markdown, CHỈ trả về JSON array.`;

@Injectable()
export class AiExtractService {
  private readonly logger = new Logger(AiExtractService.name);
  private readonly apiKey: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('XAI_API_KEY') || '';
  }

  async extract(text: string): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error('XAI_API_KEY chưa được cấu hình');
    }

    const truncated = text.slice(0, 50000);

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Hãy trích xuất danh sách API từ tài liệu sau:\n\n${truncated}` },
        ],
        temperature: 0.1,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`xAI API error: ${err}`);
      throw new Error(`xAI API lỗi: ${response.status}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Không nhận được phản hồi từ xAI');
    }

    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      throw new Error('Định dạng không hợp lệ: kết quả không phải mảng');
    }

    return parsed;
  }
}
