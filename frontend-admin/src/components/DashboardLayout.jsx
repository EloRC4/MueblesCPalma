/**
 * DashboardLayout.jsx
 * Wrapper component for the admin panel structure.
 */
export default function DashboardLayout({ children }) {
  return (
    <div className="layout">
      <nav className="sidebar">
        <h2>C Palma Admin</h2>
        <ul>
          <li>Inventory</li>
          <li>Analytics</li>
          <li>Settings</li>
        </ul>
      </nav>
      <main className="content">
        {children}
      </main>
    </div>
  );
}