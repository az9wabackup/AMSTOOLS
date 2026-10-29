import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("amsAdminToken");

      const response = await fetch(
        "http://localhost:5000/api/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load orders."
        );
      }

      setOrders(data.orders);

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
        <h2>Loading Orders...</h2>
      </section>
    );
  }

  return (
    <section className="admin-orders-page">

      <div className="admin-orders-header">
        <div>
          <h1>Orders</h1>
          <p>Manage customer orders</p>
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

      {orders.length === 0 ? (
        <div className="empty-state">
          <h2>No Orders Found</h2>
          <p>Customer orders will appear here.</p>
        </div>
      ) : (
        <div className="admin-orders-list">

          {orders.map((order) => (
            <div
              className="admin-order-card"
              key={order.order_id}
            >

              <div className="admin-order-top">

                <div>
                  <h2>
                    Order #{order.order_id}
                  </h2>

                  <p>
                    {new Date(
                      order.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <span className="order-status">
                  {order.order_status}
                </span>

              </div>

              <div className="admin-order-info">

                <p>
                  <strong>Customer:</strong>{" "}
                  {order.customer_name}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {order.phone}
                </p>

                <p>
                  <strong>Amount:</strong>{" "}
                  ₹{Number(
                    order.total_amount
                  ).toFixed(2)}
                </p>

                <p>
                  <strong>Payment:</strong>{" "}
                  {order.payment_status}
                </p>

                <p>
                  <strong>Delivery:</strong>{" "}
                  {order.city}, {order.state}
                </p>

              </div>

              <Link
                to={`/admin/orders/${order.order_id}`}
              >
                <button className="admin-view-order-button">
                  VIEW ORDER →
                </button>
              </Link>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}

export default AdminOrders;