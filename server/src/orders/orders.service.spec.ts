import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let svc: OrdersService;

  beforeEach(() => {
    svc = new OrdersService();
  });

  test('findAll returns array', () => {
    const all = svc.findAll();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
  });

  test('findOne returns order when exists', () => {
    const all = svc.findAll();
    const id = all[0].id;
    const o = svc.findOne(id);
    expect(o).toBeDefined();
    expect(o?.id).toBe(id);
  });

  test('create adds order', () => {
    const before = svc.findAll().length;
    const created = svc.create({ customerName: 'Test', garments: [{ description: 'Hat', status: 'received' }] });
    expect(created).toBeDefined();
    expect(created.customerName).toBe('Test');
    expect(svc.findAll().length).toBe(before + 1);
  });

  test('updateGarmentStatus updates status', () => {
    const all = svc.findAll();
    const order = all[0];
    const garment = order.garments[0];
    const updated = svc.updateGarmentStatus(order.id, garment.id, 'ready');
    expect(updated).toBeDefined();
    expect(updated?.status).toBe('ready');
  });
});
