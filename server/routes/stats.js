const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');
const Labor = require('../models/Labor');
const User = require('../models/User');
const mongoose = require('mongoose');

// @route   GET api/stats/dashboard
// @desc    Get dashboard stats
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Period filter (default to current month)
    const { period } = req.query;
    let startDate, endDate;
    
    const now = new Date();
    
    if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear() + 1, 0, 1);
    } else if (period === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
    } else {
      // Default to current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    
    // Calculate key metrics
    
    // 1. Sales metrics
    const soldVehicles = await Vehicle.find({
      soldDate: { $gte: startDate, $lt: endDate }
    }).populate('soldBy', 'name');
    
    // Total number of units sold
    const unitsSold = soldVehicles.length;
    
    // Gross profit per vehicle
    const totalCost = soldVehicles.reduce((sum, vehicle) => sum + (vehicle.purchasePrice + vehicle.reconCost), 0);
    const totalRevenue = soldVehicles.reduce((sum, vehicle) => sum + vehicle.soldPrice, 0);
    const totalGrossProfit = totalRevenue - totalCost;
    const grossProfitPerUnit = unitsSold > 0 ? totalGrossProfit / unitsSold : 0;
    
    // Sales by salesperson
    const salesBySalesperson = {};
    soldVehicles.forEach(vehicle => {
      if (vehicle.soldBy) {
        const name = vehicle.soldBy.name;
        if (!salesBySalesperson[name]) {
          salesBySalesperson[name] = {
            count: 0,
            profit: 0
          };
        }
        salesBySalesperson[name].count++;
        salesBySalesperson[name].profit += vehicle.soldPrice - (vehicle.purchasePrice + vehicle.reconCost);
      }
    });
    
    // 2. Inventory metrics
    const readyVehicles = await Vehicle.countDocuments({ status: 'ready' });
    const inReconVehicles = await Vehicle.countDocuments({ status: 'in_recon' });
    const inTransportVehicles = await Vehicle.countDocuments({ status: 'in_transport' });
    const purchasedVehicles = await Vehicle.countDocuments({ status: 'purchased' });
    
    // Inventory age
    const now30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const now60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const now90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    const aged30 = await Vehicle.countDocuments({ 
      status: 'ready', 
      frontLineDate: { $lt: now30, $gte: now60 } 
    });
    
    const aged60 = await Vehicle.countDocuments({ 
      status: 'ready', 
      frontLineDate: { $lt: now60, $gte: now90 } 
    });
    
    const aged90Plus = await Vehicle.countDocuments({ 
      status: 'ready', 
      frontLineDate: { $lt: now90 } 
    });
    
    // Average time calculations
    const completedVehicles = await Vehicle.find({
      soldDate: { $exists: true, $ne: null }
    });
    
    let totalDaysToSell = 0;
    let totalTransportTime = 0;
    let totalReconTime = 0;
    let totalTimeToLine = 0;
    let vehiclesWithFullData = 0;
    
    completedVehicles.forEach(vehicle => {
      if (vehicle.frontLineDate && vehicle.soldDate) {
        const daysToSell = (vehicle.soldDate - vehicle.frontLineDate) / (1000 * 60 * 60 * 24);
        totalDaysToSell += daysToSell;
      }
      
      if (vehicle.purchaseDate && vehicle.arrivalDate) {
        const transportTime = (vehicle.arrivalDate - vehicle.purchaseDate) / (1000 * 60 * 60 * 24);
        totalTransportTime += transportTime;
      }
      
      if (vehicle.arrivalDate && vehicle.frontLineDate) {
        const reconTime = (vehicle.frontLineDate - vehicle.arrivalDate) / (1000 * 60 * 60 * 24);
        totalReconTime += reconTime;
      }
      
      if (vehicle.purchaseDate && vehicle.frontLineDate) {
        const timeToLine = (vehicle.frontLineDate - vehicle.purchaseDate) / (1000 * 60 * 60 * 24);
        totalTimeToLine += timeToLine;
        vehiclesWithFullData++;
      }
    });
    
    const avgDaysToSell = totalDaysToSell / (completedVehicles.length || 1);
    const avgTransportTime = totalTransportTime / (completedVehicles.length || 1);
    const avgReconTime = totalReconTime / (completedVehicles.length || 1);
    const avgTimeToLine = totalTimeToLine / (vehiclesWithFullData || 1);
    
    // 3. Labor metrics
    const laborEntries = await Labor.find({
      date: { $gte: startDate, $lt: endDate }
    }).populate('mechanic', 'name');
    
    // Labor hours per mechanic
    const laborByMechanic = {};
    let totalStandardHours = 0;

    laborEntries.forEach(entry => {
      // Track total standard hours
      totalStandardHours += (entry.standardHours || 0);
      
      if (entry.mechanic) {
        const name = entry.mechanic.name;
        if (!laborByMechanic[name]) {
          laborByMechanic[name] = {
            hours: 0,
            standardHours: 0,
            cost: 0,
            efficiency: 0
          };
        }
        laborByMechanic[name].hours += entry.hours;
        laborByMechanic[name].standardHours += (entry.standardHours || 0);
        laborByMechanic[name].cost += entry.cost;
      }
    });

    // Calculate efficiency for each mechanic
    Object.keys(laborByMechanic).forEach(name => {
      const mechanic = laborByMechanic[name];
      mechanic.efficiency = mechanic.hours > 0 
        ? (mechanic.standardHours / mechanic.hours) * 100 
        : 0;
    });
    
    // Effective labor rate
    const totalLaborHours = laborEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const totalLaborCost = laborEntries.reduce((sum, entry) => sum + entry.cost, 0);
    const effectiveLaborRate = totalLaborHours > 0 ? totalLaborCost / totalLaborHours : 0;
    
    // Calculate overall labor efficiency
    const overallLaborEfficiency = totalLaborHours > 0 
      ? (totalStandardHours / totalLaborHours) * 100 
      : 0;
    
    // 4. Reconditioning metrics
    const avgReconCostPerUnit = soldVehicles.length > 0 
      ? soldVehicles.reduce((sum, vehicle) => sum + (vehicle.reconCost || 0), 0) / soldVehicles.length
      : 0;
    
    // Calculate inventory turn rate
    const totalInventory = readyVehicles + inReconVehicles + inTransportVehicles + purchasedVehicles;
    const turnRate = totalInventory > 0 ? (unitsSold / totalInventory) : 0;
    
    // Combine all metrics
    const stats = {
      sales: {
        unitsSold,
        grossProfitPerUnit,
        totalGrossProfit,
        salesBySalesperson
      },
      inventory: {
        ready: readyVehicles,
        inRecon: inReconVehicles,
        inTransport: inTransportVehicles,
        purchased: purchasedVehicles,
        total: totalInventory,
        aging: {
          '30-60days': aged30,
          '60-90days': aged60,
          '90plus': aged90Plus
        },
        turnRate
      },
      timing: {
        avgDaysToSell,
        avgTransportTime,
        avgReconTime,
        avgTimeToLine
      },
      labor: {
        byMechanic: laborByMechanic,
        effectiveLaborRate,
        totalHours: totalLaborHours,
        totalStandardHours: totalStandardHours,
        totalCost: totalLaborCost,
        efficiency: overallLaborEfficiency
      },
      reconditioning: {
        avgCostPerUnit: avgReconCostPerUnit
      }
    };
    
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;