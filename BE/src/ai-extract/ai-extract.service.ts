import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const SYSTEM_PROMPT = `You are an assistant that extracts API endpoint definitions from technical documents.
Return a JSON array of endpoints only, without extra text or markdown. Each endpoint should include: id, category, method, path, name, description, requestSample, responseFormat, fields.`;

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
    const provider = this.config.get<string>('XAI_PROVIDER') || 'xai';
    const providerName = provider === 'google' ? 'Google' : provider === 'deepseek' ? 'DeepSeek' : 'xAI';

    let response: Response;
    if (provider === 'deepseek') {
      response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Please extract the API list from the following document:\n\n${truncated}` },
          ],
          temperature: 0.1,
          max_tokens: 8000,
        }),
      });
    } else if (provider === 'google') {
      const gUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
        this.apiKey,
      )}`;
      const gBody = {
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              { text: `Please extract the API list from the following document:\n\n${truncated}` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8000,
        },
      };

      response = await fetch(gUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gBody),
      });
    } else {
      response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-2-latest',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Please extract the API list from the following document:\n\n${truncated}` },
          ],
          temperature: 0.1,
          max_tokens: 8000,
        }),
      });
    }

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`${providerName} API error: ${err}`);
      throw new Error(`${providerName} API lỗi: ${response.status}`);
    }

    const maybeJson: unknown = await response.json();
    let content: string | undefined;

    if (typeof maybeJson === 'object' && maybeJson !== null) {
      const obj = maybeJson as Record<string, unknown>;

      if (
        Array.isArray(obj.choices) &&
        typeof obj.choices[0] === 'object' &&
        obj.choices[0] !== null
      ) {
        const choiceObj = obj.choices[0] as Record<string, unknown>;
        const messageObj = choiceObj.message as Record<string, unknown> | undefined;
        if (messageObj && typeof messageObj.content === 'string') {
          content = messageObj.content;
        }
      }

      if (!content && Array.isArray(obj.candidates)) {
        const candidate = obj.candidates[0] as Record<string, unknown>;
        if (typeof candidate?.content === 'string') {
          content = candidate.content;
        }
      }

      if (
        !content &&
        Array.isArray(obj.candidates) &&
        typeof obj.candidates[0] === 'object' &&
        obj.candidates[0] !== null
      ) {
        const candidate = obj.candidates[0] as Record<string, unknown>;
        const cContent = candidate.content as Record<string, unknown> | undefined;
        if (cContent && Array.isArray(cContent.parts)) {
          content = cContent.parts.map((p: Record<string, unknown>) => p.text || '').join('');
        }
      }

      if (
        !content &&
        Array.isArray(obj.responses) &&
        typeof obj.responses[0] === 'object' &&
        obj.responses[0] !== null
      ) {
        const responseObj = obj.responses[0] as Record<string, unknown>;
        if (Array.isArray(responseObj.candidates)) {
          const candidate = responseObj.candidates[0] as Record<string, unknown>;
          if (typeof candidate?.content === 'string') {
            content = candidate.content;
          }
        }
      }

      if (
        !content &&
        Array.isArray(obj.output) &&
        typeof obj.output[0] === 'object'
      ) {
        const outputObj = obj.output[0] as Record<string, unknown>;
        if (Array.isArray(outputObj.content)) {
          const outputItem = outputObj.content[0] as Record<string, unknown> | undefined;
          if (outputItem && typeof outputItem.text === 'string') {
            content = outputItem.text;
          }
        }
      }
    }

    if (!content) {
      throw new Error(`Không nhận được phản hồi hợp lệ từ ${providerName}`);
    }

    const cleaned = String(content)
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(`${providerName} trả về JSON không parse được`);
    }

    if (!Array.isArray(parsed)) {
      throw new Error('Định dạng không hợp lệ: kết quả không phải mảng');
    }

    return parsed;
  }
}

