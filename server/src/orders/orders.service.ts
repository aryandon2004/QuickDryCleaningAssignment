import { Injectable } from '@nestjs/common';

export type GarmentStatus = 'received' | 'in_cleaning' | 'ready' | 'delivered';

export interface Garment {
  id: string;
  description: string;
  status: GarmentStatus;
}

export interface Order {
  id: string;
  customerName: string;
  createdAt: string; // ISO string
  garments: Garment[];
}

// In-memory mock data to simulate a POS-like workflow
const ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    customerName: 'Alice Johnson',
    createdAt: new Date().toISOString(),
    garments: [
      { id: 'G-1', description: 'Blue Shirt', status: 'received' },
      { id: 'G-2', description: 'Black Trousers', status: 'in_cleaning' },
    ],
  },
  {
    id: 'ORD-1002',
    customerName: 'Bob Singh',
    createdAt: new Date().toISOString(),
    garments: [
      { id: 'G-3', description: 'Wedding Gown', status: 'ready' },
    ],
  },
];

@Injectable()
export class OrdersService {
  findAll(filter?: { status?: GarmentStatus }): Order[] {
    if (!filter || !filter.status) return ORDERS;
    // Return orders that have at least one garment matching the status
    return ORDERS.filter((o) => o.garments.some((g) => g.status === filter.status));
  }

  findOne(id: string): Order | undefined {
    return ORDERS.find((o) => o.id === id);
  }

  create(orderData: {
    customerName: string;
    garments: { description: string; status: GarmentStatus }[];
  }): Order {
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
      customerName: orderData.customerName,
      createdAt: new Date().toISOString(),
      garments: orderData.garments.map((g, idx) => ({
        id: `G-${Date.now()}-${idx}`,
        description: g.description,
        status: g.status,
      })),
    };
    ORDERS.push(newOrder);
    return newOrder;
  }

  updateGarmentStatus(
    orderId: string,
    garmentId: string,
    status: GarmentStatus,
  ): Garment | undefined {
    const order = this.findOne(orderId);
    if (!order) return undefined;
    const garment = order.garments.find((g) => g.id === garmentId);
    if (!garment) return undefined;
    garment.status = status;
    return garment;
  }

  getGarmentStatusSummary(): { [status: string]: number } {
    const counts: { [status: string]: number } = {};
    for (const order of ORDERS) {
      for (const g of order.garments) {
        counts[g.status] = (counts[g.status] ?? 0) + 1;
      }
    }
    // Remove any statuses with a 0 count (shouldn't exist) and return empty object if none
    const result: { [status: string]: number } = {};
    for (const k of Object.keys(counts)) {
      if (counts[k] > 0) result[k] = counts[k];
    }
    return result;
  }

  // NOTE: You will add more methods here in the implementation tasks.
}
