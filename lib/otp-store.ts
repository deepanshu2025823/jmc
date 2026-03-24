// lib/otp-store.ts
declare global {
  var otpCache: Map<string, { code: string; expires: number }> | undefined;
}

export const otpCache = globalThis.otpCache || new Map<string, { code: string; expires: number }>();

if (process.env.NODE_ENV !== 'production') {
  globalThis.otpCache = otpCache;
}