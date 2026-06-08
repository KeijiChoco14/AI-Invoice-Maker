export const defaultSettings = {
  companyName: "Nama Brand Kamu",
  tagline: "Automation, Web Development & IT Support",
  address: "Pekanbaru, Riau",
  email: "email@brandkamu.com",
  phone: "08xxxxxxxxxx",
  taxLabel: "PPN",
  taxRate: 11,
  invoicePrefix: "INV",
  bankName: "BCA",
  bankAccount: "1234567890",
  bankHolder: "Nama Pemilik Rekening",
  footerNote: "Terima kasih atas kepercayaan Anda.",
};

export function getSettings() {
  const data = localStorage.getItem("invoice_settings");
  return data ? JSON.parse(data) : defaultSettings;
}

export function saveSettings(settings) {
  localStorage.setItem("invoice_settings", JSON.stringify(settings));
}

export function getInvoices() {
  return JSON.parse(localStorage.getItem("invoices")) || [];
}

export function saveInvoice(invoice) {
  const invoices = getInvoices();
  invoices.push(invoice);
  localStorage.setItem("invoices", JSON.stringify(invoices));
}

export function updateInvoiceStatus(invoiceNumber, newStatus) {
  const invoices = getInvoices();

  const updatedInvoices = invoices.map((invoice) =>
    invoice.invoiceNumber === invoiceNumber
      ? {
          ...invoice,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        }
      : invoice
  );

  localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
}

export function deleteInvoice(invoiceNumber) {
  const invoices = getInvoices();

  const updatedInvoices = invoices.filter(
    (invoice) => invoice.invoiceNumber !== invoiceNumber
  );

  localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
}

export function getInvoiceByNumber(invoiceNumber) {
  const invoices = getInvoices();

  return invoices.find(
    (invoice) => invoice.invoiceNumber === invoiceNumber
  );
}

export function updateInvoice(updatedInvoice) {
  const invoices = getInvoices();

  const updatedInvoices = invoices.map((invoice) =>
    invoice.invoiceNumber === updatedInvoice.invoiceNumber
      ? {
          ...updatedInvoice,
          updatedAt: new Date().toISOString(),
        }
      : invoice
  );

  localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
}