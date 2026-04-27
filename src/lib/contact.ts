/** Central contact constants for Wajose. Swap the WhatsApp number here. */
export const WHATSAPP_NUMBER = "254700000000"; // E.164 without "+"
export const WHATSAPP_DISPLAY = "+254 700 000 000";
export const SUPPORT_EMAIL = "hello@wajose.co.ke";

export const whatsappLink = (message?: string) => {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
