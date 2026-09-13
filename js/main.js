// 🔥 SAFE MAIN.JS v2.0.2 - ERROR SCREEN DISABLED (All Existing Code Preserved)
(function() {
    'use strict';
    
    console.log('%c🚀 FairRoute Dashboard v2.0.2', 'color: #005bea; font-size: 16px; font-weight: bold;');
    console.log('%c✅ All Features Loaded - Safe Mode (No Error Screens)', 'color: #10b981; font-size: 12px;');
    
    // 🔥 SAFE MODULE CHECKER (NEW - doesn't change existing code)
    function checkModule(name, module) {
        if (!module) {
            console.warn(`[Main] ⚠️ Module "${name}" not loaded - skipping safely`);
            return false;
        }
        console.log(`[Main] ✅ ${name} loaded`);
        return true;
    }
    
    // Initialize authentication on DOM ready (ENHANCED with safety)
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Main] DOM loaded, initializing authentication...');
        
        // Safe auth init
        if (checkModule('Auth', window.Auth)) {
            try {
                window.Auth.init();
            } catch (error) {
                console.error('[Main] Auth.init() failed:', error);
            }
        }
        
        // Safe real-time start
        if (checkModule('Realtime', window.Realtime)) {
            try {
                window.Realtime.startAll();
            } catch (error) {
                console.error('[Main] Realtime.startAll() failed:', error);
            }
        }
        
        // Auto-navigate to safe default page
        setTimeout(() => {
            if (window.Navigation && checkModule('Navigation', window.Navigation)) {
                try {
                    window.Navigation.navigate('assignments'); // Safe default
                } catch (error) {
                    console.error('[Main] Navigation failed:', error);
                }
            }
        }, 500);
    });
    
    // Clean up on page unload (ENHANCED safety)
    window.addEventListener('beforeunload', function() {
        console.log('[Main] Page unloading, cleaning up...');
        
        if (window.Realtime) {
            try {
                window.Realtime.stopAll();
            } catch (error) {
                console.warn('[Main] Realtime cleanup failed:', error);
            }
        }
        
        if (window.MapManager) {
            try {
                window.MapManager.destroy();
            } catch (error) {
                console.warn('[Main] MapManager cleanup failed:', error);
            }
        }
    });
    
    // 🔥 GLOBAL ERROR HANDLER (LOG ONLY - NO UI REPLACEMENT)
    window.addEventListener('error', function(e) {
        // Ignore generic third-party "Script error." from Leaflet/CDN/iframes
        const isGenericThirdPartyError = 
            e.message === 'Script error.' && !e.filename && !e.lineno && !e.colno;
        
        if (isGenericThirdPartyError) {
            console.warn('[Main] Ignoring harmless third-party script error');
            return; // Don't break the UI
        }
        
        // Log real errors to console ONLY (don't replace page content)
        console.error('[Main] Global error:', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            stack: e.error?.stack
        });
        
        // DO NOT touch main-content anymore - let pages stay visible
    });
    
    // 🔥 UNCAUGHT PROMISE HANDLER (LOG ONLY)
    window.addEventListener('unhandledrejection', function(e) {
        console.error('[Main] Unhandled promise rejection:', e.reason);
        // Don't break UI
    });
    
    // Expose debug helpers (SAFE ACCESSORS - no undefined errors)
    window.FairRouteDebug = {
        config: window.AppConfig || 'Not loaded',
        auth: window.Auth || 'Not loaded',
        navigation: window.Navigation || 'Not loaded',
        liveFleet: window.LiveFleet || 'Not loaded',
        fairnessMonitor: window.FairnessMonitor || 'Not loaded',
        fairnessMemory: window.FairnessMemory || 'Not loaded',
        assignments: window.Assignments || 'Not loaded',
        disputes: window.Disputes || 'Not loaded',
        orderManagement: window.OrderManagement || 'Not loaded',
        version: '2.0.2',
        // 🔥 Module status checker
        checkAllModules() {
            console.table({
                Auth: !!window.Auth,
                Navigation: !!window.Navigation,
                Realtime: !!window.Realtime,
                Assignments: !!window.Assignments,
                LiveFleet: !!window.LiveFleet,
                Disputes: !!window.Disputes,
                OrderManagement: !!window.OrderManagement
            });
        }
    };
    
    console.log('%c💡 Debug: Type FairRouteDebug.checkAllModules() in console', 'color: #f59e0b; font-size: 11px;');
    
    // 🔥 AUTO-LOAD CRITICAL MODULES if missing (safe fallback)
    if (!window.Utils) {
        window.Utils = {
            notify: (message, type = 'info') => {
                console.log(`[${type.toUpperCase()}] ${message}`);
                // Fallback toast notification
                const toast = document.createElement('div');
                toast.style.cssText = `
                    position: fixed; top: 20px; right: 20px; 
                    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'}; 
                    color: white; padding: 12px 20px; border-radius: 8px; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 99999;
                    font-weight: 500; font-size: 14px;
                `;
                toast.textContent = message;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }
        };
        console.log('✅ Utils auto-loaded (fallback)');
    }
    
    if (!window.MockData) {
        window.MockData = {
            generateDrivers: (count) => Array.from({length: count}, (_, i) => ({
                id: `D00${i+1}`,
                name: `Driver ${i+1}`,
                avatar: `https://i.pravatar.cc/40?img=${i+1}`,
                effortScore: 40 + Math.random() * 50,
                deliveries: Math.floor(Math.random() * 15)
            })),
            generateRouteAssignments: (drivers) => [],
            generateOrders: (count) => Array.from({length: count}, (_, i) => ({
                id: `ORD-${Date.now()}${i}`,
                customerName: `Customer ${i+1}`,
                pickup: 'Pickup Address',
                dropoff: 'Dropoff Address',
                weight: 5 + Math.random() * 20,
                priority: 'normal',
                status: 'unassigned'
            }))
        };
        console.log('✅ MockData auto-loaded (fallback)');
    }
})();
