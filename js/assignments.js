// Route Assignments Module - FEATURE 4
const Assignments = {
    routes: [],
    drivers: [],
    selectedRoute: null,
    
    // Render Route Assignments page
    render(container) {
        container.innerHTML = `
            <div class="content-header">
                <h1>Route Assignment Review</h1>
                <p>AI-assisted route assignments with human oversight</p>
                <div class="bulk-actions">
                    <button class="btn-bulk-auto-assign" id="auto-assign-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                        </svg>
                        🤖 Auto Assign All Orders
                    </button>
                    <button class="btn-bulk-approve-all" id="approve-all" style="display: none;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        ✅ Approve All Assignments
                    </button>
                </div>
            </div>
            <div class="content-body">
                <div class="assignments-wrapper">
                    <!-- Routes List -->
                    <div class="routes-list-section">
                        <div class="routes-list-header">
                            <div class="routes-list-title">Today's Routes & Orders</div>
                            <div class="routes-count" id="routes-count"></div>
                        </div>
                        <div class="routes-list-wrapper" id="routes-list">
                            <!-- Route items will be injected here -->
                        </div>
                    </div>
                    
                    <!-- AI Explanation Panel -->
                    <div class="ai-explanation-panel">
                        <div class="ai-panel-header">
                            <div class="ai-panel-title">Assignment Details</div>
                        </div>
                        <div class="ai-panel-body" id="ai-panel-body">
                            <div style="text-align: center; padding: 60px 20px; color: #718096;">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 16px; opacity: 0.5;">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                                </svg>
                                <div style="font-size: 14px;">Select a route to view AI explanation</div>
                            </div>
                        </div>
                        <div class="assignment-actions" id="assignment-actions" style="display: none;">
                            <!-- Action buttons will be injected here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.init();
    },
    
    // Initialize
    init() {
        // Generate more realistic data for orders/tasks
        this.drivers = MockData.generateDrivers(12);
        this.routes = this.generateFullOrderAssignments();
        
        // Attach bulk action listeners
        this.attachBulkActionListeners();
        
        // Render ALL routes (no filtering)
        this.renderRoutesList();
    },
    
    // Generate realistic order assignments with tasks
    generateFullOrderAssignments() {
        const orders = [];
        const orderIds = ['ORD001', 'ORD002', 'ORD003', 'ORD004', 'ORD005', 'ORD006', 'ORD007', 'ORD008', 'ORD009', 'ORD010'];
        
        orderIds.forEach((id, index) => {
            const driver = this.drivers[Math.floor(index / 2)]; // 2 orders per driver approx
            const stops = Math.floor(Math.random() * 8) + 3;
            const distance = Math.floor((stops * 2.5 + Math.random() * 10) * 10) / 10;
            
            orders.push({
                id: id,
                driverId: driver.id,
                driverName: driver.name,
                driverAvatar: driver.avatar,
                stops: stops,
                distance: distance,
                estimatedTime: stops * 15 + Math.floor(Math.random() * 30),
                difficulty: stops > 8 ? 'Hard' : stops > 5 ? 'Medium' : 'Easy',
                tasks: Array.from({length: stops}, (_, i) => ({
                    taskId: `TASK${id.slice(3)}${String(i+1).padStart(2,'0')}`,
                    orderItem: `Package ${i+1}`,
                    address: `Delivery ${i+1}, Sulur, Coimbatore`,
                    weight: Math.floor(Math.random() * 15 + 1),
                    status: 'pending'
                })),
                status: 'pending',
                aiReasoning: `AI assigned ${stops} stops (${distance}km) to ${driver.name} based on fairness score ${driver.fairnessIndex}, current workload ${driver.effortScore}%, and route optimization.`,
                driverWorkloadLast3Days: [65, 72, 58],
                aiAssigned: false,
                aiTimestamp: null
            });
        });
        
        return orders;
    },
    
    // Attach bulk action listeners
    attachBulkActionListeners() {
        const autoAssignBtn = document.getElementById('auto-assign-all');
        const approveAllBtn = document.getElementById('approve-all');
        
        if (autoAssignBtn) {
            autoAssignBtn.addEventListener('click', () => this.autoAssignAllOrders());
        }
        
        if (approveAllBtn) {
            approveAllBtn.addEventListener('click', () => this.approveAllAssignments());
        }
    },
    
    // 🚀 AUTO ASSIGN ALL ORDERS/TASKS using your team mate's AI
    async autoAssignAllOrders() {
        const pendingOrders = this.routes.filter(route => route.status === 'pending');
        
        if (pendingOrders.length === 0) {
            Utils.notify('ℹ️ All orders already assigned!', 'info');
            return;
        }
        
        // Show loading state
        const autoAssignBtn = document.getElementById('auto-assign-all');
        if (autoAssignBtn) {
            autoAssignBtn.disabled = true;
            autoAssignBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="31.416 31.416" stroke-dashoffset="31.416"/>
                </svg>
                Assigning ${pendingOrders.length} orders...
            `;
        }
        
        Utils.notify(`🤖 AI assigning ${pendingOrders.length} orders & tasks...`, 'info');
        
        try {
            // 🔥 SIMULATE YOUR TEAM MATE'S AI SERVICE
            // Replace this with actual API call to your team mate's AI:
            // const response = await fetch('/api/ai/auto-assign-all', {
            //     method: 'POST',
            //     headers: {'Content-Type': 'application/json'},
            //     body: JSON.stringify({
            //         orders: pendingOrders,
            //         drivers: this.drivers
            //     })
            // });
            // const aiAssignments = await response.json();
            
            // Simulate AI processing (1.5-3 seconds)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // AI assigns all pending orders
            pendingOrders.forEach((order, index) => {
                // Keep existing driver or reassign for demo
                const driverIndex = (parseInt(order.id.slice(3)) + index) % this.drivers.length;
                const assignedDriver = this.drivers[driverIndex];
                
                order.driverId = assignedDriver.id;
                order.driverName = assignedDriver.name;
                order.driverAvatar = assignedDriver.avatar;
                order.status = 'assigned';
                order.aiAssigned = true;
                order.aiTimestamp = Date.now();
                
                // Update AI reasoning
                order.aiReasoning = `🤖 AI Auto-Assigned: Optimized ${order.stops} stops (${order.distance}km) to ${assignedDriver.name}. Fairness: ${assignedDriver.fairnessIndex} | Workload: ${assignedDriver.effortScore}% | All tasks assigned.`;
                
                // Mark all tasks as assigned
                order.tasks.forEach(task => {
                    task.status = 'assigned';
                    task.driverId = assignedDriver.id;
                });
            });
            
            // Show Approve All button
            const approveAllBtn = document.getElementById('approve-all');
            if (approveAllBtn) approveAllBtn.style.display = 'inline-flex';
            
            Utils.notify(`✅ ${pendingOrders.length} orders auto-assigned by AI! Review & approve all.`, 'success');
            
        } catch (error) {
            Utils.notify('❌ Auto-assign failed. Please try manual assignment.', 'error');
            console.error('Auto-assign error:', error);
        } finally {
            // Reset button
            if (autoAssignBtn) {
                autoAssignBtn.disabled = false;
                autoAssignBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                    </svg>
                    🤖 Auto Assign All Orders
                `;
            }
        }
        
        // Refresh display
        this.renderRoutesList();
        this.updateRoutesCount();
    },
    
    // Approve ALL assignments at once
    approveAllAssignments() {
        const assignedOrders = this.routes.filter(route => route.status === 'assigned');
        
        if (assignedOrders.length === 0) {
            Utils.notify('ℹ️ No assignments to approve!', 'info');
            return;
        }
        
        if (confirm(`✅ Approve ALL ${assignedOrders.length} assignments? This will lock them for drivers.`)) {
            assignedOrders.forEach(order => {
                order.status = 'approved';
                order.approvedTimestamp = Date.now();
            });
            
            // Hide approve all button
            const approveAllBtn = document.getElementById('approve-all');
            if (approveAllBtn) approveAllBtn.style.display = 'none';
            
            Utils.notify(`✅ All ${assignedOrders.length} assignments approved & locked!`, 'success');
            this.renderRoutesList();
            this.updateRoutesCount();
        }
    },
    
    // Update routes count
    updateRoutesCount() {
        const pending = this.routes.filter(r => r.status === 'pending').length;
        const assigned = this.routes.filter(r => r.status === 'assigned').length;
        const approved = this.routes.filter(r => r.status === 'approved').length;
        
        const countElement = document.getElementById('routes-count');
        if (countElement) {
            countElement.innerHTML = `
                <span class="count-badge pending">${pending} Pending</span>
                <span class="count-badge assigned">${assigned} Assigned</span>
                <span class="count-badge approved">${approved} Approved</span>
            `;
        }
    },
    
    // Render routes list
    renderRoutesList() {
        const listContainer = document.getElementById('routes-list');
        if (!listContainer) return;
        
        const allRoutes = this.routes;
        
        if (allRoutes.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #718096;">
                    No orders available
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = allRoutes.map(route => this.createRouteItem(route)).join('');
        this.attachRouteClickListeners();
        this.updateRoutesCount();
    },
    
    createRouteItem(route) {
        const difficultyClass = route.difficulty === 'Easy' ? 'success' : route.difficulty === 'Hard' ? 'danger' : 'warning';
        const statusClass = route.status === 'assigned' ? 'assigned' : route.status === 'approved' ? 'approved' : 'pending';
        
        return `
            <div class="route-item ${this.selectedRoute?.id === route.id ? 'selected' : ''} status-${statusClass}" data-route-id="${route.id}">
                <div class="route-item-header">
                    <div class="route-item-id">${route.id}</div>
                    ${route.aiAssigned ? '<div class="ai-badge">🤖 AI</div>' : ''}
                </div>
                <div class="route-item-driver">
                    <img src="${route.driverAvatar}" alt="${route.driverName}" class="route-driver-avatar">
                    <div class="route-driver-name">${route.driverName}</div>
                </div>
                <div class="route-item-stats">
                    <div class="route-stat">
                        <div class="route-stat-label">Orders</div>
                        <div class="route-stat-value">${route.stops}</div>
                    </div>
                    <div class="route-stat">
                        <div class="route-stat-label">Distance</div>
                        <div class="route-stat-value">${route.distance} km</div>
                    </div>
                    <div class="route-stat">
                        <div class="route-stat-label">Difficulty</div>
                        <div class="route-stat-value" style="color: var(--${difficultyClass})">${route.difficulty}</div>
                    </div>
                </div>
                <div class="route-tasks-preview">
                    ${route.tasks.slice(0, 3).map(task => `<div class="task-preview">${task.orderItem}</div>`).join('')}
                    ${route.tasks.length > 3 ? `<div class="more-tasks">+${route.tasks.length - 3} more</div>` : ''}
                </div>
            </div>
        `;
    },
    
    attachRouteClickListeners() {
        const routeItems = document.querySelectorAll('.route-item');
        routeItems.forEach(item => {
            item.addEventListener('click', () => {
                const routeId = item.getAttribute('data-route-id');
                this.selectRoute(routeId);
            });
        });
    },
    
    selectRoute(routeId) {
        this.selectedRoute = this.routes.find(r => r.id === routeId);
        if (!this.selectedRoute) return;
        
        document.querySelectorAll('.route-item').forEach(item => {
            item.classList.remove('selected');
            if (item.getAttribute('data-route-id') === routeId) {
                item.classList.add('selected');
            }
        });
        
        this.showAIExplanation(this.selectedRoute);
        this.showActions(this.selectedRoute);
    },
    
    // Show AI explanation panel
    showAIExplanation(route) {
        const panelBody = document.getElementById('ai-panel-body');
        if (!panelBody) return;
        
        const driver = this.drivers.find(d => d.id === route.driverId);
        if (!driver) return;
        
        const aiAutoAssignNote = route.aiAssigned ? `
            <div class="ai-auto-assign-note">
                <div class="ai-note-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Auto-assigned by AI
                </div>
                <div class="ai-note-timestamp">${Utils.formatDateTime(route.aiTimestamp)}</div>
            </div>
        ` : '';
        
        panelBody.innerHTML = `
            ${aiAutoAssignNote}
            <!-- AI Explanation Card -->
            <div class="ai-explanation-card">
                <div class="ai-explanation-header">
                    <div class="ai-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                        </svg>
                    </div>
                    <div class="ai-explanation-title">AI Assignment Reasoning</div>
                </div>
                <div class="ai-explanation-text">
                    ${route.aiReasoning}
                </div>
            </div>
            
            <!-- Route Details -->
            <div class="driver-workload-history">
                <div class="workload-history-title">Route Details</div>
                <div class="workload-history-list">
                    <div class="workload-history-item">
                        <div class="workload-history-date">Total Stops</div>
                        <div class="workload-history-score">${route.stops} stops</div>
                    </div>
                    <div class="workload-history-item">
                        <div class="workload-history-date">Total Distance</div>
                        <div class="workload-history-score">${route.distance} km</div>
                    </div>
                    <div class="workload-history-item">
                        <div class="workload-history-date">Est. Time</div>
                        <div class="workload-history-score">${Utils.formatDuration(route.estimatedTime)}</div>
                    </div>
                    <div class="workload-history-item">
                        <div class="workload-history-date">Difficulty Level</div>
                        <div class="workload-history-score ${route.difficulty === 'Easy' ? 'low' : route.difficulty === 'Hard' ? 'high' : 'medium'}">${route.difficulty}</div>
                    </div>
                </div>
            </div>
            
            <!-- Driver Workload History -->
            <div class="driver-workload-history">
                <div class="workload-history-title">${driver.name}'s Last 3 Days</div>
                <div class="workload-history-list">
                    <div class="workload-history-item">
                        <div class="workload-history-date">3 Days Ago</div>
                        <div class="workload-history-score ${route.driverWorkloadLast3Days[0] < 60 ? 'low' : route.driverWorkloadLast3Days[0] < 80 ? 'medium' : 'high'}">${route.driverWorkloadLast3Days[0]}%</div>
                    </div>
                    <div class="workload-history-item">
                        <div class="workload-history-date">Yesterday</div>
                        <div class="workload-history-score ${route.driverWorkloadLast3Days[1] < 60 ? 'low' : route.driverWorkloadLast3Days[1] < 80 ? 'medium' : 'high'}">${route.driverWorkloadLast3Days[1]}%</div>
                    </div>
                    <div class="workload-history-item">
                        <div class="workload-history-date">Today (Current)</div>
                        <div class="workload-history-score ${route.driverWorkloadLast3Days[2] < 60 ? 'low' : route.driverWorkloadLast3Days[2] < 80 ? 'medium' : 'high'}">${route.driverWorkloadLast3Days[2]}%</div>
                    </div>
                </div>
            </div>
            
            <!-- Driver Current Status -->
            <div class="driver-workload-history">
                <div class="workload-history-title">Driver Current Status</div>
                <div class="workload-history-list">
                    <div class="workload-history-item">
                        <div class="workload-history-date">Current Effort Score</div>
                        <div class="workload-history-score ${driver.effortScore < 60 ? 'low' : driver.effortScore < 80 ? 'medium' : 'high'}">${driver.effortScore}%</div>
                    </div>
                    <div class="workload-history-item">
                        <div class="workload-history-date">Fairness Index</div>
                        <div class="workload-history-score ${driver.fairnessIndex >= 75 ? 'low' : driver.fairnessIndex >= 50 ? 'medium' : 'high'}">${driver.fairnessIndex}</div>
                    </div>
                    <div class="workload-history-item">
                        <div class="workload-history-date">Today's Deliveries</div>
                        <div class="workload-history-score">${driver.deliveries}</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ✅ FIXED: Show action buttons (Swap + Override + Approve)
    showActions(route) {
        const actionsContainer = document.getElementById('assignment-actions');
        if (!actionsContainer) return;
        
        actionsContainer.style.display = 'flex';
        
        if (route.status === 'approved') {
            // Already approved - locked
            actionsContainer.innerHTML = `
                <div style="text-align: center; padding: 16px; color: #10b981; font-size: 14px; width: 100%;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Assignment Approved & Locked
                </div>
            `;
        } else if (route.status === 'assigned') {
            // Assigned - show Approve + Swap + Override
            actionsContainer.innerHTML = `
                <button class="btn-assignment-action approve" data-action="approve">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Approve Assignment
                </button>
                <button class="btn-assignment-action swap" data-action="swap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="17 1 21 5 17 9"/>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                        <polyline points="7 23 3 19 7 15"/>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                    </svg>
                    Swap Drivers
                </button>
                <button class="btn-assignment-action override" data-action="override">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Manual Override
                </button>
            `;
        } else {
            // Pending - show only Swap + Override
            actionsContainer.innerHTML = `
                <button class="btn-assignment-action swap" data-action="swap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="17 1 21 5 17 9"/>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                        <polyline points="7 23 3 19 7 15"/>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                    </svg>
                    Swap Drivers
                </button>
                <button class="btn-assignment-action override" data-action="override">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Manual Override
                </button>
            `;
        }
        
        // Attach action listeners
        this.attachActionListeners(route);
    },
    
    // Attach action listeners
    attachActionListeners(route) {
        const actionBtns = document.querySelectorAll('.btn-assignment-action');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.handleAction(action, route);
            });
        });
    },
    
    // Handle actions
    handleAction(action, route) {
        switch(action) {
            case 'approve':
                route.status = 'approved';
                route.approvedTimestamp = Date.now();
                Utils.notify(`✅ Route ${route.id} approved and assigned to ${route.driverName}`, 'success');
                this.selectRoute(route.id);
                this.renderRoutesList();
                break;
                
            case 'swap':
                this.showSwapDriverDialog(route);
                break;
                
            case 'override':
                this.showManualOverrideDialog(route);
                break;
        }
    },
    
    // Show Swap Driver Dialog
    showSwapDriverDialog(route) {
        const currentDriver = this.drivers.find(d => d.id === route.driverId);
        
        // Get available drivers (exclude current driver)
        const availableDrivers = this.drivers.filter(d => d.id !== route.driverId);
        
        // Create driver selection dropdown
        let driverOptions = availableDrivers.map((driver, index) => 
            `${index + 1}. ${driver.name} (Fairness: ${driver.fairnessIndex}, Effort: ${driver.effortScore}%)`
        ).join('\n');
        
        const selection = prompt(
            `🔄 SWAP DRIVER FOR ROUTE ${route.id}\n\n` +
            `Current Driver: ${currentDriver.name}\n\n` +
            `Available Drivers:\n${driverOptions}\n\n` +
            `Enter driver number (1-${availableDrivers.length}):`,
            '1'
        );
        
        if (selection === null) return; // User cancelled
        
        const driverIndex = parseInt(selection) - 1;
        
        if (isNaN(driverIndex) || driverIndex < 0 || driverIndex >= availableDrivers.length) {
            alert('❌ Invalid selection. Please enter a valid number.');
            return;
        }
        
        const newDriver = availableDrivers[driverIndex];
        const oldDriverName = route.driverName;
        
        // Perform swap
        route.driverId = newDriver.id;
        route.driverName = newDriver.name;
        route.driverAvatar = newDriver.avatar;
        route.status = 'assigned'; // Change status to show Approve button
        
        Utils.notify(`🔄 Route ${route.id} swapped from ${oldDriverName} to ${newDriver.name}`, 'success');
        
        // Refresh display
        this.renderRoutesList();
        this.selectRoute(route.id);
    },
    
    // Show Manual Override Dialog
    showManualOverrideDialog(route) {
        const reason = prompt(
            `✏️ MANUAL OVERRIDE FOR ROUTE ${route.id}\n\n` +
            `Current Assignment: ${route.driverName}\n` +
            `Stops: ${route.stops} | Distance: ${route.distance} km | Difficulty: ${route.difficulty}\n\n` +
            `Enter reason for manual override:`,
            ''
        );
        
        if (reason === null) return; // User cancelled
        
        if (reason.trim() === '') {
            alert('❌ Please provide a reason for manual override.');
            return;
        }
        
        // Get all drivers for manual selection
        let driverOptions = this.drivers.map((driver, index) => 
            `${index + 1}. ${driver.name} (Fairness: ${driver.fairnessIndex}, Effort: ${driver.effortScore}%)`
        ).join('\n');
        
        const selection = prompt(
            `Select new driver:\n\n${driverOptions}\n\nEnter driver number (1-${this.drivers.length}):`,
            '1'
        );
        
        if (selection === null) return; // User cancelled
        
        const driverIndex = parseInt(selection) - 1;
        
        if (isNaN(driverIndex) || driverIndex < 0 || driverIndex >= this.drivers.length) {
            alert('❌ Invalid selection. Please enter a valid number.');
            return;
        }
        
        const newDriver = this.drivers[driverIndex];
        const oldDriverName = route.driverName;
        
        // Apply manual override
        route.driverId = newDriver.id;
        route.driverName = newDriver.name;
        route.driverAvatar = newDriver.avatar;
        route.status = 'assigned'; // Change status to show Approve button
        route.overrideReason = reason.trim();
        route.overrideBy = 'Dispatcher';
        route.overrideTimestamp = Date.now();
        
        Utils.notify(`✏️ Manual Override: Route ${route.id} reassigned from ${oldDriverName} to ${newDriver.name}`, 'warning');
        
        console.log('[Assignments] Manual Override:', {
            routeId: route.id,
            fromDriver: oldDriverName,
            toDriver: newDriver.name,
            reason: reason.trim(),
            timestamp: new Date().toISOString()
        });
        
        // Refresh display
        this.renderRoutesList();
        this.selectRoute(route.id);
    }
};

window.Assignments = Assignments;
