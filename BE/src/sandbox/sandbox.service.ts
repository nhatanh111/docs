import { Injectable } from '@nestjs/common';
import { handlers } from './handlers';

@Injectable()
export class SandboxService {
  execute(endpointId: string, requestBody: Record<string, any>) {
    const handler = handlers[endpointId];
    if (!handler) {
      return {
        status: 'success',
        data: {
          Status: '00',
          Message: 'Giao dịch giả lập thành công',
          Data: requestBody,
        },
      };
    }
    return handler(requestBody);
  }
}
