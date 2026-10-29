import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Orders() {
  const customer = JSON.parse(
    localStorage.getItem("amsCustomer")
  );

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customer) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/orders/customer/${customer.id}`
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

    fetchOrders();
  }, []);

  if (!customer) {
    return (
      <section className="page">
        <h2>Please Login</h2>

        <Link to="/login">
          <button>LOGIN</button>
        </Link>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="page">
        <h2>Loading Orders...</h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="page orders-page">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div>
          <p>You haven't placed any orders yet.</p>

          <Link to="/products">
            <button>SHOP NOW</button>
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div
              className="order-card"
              key={order.order_id}
            >
              <h3>
                Order #{order.order_id}
              </h3>

              <p>
                Amount: ₹{order.total_amount}
              </p>

              <p>
                Payment: {order.payment_status}
              </p>

              <p>
                Status: {order.order_status}
              </p>

              <p>
                Date:{" "}
                {new Date(
                  order.created_at
                ).toLocaleString()}
              </p>

              {order.dtdc_tracking && (
                <p>
                  DTDC Tracking:{" "}
                  {order.dtdc_tracking}
                </p>
              )}

              <Link
                to={`/orders/${order.order_id}`}
              >
                <button>
                  VIEW DETAILS →
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Orders;