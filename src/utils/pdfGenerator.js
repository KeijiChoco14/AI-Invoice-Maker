import jsPDF from "jspdf";
import { getSettings } from "./storage";

const formatRupiah = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);

export function generateInvoicePDF(invoice) {
  const settings = getSettings();
  const doc = new jsPDF();

  const navy = "#0B1F3A";
  const gold = "#D4AF37";
  const gray = "#6B7280";

  doc.setFillColor(navy);
  doc.rect(0, 0, 210, 38, "F");

  doc.setTextColor(gold);
  doc.setFontSize(22);
  doc.text(settings.companyName, 14, 18);

  doc.setTextColor("#FFFFFF");
  doc.setFontSize(10);
  doc.text(settings.tagline, 14, 26);

  doc.setTextColor("#FFFFFF");
  doc.setFontSize(18);
  doc.text("INVOICE", 160, 20);

  doc.setTextColor(navy);
  doc.setFontSize(11);
  doc.text(`Nomor: ${invoice.invoiceNumber}`, 14, 52);
  doc.text(`Tanggal: ${invoice.invoiceDate || "-"}`, 14, 60);
  doc.text(`Jatuh Tempo: ${invoice.dueDate || "-"}`, 14, 68);

  doc.setTextColor(gray);
  doc.text("Ditagihkan kepada:", 14, 84);

  doc.setTextColor(navy);
  doc.setFontSize(13);
  doc.text(invoice.clientName || "-", 14, 93);

  doc.setFontSize(10);
  doc.setTextColor(gray);

  let clientY = 101;

  if (invoice.clientEmail) {
    doc.text(invoice.clientEmail, 14, clientY);
    clientY += 8;
  }

  if (invoice.clientPhone) {
    doc.text(invoice.clientPhone, 14, clientY);
    clientY += 8;
  }

  if (invoice.clientAddress) {
    const addressLines = doc.splitTextToSize(invoice.clientAddress, 75);
    doc.text(addressLines, 14, clientY);
  }

  doc.setTextColor(gray);
  doc.text("Dari:", 125, 84);

  doc.setTextColor(navy);
  doc.setFontSize(12);
  doc.text(settings.companyName, 125, 93);

  doc.setFontSize(10);
  doc.setTextColor(gray);
  doc.text(settings.email, 125, 101);
  doc.text(settings.phone, 125, 109);
  doc.text(settings.address, 125, 117);

  let y = 135;

  doc.setFillColor(navy);
  doc.rect(14, y, 182, 10, "F");

  doc.setTextColor("#FFFFFF");
  doc.setFontSize(10);
  doc.text("Deskripsi", 18, y + 7);
  doc.text("Qty", 110, y + 7);
  doc.text("Harga", 130, y + 7);
  doc.text("Total", 168, y + 7);

  y += 16;

  doc.setTextColor("#1F2937");

  invoice.items.forEach((item) => {
    const total = Number(item.quantity) * Number(item.unitPrice);

    doc.text(item.description || "-", 18, y);
    doc.text(String(item.quantity), 112, y);
    doc.text(formatRupiah(item.unitPrice), 130, y);
    doc.text(formatRupiah(total), 168, y);

    y += 10;
  });

  y += 8;

  doc.setDrawColor("#E5E7EB");
  doc.line(14, y, 196, y);

  y += 12;

  doc.setTextColor(navy);
  doc.text("Subtotal", 130, y);
  doc.text(formatRupiah(invoice.subtotal), 168, y);

  y += 8;

  doc.text(`${invoice.taxLabel} ${invoice.taxRate}%`, 130, y);
  doc.text(formatRupiah(invoice.taxAmount), 168, y);

  y += 10;

  doc.setFillColor(gold);
  doc.rect(125, y - 6, 71, 12, "F");

  doc.setTextColor(navy);
  doc.setFontSize(11);
  doc.text("Grand Total", 130, y + 2);
  doc.text(formatRupiah(invoice.grandTotal), 168, y + 2);

  y += 24;

  doc.setTextColor(navy);
  doc.setFontSize(12);
  doc.text("Informasi Pembayaran", 14, y);

  y += 9;

  doc.setFontSize(10);
  doc.setTextColor("#1F2937");
  doc.text(`Bank: ${settings.bankName}`, 14, y);
  doc.text(`No. Rekening: ${settings.bankAccount}`, 14, y + 8);
  doc.text(`Atas Nama: ${settings.bankHolder}`, 14, y + 16);

  y += 34;

  doc.setTextColor(gray);
  doc.text(`Catatan: ${invoice.notes || settings.footerNote}`, 14, y);

  doc.setFillColor(navy);
  doc.rect(0, 282, 210, 15, "F");

  doc.setTextColor("#FFFFFF");
  doc.setFontSize(9);
  doc.text(settings.footerNote, 14, 291);

  doc.save(`${invoice.invoiceNumber}.pdf`);
}
