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
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
import { shareInvoiceToWhatsApp } from "../utils/whatsapp";

function InvoiceHistory() {
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState(syncOverdueInvoices());
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState({
    open: false,
    type: null,
    invoiceNumber: null,
    file: null,
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const navigate = useNavigate();

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      invoiceNumber: null,
      file: null,
    });
  };

  const handleConfirmModal = async () => {
    if (modal.type === "delete") {
      deleteInvoice(modal.invoiceNumber);
      setInvoices(syncOverdueInvoices());
      toast.success("Invoice berhasil dihapus.");
      closeModal();
      return;
    }

    if (modal.type === "import") {
      try {
        const result = await importInvoicesFromJSON(modal.file);
        setInvoices(syncOverdueInvoices());
        toast.success(result.message);
      } catch (error) {
        toast.error(error.message);
      }

      closeModal();
    }
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setModal({
      open: true,
      type: "import",
      invoiceNumber: null,
      file,
    });

    e.target.value = "";
  };

  const handleDuplicateInvoice = (invoiceNumber) => {
    const duplicated = duplicateInvoice(invoiceNumber);

    if (!duplicated) {
      toast.error("Invoice gagal diduplikasi.");
      return;
    }

    setInvoices(syncOverdueInvoices());
    toast.success("Invoice berhasil diduplikasi.");
    navigate(`/invoice/${duplicated.invoiceNumber}/edit`);
  };

  const handleDeleteInvoice = (invoiceNumber) => {
    setModal({
      open: true,
      type: "delete",
      invoiceNumber,
      file: null,
    });
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
    toast.success("Status invoice berhasil diperbarui.");
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      invoice.invoiceNumber?.toLowerCase().includes(keyword) ||
      invoice.clientName?.toLowerCase().includes(keyword) ||
      invoice.status?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "All" || invoice.status === statusFilter;

    const invoiceDate = invoice.invoiceDate || "";

    const matchesDateFrom = !dateFrom || invoiceDate >= dateFrom;
    const matchesDateTo = !dateTo || invoiceDate <= dateTo;

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  return (
    <div>
      <section className="page-hero compact">
        <div>
          <span className="eyebrow">Invoice Records</span>
          <h1>Riwayat Invoice</h1>
          <p>
            Cari, filter, download PDF, duplicate, import/export backup, dan
            kelola status pembayaran invoice.
          </p>
        </div>
      </section>

      <div className="history-toolbar modern-toolbar">
        <input
          placeholder="Cari invoice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          title="Tanggal mulai"
        />

        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          title="Tanggal akhir"
        />

        <button
          type="button"
          className="small-btn"
          onClick={() => {
            setSearch("");
            setStatusFilter("All");
            setDateFrom("");
            setDateTo("");
          }}
        >
          Reset
        </button>

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
          onClick={() => {
            exportInvoicesToJSON();
            toast.success("Backup JSON berhasil diunduh.");
          }}
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

      <div className="table-card modern-table elevated">
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
                        className="small-btn whatsapp-small"
                        onClick={() => shareInvoiceToWhatsApp(invoice)}
                      >
                        WhatsApp
                      </button>

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
                <td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-state-card">
                      <div className="empty-state-icon">INV</div>
                      <h3>Invoice tidak ditemukan</h3>
                      <p>
                        Belum ada invoice yang sesuai dengan pencarian atau
                        filter status. Coba ubah keyword, pilih semua status,
                        atau buat invoice baru.
                      </p>
                      <Link to="/create" className="primary-action">
                        + Buat Invoice Baru
                      </Link>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={modal.open}
        title={
          modal.type === "delete" ? "Hapus Invoice?" : "Import Backup JSON?"
        }
        message={
          modal.type === "delete"
            ? `Invoice ${modal.invoiceNumber} akan dihapus permanen dari browser ini.`
            : "Import backup akan mengganti data invoice dan pengaturan saat ini."
        }
        confirmText={modal.type === "delete" ? "Hapus" : "Import"}
        danger={modal.type === "delete"}
        onConfirm={handleConfirmModal}
        onCancel={closeModal}
      />
    </div>
  );
}

export default InvoiceHistory;
