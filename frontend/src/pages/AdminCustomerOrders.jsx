import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function AdminCustomerOrders() {
  const { customerId } = useParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [customerId]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("amsAdminToken");

      const response = await fetch(
        `http://localhost:5000/api/admin/customers/${customerId}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("CUSTOMER ORDERS:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load orders."
        );
      }

      setOrders(data.orders || []);

    } catch (err) {
      console.error("CUSTOMER ORDERS ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="page">
        <h2>Loading Customer Orders...</h2>
      </section>
    );
  }

  return (
    <section className="admin-customers-page">

      <div className="admin-customers-header">
        <div>
          <h1>Customer Orders</h1>
          <p>
            Customer ID: {customerId}
          </p>
        </div>

        <Link to="/admin/customers">
          <button>← CUSTOMERS</button>
        </Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <h2>
          Total Orders: {orders.length}
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h2>No Orders Found</h2>
          <p>This customer has not placed any orders.</p>
        </div>
      ) : (
        <div className="admin-customers-list">

          {orders.map((order) => (
            <div
              className="admin-customer-card"
              key={order.order_id}
            >

              <div className="admin-customer-info">

                <h2>
                  Order #{order.order_id}
                </h2>

                <p>
                  Date:{" "}
                  {new Date(
                    order.created_at
                  ).toLocaleString()}
                </p>

                <p>
                  Amount:{" "}
                  <strong>
                    ₹{Number(order.total_amount).toFixed(2)}
                  </strong>
                </p>

                <p>
                  Payment:{" "}
                  <strong>
                    {order.payment_status}
                  </strong>
                </p>

                <p>
                  Status:{" "}
                  <strong>
                    {order.order_status}
                  </strong>
                </p>

                <p>
                  Customer:{" "}
                  <strong>
                    {order.full_name}
                  </strong>
                </p>

                <p>
                  Phone: {order.phone}
                </p>

                {order.dtdc_tracking && (
                  <p>
                    DTDC Tracking:{" "}
                    <strong>
                      {order.dtdc_tracking}
                    </strong>
                  </p>
                )}

                <Link
                  to={`/admin/orders/${order.order_id}`}
                >
                  <button>
                    VIEW ORDER
                  </button>
                </Link>

              </div>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}

export default AdminCustomerOrders;