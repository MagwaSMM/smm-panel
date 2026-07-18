import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const addFundsSchema = z.object({
  amount: z.number().min(5).max(10000)
});

router.post('/add-funds', authenticate, async (req, res) => {
  try {
    const { amount } = addFundsSchema.parse(req.body);

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        amount,
        type: 'deposit',
        status: 'completed',
        paymentMethod: 'manual',
        reference: `MANUAL-${Date.now()}`
      }
    });

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { balance: { increment: amount } }
    });

    res.json({
      transaction,
      newBalance: user.balance,
      message: `Successfully added $${amount.toFixed(2)} to your balance`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to add funds' });
  }
});

router.get('/transactions', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
