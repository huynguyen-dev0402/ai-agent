export const TRANSACTION_CONTENT_REGEX = /SEVQR([a-zA-Z]+)(\d+)(user\d+)TS\d+/;

export const ACTION_MAP: Record<string, string> = {
  SC: 'subscribe',
  ET: 'extend',
  UG: 'upgrade',
};
