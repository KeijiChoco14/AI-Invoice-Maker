import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceHistory from "./pages/InvoiceHistory";
import Settings from "./pages/Settings";
import InvoiceDetail from "./pages/InvoiceDetail";
import EditInvoice from "./pages/EditInvoice";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-icon">AI</div>
            <div>
              <h2>InvoiceAI</h2>
              <p>Smart Billing Studio</p>
            </div>
          </div>

          <nav className="nav-menu">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/create">Buat Invoice</NavLink>
            <NavLink to="/history">Riwayat</NavLink>
            <NavLink to="/settings">Pengaturan</NavLink>
          </nav>

          <div className="sidebar-card">
            <span>AI Invoice Parser</span>
            <p>Buat invoice dari teks ID/EN secara otomatis.</p>
          </div>
        </aside>

        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateInvoice />} />
            <Route path="/history" element={<InvoiceHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/invoice/:invoiceNumber" element={<InvoiceDetail />} />
            <Route
              path="/invoice/:invoiceNumber/edit"
              element={<EditInvoice />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
