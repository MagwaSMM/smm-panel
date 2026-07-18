import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';
import { placeOrderWithProvider } from '../utils/apiProvider.js';

const router = Router();

const createOrderSchema = z.object({
  serviceId: z.string().uuid(),
  link: z.string().url(),
  quantity: z.number().int().positive()
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { serviceId, link, quantity } = createOrderSchema.parse(req.body);

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return res.status(404).json({ error: 'Service not found or inactive' });
    }

    if (quantity < service.minQuantity || quantity > service.maxQuantity) {
      return res.status(400).json({ 
        error: `Quantity must be between ${service.minQuantity} and ${service.maxQuantity}` 
      });
    }

    const charge = (service.price / 1000) * quantity;
    
    if (req.user.balance < charge) {
      return res.status(400).json({ 
        error: `Insufficient balance. Required: $${charge.toFixed(2)}, Available: $${req.user.balance.toFixed(2)}` 
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          serviceId,
          link,
          quantity,
          charge,
          status: 'pending'
        }
      });

      await tx.user.update({
        where: { id: req.user.id },
        data: {
          balance: { decrement: charge },
          totalSpent: { increment: charge }
        }
      });

      return newOrder;
    });

    try {
      const providerResult = await placeOrderWithProvider(service, link, quantity);
      
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'processing',
          providerOrderId: providerResult.orderId.toString()
        }
      });
    } catch (providerError) {
      console.error('Provider error:', providerError);
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { service: true }
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { balance: true }
    });

    res.status(201).json({ order: updatedOrder, newBalance: updatedUser.balance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { service: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { service: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
