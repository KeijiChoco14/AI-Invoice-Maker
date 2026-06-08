import { Link, useParams } from "react-router-dom";
import { getInvoiceByNumber, getSettings } from "../utils/storage";
import { generateInvoicePDF } from "../utils/pdfGenerator";

function InvoiceDetail() {
  const { invoiceNumber } = useParams();
  const invoice = getInvoiceByNumber(invoiceNumber);
  const settings = getSettings();

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);

  if (!invoice) {
    return (
      <div>
        <h1>Invoice tidak ditemukan</h1>
        <Link to="/history">Kembali ke Riwayat</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="detail-header">
        <div>
          <h1>Preview Invoice</h1>
          <p className="subtitle">{invoice.invoiceNumber}</p>
        </div>

        <div className="action-buttons">
          <Link className="link-btn" to="/history">
            Kembali
          </Link>

          <Link
            className="link-btn"
            to={`/invoice/${invoice.invoiceNumber}/edit`}
          >
            Edit
          </Link>

          <button onClick={() => generateInvoicePDF(invoice)}>
            Download PDF
          </button>
        </div>
      </div>

      <div className="invoice-preview">
        <div className="preview-top">
          <div>
            <h2>{settings.companyName}</h2>
            <p>{settings.tagline}</p>
          </div>

          <div className="preview-title">
            <h1>INVOICE</h1>
            <p>{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="preview-info-grid">
          <div>
            <h3>Ditagihkan Kepada</h3>
            <strong>{invoice.clientName}</strong>
            <p>{invoice.clientEmail || "-"}</p>
            <p>{invoice.clientPhone || "-"}</p>
            <p>{invoice.clientAddress || "-"}</p>
          </div>

          <div>
            <h3>Dari</h3>
            <strong>{settings.companyName}</strong>
            <p>{settings.email}</p>
            <p>{settings.phone}</p>
            <p>{settings.address}</p>
          </div>

          <div>
            <h3>Detail Invoice</h3>
            <p>Tanggal: {invoice.invoiceDate || "-"}</p>
            <p>Jatuh Tempo: {invoice.dueDate || "-"}</p>
            <p>Status: {invoice.status}</p>
          </div>
        </div>

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

        <div className="preview-summary">
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

        <div className="preview-payment">
          <h3>Informasi Pembayaran</h3>
          <p>Bank: {settings.bankName}</p>
          <p>No. Rekening: {settings.bankAccount}</p>
          <p>Atas Nama: {settings.bankHolder}</p>
        </div>

        <div className="preview-footer">
          {invoice.notes || settings.footerNote}
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetail;
