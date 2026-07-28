export const motoHandlers: Record<string, (body: any) => any> = {
  'ep-moto-calc': () => ({
    status: 'success',
    data: { Status: '00', Message: 'Tính phí xe máy thành công', Data: { phi_moto: 66000, phi_laiphu: 40000, TongPhi: 106000 } },
  }),
  'ep-moto-insert': () => ({
    status: 'success',
    data: { Status: '00', Message: 'Cấp đơn xe máy thành công', TotalFee: 106000, Data: { so_gcn: 'GCN/MOTO/2026/002' } },
  }),
  'api-calculate-premium-moto': () => ({
    status: 'success',
    data: { Status: '00', Message: 'Tính phí xe máy thành công', Data: { phi_moto: 66000, phi_laiphu: 40000, TongPhi: 106000 } },
  }),
  'api-insert-moto': () => ({
    status: 'success',
    data: { Status: '00', Message: 'Cấp đơn xe máy thành công', TotalFee: 106000, Data: { so_gcn: 'GCN/MOTO/2026/002' } },
  }),
  'api-tnds-moto-fee': () => ({
    status: 'success',
    data: { Status: '00', Message: 'Thanh cong', phi_moto: 66000, phi_laiphu: 10000, TotalFee: 76000 },
  }),
  'api-tnds-moto-create': () => ({
    status: 'success',
    data: { Status: '00', Message: 'Tạo đơn thành công', Pr_key: 123456 },
  }),
};
