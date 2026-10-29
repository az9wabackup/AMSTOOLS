import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function OrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/orders/${orderId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load order."
          );
        }

        setOrder(data.order);
        setItems(data.items);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <section className="page">
        <h2>Loading Order...</h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <h2>Unable to Load Order</h2>
        <p>{error}</p>
        <Link to="/orders">
          <button>BACK TO ORDERS</button>
        </Link>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="page">
        <h2>Order Not Found</h2>
      </section>
    );
  }

  return (
    <section className="page order-details-page">
      <Link to="/orders">
        <button>← BACK TO ORDERS</button>
      </Link>

      <div className="order-details-card">
        <h1>Order #{order.order_id}</h1>

        <div className="order-status-box">
          <p>
            <strong>Order Status:</strong>{" "}
            {order.order_status}
          </p>

          <p>
            <strong>Payment:</strong>{" "}
            {order.payment_status}
          </p>

          <p>
            <strong>Order Date:</strong>{" "}
            {new Date(
              order.created_at
            ).toLocaleString()}
          </p>
        </div>

        <h2>Products</h2>

        <div className="order-products">
          {items.map((item) => (
            <div
              className="order-product"
              key={item.order_item_id}
            >
              <div>
                <h3>{item.product_name}</h3>

                <p>
                  Quantity: {item.quantity}
                </p>
              </div>

              <strong>
                ₹
                {(
                  Number(item.price) *
                  item.quantity
                ).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>

        <div className="order-total">
          <h2>
            Total: ₹
            {Number(order.total_amount).toFixed(2)}
          </h2>
        </div>

        <h2>Delivery Address</h2>

        <div className="delivery-address">
          <p>
            <strong>{order.full_name}</strong>
          </p>

          <p>{order.phone}</p>

          <p>{order.address}</p>

          <p>
            {order.city}, {order.state}
          </p>

          <p>PIN: {order.pincode}</p>
        </div>

        {order.dtdc_tracking && (
          <div className="tracking-box">
            <h2>DTDC Tracking</h2>
            <p>{order.dtdc_tracking}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default OrderDetails;