import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getInvoiceByNumber,
  getSettings,
  updateInvoice,
} from "../utils/storage";

function EditInvoice() {
  const { invoiceNumber } = useParams();
  const navigate = useNavigate();

  const settings = getSettings();
  const savedInvoice = getInvoiceByNumber(invoiceNumber);

  const [invoice, setInvoice] = useState(savedInvoice);

  if (!savedInvoice) {
    return (
      <div>
        <h1>Invoice tidak ditemukan</h1>
        <Link to="/history">Kembali ke Riwayat</Link>
      </div>
    );
  }

  const subtotal = invoice.items.reduce((sum, item) => {
    return sum + Number(item.quantity) * Number(item.unitPrice);
  }, 0);

  const taxAmount = subtotal * (Number(settings.taxRate) / 100);
  const grandTotal = subtotal + taxAmount;

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setInvoice({
      ...invoice,
      [name]: value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoice.items];

    updatedItems[index][field] =
      field === "quantity" || field === "unitPrice" ? Number(value) : value;

    setInvoice({
      ...invoice,
      items: updatedItems,
    });
  };

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    });
  };

  const removeItem = (index) => {
    const updatedItems = invoice.items.filter((_, i) => i !== index);

    setInvoice({
      ...invoice,
      items: updatedItems.length
        ? updatedItems
        : [{ description: "", quantity: 1, unitPrice: 0 }],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalInvoice = {
      ...invoice,
      subtotal,
      taxLabel: settings.taxLabel,
      taxRate: settings.taxRate,
      taxAmount,
      grandTotal,
    };

    updateInvoice(finalInvoice);
    alert("Invoice berhasil diperbarui!");
    navigate(`/invoice/${invoice.invoiceNumber}`);
  };

  return (
    <div>
      <h1>Edit Invoice</h1>
      <p className="subtitle">{invoice.invoiceNumber}</p>

      <form className="form-card wide" onSubmit={handleSubmit}>
        <h2>Informasi Invoice</h2>

        <div className="grid-2">
          <div>
            <label>Nomor Invoice</label>
            <input
              name="invoiceNumber"
              value={invoice.invoiceNumber}
              readOnly
            />
          </div>

          <div>
            <label>Status</label>
            <select
              name="status"
              value={invoice.status}
              onChange={handleChange}
            >
              <option value="Draft">Draft</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label>Tanggal Invoice</label>
            <input
              type="date"
              name="invoiceDate"
              value={invoice.invoiceDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Jatuh Tempo</label>
            <input
              type="date"
              name="dueDate"
              value={invoice.dueDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <h2>Data Klien</h2>

        <label>Nama Klien</label>
        <input
          name="clientName"
          value={invoice.clientName}
          onChange={handleChange}
          required
        />

        <label>Email Klien</label>
        <input
          type="email"
          name="clientEmail"
          value={invoice.clientEmail}
          onChange={handleChange}
        />

        <label>Telepon / WhatsApp Klien</label>
        <input
          name="clientPhone"
          value={invoice.clientPhone || ""}
          onChange={handleChange}
        />

        <label>Alamat Klien</label>
        <textarea
          name="clientAddress"
          value={invoice.clientAddress}
          onChange={handleChange}
        />

        <h2>Item Jasa</h2>

        {invoice.items.map((item, index) => (
          <div className="item-row" key={index}>
            <div>
              <label>Deskripsi Jasa</label>
              <input
                value={item.description}
                onChange={(e) =>
                  handleItemChange(index, "description", e.target.value)
                }
                required
              />
            </div>

            <div>
              <label>Qty</label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
              />
            </div>

            <div>
              <label>Harga</label>
              <input
                type="number"
                min="0"
                value={item.unitPrice}
                onChange={(e) =>
                  handleItemChange(index, "unitPrice", e.target.value)
                }
              />
            </div>

            <div>
              <label>Total</label>
              <input
                value={formatRupiah(item.quantity * item.unitPrice)}
                readOnly
              />
            </div>

            <button
              type="button"
              className="danger-btn"
              onClick={() => removeItem(index)}
            >
              Hapus
            </button>
          </div>
        ))}

        <button type="button" className="secondary-btn" onClick={addItem}>
          + Tambah Item
        </button>

        <h2>Ringkasan</h2>

        <div className="summary-box">
          <div>
            <span>Subtotal</span>
            <strong>{formatRupiah(subtotal)}</strong>
          </div>

          <div>
            <span>
              {settings.taxLabel} {settings.taxRate}%
            </span>
            <strong>{formatRupiah(taxAmount)}</strong>
          </div>

          <div className="grand-total">
            <span>Grand Total</span>
            <strong>{formatRupiah(grandTotal)}</strong>
          </div>
        </div>

        <label>Catatan</label>
        <textarea
          name="notes"
          value={invoice.notes || ""}
          onChange={handleChange}
        />

        <div className="action-buttons">
          <button type="submit">Simpan Perubahan</button>

          <Link className="link-btn" to={`/invoice/${invoice.invoiceNumber}`}>
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}

export default EditInvoice;