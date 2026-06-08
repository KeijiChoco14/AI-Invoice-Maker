import { useState } from "react";
import {
  updateInvoiceStatus,
  deleteInvoice,
  duplicateInvoice,
  syncOverdueInvoices,
  exportInvoicesToJSON,
  importInvoicesFromJSON,
} from "../utils/storage";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { Link, useNavigate } from "react-router-dom";

function InvoiceHistory() {
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState(syncOverdueInvoices());
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("All");

  const handleImportJSON = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const confirmImport = window.confirm(
      "Import backup akan mengganti data invoice dan pengaturan saat ini. Lanjutkan?",
    );

    if (!confirmImport) return;

    importInvoicesFromJSON(file, () => {
      setInvoices(syncOverdueInvoices());
    });

    e.target.value = "";
  };

  const handleDuplicateInvoice = (invoiceNumber) => {
    const duplicated = duplicateInvoice(invoiceNumber);

    if (!duplicated) {
      alert("Invoice gagal diduplikasi.");
      return;
    }

    setInvoices(syncOverdueInvoices());
    navigate(`/invoice/${duplicated.invoiceNumber}/edit`);
  };

  const handleDeleteInvoice = (invoiceNumber) => {
    const confirmDelete = window.confirm(
      `Yakin ingin menghapus invoice ${invoiceNumber}?`,
    );

    if (!confirmDelete) return;

    deleteInvoice(invoiceNumber);
    setInvoices(syncOverdueInvoices());
  };

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);

  const handleStatusChange = (invoiceNumber, newStatus) => {
    updateInvoiceStatus(invoiceNumber, newStatus);
    setInvoices(syncOverdueInvoices());
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      invoice.invoiceNumber?.toLowerCase().includes(keyword) ||
      invoice.clientName?.toLowerCase().includes(keyword) ||
      invoice.status?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "All" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h1>Riwayat Invoice</h1>
      <p className="subtitle">
        Cari invoice, ubah status pembayaran, dan download ulang PDF.
      </p>

      <div className="history-toolbar">
        <input
          placeholder="Cari invoice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">Semua Status</option>
          <option value="Draft">Draft</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>

        <button
          type="button"
          className="export-btn"
          onClick={exportInvoicesToJSON}
        >
          Export JSON
        </button>

        <label className="import-btn">
          Import JSON
          <input
            type="file"
            accept="application/json"
            onChange={handleImportJSON}
            hidden
          />
        </label>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Nomor</th>
              <th>Klien</th>
              <th>Tanggal</th>
              <th>Jatuh Tempo</th>
              <th>Status</th>
              <th>Total</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice, index) => (
                <tr key={index}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.clientName}</td>
                  <td>{invoice.invoiceDate || "-"}</td>
                  <td>{invoice.dueDate || "-"}</td>
                  <td>
                    <select
                      className={`status-select ${invoice.status?.toLowerCase()}`}
                      value={invoice.status}
                      onChange={(e) =>
                        handleStatusChange(
                          invoice.invoiceNumber,
                          e.target.value,
                        )
                      }
                    >
                      <option value="Draft">Draft</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </td>
                  <td>{formatRupiah(invoice.grandTotal)}</td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        className="small-link-btn"
                        to={`/invoice/${invoice.invoiceNumber}`}
                      >
                        Detail
                      </Link>

                      <Link
                        className="small-link-btn"
                        to={`/invoice/${invoice.invoiceNumber}/edit`}
                      >
                        Edit
                      </Link>

                      <button
                        className="small-btn"
                        onClick={() => generateInvoicePDF(invoice)}
                      >
                        PDF
                      </button>

                      <button
                        className="small-btn secondary-small"
                        onClick={() =>
                          handleDuplicateInvoice(invoice.invoiceNumber)
                        }
                      >
                        Duplicate
                      </button>

                      <button
                        className="small-btn danger-small"
                        onClick={() =>
                          handleDeleteInvoice(invoice.invoiceNumber)
                        }
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-table">
                  Belum ada invoice yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InvoiceHistory;
