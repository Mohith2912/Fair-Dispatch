// System Health Module - FEATURE 6
const SystemHealth = {
    drivers: [],
    globalAlerts: [],
    updateInterval: null,
    
    // Render System Health page
    render(container) {
        container.innerHTML = `
            <div class="content-header">
                <h1>System Health & Hardware Status</h1>
                <p>Real-time monitoring of all sensor and connectivity status</p>
            </div>
            <div class="content-body">
                <div class="system-health-wrapper">
                    <!-- Global Health Overview -->
                    <div class="global-health-overview">
                        <div class="health-overview-card">
                            <div class="health-card-header">
                                <div class="health-card-title">GPS Trackers</div>
                                <div class="health-status-indicator healthy" id="gps-indicator"></div>
                            </div>
                            <div class="health-card-value" id="gps-online">0</div>
                            <div class="health-card-label">of <span id="gps-total">0</span> online</div>
                        </div>
                        
                        <div class="health-overview-card">
                            <div class="health-card-header">
                                <div class="health-card-title">Internet</div>
                                <div class="health-status-indicator healthy" id="internet-indicator"></div>
                            </div>
                            <div class="health-card-value" id="internet-online">0</div>
                            <div class="health-card-label">of <span id="internet-total">0</span> online</div>
                        </div>
                        
                        <div class="health-overview-card">
                            <div class="health-card-header">
                                <div class="health-card-title">Load Cells</div>
                                <div class="health-status-indicator warning" id="loadcell-indicator"></div>
                            </div>
                            <div class="health-card-value" id="loadcell-online">0</div>
                            <div class="health-card-label">of <span id="loadcell-total">0</span> online</div>
                        </div>
                        
                        <div class="health-overview-card">
                            <div class="health-card-header">
                                <div class="health-card-title">Stair Sensors</div>
                                <div class="health-status-indicator warning" id="stair-indicator"></div>
                            </div>
                            <div class="health-card-value" id="stair-online">0</div>
                            <div class="health-card-label">of <span id="stair-total">0</span> online</div>
                        </div>
                    </div>
                    
                    <!-- Driver Hardware Status -->
                    <div class="driver-hardware-container">
                        <div class="driver-hardware-header">
                            <div class="driver-hardware-title">Driver Hardware Status</div>
                            <button class="hardware-refresh-btn" id="hardware-refresh-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="23 4 23 10 17 10"/>
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                                </svg>
                                Refresh Status
                            </button>
                        </div>
                        <div class="driver-hardware-list" id="driver-hardware-list">
                            <!-- Driver hardware items will be injected here -->
                        </div>
                    </div>
                    
                    <!-- Global Alerts -->
                    <div class="global-alerts-section" id="global-alerts-section">
                        <div class="global-alerts-title">Active Hardware Alerts</div>
                        <div class="global-alerts-list" id="global-alerts-list">
                            <!-- Alerts will be injected here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.init();
    },
    
    // Initialize
    init() {
        // Load drivers
        this.drivers = MockData.generateDrivers(12);
        
        // Update global stats
        this.updateGlobalStats();
        
        // Render driver hardware list
        this.renderDriverHardware();
        
        // Generate and render alerts
        this.generateAlerts();
        this.renderAlerts();
        
        // Attach refresh listener
        this.attachRefreshListener();
        
        // Start real-time updates
        this.startRealtimeUpdates();
    },
    
    // Update global stats
    updateGlobalStats() {
        const total = this.drivers.length;
        
        // Count online devices
        const gpsOnline = this.drivers.filter(d => d.hardware.gps).length;
        const internetOnline = this.drivers.filter(d => d.hardware.internet).length;
        const loadCellOnline = this.drivers.filter(d => d.hardware.loadCell).length;
        const stairOnline = this.drivers.filter(d => d.hardware.stairSensor).length;
        
        // Update counts
        document.getElementById('gps-online').textContent = gpsOnline;
        document.getElementById('gps-total').textContent = total;
        document.getElementById('internet-online').textContent = internetOnline;
        document.getElementById('internet-total').textContent = total;
        document.getElementById('loadcell-online').textContent = loadCellOnline;
        document.getElementById('loadcell-total').textContent = total;
        document.getElementById('stair-online').textContent = stairOnline;
        document.getElementById('stair-total').textContent = total;
        
        // Update indicators
        this.updateIndicator('gps-indicator', gpsOnline, total);
        this.updateIndicator('internet-indicator', internetOnline, total);
        this.updateIndicator('loadcell-indicator', loadCellOnline, total);
        this.updateIndicator('stair-indicator', stairOnline, total);
    },
    
    // Update health indicator
    updateIndicator(indicatorId, online, total) {
        const indicator = document.getElementById(indicatorId);
        if (!indicator) return;
        
        const percentage = (online / total) * 100;
        
        indicator.className = 'health-status-indicator';
        if (percentage >= 90) {
            indicator.classList.add('healthy');
        } else if (percentage >= 70) {
            indicator.classList.add('warning');
        } else {
            indicator.classList.add('critical');
        }
    },
    
    // Render driver hardware list
    renderDriverHardware() {
        const listContainer = document.getElementById('driver-hardware-list');
        if (!listContainer) return;
        
        listContainer.innerHTML = this.drivers.map(driver => this.createDriverHardwareItem(driver)).join('');
    },
    
    // Create driver hardware item
    createDriverHardwareItem(driver) {
        const hardwareValues = Object.values(driver.hardware);
        const onlineCount = hardwareValues.filter(Boolean).length;
        const totalCount = hardwareValues.length;
        const hasOffline = onlineCount < totalCount;
        
        let overallStatus = 'all-online';
        if (onlineCount === 0) {
            overallStatus = 'critical';
        } else if (hasOffline) {
            overallStatus = 'some-offline';
        }
        
        return `
            <div class="driver-hardware-item ${hasOffline ? 'has-offline' : ''}">
                <div class="driver-hardware-item-header">
                    <div class="driver-hardware-info">
                        <img src="${driver.avatar}" alt="${driver.name}" class="driver-hardware-avatar">
                        <div class="driver-hardware-details">
                            <div class="driver-hardware-name">${driver.name}</div>
                            <div class="driver-hardware-id">${driver.id} • Last check: ${Utils.getRelativeTime(driver.lastHardwareCheck)}</div>
                        </div>
                    </div>
                    <div class="driver-overall-status ${overallStatus}">
                        ${onlineCount === totalCount ? 'All Systems Online' : onlineCount === 0 ? 'All Offline' : `${onlineCount}/${totalCount} Online`}
                    </div>
                </div>
                
                <div class="sensors-grid">
                    ${this.createSensorCard('GPS Tracker', driver.hardware.gps)}
                    ${this.createSensorCard('Internet', driver.hardware.internet)}
                    ${this.createSensorCard('Load Cell', driver.hardware.loadCell)}
                    ${this.createSensorCard('Stair Sensor', driver.hardware.stairSensor)}
                </div>
            </div>
        `;
    },
    
    // Create sensor status card
    createSensorCard(name, isOnline) {
        return `
            <div class="sensor-status-card ${isOnline ? '' : 'offline'}">
                <div class="sensor-header">
                    <div class="sensor-name">${name}</div>
                    <div class="sensor-icon ${isOnline ? 'online' : 'offline'}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${isOnline 
                                ? '<polyline points="20 6 9 17 4 12"/>' 
                                : '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
                            }
                        </svg>
                    </div>
                </div>
                <div class="sensor-status-text ${isOnline ? 'online' : 'offline'}">
                    ${isOnline ? 'Online' : 'Offline'}
                </div>
                <div class="sensor-last-update">
                    ${isOnline ? 'Active now' : 'Connection lost'}
                </div>
            </div>
        `;
    },
    
    // Generate alerts
    generateAlerts() {
        this.globalAlerts = [];
        
        this.drivers.forEach(driver => {
            // Check each hardware component
            if (!driver.hardware.gps) {
                this.globalAlerts.push({
                    driverId: driver.id,
                    driverName: driver.name,
                    message: `GPS tracker offline for ${driver.name}`,
                    time: driver.lastHardwareCheck
                });
            }
            if (!driver.hardware.loadCell) {
                this.globalAlerts.push({
                    driverId: driver.id,
                    driverName: driver.name,
                    message: `Weight sensor disconnected for ${driver.name}`,
                    time: driver.lastHardwareCheck
                });
            }
            if (!driver.hardware.stairSensor) {
                this.globalAlerts.push({
                    driverId: driver.id,
                    driverName: driver.name,
                    message: `Stair sensor offline for ${driver.name}`,
                    time: driver.lastHardwareCheck
                });
            }
            if (!driver.hardware.internet) {
                this.globalAlerts.push({
                    driverId: driver.id,
                    driverName: driver.name,
                    message: `Internet connection lost for ${driver.name}`,
                    time: driver.lastHardwareCheck
                });
            }
        });
        
        // Sort by time (most recent first)
        this.globalAlerts.sort((a, b) => b.time - a.time);
    },
    
    // Render alerts
    renderAlerts() {
        const alertsContainer = document.getElementById('global-alerts-list');
        if (!alertsContainer) return;
        
        if (this.globalAlerts.length === 0) {
            alertsContainer.innerHTML = `
                <div class="system-health-empty">
                    <div class="system-health-empty-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div class="system-health-empty-title">All Systems Healthy</div>
                    <div class="system-health-empty-text">No hardware issues detected across the fleet</div>
                </div>
            `;
            return;
        }
        
        alertsContainer.innerHTML = this.globalAlerts.map(alert => `
            <div class="global-alert-item">
                <div class="global-alert-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <div class="global-alert-content">
                    <div class="global-alert-message">${alert.message}</div>
                    <div class="global-alert-time">${Utils.getRelativeTime(alert.time)}</div>
                </div>
            </div>
        `).join('');
    },
    
    // Attach refresh listener
    attachRefreshListener() {
        const refreshBtn = document.getElementById('hardware-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
    },
    
    // Refresh hardware status
    refresh() {
        // Simulate hardware status changes
        this.drivers.forEach(driver => {
            driver.lastHardwareCheck = new Date();
            
            // Random reconnection (30% chance)
            if (Math.random() < 0.3) {
                if (!driver.hardware.gps && Math.random() < 0.5) driver.hardware.gps = true;
                if (!driver.hardware.loadCell && Math.random() < 0.5) driver.hardware.loadCell = true;
                if (!driver.hardware.stairSensor && Math.random() < 0.5) driver.hardware.stairSensor = true;
                if (!driver.hardware.internet && Math.random() < 0.5) driver.hardware.internet = true;
            }
        });
        
        this.updateGlobalStats();
        this.renderDriverHardware();
        this.generateAlerts();
        this.renderAlerts();
        
        Utils.notify('Hardware status refreshed', 'success');
    },
    
    // Start real-time updates
    startRealtimeUpdates() {
        this.updateInterval = setInterval(() => {
            // Simulate random hardware failures/recoveries
            this.drivers.forEach(driver => {
                // 5% chance of status change
                if (Math.random() < 0.05) {
                    const sensors = ['gps', 'internet', 'loadCell', 'stairSensor'];
                    const randomSensor = sensors[Utils.randomIntBetween(0, sensors.length - 1)];
                    driver.hardware[randomSensor] = !driver.hardware[randomSensor];
                    driver.lastHardwareCheck = new Date();
                }
            });
            
            this.updateGlobalStats();
            this.renderDriverHardware();
            this.generateAlerts();
            this.renderAlerts();
        }, AppConfig.refreshIntervals.systemHealth);
    },
    
    // Stop real-time updates
    stopRealtimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
};

window.SystemHealth = SystemHealth;
