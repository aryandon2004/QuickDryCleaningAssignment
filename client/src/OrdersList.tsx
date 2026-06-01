import React from 'react';
import type { Order } from './App';

interface Props {
  orders: Order[];
  onUpdateGarment?: (orderId: string, garmentId: string, status: string) => void;
}

const statusLabel: Record<string, string> = {
  received: 'Received',
  in_cleaning: 'In Cleaning',
  ready: 'Ready for Pickup',
  delivered: 'Delivered',
};

export const OrdersList: React.FC<Props> = ({ orders, onUpdateGarment }) => {
  if (orders.length === 0) {
    return <p>No active orders.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{order.id}</strong>
            <span>{order.customerName}</span>
          </div>
          <small>Created: {new Date(order.createdAt).toLocaleString()}</small>
          <ul>
            {order.garments.map((g) => (
              <li key={g.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ flex: 1 }}>{g.description}</span>
                <em>{statusLabel[g.status] ?? g.status}</em>
                <select
                  value={g.status}
                  onChange={(e) =>
                    typeof onUpdateGarment === 'function' && onUpdateGarment(order.id, g.id, e.target.value)
                  }
                >
                  <option value="received">Received</option>
                  <option value="in_cleaning">In Cleaning</option>
                  <option value="ready">Ready for Pickup</option>
                  <option value="delivered">Delivered</option>
                </select>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
