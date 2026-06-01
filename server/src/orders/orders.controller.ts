import { Controller, Get, Param, Post, Body, Patch, Query, NotFoundException } from '@nestjs/common';
import { OrdersService, Order, GarmentStatus } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getOrders(@Query('status') status?: GarmentStatus): Order[] {
    if (status) return this.ordersService.findAll({ status });
    return this.ordersService.findAll();
  }

  @Get('summary')
  getSummary(): { [status: string]: number } {
    return this.ordersService.getGarmentStatusSummary();
  }

  @Get(':id')
  getOrder(@Param('id') id: string): Order {
    const order = this.ordersService.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  @Post()
  createOrder(
    @Body()
    body: {
      customerName: string;
      garments: { description: string; status: GarmentStatus }[];
    },
  ): Order {
    return this.ordersService.create(body);
  }

  @Patch(':orderId/garments/:garmentId')
  updateGarmentStatus(
    @Param('orderId') orderId: string,
    @Param('garmentId') garmentId: string,
    @Body('status') status: GarmentStatus,
  ) {
    const g = this.ordersService.updateGarmentStatus(orderId, garmentId, status);
    if (!g) {
      throw new NotFoundException('Order or garment not found');
    }
    return g;
  }
}
