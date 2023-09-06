export function parseToNumberString(val: string) {
  if (!val) return '';
  return val.replace(/\D/g, '');
}
