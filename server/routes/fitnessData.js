const express = require('express');
const router = express.Router();
const FitnessData = require('../models/FitnessData');
const auth = require('../middleware/auth');

// Store fitness data
router.post('/store', auth, async (req, res) => {
  try {
    const { fitnessData } = req.body;
    
    // Prepare bulk operations
    const operations = fitnessData.map(data => ({
      updateOne: {
        filter: { 
          userId: req.user.id,
          date: new Date(data.date)
        },
        update: {
          $set: {
            steps: data.steps,
            calories: data.calories,
            activeMinutes: data.activeMinutes,
            distance: data.distance,
            updatedAt: new Date()
          }
        },
        upsert: true
      }
    }));

    // Perform bulk write operation
    await FitnessData.bulkWrite(operations);

    res.status(200).json({ message: 'Fitness data stored successfully' });
  } catch (error) {
    console.error('Error storing fitness data:', error);
    res.status(500).json({ error: 'Failed to store fitness data' });
  }
});

// Get user's fitness data
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {
      userId: req.user.id
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const fitnessData = await FitnessData.find(query)
      .sort({ date: 1 })
      .lean();

    res.json(fitnessData);
  } catch (error) {
    console.error('Error fetching fitness data:', error);
    res.status(500).json({ error: 'Failed to fetch fitness data' });
  }
});

// Get user's latest fitness data
router.get('/latest', auth, async (req, res) => {
  try {
    const latestData = await FitnessData.findOne(
      { userId: req.user.id },
      {},
      { sort: { date: -1 } }
    ).lean();

    res.json(latestData || null);
  } catch (error) {
    console.error('Error fetching latest fitness data:', error);
    res.status(500).json({ error: 'Failed to fetch latest fitness data' });
  }
});

// Get user's fitness summary
router.get('/summary', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const summary = await FitnessData.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSteps: { $sum: '$steps' },
          totalCalories: { $sum: '$calories' },
          totalActiveMinutes: { $sum: '$activeMinutes' },
          totalDistance: { $sum: '$distance' },
          avgSteps: { $avg: '$steps' },
          avgCalories: { $avg: '$calories' },
          avgActiveMinutes: { $avg: '$activeMinutes' },
          avgDistance: { $avg: '$distance' }
        }
      }
    ]);

    res.json(summary[0] || null);
  } catch (error) {
    console.error('Error fetching fitness summary:', error);
    res.status(500).json({ error: 'Failed to fetch fitness summary' });
  }
});

module.exports = router; 