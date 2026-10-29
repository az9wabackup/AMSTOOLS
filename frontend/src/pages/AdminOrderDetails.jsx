import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function AdminOrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("amsAdminToken");

      const response = await fetch(
        `http://localhost:5000/api/admin/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

        <Link to="/admin/orders">
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


  const updateOrderStatus = async (newStatus) => {
  try {
    const token = localStorage.getItem(
      "amsAdminToken"
    );

    const response = await fetch(
      `http://localhost:5000/api/admin/orders/${orderId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_status: newStatus,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to update order status."
      );
    }

    setOrder((previousOrder) => ({
      ...previousOrder,
      order_status: newStatus,
    }));

    alert("Order status updated successfully.");

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};


const updatePaymentStatus = async (newStatus) => {
  try {
    const token = localStorage.getItem(
      "amsAdminToken"
    );

    const response = await fetch(
      `http://localhost:5000/api/admin/orders/${orderId}/payment`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_status: newStatus,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to update payment status."
      );
    }

    setOrder((previousOrder) => ({
      ...previousOrder,
      payment_status: newStatus,
    }));

    alert(
      "Payment status updated successfully."
    );

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};


  return (
    <section className="admin-order-details-page">

      <div className="admin-order-details-header">
        <div>
          <h1>Order #{order.order_id}</h1>

          <p>
            {new Date(
              order.created_at
            ).toLocaleString()}
          </p>
        </div>

        <Link to="/admin/orders">
          <button>← ORDERS</button>
        </Link>
      </div>

      {/* ORDER STATUS */}

      <div className="admin-order-status-card">

  <h2>Order Status</h2>

  <p>
    <strong>Current Status:</strong>{" "}
    {order.order_status}
  </p>

  <select
    value={order.order_status}
    onChange={(e) =>
      updateOrderStatus(e.target.value)
    }
  >
    <option value="PLACED">PLACED</option>
    <option value="PROCESSING">PROCESSING</option>
    <option value="SHIPPED">SHIPPED</option>
    <option value="DELIVERED">DELIVERED</option>
    <option value="CANCELLED">CANCELLED</option>
  </select>

  <p>
  <strong>Current Payment:</strong>{" "}
  {order.payment_status}
</p>

<select
  value={order.payment_status}
  onChange={(e) =>
    updatePaymentStatus(e.target.value)
  }
>
  <option value="PENDING">PENDING</option>
  <option value="PAID">PAID</option>
  <option value="FAILED">FAILED</option>
</select>

</div>

      {/* CUSTOMER */}

      <div className="admin-order-section">

        <h2>Customer</h2>

        <p>
          <strong>Name:</strong>{" "}
          {order.customer_name}
        </p>

        <p>
          <strong>Phone:</strong>{" "}
          {order.phone}
        </p>

      </div>

      {/* PRODUCTS */}

      <div className="admin-order-section">

        <h2>Products</h2>

        <div className="admin-order-items">

          {items.map((item) => (
            <div
              className="admin-order-item"
              key={item.order_item_id}
            >

              <div>
                <h3>{item.product_name}</h3>

                <p>
                  Quantity: {item.quantity}
                </p>

                <p>
                  Price: ₹
                  {Number(item.price).toFixed(2)}
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

        <div className="admin-order-total">

          <h2>
            Total: ₹
            {Number(
              order.total_amount
            ).toFixed(2)}
          </h2>

        </div>

      </div>

      {/* DELIVERY */}

      <div className="admin-order-section">

        <h2>Delivery Address</h2>

        <p>
          <strong>
            {order.full_name}
          </strong>
        </p>

        <p>{order.phone}</p>

        <p>{order.address}</p>

        <p>
          {order.city}, {order.state}
        </p>

        <p>
          PIN: {order.pincode}
        </p>

      </div>

      {/* DTDC */}

      <div className="admin-order-section">

  <h2>DTDC Tracking</h2>

  <input
    type="text"
    id="dtdcTracking"
    placeholder="Enter DTDC tracking number"
    defaultValue={order.dtdc_tracking || ""}
  />

  <button
    type="button"
    onClick={async () => {
      const input =
        document.getElementById("dtdcTracking");

      const trackingNumber = input.value.trim();

      try {
        const token = localStorage.getItem(
          "amsAdminToken"
        );

        const response = await fetch(
          `http://localhost:5000/api/admin/orders/${orderId}/tracking`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              dtdc_tracking: trackingNumber,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to update tracking."
          );
        }

        setOrder((previousOrder) => ({
          ...previousOrder,
          dtdc_tracking: trackingNumber,
        }));

        alert(
          "DTDC tracking updated successfully."
        );

      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    }}
  >
    SAVE TRACKING
  </button>

  {order.dtdc_tracking && (
    <p>
      Current Tracking:{" "}
      <strong>{order.dtdc_tracking}</strong>
    </p>
  )}

</div>

    </section>
  );
}

export default AdminOrderDetails;