import { Injectable } from '@nestjs/common';
import { handlers, HandlerMap } from './handlers';

@Injectable()
export class SandboxService {
  execute(endpointId: string, requestBody: any) {
    const handler = (handlers as HandlerMap)[endpointId];
    if (!handler) {
      return { status: 'success', data: { Status: '00', Message: 'Giao dịch giả lập thành công', Data: requestBody } };
    }
    return handler(requestBody);
  }
}
