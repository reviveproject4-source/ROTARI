/**
 * Helper utility resmi untuk membuka WhatsApp secara langsung di HP/Desktop.
 * Menggunakan window.location.href (Direct Navigation) tanpa window.open(..., "_blank")
 * agar tidak memicu popup blocker atau tab/layar terpisah di HP.
 */
export function openWhatsAppChat(phone: string, text: string) {
  if (!phone) return;
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(text);
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  if (typeof window !== "undefined") {
    window.location.href = waUrl;
  }
}
