import { useState } from "react";
import { getSettings, saveSettings } from "../utils/storage";
import toast from "react-hot-toast";

function Settings() {
  const [settings, setSettings] = useState(getSettings());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: name === "taxRate" ? Number(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings(settings);
    toast.success("Pengaturan berhasil disimpan!");
  };

  return (
    <div>
      <section className="page-hero compact">
        <div>
          <span className="eyebrow">Brand Settings</span>
          <h1>Pengaturan Brand & Invoice</h1>
          <p>
            Semua informasi di halaman ini akan otomatis digunakan pada invoice,
            PDF, informasi pembayaran, dan branding aplikasi.
          </p>
        </div>
      </section>

      <form className="form-card wide modern-form" onSubmit={handleSubmit}>
        <div className="settings-section">
          <h2>Informasi Brand</h2>

          <div className="grid-2">
            <div>
              <label>Nama Perusahaan / Brand</label>
              <input
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Tagline</label>
              <input
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Email</label>
              <input
                name="email"
                value={settings.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Telepon</label>
              <input
                name="phone"
                value={settings.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <label>Alamat</label>
          <textarea
            name="address"
            value={settings.address}
            onChange={handleChange}
          />
        </div>

        <div className="settings-section">
          <h2>Pengaturan Invoice</h2>

          <div className="grid-3">
            <div>
              <label>Prefix Invoice</label>
              <input
                name="invoicePrefix"
                value={settings.invoicePrefix}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Label Pajak</label>
              <input
                name="taxLabel"
                value={settings.taxLabel}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Pajak (%)</label>
              <input
                type="number"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Informasi Pembayaran</h2>

          <div className="grid-3">
            <div>
              <label>Bank</label>
              <input
                name="bankName"
                value={settings.bankName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Nomor Rekening</label>
              <input
                name="bankAccount"
                value={settings.bankAccount}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Atas Nama</label>
              <input
                name="bankHolder"
                value={settings.bankHolder}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Footer Invoice</h2>

          <label>Catatan Footer</label>
          <textarea
            name="footerNote"
            value={settings.footerNote}
            onChange={handleChange}
          />
        </div>

        <div className="settings-actions">
          <button type="submit" className="save-settings-btn">
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
