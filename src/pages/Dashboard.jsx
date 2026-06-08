import { Link } from "react-router-dom";
import { syncOverdueInvoices } from "../utils/storage";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const invoices = syncOverdueInvoices();

  const totalInvoices = invoices.length;

  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.grandTotal || 0),
    0,
  );

  const paidInvoices = invoices.filter((invoice) => invoice.status === "Paid");
  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.status === "Unpaid",
  );
  const overdueInvoices = invoices.filter(
    (invoice) => invoice.status === "Overdue",
  );

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);

  const recentInvoices = [...invoices].slice(-5).reverse();

  const monthlyRevenue = invoices.reduce((acc, invoice) => {
    if (!invoice.invoiceDate) return acc;

    const date = new Date(invoice.invoiceDate);
    const month = date.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });

    const existing = acc.find((item) => item.month === month);

    if (existing) {
      existing.revenue += Number(invoice.grandTotal || 0);
      existing.count += 1;
    } else {
      acc.push({
        month,
        revenue: Number(invoice.grandTotal || 0),
        count: 1,
      });
    }

    return acc;
  }, []);

  return (
    <div>
      <section className="hero-dashboard">
        <div>
          <span className="eyebrow">AI Invoice Workspace</span>
          <h1>Kelola invoice jasa digital kamu lebih cepat.</h1>
          <p>
            Buat invoice dari natural language, kelola status pembayaran, dan
            download PDF profesional dengan branding navy-gold.
          </p>

          <div className="hero-actions">
            <Link to="/create" className="primary-action">
              + Buat Invoice
            </Link>
            <Link to="/history" className="ghost-action">
              Lihat Riwayat
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <span>Total Nilai Invoice</span>
          <strong>{formatRupiah(totalRevenue)}</strong>
          <p>{totalInvoices} invoice tersimpan</p>
        </div>
      </section>

      <div className="stats-grid modern">
        <div className="stat-card ai-card">
          <span>Total Invoice</span>
          <strong>{totalInvoices}</strong>
          <p>Semua invoice</p>
        </div>

        <div className="stat-card ai-card">
          <span>Belum Dibayar</span>
          <strong>{unpaidInvoices.length}</strong>
          <p>
            {formatRupiah(
              unpaidInvoices.reduce((s, i) => s + Number(i.grandTotal || 0), 0),
            )}
          </p>
        </div>

        <div className="stat-card ai-card danger-stat">
          <span>Tertunggak</span>
          <strong>{overdueInvoices.length}</strong>
          <p>
            {formatRupiah(
              overdueInvoices.reduce(
                (s, i) => s + Number(i.grandTotal || 0),
                0,
              ),
            )}
          </p>
        </div>

        <div className="stat-card ai-card success-stat">
          <span>Lunas</span>
          <strong>{paidInvoices.length}</strong>
          <p>
            {formatRupiah(
              paidInvoices.reduce((s, i) => s + Number(i.grandTotal || 0), 0),
            )}
          </p>
        </div>
      </div>

      <section className="chart-section">
        <div className="section-header">
          <div>
            <h2>Revenue Bulanan</h2>
            <p>Grafik total nilai invoice berdasarkan bulan.</p>
          </div>
        </div>

        <div className="chart-card">
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyRevenue}>
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("id-ID", {
                      notation: "compact",
                      compactDisplay: "short",
                    }).format(value)
                  }
                />
                <Tooltip
                  formatter={(value) =>
                    new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(value)
                  }
                />
                <Bar dataKey="revenue" fill="#D4AF37" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">
              <strong>Belum ada data grafik</strong>
              <p>Buat invoice pertama untuk melihat revenue bulanan.</p>
            </div>
          )}
        </div>
      </section>

      <section className="recent-section">
        <div className="section-header">
          <div>
            <h2>Invoice Terbaru</h2>
            <p>Invoice paling baru yang kamu buat.</p>
          </div>

          <Link to="/history" className="small-link-btn">
            Lihat Semua
          </Link>
        </div>

        <div className="table-card modern-table">
          <table>
            <thead>
              <tr>
                <th>Nomor</th>
                <th>Klien</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice, index) => (
                  <tr key={index}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{invoice.clientName}</td>
                    <td>
                      <span
                        className={`status ${invoice.status?.toLowerCase()}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td>{formatRupiah(invoice.grandTotal)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">
                    <div className="empty-state">
                      <div className="empty-state-card">
                        <div className="empty-state-icon">AI</div>
                        <h3>Belum ada invoice</h3>
                        <p>
                          Buat invoice pertama kamu dan dashboard akan mulai
                          menampilkan riwayat, revenue, serta status pembayaran.
                        </p>
                        <Link to="/create" className="primary-action">
                          + Buat Invoice Pertama
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
