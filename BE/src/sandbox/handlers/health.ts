export const healthHandlers: Record<string, (body: any) => any> = {
  'api-health-register': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Dang ky bao hiem suc khoe thanh cong',
      Data: { so_gcn: 'GCN/HEALTH/2026/001' },
    },
  }),
  'api-health-query': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Tra cuu thanh cong',
      Data: { TrangThai: 'ACTIVE', NgayHetHan: '03/07/2027' },
    },
  }),
  'api-property-insure': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Cap don bao hiem tai san thanh cong',
      Data: { so_gcn: 'GCN/PROP/2026/001', PhiBaoHiem: 25000000 },
    },
  }),
};
