import { getSettings } from "./storage";

const formatRupiah = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);

function cleanPhoneNumber(phone) {
  if (!phone) return "";

  let cleaned = String(phone).replace(/[^\d]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = `62${cleaned.slice(1)}`;
  }

  return cleaned;
}

export function shareInvoiceToWhatsApp(invoice) {
  const settings = getSettings();
  const phone = cleanPhoneNumber(invoice.clientPhone);

  const message = `Halo ${invoice.clientName || "Bapak/Ibu"},

Berikut kami kirimkan informasi invoice:

Nomor Invoice: ${invoice.invoiceNumber}
Tanggal Invoice: ${invoice.invoiceDate || "-"}
Jatuh Tempo: ${invoice.dueDate || "-"}
Total Tagihan: ${formatRupiah(invoice.grandTotal)}

Pembayaran dapat dilakukan melalui:
Bank: ${settings.bankName}
No. Rekening: ${settings.bankAccount}
Atas Nama: ${settings.bankHolder}

Terima kasih atas kepercayaan Anda.

${settings.companyName}`;

  const encodedMessage = encodeURIComponent(message);

  const url = phone
    ? `https://wa.me/${phone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  window.open(url, "_blank");
}