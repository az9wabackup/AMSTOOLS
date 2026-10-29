import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("amsAdminToken");

      const response = await fetch(
        "http://localhost:5000/api/admin/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load customers."
        );
      }

      setCustomers(data.customers);

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
        <h2>Loading Customers...</h2>
      </section>
    );
  }

  return (
    <section className="admin-customers-page">

      <div className="admin-customers-header">
        <div>
          <h1>Customers</h1>
          <p>Manage AMS TOOLS customers</p>
        </div>

        <Link to="/admin">
          <button>← DASHBOARD</button>
        </Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {customers.length === 0 ? (
        <div className="empty-state">
          <h2>No Customers Found</h2>
        </div>
      ) : (
        <div className="admin-customers-list">

          {customers.map((customer) => (
            <Link
  to={`/admin/customers/${customer.customer_id}/orders`}
  className="admin-customer-card"
  key={customer.customer_id}
>

              <div className="admin-customer-avatar">
                {customer.full_name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="admin-customer-info">

                <h2>{customer.full_name}</h2>

                <p>
                  📱 {customer.phone}
                </p>

                <p>
                  Status:{" "}
                  <strong>
                    {customer.status}
                  </strong>
                </p>

                <div className="admin-customer-stats">

                  <span>
                    Orders:{" "}
                    <strong>
                      {customer.total_orders}
                    </strong>
                  </span>

                  <span>
                    Paid: ₹
                    <strong>
                      {Number(
                        customer.total_spent
                      ).toFixed(2)}
                    </strong>
                  </span>

                </div>

                <p className="customer-joined">
                  Joined:{" "}
                  {new Date(
                    customer.created_at
                  ).toLocaleDateString()}
                </p>

              </div>

            </Link>
          ))}

        </div>
      )}

    </section>
  );
}

export default AdminCustomers;