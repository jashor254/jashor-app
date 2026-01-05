export function canDownload(status) {
  return status === 'PAID';
}

export function canEdit(status) {
  return status !== 'PAID';
}

export function canPay(status) {
  return status === 'UNPAID';
}
