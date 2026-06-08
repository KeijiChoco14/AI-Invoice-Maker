import { getInvoices } from "../utils/storage";

function Dashboard() {
  const invoices = getInvoices();

  const totalInvoices = invoices.length;

  const totalRevenue = invoices.reduce((sum, invoice) => {
    return sum + Number(invoice.grandTotal || 0);
  }, 0);

  const paidInvoices = invoices.filter((invoice) => invoice.status === "Paid");
  const unpaidInvoices = invoices.filter((invoice) => invoice.status === "Unpaid");
  const overdueInvoices = invoices.filter((invoice) => invoice.status === "Overdue");
  const draftInvoices = invoices.filter((invoice) => invoice.status === "Draft");

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);

  const recentInvoices = [...invoices].slice(-5).reverse();

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="subtitle">
        Ringkasan performa invoice dan status pembayaran.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Invoice</span>
          <strong>{totalInvoices}</strong>
        </div>

        <div className="stat-card">
          <span>Total Nilai Invoice</span>
          <strong>{formatRupiah(totalRevenue)}</strong>
        </div>

        <div className="stat-card">
          <span>Paid</span>
          <strong>{paidInvoices.length}</strong>
        </div>

        <div className="stat-card">
          <span>Unpaid</span>
          <strong>{unpaidInvoices.length}</strong>
        </div>

        <div className="stat-card">
          <span>Overdue</span>
          <strong>{overdueInvoices.length}</strong>
        </div>

        <div className="stat-card">
          <span>Draft</span>
          <strong>{draftInvoices.length}</strong>
        </div>
      </div>

      <div className="table-card mt-24">
        <h2>Invoice Terbaru</h2>

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
                    <span className={`status ${invoice.status?.toLowerCase()}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>{formatRupiah(invoice.grandTotal)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-table">
                  Belum ada invoice.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;