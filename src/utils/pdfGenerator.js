import jsPDF from "jspdf";
import logo from "../assets/logo.png";
import { getSettings } from "./storage";

const formatRupiah = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);

export function generateInvoicePDF(invoice) {
  const settings = getSettings();
  const doc = new jsPDF("p", "mm", "a4");

  const navy = "#0B1F3A";
  const gold = "#D4AF37";
  const text = "#1F2937";
  const gray = "#6B7280";
  const lightGray = "#F5F7FA";
  const border = "#E5E7EB";

  // HEADER
  doc.setFillColor(navy);
  doc.rect(0, 0, 210, 44, "F");

  try {
    doc.addImage(logo, "PNG", 14, 9, 24, 24);
  } catch {
    // Logo gagal dimuat, PDF tetap dibuat.
  }

  doc.setTextColor(gold);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(settings.companyName || "AI Invoice Maker", 43, 18);

  doc.setTextColor("#FFFFFF");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(settings.tagline || "Smart Billing Studio", 43, 26);

  doc.setTextColor(gold);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 160, 18);

  doc.setTextColor("#FFFFFF");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoiceNumber || "-", 160, 27);

  // META BOX
  doc.setFillColor(lightGray);
  doc.roundedRect(14, 54, 182, 25, 3, 3, "F");

  doc.setTextColor(gray);
  doc.setFontSize(9);
  doc.text("Nomor Invoice", 20, 64);
  doc.text("Tanggal", 78, 64);
  doc.text("Jatuh Tempo", 128, 64);

  doc.setTextColor(navy);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.invoiceNumber || "-", 20, 72);
  doc.text(invoice.invoiceDate || "-", 78, 72);
  doc.text(invoice.dueDate || "-", 128, 72);

  // CLIENT & COMPANY BOXES
  const boxY = 90;

  doc.setDrawColor(border);
  doc.setFillColor("#FFFFFF");
  doc.roundedRect(14, boxY, 86, 48, 3, 3, "FD");
  doc.roundedRect(110, boxY, 86, 48, 3, 3, "FD");

  doc.setTextColor(gold);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DITAGIHKAN KEPADA", 20, boxY + 9);
  doc.text("DARI", 116, boxY + 9);

  doc.setTextColor(navy);
  doc.setFontSize(11);
  doc.text(invoice.clientName || "-", 20, boxY + 18);
  doc.text(settings.companyName || "-", 116, boxY + 18);

  doc.setTextColor(gray);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  let clientY = boxY + 26;

  if (invoice.clientEmail) {
    doc.text(invoice.clientEmail, 20, clientY);
    clientY += 6;
  }

  if (invoice.clientPhone) {
    doc.text(invoice.clientPhone, 20, clientY);
    clientY += 6;
  }

  if (invoice.clientAddress) {
    const addressLines = doc.splitTextToSize(invoice.clientAddress, 70);
    doc.text(addressLines.slice(0, 3), 20, clientY);
  }

  let companyY = boxY + 26;

  if (settings.email) {
    doc.text(settings.email, 116, companyY);
    companyY += 6;
  }

  if (settings.phone) {
    doc.text(settings.phone, 116, companyY);
    companyY += 6;
  }

  if (settings.address) {
    const companyAddressLines = doc.splitTextToSize(settings.address, 70);
    doc.text(companyAddressLines.slice(0, 3), 116, companyY);
  }

  // TABLE HEADER
  let y = 154;

  doc.setFillColor(navy);
  doc.roundedRect(14, y, 182, 10, 2, 2, "F");

  doc.setTextColor("#FFFFFF");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Deskripsi", 20, y + 7);
  doc.text("Qty", 112, y + 7);
  doc.text("Harga", 132, y + 7);
  doc.text("Total", 170, y + 7);

  y += 15;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(text);

  invoice.items.forEach((item, index) => {
    const rowHeight = 12;
    const total = Number(item.quantity) * Number(item.unitPrice);

    if (index % 2 === 0) {
      doc.setFillColor("#FAFAFA");
      doc.rect(14, y - 7, 182, rowHeight, "F");
    }

    const descriptionLines = doc.splitTextToSize(item.description || "-", 85);

    doc.setTextColor(text);
    doc.setFontSize(9);
    doc.text(descriptionLines.slice(0, 2), 20, y);

    doc.text(String(item.quantity || 1), 114, y);
    doc.text(formatRupiah(item.unitPrice), 132, y);
    doc.text(formatRupiah(total), 170, y);

    y += rowHeight;
  });

  // SUMMARY
  y += 8;

  const summaryX = 118;
  const summaryW = 78;

  doc.setDrawColor(border);
  doc.setFillColor("#FFFFFF");
  doc.roundedRect(summaryX, y, summaryW, 36, 3, 3, "FD");

  doc.setTextColor(gray);
  doc.setFontSize(9);
  doc.text("Subtotal", summaryX + 6, y + 9);
  doc.text(formatRupiah(invoice.subtotal), summaryX + 42, y + 9);

  doc.text(
    `${invoice.taxLabel || settings.taxLabel} ${invoice.taxRate || settings.taxRate}%`,
    summaryX + 6,
    y + 18
  );
  doc.text(formatRupiah(invoice.taxAmount), summaryX + 42, y + 18);

  doc.setFillColor(gold);
  doc.roundedRect(summaryX + 4, y + 23, summaryW - 8, 10, 2, 2, "F");

  doc.setTextColor(navy);
  doc.setFont("helvetica", "bold");
  doc.text("Grand Total", summaryX + 7, y + 30);
  doc.text(formatRupiah(invoice.grandTotal), summaryX + 42, y + 30);

  // PAYMENT
  const paymentY = y + 48;

  doc.setTextColor(navy);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Informasi Pembayaran", 14, paymentY);

  doc.setTextColor(text);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Bank: ${settings.bankName || "-"}`, 14, paymentY + 8);
  doc.text(`No. Rekening: ${settings.bankAccount || "-"}`, 14, paymentY + 15);
  doc.text(`Atas Nama: ${settings.bankHolder || "-"}`, 14, paymentY + 22);

  // NOTES
  const notesY = paymentY + 38;

  doc.setFillColor(lightGray);
  doc.roundedRect(14, notesY, 182, 24, 3, 3, "F");

  doc.setTextColor(gray);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Catatan", 20, notesY + 8);

  doc.setFont("helvetica", "normal");
  const noteLines = doc.splitTextToSize(
    invoice.notes || settings.footerNote || "Terima kasih atas kepercayaan Anda.",
    168
  );
  doc.text(noteLines.slice(0, 2), 20, notesY + 16);

  // FOOTER
  doc.setFillColor(navy);
  doc.rect(0, 282, 210, 15, "F");

  doc.setTextColor("#FFFFFF");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(settings.footerNote || "Terima kasih atas kepercayaan Anda.", 14, 291);

  doc.save(`${invoice.invoiceNumber}.pdf`);
}