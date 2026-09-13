// FairDispatch AI Rotation - fairdispatch project
async function runFairDispatchRotation() {
  console.log('🤖 fairdispatch AI Rotation Starting...');
  
  try {
    const db = firebase.database();
    
    // YOUR DATA PATHS
    const driversSnap = await db.ref('drivers').once('value');
    const routesSnap = await db.ref('routes').once('value');
    
    const drivers = driversSnap.val() || {};
    const routes = routesSnap.val() || [];
    
    console.log(`Drivers: ${Object.keys(drivers).length}, Routes: ${routes.length}`);
    
    if (Object.keys(drivers).length === 0) {
      alert('🚨 Add test data:\nhttps://console.firebase.google.com/project/fairdispatch\n\ndrivers/D1:\n{\n"monthlyLoad":2.5,\n"weeklyEffort":65,\n"esp32Steps":8500\n}');
      return;
    }
    
    const assignments = {};
    
    routes.forEach((route, index) => {
      let bestDriver = null;
      let bestScore = Infinity;
      
      Object.entries(drivers).forEach(([driverId, data]) => {
        const monthly = data.monthlyLoad || 4;
        const weekly = data.weeklyEffort || 55;
        
        // MONTHLY vs WEEKLY LOGIC
        const priority = monthly < weekly * 0.8 ? 2 :    // HARDER (catch-up)
                        monthly > weekly * 1.2 ? 0 : 1; // EASIER / MEDIUM
        
        const score = Math.abs(priority - Math.min(2, (route.difficulty || 50) / 40));
        
        if (score < bestScore) {
          bestScore = score;
          bestDriver = driverId;
        }
      });
      
      assignments[route.id || `R${index + 1}`] = {
        driver: bestDriver,
        fairnessScore: bestScore.toFixed(2),
        monthlyLoad: drivers[bestDriver]?.monthlyLoad?.toFixed(1),
        weeklyEffort: drivers[bestDriver]?.weeklyEffort?.toFixed(0),
        esp32Steps: drivers[bestDriver]?.esp32Steps,
        reasoning: `${bestDriver}: M${drivers[bestDriver]?.monthlyLoad?.toFixed(1)} vs W${drivers[bestDriver]?.weeklyEffort?.toFixed(0)}`,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      };
    });
    
    // SAVE - MOBILE AUTO-SYNCs (2s)
    await db.ref('assignments/ai-rotation').set(assignments);
    
    // Mobile notification
    await db.ref('notifications/ai-complete').push({
      message: `${Object.keys(assignments).length} routes assigned fairly`,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    
    console.table(assignments);
    alert(`✅ AI SUCCESS!\n${Object.keys(assignments).length} routes assigned\n📱 Mobile auto-synced!\nCheck: assignments/ai-rotation`);
    
  } catch (error) {
    console.error('AI Error:', error);
    alert('Error: ' + error.message);
  }
}

// Ready!
console.log('✅ fairdispatch AI Ready - Web+Mobile!');
