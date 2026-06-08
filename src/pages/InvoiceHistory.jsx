import { useState } from "react";
import {
  getInvoices,
  updateInvoiceStatus,
  deleteInvoice,
} from "../utils/storage";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { Link } from "react-router-dom";

function InvoiceHistory() {
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState(getInvoices());

  const handleDeleteInvoice = (invoiceNumber) => {
    const confirmDelete = window.confirm(
      `Yakin ingin menghapus invoice ${invoiceNumber}?`,
    );

    if (!confirmDelete) return;

    deleteInvoice(invoiceNumber);
    setInvoices(getInvoices());
  };

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);

  const handleStatusChange = (invoiceNumber, newStatus) => {
    updateInvoiceStatus(invoiceNumber, newStatus);
    setInvoices(getInvoices());
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const keyword = search.toLowerCase();

    return (
      invoice.invoiceNumber?.toLowerCase().includes(keyword) ||
      invoice.clientName?.toLowerCase().includes(keyword) ||
      invoice.status?.toLowerCase().includes(keyword)
    );
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
