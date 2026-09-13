// ========================================
// MOCK DATA GENERATOR
// Generates realistic test data for all 7 features
// ========================================

const MockData = {
    
    // Chennai coordinates for realistic locations
    chennaiLocations: [
        [13.0827, 80.2707], // T Nagar
        [13.0478, 80.2619], // Adyar
        [13.0569, 80.2425], // Guindy
        [13.0337, 80.2182], // Velachery
        [13.0674, 80.2376], // Saidapet
        [13.0915, 80.2243], // Anna Nagar
        [13.0423, 80.2598], // Mylapore
        [13.0732, 80.2519], // Nungambakkam
        [13.0194, 80.2507], // Sholinganallur
        [13.0543, 80.2499], // Kotturpuram
        [13.0358, 80.2569], // Thiruvanmiyur
        [13.0878, 80.2785]  // Egmore
    ],
    
    // Driver names (Tamil and pan-Indian)
    driverNames: [
        'Rajesh Kumar',
        'Priya Sharma',
        'Amit Patel',
        'Kavya Reddy',
        'Vijay Singh',
        'Sneha Iyer',
        'Rahul Verma',
        'Anjali Nair',
        'Arjun Menon',
        'Divya Krishnan',
        'Karthik Subramanian',
        'Lakshmi Raman'
    ],
    
    // Generate complete driver data with all features
    generateDrivers(count = 12) {
        const drivers = [];
        
        for (let i = 0; i < count; i++) {
            const effortScore = Utils.randomIntBetween(45, 95);
            const fairnessIndex = Utils.randomIntBetween(50, 95);
            const deliveries = Utils.randomIntBetween(5, 25);
            
            // Generate 7-day history
            const effortHistory = this.generate7DayEffort();
            
            // Hardware status
            const hardwareStatus = {
                gps: Math.random() > 0.1, // 90% online
                internet: Math.random() > 0.05, // 95% online
                loadCell: Math.random() > 0.15, // 85% online
                stairSensor: Math.random() > 0.2 // 80% online
            };
            
            drivers.push({
                id: `DR-${1000 + i}`,
                name: this.driverNames[i],
                avatar: `https://i.pravatar.cc/100?img=${20 + i}`,
                phone: `+91 ${90000 + i}00000`,
                location: this.chennaiLocations[i],
                
                // Current stats
                deliveries: deliveries,
                effortScore: effortScore,
                fairnessIndex: fairnessIndex,
                workload: this.getWorkloadStatus(effortScore),
                
                // Financial
                earnings: Utils.randomIntBetween(1500, 4500),
                
                // Status
                status: 'Active',
                vehicleType: Utils.randomIntBetween(0, 1) === 0 ? 'Van' : 'Bike',
                vehicle: Utils.randomIntBetween(0, 1) === 0 ? 'Van' : 'Bike',
                joinedDate: '2024-01-15',
                rating: (4 + Math.random()).toFixed(1),
                
                // Current route
                currentRoute: deliveries > 0 ? `RT-${Utils.randomIntBetween(100, 999)}` : null,
                stopsRemaining: deliveries > 15 ? Utils.randomIntBetween(3, 8) : Utils.randomIntBetween(0, 3),
                etaNextStop: Utils.randomIntBetween(5, 25),
                
                // Historical data (Feature 3)
                effortHistory: effortHistory,
                
                // Hardware status (Feature 6)
                hardware: hardwareStatus,
                lastHardwareCheck: new Date(Date.now() - Utils.randomIntBetween(60000, 600000))
            });
        }
        
        return drivers;
    },
    
    // Get workload status based on effort score
    getWorkloadStatus(effortScore) {
        if (effortScore < 60) return 'Available';
        if (effortScore < 80) return 'Moderate';
        return 'Overloaded';
    },
    
    // Generate 7-day effort history for Fairness Memory
    generate7DayEffort() {
        const history = [];
        const baseEffort = Utils.randomIntBetween(55, 75);
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Add some variation
            const variation = Utils.randomIntBetween(-10, 10);
            const effort = this.clamp(baseEffort + variation, 40, 95);
            
            history.push({
                date: date.toISOString().split('T')[0],
                effortScore: effort
            });
        }
        
        return history;
    },
    
    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    // Generate route assignments (Feature 4)
    generateRouteAssignments(drivers) {
        const routes = [];
        const statuses = ['pending', 'assigned', 'approved'];
        const difficulties = ['Easy', 'Medium', 'Hard'];
        
        for (let i = 0; i < 15; i++) {
            const driver = drivers[Utils.randomIntBetween(0, drivers.length - 1)];
            const difficulty = difficulties[Utils.randomIntBetween(0, 2)];
            const stops = Utils.randomIntBetween(5, 20);
            const distance = Utils.randomIntBetween(10, 50);
            
            routes.push({
                id: `RT-${100 + i}`,
                driverId: driver.id,
                driverName: driver.name,
                driverAvatar: driver.avatar,
                status: statuses[Utils.randomIntBetween(0, 2)],
                stops: stops,
                distance: distance,
                difficulty: difficulty,
                estimatedTime: Utils.randomIntBetween(120, 300),
                createdAt: new Date(Date.now() - Utils.randomIntBetween(3600000, 86400000)),
                
                // AI Explanation (Feature 4)
                aiReasoning: this.generateAIReasoning(driver, difficulty),
                
                // Driver workload context
                driverWorkloadLast3Days: [
                    Utils.randomIntBetween(50, 70),
                    Utils.randomIntBetween(55, 75),
                    driver.effortScore
                ]
            });
        }
        
        return routes;
    },
    
    // Generate AI reasoning text
    generateAIReasoning(driver, difficulty) {
        const reasons = [
            `Assigned to ${driver.name} because they had lighter routes in the last 2 days (average effort: ${Utils.randomIntBetween(50, 65)}%).`,
            `${driver.name} has a fairness index of ${driver.fairnessIndex}, indicating they can handle this ${difficulty.toLowerCase()} route.`,
            `This route balances ${driver.name}'s workload while maintaining fleet efficiency.`,
            `${driver.name} is currently at ${driver.effortScore}% effort, which is optimal for this route difficulty.`
        ];
        
        return reasons[Utils.randomIntBetween(0, reasons.length - 1)];
    },
    
    // ========================================
    // DISPUTES - WITH REASSIGNED STATUS
    // ========================================
    generateDisputes(drivers, count = 8) {
        const disputes = [];
        const categories = ['hardware', 'operational', 'health'];
        const severities = ['urgent', 'medium', 'info'];
        
        const hardwareTypes = [
            { type: 'weight_mismatch', description: 'Package weight exceeds listed weight significantly' },
            { type: 'stair_mismatch', description: 'Stair sensor detected more floors than expected' },
            { type: 'sensor_fault', description: 'Load cell sensor showing inconsistent readings' }
        ];
        
        const operationalTypes = [
            { type: 'route_too_long', description: 'Route duration exceeds time estimate by 30+ minutes' },
            { type: 'traffic_delay', description: 'Unexpected traffic congestion causing major delay' },
            { type: 'vehicle_issue', description: 'Vehicle breakdown reported mid-route' }
        ];
        
        const healthTypes = [
            { type: 'feeling_unwell', description: 'Driver feeling dizzy, requesting immediate rest' },
            { type: 'injury', description: 'Minor injury sustained during delivery' },
            { type: 'emergency_leave', description: 'Family emergency requiring immediate attention' }
        ];
        
        for (let i = 0; i < count; i++) {
            const driver = drivers[Utils.randomIntBetween(0, drivers.length - 1)];
            const category = categories[Utils.randomIntBetween(0, categories.length - 1)];
            const severity = severities[Utils.randomIntBetween(0, severities.length - 1)];
            
            let disputeType, description;
            
            if (category === 'hardware') {
                const hw = hardwareTypes[Utils.randomIntBetween(0, hardwareTypes.length - 1)];
                disputeType = hw.type;
                description = hw.description;
            } else if (category === 'operational') {
                const op = operationalTypes[Utils.randomIntBetween(0, operationalTypes.length - 1)];
                disputeType = op.type;
                description = op.description;
            } else {
                const h = healthTypes[Utils.randomIntBetween(0, healthTypes.length - 1)];
                disputeType = h.type;
                description = h.description;
            }
            
            // Status distribution: 60% pending, 20% approved, 15% rejected, 5% reassigned
            const statusPool = ['pending', 'approved', 'rejected', 'reassigned'];
            const weights = [0.6, 0.2, 0.15, 0.05];
            const randomStatus = this.getWeightedRandom(statusPool, weights);
            
            disputes.push({
                id: `DSP-${String(i + 1).padStart(4, '0')}`,
                driverId: driver.id,
                driverName: driver.name,
                driverAvatar: driver.avatar,
                category: category,
                type: disputeType,
                severity: severity,
                status: randomStatus,
                description: description,
                timestamp: Date.now() - Utils.randomIntBetween(60000, 3600000), // Last hour
                
                // Hardware-specific data
                expectedWeight: category === 'hardware' ? Utils.randomIntBetween(3, 8) : null,
                actualWeight: category === 'hardware' ? Utils.randomIntBetween(8, 15) : null,
                sensorConfidence: category === 'hardware' ? Utils.randomIntBetween(85, 99) : null,
                sensorVerified: category === 'hardware' ? Math.random() > 0.1 : null,
                stairSensorData: category === 'hardware' ? Utils.randomIntBetween(2, 6) : null,
                
                // Operational-specific data
                routeDifficultyScore: category === 'operational' ? Utils.randomIntBetween(65, 95) : null,
                stopsRemaining: category === 'operational' ? Utils.randomIntBetween(5, 15) : null,
                trafficDelay: category === 'operational' ? Utils.randomIntBetween(10, 30) : null,
                routeId: `R-${String(Utils.randomIntBetween(100, 999)).padStart(3, '0')}`,
                stopId: category !== 'health' ? `Stop #${Utils.randomIntBetween(1, 50)}` : null,
                
                // Health-specific data
                driverMessage: category === 'health' ? 'Feeling dizzy and unwell, requesting rest period' : null,
                location: category === 'health' ? 'Near Guindy Metro, Chennai' : null,
                
                // Resolution data
                rejectionReason: randomStatus === 'rejected' ? this.getRandomRejectionReason() : null,
                approvedBy: randomStatus === 'approved' ? 'Dispatcher' : null,
                approvedAt: randomStatus === 'approved' ? Date.now() - Utils.randomIntBetween(300000, 1800000) : null,
                rejectedBy: randomStatus === 'rejected' ? 'Dispatcher' : null,
                rejectedAt: randomStatus === 'rejected' ? Date.now() - Utils.randomIntBetween(300000, 1800000) : null,
                reassignedBy: randomStatus === 'reassigned' ? 'Dispatcher' : null,
                reassignedAt: randomStatus === 'reassigned' ? Date.now() - Utils.randomIntBetween(300000, 1800000) : null
            });
        }
        
        return disputes;
    },
    
    // Get random rejection reason
    getRandomRejectionReason() {
        const reasons = [
            'Insufficient evidence from sensor data',
            'Weight difference within acceptable margin of error',
            'Traffic delay not significant enough for compensation',
            'Driver did not follow proper escalation procedure',
            'Issue already resolved during route',
            'Sensor calibration shows reading was accurate'
        ];
        return reasons[Utils.randomIntBetween(0, reasons.length - 1)];
    },
    
    // Helper: Weighted random selection
    getWeightedRandom(array, weights) {
        const random = Math.random();
        let sum = 0;
        for (let i = 0; i < array.length; i++) {
            sum += weights[i];
            if (random < sum) return array[i];
        }
        return array[array.length - 1];
    },
    
    // Generate audit logs (Feature 7)
    generateAuditLogs(drivers) {
        const logs = [];
        const actions = [
            { type: 'ai', action: 'AI Route Assignment', icon: 'ai' },
            { type: 'human', action: 'Manual Override', icon: 'human' },
            { type: 'dispute', action: 'Dispute Raised', icon: 'dispute' },
            { type: 'dispute', action: 'Dispute Approved', icon: 'dispute' },
            { type: 'dispute', action: 'Dispute Rejected', icon: 'dispute' },
            { type: 'dispute', action: 'Work Reassigned', icon: 'dispute' },
            { type: 'sensor', action: 'Sensor Failure Detected', icon: 'sensor' },
            { type: 'human', action: 'Route Reassignment', icon: 'human' }
        ];
        
        for (let i = 0; i < 30; i++) {
            const driver = drivers[Utils.randomIntBetween(0, drivers.length - 1)];
            const actionData = actions[Utils.randomIntBetween(0, actions.length - 1)];
            
            logs.push({
                id: `LOG-${300 + i}`,
                timestamp: new Date(Date.now() - Utils.randomIntBetween(60000, 86400000)),
                action: actionData.action,
                type: actionData.type,
                icon: actionData.icon,
                driverId: driver.id,
                driverName: driver.name,
                description: this.generateLogDescription(actionData.action, driver),
                userId: 'dispatcher@fairroute.ai'
            });
        }
        
        // Sort by timestamp (newest first)
        return logs.sort((a, b) => b.timestamp - a.timestamp);
    },
    
    // Generate log description
    generateLogDescription(action, driver) {
        const descriptions = {
            'AI Route Assignment': `Route RT-${Utils.randomIntBetween(100, 999)} automatically assigned to ${driver.name} based on fairness algorithm.`,
            'Manual Override': `Dispatcher manually reassigned route from ${driver.name} due to workload concerns.`,
            'Dispute Raised': `${driver.name} reported package weight discrepancy at stop STP-${Utils.randomIntBetween(1000, 9999)}.`,
            'Dispute Approved': `Dispute DSP-${Utils.randomIntBetween(200, 299)} approved. ${driver.name}'s fairness index updated.`,
            'Dispute Rejected': `Dispute DSP-${Utils.randomIntBetween(200, 299)} rejected. Insufficient evidence.`,
            'Work Reassigned': `${driver.name}'s remaining deliveries reassigned to other drivers.`,
            'Sensor Failure Detected': `Load cell sensor offline for ${driver.name}. Switched to manual verification.`,
            'Route Reassignment': `Route RT-${Utils.randomIntBetween(100, 999)} reassigned to balance fleet workload.`
        };
        
        return descriptions[action] || `Action performed for ${driver.name}`;
    },
    
    // Get current fleet average effort
    getFleetAverageEffort(drivers) {
        const effortScores = drivers.map(d => d.effortScore);
        const avg = effortScores.reduce((sum, score) => sum + score, 0) / effortScores.length;
        return avg.toFixed(1);
    },
    
    // Get overworked drivers count
    getOverworkedCount(drivers) {
        return drivers.filter(d => d.workload === 'Overloaded').length;
    },
    
    // Get active compensations (mock)
    getActiveCompensations() {
        return Utils.randomIntBetween(2, 8);
    }
};

window.MockData = MockData;
