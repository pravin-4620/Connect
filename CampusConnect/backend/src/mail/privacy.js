export function redactSensitiveText(value) {
  return String(value ?? '').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email hidden]').replace(/https?:\/\/\S+/gi, '[link hidden]').replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone hidden]').replace(/\b(?:code|otp|pin|verification code)(\s*(?:is|:|to continue)?\s*)\d{4,8}\b/gi, '$1[code hidden]').replace(/\b\d{6,8}\b/g, '[code hidden]');
}

export function publicEmail(email) {
  return email;
}
