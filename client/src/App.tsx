import React, { useEffect, useState } from 'react';
import { OrdersList } from './OrdersList';

export interface Garment {
  id: string;
  description: string;
  status: 'received' | 'in_cleaning' | 'ready' | 'delivered';
}

export interface Order {
  id: string;
  customerName: string;
  createdAt: string;
  garments: Garment[];
}

export const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'received' | 'in_cleaning' | 'ready' | 'delivered'>('all');
  const [customerName, setCustomerName] = useState<string>('');
  const [garmentsInput, setGarmentsInput] = useState<string>('');

  useEffect(() => {
    // placeholder - real fetchOrders defined outside effect
    // effect will trigger manual fetch below
  }, []);

  const fetchOrders = async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('http://localhost:3001/api/orders');
      const s = typeof status === 'string' ? status : filterStatus;
      if (s) url.searchParams.set('status', s);
      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as Order[];
      setOrders(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // initial load and refetch when filterStatus changes
  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const updateGarment = async (orderId: string, garmentId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/orders/${orderId}/garments/${garmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // refresh list
      await fetchOrders();
    } catch (e) {
      console.error(e);
      setError('Failed to update garment');
    }
  };

  const createOrder = async () => {
    const garments = garmentsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((desc) => ({ description: desc, status: 'received' as const }));
    try {
      const res = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, garments }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCustomerName('');
      setGarmentsInput('');
      await fetchOrders();
    } catch (e) {
      console.error(e);
      setError('Failed to create order');
    }
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>QDC Mini Dashboard</h1>
      <p>Simple view of active orders and garments.</p>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <label>
          Filter status:
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            <option value="received">Received</option>
            <option value="in_cleaning">In Cleaning</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </select>
        </label>
        <label>
          Show garments:
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as any)}>
            <option value="all">All</option>
            <option value="received">Received</option>
            <option value="in_cleaning">In Cleaning</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </select>
        </label>
        <button onClick={() => fetchOrders()}>Refresh</button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Create Order</h3>
        <input placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <input
          placeholder="Garments (comma separated)"
          value={garmentsInput}
          onChange={(e) => setGarmentsInput(e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        />
        <button onClick={createOrder} style={{ marginLeft: '0.5rem' }}>
          Create
        </button>
      </div>

      {loading && <p>Loading orders...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && (
        <OrdersList orders={orders} onUpdateGarment={updateGarment} selectedStatus={selectedStatus} />
      )}
    </div>
  );
};
