// ========================================
// NAVIGATION MODULE v2.0.2 - CLEAN 6-PAGE VERSION
// REMOVED: system-health + audit-logs cases
// ========================================

const Navigation = {
    currentPage: 'assignments', // 🔥 SAFE DEFAULT (your working AI page)
    
    // Initialize navigation (ENHANCED SAFETY - UNCHANGED)
    init() {
        console.log('[Navigation] Initializing...');
        
        try {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = link.getAttribute('data-page');
                    if (page) {
                        this.navigate(page);
                    }
                });
            });
            
            // Auto-navigate to safe default
            setTimeout(() => {
                if (!document.querySelector('.nav-link.active')) {
                    this.navigate('assignments');
                }
            }, 500);
            
            this.applyScrollFix();
        } catch (error) {
            console.error('[Navigation] Init error:', error);
        }
    },
    
    // Apply scroll fix (UNCHANGED)
    applyScrollFix() {
        const contentBody = document.querySelector('.content-body');
        if (contentBody) {
            contentBody.style.overflowY = 'auto';
            contentBody.style.overflowX = 'hidden';
            contentBody.style.scrollBehavior = 'smooth';
        }
    },
    
    // SAFE MODULE CHECKER (UNCHANGED)
    checkModule(name, module) {
        if (!module) {
            console.warn(`[Navigation] ⚠️ Module "${name}" not loaded - showing fallback`);
            return false;
        }
        return true;
    },
    
    // Navigate to page (CLEAN 6 PAGES ONLY)
    navigate(page) {
        console.log(`[Navigation] Navigating to: ${page}`);
        
        // Update active nav link (SAFE - UNCHANGED)
        try {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-page') === page) {
                    link.classList.add('active');
                }
            });
        } catch (error) {
            console.warn('[Navigation] Active link update failed:', error);
        }
        
        this.currentPage = page;
        
        // Get main content safely (UNCHANGED)
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('[Navigation] main-content not found');
            return;
        }
        
        mainContent.innerHTML = '<div style="padding: 40px; text-align: center; color: #64748b;">Loading...</div>';
        
        // 🔥 CLEAN 6-PAGE SWITCH (NO SYSTEM HEALTH/AUDIT)
        try {
            switch(page) {
                case 'live-fleet':
                    if (this.checkModule('LiveFleet', window.LiveFleet)) {
                        window.LiveFleet.render(mainContent);
                    } else {
                        this.renderFallback(mainContent, 'Live Fleet', '🚗 Fleet cards active below');
                    }
                    break;
                    
                case 'fairness-monitor':
                    if (this.checkModule('FairnessMonitor', window.FairnessMonitor)) {
                        window.FairnessMonitor.render(mainContent);
                    } else {
                        this.renderFallback(mainContent, 'Fairness Monitor', '📊 Fairness metrics loading...');
                    }
                    break;
                    
                case 'fairness-memory':
                    if (this.checkModule('FairnessMemory', window.FairnessMemory)) {
                        window.FairnessMemory.render(mainContent);
                    } else {
                        this.renderFallback(mainContent, 'Fairness Memory', '🧠 Historical fairness data');
                    }
                    break;
                    
                case 'assignments':
                    if (this.checkModule('Assignments', window.Assignments)) {
                        window.Assignments.render(mainContent);
                    } else {
                        this.renderFallback(mainContent, 'AI Assignments', '🤖 Your 420+ line AI dispatch loading...');
                    }
                    break;
                    
                case 'disputes':
                    if (this.checkModule('Disputes', window.Disputes)) {
                        window.Disputes.render(mainContent);
                        setTimeout(() => {
                            if (window.Disputes && window.Disputes.updateGlobalNotifications) {
                                window.Disputes.updateGlobalNotifications();
                            }
                        }, 500);
                    } else {
                        this.renderFallback(mainContent, 'Disputes & Alerts', '⚖️ Justice system realtime');
                    }
                    break;
                    
                case 'order-management':
                    if (this.checkModule('OrderManagement', window.OrderManagement)) {
                        window.OrderManagement.render(mainContent);
                    } else {
                        this.renderFallback(mainContent, 'Order Management', '📦 Upload → AI assigns instantly! <button onclick="if(window.Assignments) window.Assignments.render(document.getElementById(\'main-content\'));" style="background: #10b981; color: white; padding: 8px 16px; border: none; border-radius: 6px; margin-top: 12px; cursor: pointer;">→ AI Assignments</button>');
                    }
                    break;
                
                default:
                    this.renderFallback(mainContent, page, 'Page optimized out! Main features below:', false);
            }
        } catch (error) {
            console.error(`[Navigation] ${page} render error:`, error);
            this.renderFallback(mainContent, page, 'Refresh for clean reload');
        }
        
        setTimeout(() => {
            this.applyScrollFix();
        }, 100);
    },
    
    // FALLBACK RENDER (UPDATED - CLEANER MESSAGES)
    renderFallback(container, title, message) {
        container.innerHTML = `
            <div style="padding: 60px 40px; text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; max-width: 600px; margin: 0 auto;">
                <div style="font-size: 48px; margin-bottom: 24px; opacity: 0.2;">🔧</div>
                <h2 style="color: #1e293b; margin-bottom: 12px;">${title}</h2>
                <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">${message}</p>
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; font-size: 15px;">
                    <button onclick="if(window.Navigation) window.Navigation.navigate('assignments')" 
                            style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 32px; border: none; border-radius: 12px; font-weight: 600; cursor: pointer;">
                        🤖 AI Assignments (MAIN)
                    </button>
                    <button onclick="if(window.Navigation) window.Navigation.navigate('order-management')" 
                            style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 14px 32px; border: none; border-radius: 12px; font-weight: 600; cursor: pointer;">
                        📦 Order Management
                    </button>
                    <button onclick="if(window.Navigation) window.Navigation.navigate('disputes')" 
                            style="background: #f8fafc; color: #475569; padding: 14px 32px; border: 1px solid #cbd5e1; border-radius: 12px; font-weight: 600; cursor: pointer;">
                        ⚖️ Disputes
                    </button>
                </div>
            </div>
        `;
    }
};

// Initialize on DOM ready (UNCHANGED)
document.addEventListener('DOMContentLoaded', function() {
    try {
        if (window.Navigation) {
            window.Navigation.init();
        } else {
            console.error('[Navigation] Module not loaded');
        }
    } catch (error) {
        console.error('[Navigation] DOM ready error:', error);
    }
});

window.Navigation = Navigation;
console.log('✅ Navigation v2.0.2 - CLEAN 6-PAGE DASHBOARD!');
