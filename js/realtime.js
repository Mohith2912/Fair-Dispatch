// Real-time Data Simulation Module
const Realtime = {
    intervals: {},
    
    // Start all real-time updates
    startAll() {
        console.log('[Realtime] Starting all real-time updates...');
        // Individual modules handle their own updates
    },
    
    // Stop all real-time updates
    stopAll() {
        console.log('[Realtime] Stopping all real-time updates...');
        
        // Stop Live Fleet updates
        if (window.LiveFleet && window.LiveFleet.stopRealtimeUpdates) {
            window.LiveFleet.stopRealtimeUpdates();
        }
        
        // Stop Disputes alert checking
        if (window.Disputes && window.Disputes.stopAlertChecking) {
            window.Disputes.stopAlertChecking();
        }
        
        // Stop System Health updates
        if (window.SystemHealth && window.SystemHealth.stopRealtimeUpdates) {
            window.SystemHealth.stopRealtimeUpdates();
        }
    }
};

window.Realtime = Realtime;
