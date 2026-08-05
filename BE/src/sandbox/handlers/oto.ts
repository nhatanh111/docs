export const otoHandlers: Record<string, (body: any) => any> = {
  'ep-oto-calc': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Tính phí ô tô thành công',
      Data: {
        PhiBHTNDSBB: 437000,
        PhiBHLaiPhu: 100000,
        ThueVAT: 53700,
        TongPhi: 590700,
      },
    },
  }),
  'ep-oto-insert': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Cấp đơn ô tô thành công',
      TotalFee: 590700,
      Data: {
        ma_giaodich: 'GD_OTO_2026_01',
        so_gcn: 'GCN/OTO/2026/001',
        Pr_key: 1256789,
      },
    },
  }),
  'api-calculate-premium-oto': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Tính phí ô tô thành công',
      Data: {
        PhiBHTNDSBB: 437000,
        PhiBHLaiPhu: 100000,
        ThueVAT: 53700,
        TongPhi: 590700,
      },
    },
  }),
  'api-insert-oto': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Cấp đơn ô tô thành công',
      TotalFee: 590700,
      Data: {
        ma_giaodich: 'GD_OTO_2026_01',
        so_gcn: 'GCN/OTO/2026/001',
        Pr_key: 1256789,
      },
    },
  }),
  'api-tnds-oto-fee': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Thanh cong',
      TotalFee: '510700',
      phi_tndsbb: '437000',
      phi_lpx: '73700',
      ma_loaixe: '3001',
    },
  }),
  'api-tnds-oto-create': () => ({
    status: 'success',
    data: { Status: '00', Message: 'Tạo đơn thành công', Pr_key: 123456 },
  }),
  'api-tnds-oto-get-maloaixe': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Thành công',
      Data: [{ Value: '3001', Text: 'Xe ô tô dưới 6 chỗ không KDVT' }],
    },
  }),
  'api-get-car-categories': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Lấy dữ liệu danh mục thành công',
      Data: [
        { Value: 'X01', Text: 'Xe ô tô dưới 6 chỗ không kinh doanh vận tải' },
      ],
    },
  }),
};
