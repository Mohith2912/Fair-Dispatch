// Driver Profile Modal
const DriverProfile = {
    
    // Show driver profile modal
    show(driverId) {
        const driver = LiveFleet.getDriver(driverId);
        if (!driver) return;
        
        const modal = document.getElementById('driver-profile-modal');
        if (!modal) return;
        
        // Render modal content
        const content = modal.querySelector('.driver-profile-content');
        content.innerHTML = this.renderProfileContent(driver);
        
        // Show modal
        modal.classList.add('active');
        
        // Attach close listeners
        this.attachCloseListeners(modal);
        
        // Attach action listeners
        this.attachActionListeners(driver);
    },
    
    // Render profile content
    renderProfileContent(driver) {
        const statusClass = Utils.getWorkloadClass(driver.effortScore);
        const hardwareOnlineCount = Object.values(driver.hardware).filter(Boolean).length;
        const hardwareTotalCount = Object.keys(driver.hardware).length;
        
        return `
            <div class="profile-modal-header">
                <div class="profile-modal-title">
                    <img src="${driver.avatar}" alt="${driver.name}" class="profile-modal-avatar">
                    <div class="profile-modal-info">
                        <h2>${driver.name}</h2>
                        <p>${driver.id} • ${driver.vehicleType} • ${driver.phone}</p>
                    </div>
                </div>
                <button class="btn-close-modal" id="close-profile-modal">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div class="profile-modal-body">
                <!-- Current Status -->
                <div class="profile-section">
                    <div class="profile-section-title">Current Status</div>
                    <div class="profile-stats-grid">
                        <div class="profile-stat-card">
                            <div class="profile-stat-label">Today's Effort</div>
                            <div class="profile-stat-value" style="color: ${Utils.getStatusColor(driver.workload)}">${driver.effortScore}</div>
                        </div>
                        <div class="profile-stat-card">
                            <div class="profile-stat-label">Fairness Index</div>
                            <div class="profile-stat-value">${driver.fairnessIndex}</div>
                        </div>
                        <div class="profile-stat-card">
                            <div class="profile-stat-label">Deliveries</div>
                            <div class="profile-stat-value">${driver.deliveries}</div>
                        </div>
                        <div class="profile-stat-card">
                            <div class="profile-stat-label">Earnings Today</div>
                            <div class="profile-stat-value">${Utils.formatCurrency(driver.earnings)}</div>
                        </div>
                        <div class="profile-stat-card">
                            <div class="profile-stat-label">Stops Remaining</div>
                            <div class="profile-stat-value">${driver.stopsRemaining}</div>
                        </div>
                        <div class="profile-stat-card">
                            <div class="profile-stat-label">ETA Next Stop</div>
                            <div class="profile-stat-value">${driver.etaNextStop} min</div>
                        </div>
                    </div>
                </div>
                
                <!-- Current Route -->
                <div class="profile-section">
                    <div class="profile-section-title">Current Route</div>
                    <div class="profile-stats-grid" style="grid-template-columns: 1fr;">
                        <div class="profile-stat-card">
                            <div class="profile-stat-label">Route ID</div>
                            <div class="profile-stat-value" style="font-size: 18px;">${driver.currentRoute || 'No active route'}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Hardware Sensor Status -->
                <div class="profile-section">
                    <div class="profile-section-title">Hardware Sensor Status (${hardwareOnlineCount}/${hardwareTotalCount} Online)</div>
                    <div class="hardware-status-grid">
                        ${this.renderHardwareStatus('GPS Tracker', driver.hardware.gps)}
                        ${this.renderHardwareStatus('Internet', driver.hardware.internet)}
                        ${this.renderHardwareStatus('Load Cell (Weight)', driver.hardware.loadCell)}
                        ${this.renderHardwareStatus('Stair Sensor', driver.hardware.stairSensor)}
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="profile-actions">
                    <button class="btn-profile-action primary" data-action="message">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Send Message
                    </button>
                    <button class="btn-profile-action secondary" data-action="flag">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                            <line x1="4" y1="22" x2="4" y2="15"></line>
                        </svg>
                        Flag as Overworked
                    </button>
                    <button class="btn-profile-action secondary" data-action="reassign">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Reassign Route
                    </button>
                </div>
            </div>
        `;
    },
    
    // Render hardware status item
    renderHardwareStatus(name, isOnline) {
        return `
            <div class="hardware-status-item">
                <div class="hardware-status-name">${name}</div>
                <div class="hardware-status-indicator ${isOnline ? 'online' : 'offline'}">
                    <span class="hardware-status-dot"></span>
                    ${isOnline ? 'Online' : 'Offline'}
                </div>
            </div>
        `;
    },
    
    // Attach close listeners
    attachCloseListeners(modal) {
        // Close button
        const closeBtn = document.getElementById('close-profile-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide(modal));
        }
        
        // Backdrop click
        const backdrop = modal.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.hide(modal));
        }
        
        // Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide(modal);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    },
    
    // Attach action listeners
    attachActionListeners(driver) {
        const actionBtns = document.querySelectorAll('.btn-profile-action');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.handleAction(action, driver);
            });
        });
    },
    
    // Handle profile actions
    handleAction(action, driver) {
        switch(action) {
            case 'message':
                Utils.notify(`Message sent to ${driver.name}`, 'success');
                break;
            case 'flag':
                Utils.notify(`${driver.name} flagged as overworked`, 'warning');
                break;
            case 'reassign':
                Utils.notify(`Route reassignment initiated for ${driver.name}`, 'info');
                break;
        }
    },
    
    // Hide modal
    hide(modal) {
        modal.classList.remove('active');
    }
};

window.DriverProfile = DriverProfile;
