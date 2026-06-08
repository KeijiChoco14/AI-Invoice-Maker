import { Link, useParams } from "react-router-dom";
import {
  getInvoiceByNumber,
  getSettings,
  updateInvoiceStatus,
} from "../utils/storage";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { shareInvoiceToWhatsApp } from "../utils/whatsapp";

function InvoiceDetail() {
  const { invoiceNumber } = useParams();
  const invoice = getInvoiceByNumber(invoiceNumber);
  const settings = getSettings();
  const navigate = useNavigate();

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);

  if (!invoice) {
    return (
      <div>
        <section className="page-hero compact">
          <span className="eyebrow">Invoice Preview</span>
          <h1>Invoice tidak ditemukan</h1>
          <p>Data invoice yang kamu cari tidak tersedia.</p>
        </section>

        <Link className="link-btn" to="/history">
          Kembali ke Riwayat
        </Link>
      </div>
    );
  }

  const handleMarkAsPaid = () => {
    updateInvoiceStatus(invoice.invoiceNumber, "Paid");
    toast.success("Invoice berhasil ditandai lunas.");
    navigate(`/invoice/${invoice.invoiceNumber}`);
    window.location.reload();
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div>
      <div className="detail-header premium-detail-header">
        <div>
          <span className="eyebrow dark">Invoice Preview</span>
          <h1>Preview Invoice</h1>
          <p className="subtitle">{invoice.invoiceNumber}</p>
        </div>

        <div className="action-buttons">
          <Link className="btn-icon btn-ghost-outline" to="/history">
            <i className="ti ti-arrow-left" aria-hidden="true" />
            Kembali
          </Link>

          <Link
            className="btn-icon btn-ghost-outline"
            to={`/invoice/${invoice.invoiceNumber}/edit`}
          >
            <i className="ti ti-pencil" aria-hidden="true" />
            Edit
          </Link>

          {invoice.status !== "Paid" && (
            <button
              type="button"
              className="btn-icon btn-green-soft"
              onClick={handleMarkAsPaid}
            >
              <i className="ti ti-circle-check" aria-hidden="true" />
              Tandai Lunas
            </button>
          )}

          <button
            type="button"
            className="btn-icon btn-ghost-outline"
            onClick={handlePrintInvoice}
          >
            <i className="ti ti-printer" aria-hidden="true" />
            Print
          </button>

          <button
            className="btn-icon btn-dark-solid"
            onClick={() => generateInvoicePDF(invoice)}
          >
            <i className="ti ti-download" aria-hidden="true" />
            Download PDF
          </button>

          <button
            className="btn-icon btn-green-soft"
            onClick={() => shareInvoiceToWhatsApp(invoice)}
          >
            <i className="ti ti-brand-whatsapp" aria-hidden="true" />
            Share WA
          </button>
        </div>
      </div>

      <div className="invoice-preview premium-preview">
        <div className="preview-top">
          <div>
            <span className="preview-badge">Navy Gold Invoice</span>
            <h2>{settings.companyName}</h2>
            <p>{settings.tagline}</p>
          </div>

          <div className="preview-title">
            <h1>INVOICE</h1>
            <p>{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="preview-info-grid">
          <div className="preview-info-card">
            <h3>Ditagihkan Kepada</h3>
            <strong>{invoice.clientName}</strong>
            <p>{invoice.clientEmail || "-"}</p>
            <p>{invoice.clientPhone || "-"}</p>
            <p>{invoice.clientAddress || "-"}</p>
          </div>

          <div className="preview-info-card">
            <h3>Dari</h3>
            <strong>{settings.companyName}</strong>
            <p>{settings.email}</p>
            <p>{settings.phone}</p>
            <p>{settings.address}</p>
          </div>

          <div className="preview-info-card">
            <h3>Detail Invoice</h3>
            <p>Tanggal: {invoice.invoiceDate || "-"}</p>
            <p>Jatuh Tempo: {invoice.dueDate || "-"}</p>
            <p>
              Status:{" "}
              <span className={`status ${invoice.status?.toLowerCase()}`}>
                {invoice.status}
              </span>
            </p>
          </div>
        </div>

        <div className="preview-table-wrap">
          <table className="preview-table">
            <thead>
              <tr>
                <th>Deskripsi</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{formatRupiah(item.unitPrice)}</td>
                  <td>{formatRupiah(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="preview-bottom-grid">
          <div className="preview-payment">
            <h3>Informasi Pembayaran</h3>
            <p>Bank: {settings.bankName}</p>
            <p>No. Rekening: {settings.bankAccount}</p>
            <p>Atas Nama: {settings.bankHolder}</p>
          </div>

          <div className="preview-summary premium-summary">
            <div>
              <span>Subtotal</span>
              <strong>{formatRupiah(invoice.subtotal)}</strong>
            </div>

            <div>
              <span>
                {invoice.taxLabel} {invoice.taxRate}%
              </span>
              <strong>{formatRupiah(invoice.taxAmount)}</strong>
            </div>

            <div className="preview-grand-total">
              <span>Grand Total</span>
              <strong>{formatRupiah(invoice.grandTotal)}</strong>
            </div>
          </div>
        </div>

        <div className="preview-footer">
          {invoice.notes || settings.footerNote}
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetail;
