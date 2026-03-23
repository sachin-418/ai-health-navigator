export const INDIAN_PHONE_PREFIX = "+91";

export const sanitizeIndianPhoneInput = (value: string) =>
  value.replace(/\D/g, "").slice(0, 10);

export const toIndianPhoneNumber = (value: string) => {
  const digits = sanitizeIndianPhoneInput(value);
  return digits ? `${INDIAN_PHONE_PREFIX}${digits}` : "";
};

export const isValidIndianPhoneInput = (value: string) => sanitizeIndianPhoneInput(value).length === 10;