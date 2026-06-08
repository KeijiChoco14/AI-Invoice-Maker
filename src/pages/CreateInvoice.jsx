import { useState } from "react";
import { generateInvoiceNumber } from "../utils/invoiceNumber";
import { getSettings, saveInvoice } from "../utils/storage";
import { parseInvoiceText } from "../utils/parser";

function CreateInvoice() {
  const [naturalText, setNaturalText] = useState("");
  const settings = getSettings();

  const getInitialInvoice = () => ({
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    status: "Unpaid",
    notes: "",
    items: [
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ],
  });

  const [invoice, setInvoice] = useState(getInitialInvoice());

  const subtotal = invoice.items.reduce((sum, item) => {
    return sum + Number(item.quantity) * Number(item.unitPrice);
  }, 0);

  const taxAmount = subtotal * (Number(settings.taxRate) / 100);
  const grandTotal = subtotal + taxAmount;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);
  };

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

  const handleParseText = () => {
    if (!naturalText.trim()) {
      alert("Masukkan teks invoice terlebih dahulu.");
      return;
    }

    const parsed = parseInvoiceText(naturalText);

    setInvoice({
      ...invoice,
      clientName: parsed.clientName || invoice.clientName,
      clientEmail: parsed.clientEmail || invoice.clientEmail,
      clientPhone: parsed.clientPhone || invoice.clientPhone,
      clientAddress: parsed.clientAddress || invoice.clientAddress,
      dueDate: parsed.dueDate || invoice.dueDate,
      notes: parsed.notes || invoice.notes,
      items: parsed.items?.length ? parsed.items : invoice.items,
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
      currency: "IDR",
      createdAt: new Date().toISOString(),
    };

    saveInvoice(finalInvoice);
    alert("Invoice berhasil disimpan!");

    setInvoice(getInitialInvoice());
    setNaturalText("");
  };

  return (
    <div>
      <h1>Buat Invoice</h1>
      <p className="subtitle">
        Buat invoice dari input manual atau natural language parser.
      </p>

      <div className="ai-box">
        <h2>AI Invoice Parser</h2>
        <p>
          Masukkan deskripsi invoice dalam Bahasa Indonesia atau English, lalu
          sistem akan mencoba mengubahnya menjadi data invoice.
        </p>

        <textarea
          value={naturalText}
          onChange={(e) => setNaturalText(e.target.value)}
          placeholder="Contoh: Buat invoice untuk PT Maju Jaya, alamat Jl. Sudirman No.123 Pekanbaru, email finance@majujaya.co.id, telepon 081234567890, jasa website company profile Rp3500000, maintenance Rp750000, jatuh tempo 7 hari."
        />

        <button type="button" onClick={handleParseText}>
          Parse ke Form Invoice
        </button>
      </div>

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
          value={invoice.clientPhone}
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
                placeholder="Contoh: Pembuatan Website Company Profile"
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
          value={invoice.notes}
          onChange={handleChange}
          placeholder="Contoh: Pembayaran maksimal 7 hari setelah invoice diterbitkan."
        />

        <button type="submit">Simpan Invoice</button>
      </form>
    </div>
  );
}

export default CreateInvoice;