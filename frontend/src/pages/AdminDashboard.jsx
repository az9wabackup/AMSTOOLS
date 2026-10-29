import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const admin = JSON.parse(
    localStorage.getItem("amsAdmin")
  );

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStock: 0,
    totalSales: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!admin) {
      navigate("/admin/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem(
          "amsAdminToken"
        );

        const response = await fetch(
          "http://localhost:5000/api/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load dashboard."
          );
        }

        setStats(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("amsAdminToken");
    localStorage.removeItem("amsAdmin");

    navigate("/admin/login");
  };

  if (!admin) {
    return null;
  }

  return (
    <section className="admin-dashboard">

      <div className="admin-header">
        <div>
          <p>WELCOME</p>
          <h1>{admin.fullName}</h1>
          <span>AMS TOOLS ADMIN</span>
        </div>

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          LOGOUT
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="admin-stats">

        <div className="admin-stat-card">
          <span>📦</span>
          <h2>
            {loading ? "..." : stats.totalOrders}
          </h2>
          <p>Total Orders</p>
        </div>

        <div className="admin-stat-card">
          <span>🛒</span>
          <h2>
            {loading ? "..." : stats.totalProducts}
          </h2>
          <p>Products</p>
        </div>

        <div className="admin-stat-card">
          <span>👥</span>
          <h2>
            {loading
              ? "..."
              : stats.totalCustomers}
          </h2>
          <p>Customers</p>
        </div>

        <div className="admin-stat-card">
          <span>⚠️</span>
          <h2>
            {loading ? "..." : stats.lowStock}
          </h2>
          <p>Low Stock</p>
        </div>

        <div className="admin-stat-card">
          <span>₹</span>
          <h2>
            {loading
              ? "..."
              : `₹${Number(
                  stats.totalSales
                ).toFixed(2)}`}
          </h2>
          <p>Total Sales</p>
        </div>

      </div>

      <div className="admin-menu">

        <Link to="/admin/products">
          <div className="admin-menu-card">
            <span>🛠️</span>

            <div>
              <h3>Products</h3>
              <p>
                Manage products, prices and stock
              </p>
            </div>
          </div>
        </Link>

        <Link to="/admin/orders">
          <div className="admin-menu-card">
            <span>📦</span>

            <div>
              <h3>Orders</h3>
              <p>
                View and manage customer orders
              </p>
            </div>
          </div>
        </Link>

        <Link to="/admin/customers">
          <div className="admin-menu-card">
            <span>👥</span>

            <div>
              <h3>Customers</h3>
              <p>
                View customer accounts and orders
              </p>
            </div>
          </div>
        </Link>

        <Link to="/admin/reports">
          <div className="admin-menu-card">
            <span>📊</span>

            <div>
              <h3>Reports</h3>
              <p>
                Sales and business reports
              </p>
            </div>
          </div>
        </Link>

      </div>

    </section>
  );
}

export default AdminDashboard;