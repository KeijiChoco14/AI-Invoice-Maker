import { useState } from "react";
import { getSettings, saveSettings } from "../utils/storage";

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
    alert("Pengaturan berhasil disimpan!");
  };

  return (
    <div>
      <h1>Pengaturan</h1>
      <p className="subtitle">
        Data ini akan digunakan otomatis di invoice dan PDF.
      </p>

      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Informasi Brand</h2>

        <label>Nama Perusahaan / Brand</label>
        <input name="companyName" value={settings.companyName} onChange={handleChange} />

        <label>Tagline</label>
        <input name="tagline" value={settings.tagline} onChange={handleChange} />

        <label>Alamat</label>
        <textarea name="address" value={settings.address} onChange={handleChange} />

        <label>Email</label>
        <input name="email" value={settings.email} onChange={handleChange} />

        <label>Telepon</label>
        <input name="phone" value={settings.phone} onChange={handleChange} />

        <h2>Pengaturan Invoice</h2>

        <label>Prefix Nomor Invoice</label>
        <input name="invoicePrefix" value={settings.invoicePrefix} onChange={handleChange} />

        <label>Label Pajak</label>
        <input name="taxLabel" value={settings.taxLabel} onChange={handleChange} />

        <label>Persentase Pajak (%)</label>
        <input type="number" name="taxRate" value={settings.taxRate} onChange={handleChange} />

        <h2>Informasi Pembayaran</h2>

        <label>Bank</label>
        <input name="bankName" value={settings.bankName} onChange={handleChange} />

        <label>Nomor Rekening</label>
        <input name="bankAccount" value={settings.bankAccount} onChange={handleChange} />

        <label>Atas Nama</label>
        <input name="bankHolder" value={settings.bankHolder} onChange={handleChange} />

        <h2>Catatan Footer</h2>

        <label>Catatan</label>
        <textarea name="footerNote" value={settings.footerNote} onChange={handleChange} />

        <button type="submit">Simpan Pengaturan</button>
      </form>
    </div>
  );
}

export default Settings;