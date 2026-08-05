export const claimHandlers: Record<string, (body: any) => any> = {
  'ep-claim-reg': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Tiếp nhận thành công',
      Data: { claim_id_str: 'CLAIM_2026_9921', status_code: 200 },
    },
  }),
  'api-submit-claim': () => ({
    status: 'success',
    data: {
      Status: '00',
      Message: 'Tiếp nhận thành công',
      Data: { claim_id_str: 'CLAIM_2026_9921', status_code: 200 },
    },
  }),
};
