export const aquaHandlers: Record<string, (body: any) => any> = {
  'api-aqua-fee-quote': () => ({
    status: 'success',
    data: { totalFee: 400000, status: '200' },
  }),
  'api-aqua-create-policy': (body: any) => ({
    status: 'success',
    data: {
      partnerTransactionId: body?.partnerTransactionId || 'Test07',
      status: 'OFFICIAL',
      policyNumber: 'ABC/12345',
      serialNumber: '123456789',
      certificateUrl: 'https://certificate.pvi.com.vn/ABC/12345',
      message: 'Thanh cong',
    },
  }),
  'api-aqua-query-policy': (body: any) => ({
    status: 'success',
    data: {
      partnerTransactionId: body?.partnerTransactionId || 'Test07',
      status: 'OFFICIAL',
      policyNumber: 'ABC/12345',
      serialNumber: '123456789',
      certificateUrl: 'https://certificate.pvi.com.vn/ABC/12345',
      message: 'Thanh cong',
    },
  }),
  'api-aqua-cancel-policy': () => ({
    status: 'success',
    data: { message: 'Yêu cầu huỷ đơn thành công' },
  }),
  'api-vatcb-create': () => ({
    status: 'success',
    data: {
      status: true,
      code: '000',
      message: 'Success',
      data: {
        id: 'f61ccf05-e9bd-4f7b-91b0-85b90dc6bc8d',
        requestId: 'REQ-003',
        virtualAccountNumber: 'M37926000000121',
        qrCode: '00020101021238590010A00000072701...',
        qrBase64: 'data:image/png;base64,iVBORw0KGgo...',
        bankName: 'Ngân hàng TMCP Kỹ Thuơng Việt Nam (Techcombank)',
        customerName: 'Nguyen Van A',
        amount: 30000,
        expiryDate: '05/07/2026',
        callbackUrl: 'https://partner.example.com/hooks/pvi',
        message: 'Success',
      },
    },
  }),
  'api-vatcb-query': () => ({
    status: 'success',
    data: {
      status: true,
      code: '000',
      message: 'Thành công',
      data: {
        id: 'f61ccf05-e9bd-4f7b-91b0-85b90dc6bc8d',
        requestId: 'REQ-003',
        amount: 30000,
        virtualAccountNumber: 'M37926000000121',
        paymentStatus: true,
        contractStatus: 'PAID',
        paidAt: '2026-06-28T09:38:29+07:00',
        callbackUrl: 'https://partner.example.com/hooks/pvi',
      },
    },
  }),
};
