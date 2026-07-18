import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { category, search } = req.query;
    
    const where = { isActive: true };
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { category: 'asc' }
    });

    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = await prisma.service.findMany({
      where: { isActive: true },
      distinct: ['category'],
      select: { category: true }
    });
    
    res.json(categories.map(c => c.category));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id }
    });
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

export default router;
