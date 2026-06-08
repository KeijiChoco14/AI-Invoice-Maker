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

export function duplicateInvoice(invoiceNumber) {
  const invoices = getInvoices();
  const originalInvoice = getInvoiceByNumber(invoiceNumber);

  if (!originalInvoice) return null;

  const settings = getSettings();
  const year = new Date().getFullYear();

  const currentYearInvoices = invoices.filter((invoice) =>
    invoice.invoiceNumber?.includes(`${settings.invoicePrefix}-${year}`)
  );

  const nextNumber = currentYearInvoices.length + 1;
  const paddedNumber = String(nextNumber).padStart(4, "0");

  const duplicatedInvoice = {
    ...originalInvoice,
    invoiceNumber: `${settings.invoicePrefix}-${year}-${paddedNumber}`,
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "Draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  invoices.push(duplicatedInvoice);
  localStorage.setItem("invoices", JSON.stringify(invoices));

  return duplicatedInvoice;
}

export function syncOverdueInvoices() {
  const invoices = getInvoices();
  const today = new Date().toISOString().split("T")[0];

  const updatedInvoices = invoices.map((invoice) => {
    if (
      invoice.status === "Unpaid" &&
      invoice.dueDate &&
      invoice.dueDate < today
    ) {
      return {
        ...invoice,
        status: "Overdue",
        updatedAt: new Date().toISOString(),
      };
    }

    return invoice;
  });

  localStorage.setItem("invoices", JSON.stringify(updatedInvoices));

  return updatedInvoices;
}

export function exportInvoicesToJSON() {
  const invoices = getInvoices();
  const settings = getSettings();

  const backupData = {
    exportedAt: new Date().toISOString(),
    settings,
    invoices,
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `invoice-backup-${new Date().toISOString().split("T")[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export function importInvoicesFromJSON(file, callback) {
  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);

      if (!data.invoices || !Array.isArray(data.invoices)) {
        alert("File backup tidak valid.");
        return;
      }

      if (data.settings) {
        localStorage.setItem("invoice_settings", JSON.stringify(data.settings));
      }

      localStorage.setItem("invoices", JSON.stringify(data.invoices));

      alert("Data backup berhasil di-import!");

      if (callback) callback();
    } catch (error) {
      alert("Gagal membaca file JSON.");
    }
  };

  reader.readAsText(file);
}