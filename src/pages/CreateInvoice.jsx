import { useState, useEffect } from "react";
import { generateInvoiceNumber } from "../utils/invoiceNumber";
import { getSettings, saveInvoice } from "../utils/storage";
import { parseInvoiceText } from "../utils/parser";
import toast from "react-hot-toast";

function CreateInvoice() {
  const [naturalText, setNaturalText] = useState(() => {
    return localStorage.getItem("invoice_natural_text_draft") || "";
  });
  const [isParsing, setIsParsing] = useState(false);
  const [errors, setErrors] = useState({});

  const settings = getSettings();
  const DRAFT_KEY = "invoice_draft";
  const NATURAL_TEXT_KEY = "invoice_natural_text_draft";

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
    items: [{ description: "", quantity: 1, unitPrice: 0 }],
  });

  const [invoice, setInvoice] = useState(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);

    if (savedDraft) {
      try {
        return JSON.parse(savedDraft);
      } catch {
        return getInitialInvoice();
      }
    }

    return getInitialInvoice();
  });

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(invoice));
  }, [invoice]);

  useEffect(() => {
    localStorage.setItem(NATURAL_TEXT_KEY, naturalText);
  }, [naturalText]);

  const subtotal = invoice.items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
    0,
  );

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

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoice.items];

    updatedItems[index][field] =
      field === "quantity" || field === "unitPrice" ? Number(value) : value;

    setInvoice({
      ...invoice,
      items: updatedItems,
    });

    const errorKeyMap = {
      description: `itemDescription${index}`,
      quantity: `itemQuantity${index}`,
      unitPrice: `itemPrice${index}`,
    };

    const errorKey = errorKeyMap[field];

    if (errors[errorKey]) {
      setErrors({
        ...errors,
        [errorKey]: "",
      });
    }
  };

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: "", quantity: 1, unitPrice: 0 }],
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
      toast.error("Masukkan teks invoice terlebih dahulu.");
      return;
    }

    setIsParsing(true);

    try {
      const parsed = parseInvoiceText(naturalText);

      setInvoice({
        ...invoice,
        clientName: parsed.clientName || invoice.clientName,
        clientEmail: parsed.clientEmail || invoice.clientEmail,
        clientPhone: parsed.clientPhone || invoice.clientPhone,
        clientAddress: parsed.clientAddress || invoice.clientAddress,
        dueDate: parsed.dueDate || invoice.dueDate,
        status: parsed.status || invoice.status,
        notes: parsed.notes || naturalText,
        items: parsed.items?.length ? parsed.items : invoice.items,
      });

      setErrors({});
      toast.success("Invoice berhasil diparsing dengan Local Parser.");
    } catch (error) {
      toast.error(error.message || "Gagal parsing invoice.");
    } finally {
      setIsParsing(false);
    }
  };

  const validateInvoice = () => {
    const newErrors = {};

    if (!invoice.clientName.trim()) {
      newErrors.clientName = "Nama klien wajib diisi.";
    }

    if (invoice.clientEmail && !/\S+@\S+\.\S+/.test(invoice.clientEmail)) {
      newErrors.clientEmail = "Format email klien tidak valid.";
    }

    if (!invoice.dueDate) {
      newErrors.dueDate = "Tanggal jatuh tempo wajib diisi.";
    }

    invoice.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`itemDescription${index}`] = "Deskripsi jasa wajib diisi.";
      }

      if (Number(item.quantity) < 1) {
        newErrors[`itemQuantity${index}`] = "Qty minimal 1.";
      }

      if (Number(item.unitPrice) <= 0) {
        newErrors[`itemPrice${index}`] = "Harga harus lebih dari 0.";
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateInvoice()) {
      toast.error("Periksa kembali data invoice.");
      return;
    }

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
    toast.success("Invoice berhasil disimpan!");

    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(NATURAL_TEXT_KEY);

    setInvoice(getInitialInvoice());
    setNaturalText("");
    setErrors({});
  };

  return (
    <div>
      <section className="page-hero">
        <div>
          <span className="eyebrow">Smart Invoice Generator</span>
          <h1>Buat invoice dari teks terstruktur.</h1>
          <p>
            Masukkan detail invoice dalam format semi-terstruktur. Sistem akan
            mengubahnya menjadi form invoice yang bisa kamu review sebelum
            disimpan.
          </p>
        </div>
      </section>

      <div className="create-layout">
        <div className="ai-box premium-ai">
          <div className="ai-box-header">
            <div>
              <h2>Smart Local Parser</h2>
              <p>
                Gunakan format semi-terstruktur agar hasil parsing stabil tanpa
                API berbayar.
              </p>
            </div>

            <div className="parser-controls">
              <span className="ai-pill">Local AI-like Parser</span>
              <span className="draft-indicator">Draft tersimpan otomatis</span>
            </div>
          </div>

          <textarea
            value={naturalText}
            onChange={(e) => setNaturalText(e.target.value)}
            placeholder={`Client: PT Maju Jaya
Email: finance@majujaya.co.id
Phone: 081234567890
Address: Jl. Sudirman No.123 Pekanbaru

Items:
- Website Company Profile | 3500000
- Maintenance Bulanan | 750000

Due: 7 days`}
          />

          <button type="button" onClick={handleParseText} disabled={isParsing}>
            {isParsing ? "Memproses..." : "Generate ke Form Invoice"}
          </button>
        </div>

        <div className="side-summary">
          <span>Estimasi Grand Total</span>
          <strong>{formatRupiah(grandTotal)}</strong>
          <p>{invoice.items.length} item jasa</p>

          <div className="mini-summary">
            <div>
              <span>Subtotal</span>
              <b>{formatRupiah(subtotal)}</b>
            </div>

            <div>
              <span>
                {settings.taxLabel} {settings.taxRate}%
              </span>
              <b>{formatRupiah(taxAmount)}</b>
            </div>
          </div>
        </div>
      </div>

      <form className="form-card wide modern-form" onSubmit={handleSubmit}>
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
              className={errors.dueDate ? "input-error" : ""}
            />
            {errors.dueDate && (
              <small className="error-text">{errors.dueDate}</small>
            )}
          </div>
        </div>

        <h2>Data Klien</h2>

        <div className="grid-2">
          <div>
            <label>Nama Klien</label>
            <input
              name="clientName"
              value={invoice.clientName}
              onChange={handleChange}
              className={errors.clientName ? "input-error" : ""}
              required
            />
            {errors.clientName && (
              <small className="error-text">{errors.clientName}</small>
            )}
          </div>

          <div>
            <label>Email Klien</label>
            <input
              type="email"
              name="clientEmail"
              value={invoice.clientEmail}
              onChange={handleChange}
              className={errors.clientEmail ? "input-error" : ""}
            />
            {errors.clientEmail && (
              <small className="error-text">{errors.clientEmail}</small>
            )}
          </div>

          <div>
            <label>Telepon / WhatsApp Klien</label>
            <input
              name="clientPhone"
              value={invoice.clientPhone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Alamat Klien</label>
            <textarea
              name="clientAddress"
              value={invoice.clientAddress}
              onChange={handleChange}
            />
          </div>
        </div>

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
                className={
                  errors[`itemDescription${index}`] ? "input-error" : ""
                }
                required
              />
              {errors[`itemDescription${index}`] && (
                <small className="error-text">
                  {errors[`itemDescription${index}`]}
                </small>
              )}
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
                className={errors[`itemQuantity${index}`] ? "input-error" : ""}
              />
              {errors[`itemQuantity${index}`] && (
                <small className="error-text">
                  {errors[`itemQuantity${index}`]}
                </small>
              )}
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
                className={errors[`itemPrice${index}`] ? "input-error" : ""}
              />
              {errors[`itemPrice${index}`] && (
                <small className="error-text">
                  {errors[`itemPrice${index}`]}
                </small>
              )}
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

        <div className="form-actions">
          <button
            type="button"
            className="danger-btn"
            onClick={() => {
              localStorage.removeItem(DRAFT_KEY);
              localStorage.removeItem(NATURAL_TEXT_KEY);
              setInvoice(getInitialInvoice());
              setNaturalText("");
              setErrors({});
              toast.success("Draft berhasil dihapus.");
            }}
          >
            Hapus Draft
          </button>

          <button type="submit">Simpan Invoice</button>
        </div>
      </form>
    </div>
  );
}

export default CreateInvoice;
