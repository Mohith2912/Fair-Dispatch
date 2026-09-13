// ========================================
// DISPUTES & ALERTS MODULE - FEATURE 5 (CHATBOT INTEGRATED)
// Real-time justice system with chatbot integration + auto-move to assignments
// ========================================

const Disputes = {
    disputes: [],
    drivers: [],
    filteredDisputes: [],
    selectedDispute: null,
    filterStatus: 'pending',
    updateInterval: null,
    viewedDisputes: new Set(),
    
    // Render Disputes page
    render(container) {
        container.innerHTML = `
            <div class="content-header">
                <h1>Disputes & Alerts</h1>
                <p>Real-time justice with hardware verification + Chatbot Integration</p>
            </div>
            <div class="content-body">
                <div class="disputes-wrapper">
                    <!-- Stats Row - NO REASSIGN -->
                    <div class="dispute-stats-row" id="dispute-stats-row">
                        <div class="dispute-stat-card active" data-filter="pending">
                            <div class="dispute-stat-icon pending">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                            <div class="dispute-stat-info">
                                <div class="dispute-stat-value" id="pending-disputes">0</div>
                                <div class="dispute-stat-label">Pending</div>
                            </div>
                        </div>
                        
                        <div class="dispute-stat-card" data-filter="approved">
                            <div class="dispute-stat-icon approved">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>
                            <div class="dispute-stat-info">
                                <div class="dispute-stat-value" id="approved-disputes">0</div>
                                <div class="dispute-stat-label">Approved</div>
                            </div>
                        </div>
                        
                        <div class="dispute-stat-card" data-filter="rejected">
                            <div class="dispute-stat-icon rejected">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                            </div>
                            <div class="dispute-stat-info">
                                <div class="dispute-stat-value" id="rejected-disputes">0</div>
                                <div class="dispute-stat-label">Rejected</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Disputes List -->
                    <div class="disputes-list" id="disputes-list">
                        <!-- Dispute items will be injected here -->
                    </div>
                </div>
            </div>
        `;
        
        this.init();
    },
    
    // Initialize
    init() {
        console.log('[Disputes] Initializing with Chatbot integration...');
        
        this.drivers = MockData.generateDrivers(12);
        this.disputes = MockData.generateDisputes(this.drivers, 12);
        
        this.updateStats();
        this.applyFilter('pending');
        this.attachStatCardListeners();
        this.startRealtimeUpdates();
        this.updateGlobalNotifications();
    },
    
    // Update stats
    updateStats() {
        const pending = this.disputes.filter(d => d.status === 'pending').length;
        const approved = this.disputes.filter(d => d.status === 'approved').length;
        const rejected = this.disputes.filter(d => d.status === 'rejected').length;
        
        document.getElementById('pending-disputes').textContent = pending;
        document.getElementById('approved-disputes').textContent = approved;
        document.getElementById('rejected-disputes').textContent = rejected;
    },
    
    // Attach stat card click listeners
    attachStatCardListeners() {
        const statCards = document.querySelectorAll('.dispute-stat-card');
        statCards.forEach(card => {
            card.addEventListener('click', () => {
                const filter = card.getAttribute('data-filter');
                this.applyFilter(filter);
                
                statCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
    },
    
    // Apply filter
    applyFilter(filter) {
        console.log(`[Disputes] Applying filter: ${filter}`);
        this.filterStatus = filter;
        this.filteredDisputes = this.disputes.filter(d => d.status === filter);
        console.log(`[Disputes] Filtered disputes count: ${this.filteredDisputes.length}`);
        this.renderDisputesList();
    },
    
    // Render disputes list
    renderDisputesList() {
        const listContainer = document.getElementById('disputes-list');
        if (!listContainer) return;
        
        const sorted = [...this.filteredDisputes].sort((a, b) => {
            const severityOrder = { urgent: 0, medium: 1, info: 2 };
            const diff = severityOrder[a.severity] - severityOrder[b.severity];
            if (diff !== 0) return diff;
            return b.timestamp - a.timestamp;
        });
        
        if (sorted.length === 0) {
            listContainer.innerHTML = `
                <div style="padding: 60px 20px; text-align: center; color: #718096;">
                    <div style="font-size: 14px;">No disputes in this category</div>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = sorted.map(dispute => this.createDisputeCard(dispute)).join('');
        
        sorted.forEach(d => this.viewedDisputes.add(d.id));
        this.updateGlobalNotifications();
        this.attachDisputeActionListeners();
    },
    
    // Create dispute card - WITH CHATBOT MESSAGE
    createDisputeCard(dispute) {
        const driver = this.drivers.find(d => d.id === dispute.driverId);
        if (!driver) return '';
        
        return `
            <div class="dispute-item ${dispute.status}">
                <div class="dispute-item-header">
                    <div class="dispute-driver-info">
                        <img src="${driver.avatar}" alt="${driver.name}" class="dispute-driver-avatar">
                        <div class="dispute-driver-details">
                            <div class="dispute-driver-name">${driver.name}</div>
                            <div class="dispute-driver-id">${driver.id}</div>
                        </div>
                    </div>
                    <div class="dispute-status-badge ${dispute.status}">${dispute.status}</div>
                </div>
                
                <div class="dispute-details">
                    <div class="dispute-detail-item">
                        <div class="dispute-detail-label">Dispute ID</div>
                        <div class="dispute-detail-value">${dispute.id}</div>
                    </div>
                    <div class="dispute-detail-item">
                        <div class="dispute-detail-label">Stop ID</div>
                        <div class="dispute-detail-value">${dispute.stopId || 'N/A'}</div>
                    </div>
                    <div class="dispute-detail-item">
                        <div class="dispute-detail-label">Category</div>
                        <div class="dispute-detail-value">${this.getCategoryLabel(dispute.category)}</div>
                    </div>
                    <div class="dispute-detail-item">
                        <div class="dispute-detail-label">Time</div>
                        <div class="dispute-detail-value">${Utils.getRelativeTime(dispute.timestamp)}</div>
                    </div>
                </div>
                
                <!-- 🔥 CHATBOT MESSAGE SECTION -->
                ${dispute.chatbotMessage ? this.renderChatbotMessage(dispute) : ''}
                
                ${this.renderCategorySection(dispute)}
                
                ${dispute.status === 'rejected' && dispute.rejectionReason ? this.renderRejectionReason(dispute) : ''}
                
                ${dispute.status === 'pending' ? this.renderActionButtons(dispute) : ''}
            </div>
        `;
    },
    
    // 🔥 NEW: Render Chatbot Message
    renderChatbotMessage(dispute) {
        return `
            <div class="chatbot-message-section" style="margin: 16px 0; padding: 16px; background: linear-gradient(135deg, #667eea15, #764ba215); border-left: 4px solid #667eea; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <div style="font-weight: 600; color: #667eea; font-size: 13px;">Driver's Chatbot Report</div>
                </div>
                <div style="font-size: 14px; color: #2d3748; line-height: 1.6; font-style: italic;">
                    "${dispute.chatbotMessage}"
                </div>
                <div style="margin-top: 8px; font-size: 11px; color: #718096;">
                    Reported via Chatbot • ${Utils.formatDateTime(dispute.timestamp)}
                </div>
            </div>
        `;
    },
    
    // Render category-specific section
    renderCategorySection(dispute) {
        if (dispute.category === 'hardware') {
            return `
                <div class="hardware-verification-section">
                    <div class="section-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        Hardware Verification
                    </div>
                    <div class="hardware-comparison">
                        <div class="hardware-value-box">
                            <div class="hardware-value-label">Expected</div>
                            <div class="hardware-value-number">${dispute.expectedWeight} kg</div>
                        </div>
                        <div class="hardware-comparison-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </div>
                        <div class="hardware-value-box">
                            <div class="hardware-value-label">Actual (Sensor)</div>
                            <div class="hardware-value-number">${dispute.actualWeight} kg</div>
                        </div>
                    </div>
                    <div style="margin-top: 12px; padding: 12px; background: var(--white); border-radius: 6px;">
                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">Sensor Confidence</div>
                        <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">${dispute.sensorConfidence}%</div>
                    </div>
                </div>
            `;
        } else if (dispute.category === 'operational') {
            return `
                <div class="operational-issue-section">
                    <div class="section-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="22 12 18 12 15 20 9 4 6 12 2 12"/>
                        </svg>
                        Operational Issue
                    </div>
                    <div class="operational-metric">
                        <div class="operational-metric-label">Route Difficulty</div>
                        <div class="operational-metric-value">${dispute.routeDifficultyScore || 78}%</div>
                    </div>
                    <div class="operational-metric">
                        <div class="operational-metric-label">Stops Remaining</div>
                        <div class="operational-metric-value">${dispute.stopsRemaining || 12}</div>
                    </div>
                    <div class="operational-metric">
                        <div class="operational-metric-label">Issue Description</div>
                        <div class="operational-metric-value" style="font-style: italic; font-size: 13px;">${dispute.description}</div>
                    </div>
                </div>
            `;
        } else if (dispute.category === 'health') {
            return `
                <div class="health-issue-section">
                    <div class="section-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        Health / Personal Issue
                    </div>
                    <div class="health-message">"${dispute.driverMessage || 'Driver reported feeling unwell'}"</div>
                    <div class="health-meta">
                        <span>Time: ${Utils.formatDateTime(dispute.timestamp)}</span>
                        <span>Severity: ${dispute.severity.toUpperCase()}</span>
                    </div>
                </div>
            `;
        }
        return '';
    },
    
    // Render rejection reason
    renderRejectionReason(dispute) {
        return `
            <div class="rejection-reason-section">
                <div class="rejection-reason-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle;">
                        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Rejection Reason
                </div>
                <div class="rejection-reason-text">"${dispute.rejectionReason}"</div>
            </div>
        `;
    },
    
    // Render action buttons - APPROVE/REJECT ONLY
    renderActionButtons(dispute) {
        return `
            <div class="dispute-actions">
                <button class="btn-dispute-action approve" data-action="approve" data-dispute-id="${dispute.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Approve
                </button>
                <button class="btn-dispute-action reject" data-action="reject" data-dispute-id="${dispute.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Reject
                </button>
            </div>
        `;
    },
    
    // Attach dispute action listeners
    attachDisputeActionListeners() {
        const actionBtns = document.querySelectorAll('.btn-dispute-action');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                const disputeId = btn.getAttribute('data-dispute-id');
                this.handleAction(action, disputeId);
            });
        });
    },
    
    // 🔥 Handle actions - AUTO-REDIRECT TO ASSIGNMENTS ON APPROVE
    handleAction(action, disputeId) {
        const dispute = this.disputes.find(d => d.id === disputeId);
        if (!dispute) {
            console.error('[Disputes] Dispute not found:', disputeId);
            return;
        }
        
        const driver = this.drivers.find(d => d.id === dispute.driverId);
        if (!driver) {
            console.error('[Disputes] Driver not found:', dispute.driverId);
            return;
        }
        
        console.log(`[Disputes] Action ${action} for dispute ${disputeId}`);
        
        switch(action) {
            case 'approve':
                dispute.status = 'approved';
                dispute.approvedAt = Date.now();
                dispute.approvedBy = 'Dispatcher';
                
                Utils.notify(`✅ Dispute ${dispute.id} approved! Redirecting to Assignments...`, 'success');
                this.sendToDriverApp(dispute, 'approved', null);
                
                // 🔥 AUTO-REDIRECT TO ASSIGNMENTS AFTER 2 SECONDS
                setTimeout(() => {
                    console.log('[Disputes] Redirecting to Assignments page...');
                    Navigation.navigate('assignments');
                    
                    // 🔥 AUTO-TRIGGER SWAP DIALOG AFTER REDIRECT
                    setTimeout(() => {
                        if (window.Assignments && window.Assignments.routes) {
                            // Find the route associated with this driver
                            const affectedRoute = window.Assignments.routes.find(r => r.driverId === dispute.driverId);
                            if (affectedRoute) {
                                console.log('[Disputes] Auto-opening Swap Driver dialog for route:', affectedRoute.id);
                                window.Assignments.showSwapDriverDialog(affectedRoute);
                            } else {
                                Utils.notify('Route not found for driver. Please swap manually.', 'warning');
                            }
                        }
                    }, 500);
                }, 2000);
                
                break;
                
            case 'reject':
                this.showRejectionDialog(dispute);
                return;
        }
        
        this.updateStats();
        this.applyFilter(this.filterStatus);
        this.updateGlobalNotifications();
        
        console.log(`[Disputes] ${action} completed for ${dispute.id}, new status: ${dispute.status}`);
    },
    
    // Show rejection dialog
    showRejectionDialog(dispute) {
        const reason = prompt('Enter reason for rejection:\n(Press Enter to submit, Cancel to abort)', '');
        
        if (reason === null) return;
        
        if (reason.trim() === '') {
            alert('Please provide a reason for rejection');
            return;
        }
        
        dispute.status = 'rejected';
        dispute.rejectionReason = reason.trim();
        dispute.rejectedAt = Date.now();
        dispute.rejectedBy = 'Dispatcher';
        
        Utils.notify(`❌ Dispute ${dispute.id} rejected`, 'info');
        this.sendToDriverApp(dispute, 'rejected', reason.trim());
        
        this.updateStats();
        this.applyFilter(this.filterStatus);
        this.updateGlobalNotifications();
    },
    
    // Send to driver app
    sendToDriverApp(dispute, action, reason) {
        console.log(`[Disputes] Sending to driver app:`, {
            disputeId: dispute.id,
            driverId: dispute.driverId,
            action: action,
            reason: reason,
            timestamp: new Date().toISOString()
        });
        
        // 🔥 Firebase integration point - send to chatbot
        // firebase.database().ref(`drivers/${dispute.driverId}/notifications`).push({
        //     type: 'dispute_response',
        //     disputeId: dispute.id,
        //     action: action,
        //     reason: reason,
        //     timestamp: Date.now()
        // });
    },
    
    // Get category label
    getCategoryLabel(category) {
        const labels = {
            hardware: 'Hardware / Data',
            operational: 'Operational',
            health: 'Health / Personal'
        };
        return labels[category] || 'Unknown';
    },
    
    // Update global notifications
    updateGlobalNotifications() {
        const pendingDisputes = this.disputes.filter(d => 
            d.status === 'pending' && !this.viewedDisputes.has(d.id)
        ).slice(0, 7);
        
        const sidebarBadge = document.getElementById('sidebar-dispute-badge');
        if (sidebarBadge) {
            if (pendingDisputes.length > 0) {
                sidebarBadge.textContent = pendingDisputes.length;
                sidebarBadge.style.display = 'inline-block';
            } else {
                sidebarBadge.style.display = 'none';
            }
        }
        
        this.updateNotificationBell(pendingDisputes);
    },
    
    // Update notification bell
    updateNotificationBell(pendingDisputes) {
        const badge = document.getElementById('notification-badge');
        const dropdownList = document.getElementById('notification-dropdown-list');
        
        if (badge) {
            if (pendingDisputes.length > 0) {
                badge.textContent = pendingDisputes.length;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
        
        if (dropdownList) {
            if (pendingDisputes.length === 0) {
                dropdownList.innerHTML = `
                    <div class="notification-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <div style="margin-top: 8px; font-size: 13px;">All caught up!</div>
                    </div>
                `;
            } else {
                dropdownList.innerHTML = pendingDisputes.map(dispute => `
                    <div class="notification-dropdown-item" data-dispute-id="${dispute.id}">
                        <div class="notification-icon-wrapper ${dispute.severity}">
                            ${this.getSeverityIcon(dispute.severity)}
                        </div>
                        <div class="notification-content">
                            <div class="notification-driver-name">${dispute.driverName}</div>
                            <div class="notification-dispute-type">${this.getCategoryLabel(dispute.category)}</div>
                        </div>
                        <div class="notification-time">${Utils.getRelativeTime(dispute.timestamp)}</div>
                    </div>
                `).join('');
                
                dropdownList.querySelectorAll('.notification-dropdown-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const disputeId = item.getAttribute('data-dispute-id');
                        this.viewedDisputes.add(disputeId);
                        Navigation.navigate('disputes');
                        const dropdown = document.getElementById('notification-dropdown');
                        if (dropdown) dropdown.style.display = 'none';
                        this.updateGlobalNotifications();
                    });
                });
            }
        }
    },
    
    // Get severity icon
    getSeverityIcon(severity) {
        const icons = {
            urgent: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
            medium: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
            info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };
        return icons[severity] || icons.info;
    },
    
    // 🔥 Start real-time updates WITH FIREBASE CHATBOT SYNC
    startRealtimeUpdates() {
        console.log('[Disputes] Starting real-time updates with Chatbot integration...');
        
        // 🔥 Firebase listener for chatbot disputes (drivers/disputes)
        if (typeof firebase !== 'undefined' && firebase.database) {
            const disputesRef = firebase.database().ref('drivers/disputes');
            
            disputesRef.on('child_added', (snapshot) => {
                const chatbotDispute = snapshot.val();
                chatbotDispute.firebaseKey = snapshot.key;
                chatbotDispute.timestamp = chatbotDispute.timestamp || Date.now();
                
                if (!this.disputes.find(d => d.id === chatbotDispute.id)) {
                    this.disputes.unshift(chatbotDispute);
                    console.log('[Chatbot] New dispute from driver chatbot:', chatbotDispute.id);
                    
                    this.updateStats();
                    if (this.filterStatus === 'pending') this.applyFilter('pending');
                    this.updateGlobalNotifications();
                    Utils.notify(`🔔 New chatbot dispute from ${chatbotDispute.driverName}`, 'warning');
                }
            });
        }
        
        // Mock updates (for demo without Firebase)
        this.updateInterval = setInterval(() => {
            if (Math.random() < 0.02 && this.disputes.length < 25) {
                const newDisputes = MockData.generateDisputes(this.drivers, 1);
                if (newDisputes.length > 0) {
                    const newDispute = newDisputes[0];
                    newDispute.timestamp = Date.now();
                    newDispute.chatbotMessage = `Driver reported: "${newDispute.description || 'Issue with current assignment'}"`;
                    this.disputes.unshift(newDispute);
                    
                    console.log('[Disputes] New dispute:', newDispute.id);
                    
                    this.updateStats();
                    if (this.filterStatus === 'pending') this.applyFilter('pending');
                    this.updateGlobalNotifications();
                }
            }
        }, AppConfig.refreshIntervals.disputeAlerts);
    },
    
    // Stop updates
    stopRealtimeUpdates() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        if (typeof firebase !== 'undefined' && firebase.database) {
            firebase.database().ref('drivers/disputes').off();
        }
    }
};

// Global notification bell listeners
document.addEventListener('DOMContentLoaded', function() {
    const bellBtn = document.getElementById('notification-bell-btn');
    const closeBtn = document.getElementById('notification-close-btn');
    const dropdown = document.getElementById('notification-dropdown');
    const viewAllBtn = document.getElementById('notification-view-all-btn');
    
    if (bellBtn && dropdown) {
        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    if (closeBtn && dropdown) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = 'none';
        });
    }
    
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            Navigation.navigate('disputes');
            if (dropdown) dropdown.style.display = 'none';
        });
    }
    
    document.addEventListener('click', (e) => {
        if (dropdown && !dropdown.contains(e.target) && bellBtn && !bellBtn.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
});

window.Disputes = Disputes;