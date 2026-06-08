import { getSettings } from "./storage";

export function generateInvoiceNumber() {
  const settings = getSettings();
  const year = new Date().getFullYear();

  const invoices = JSON.parse(localStorage.getItem("invoices")) || [];

  const currentYearInvoices = invoices.filter((invoice) =>
    invoice.invoiceNumber?.includes(`${settings.invoicePrefix}-${year}`)
  );

  const nextNumber = currentYearInvoices.length + 1;
  const paddedNumber = String(nextNumber).padStart(4, "0");

  return `${settings.invoicePrefix}-${year}-${paddedNumber}`;
}