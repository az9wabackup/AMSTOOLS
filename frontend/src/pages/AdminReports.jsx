import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("amsAdminToken");

      const response = await fetch(
        "http://localhost:5000/api/admin/reports",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load reports."
        );
      }

      setReport(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="page">
        <h2>Loading Reports...</h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <h2>Reports Error</h2>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="admin-customers-page">

      <div className="admin-customers-header">
        <div>
          <h1>Reports</h1>
          <p>AMS TOOLS business overview</p>
        </div>

        <Link to="/admin">
          <button>← DASHBOARD</button>
        </Link>
      </div>

      {/* SUMMARY */}

      <div className="admin-customer-card">
        <h2>Sales Summary</h2>

        <p>
          Total Orders:{" "}
          <strong>
            {report.summary.total_orders}
          </strong>
        </p>

        <p>
          Total Sales:{" "}
          <strong>
            ₹{Number(report.summary.total_sales).toFixed(2)}
          </strong>
        </p>

        <p>
          Paid Orders:{" "}
          <strong>
            {report.summary.paid_orders}
          </strong>
        </p>

        <p>
          Pending Payments:{" "}
          <strong>
            {report.summary.pending_orders}
          </strong>
        </p>

        <p>
          Cancelled Orders:{" "}
          <strong>
            {report.summary.cancelled_orders}
          </strong>
        </p>
      </div>

      {/* PRODUCT SALES */}

      <div className="admin-customers-list">

        <div className="admin-customer-card">

          <h2>Product Sales</h2>

          {report.productSales.length === 0 ? (
            <p>No product sales found.</p>
          ) : (
            report.productSales.map((product) => (
              <div
                key={product.product_id}
                style={{
                  marginBottom: "20px",
                }}
              >
                <h3>
                  {product.product_name}
                </h3>

                <p>
                  Quantity Sold:{" "}
                  <strong>
                    {product.quantity_sold}
                  </strong>
                </p>

                <p>
                  Sales Amount:{" "}
                  <strong>
                    ₹
                    {Number(
                      product.sales_amount
                    ).toFixed(2)}
                  </strong>
                </p>
              </div>
            ))
          )}

        </div>

      </div>

      {/* CUSTOMER SALES */}

      <div className="admin-customers-list">

        <div className="admin-customer-card">

          <h2>Customer Sales</h2>

          {report.customerSales.length === 0 ? (
            <p>No customer data found.</p>
          ) : (
            report.customerSales.map((customer) => (
              <div
                key={customer.customer_id}
                style={{
                  marginBottom: "20px",
                }}
              >
                <h3>
                  {customer.full_name}
                </h3>

                <p>
                  📱 {customer.phone}
                </p>

                <p>
                  Orders:{" "}
                  <strong>
                    {customer.total_orders}
                  </strong>
                </p>

                <p>
                  Paid:{" "}
                  <strong>
                    ₹
                    {Number(
                      customer.total_spent
                    ).toFixed(2)}
                  </strong>
                </p>

              </div>
            ))
          )}

        </div>

      </div>

    </section>
  );
}

export default AdminReports;