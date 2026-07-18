import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      recentOrders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { charge: true }, where: { status: 'completed' } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { username: true } }, service: { select: { name: true } } } })
    ]);

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.charge || 0,
      pendingOrders,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/services', async (req, res) => {
  const services = await prisma.service.findMany({ orderBy: { category: 'asc' } });
  res.json(services);
});

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  price: z.number().positive(),
  minQuantity: z.number().int().positive().default(10),
  maxQuantity: z.number().int().positive().default(100000),
  providerServiceId: z.string().default('')
});

router.post('/services', async (req, res) => {
  try {
    const data = serviceSchema.parse(req.body);
    const service = await prisma.service.create({ data });
    res.status(201).json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/services/:id', async (req, res) => {
  try {
    const data = serviceSchema.partial().parse(req.body);
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/services/:id', async (req, res) => {
  try {
    await prisma.service.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    res.json({ message: 'Service deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { username: true, email: true } },
          service: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({ orders, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true, email: true, username: true, role: true,
          balance: true, totalSpent: true, createdAt: true,
          _count: { select: { orders: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count()
    ]);

    res.json({ users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { balance, role } = req.body;
    const data = {};
    if (balance !== undefined) data.balance = balance;
    if (role) data.role = role;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, email: true, username: true, role: true, balance: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
