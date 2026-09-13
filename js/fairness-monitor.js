// ========================================
// FAIRNESS MONITOR MODULE - FEATURE 2
// Visibility & Explainability ONLY (no actions)
// ========================================

const FairnessMonitor = {
    drivers: [],
    rows: [],
    filter: 'all',           // all | overloaded | underutilized | disputed | new
    range: '1h',             // 1h | today | week
    selectedDriverId: null,
    
    render(container) {
        container.innerHTML = `
            <div class="content-header">
                <h1>Fairness Monitor</h1>
                <p>Explainability and transparency layer to audit AI workload distribution.</p>
            </div>
            <div class="content-body">
                <div class="fairness-monitor-wrapper">
                    
                    <!-- Top overview row -->
                    <div class="fairness-top-row">
                        <div class="fairness-status-card" id="fairness-status-card">
                            <div class="fairness-status-label">Overall Fairness Status</div>
                            <div class="fairness-status-value" id="fairness-status-value">Healthy</div>
                            <div class="fairness-status-sub" id="fairness-status-sub">
                                AI workload distribution is balanced across the fleet.
                            </div>
                        </div>
                        
                        <div class="fairness-time-card">
                            <div class="fairness-time-label">Time Range</div>
                            <div class="fairness-time-buttons">
                                <button class="fm-time-btn active" data-range="1h">Last 1 hour</button>
                                <button class="fm-time-btn" data-range="today">Today</button>
                                <button class="fm-time-btn" data-range="week">This week</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="fairness-main-layout">
                        <!-- Left: Driver Fairness Table -->
                        <div class="fairness-table-panel">
                            <div class="fairness-table-header">
                                <div class="fairness-table-title">Driver Workload & Fairness</div>
                                <div class="fairness-filters">
                                    <button class="fm-filter-btn active" data-filter="all">All</button>
                                    <button class="fm-filter-btn" data-filter="overloaded">Overloaded</button>
                                    <button class="fm-filter-btn" data-filter="underutilized">Underutilized</button>
                                    <button class="fm-filter-btn" data-filter="disputed">With Disputes</button>
                                    <button class="fm-filter-btn" data-filter="new">New Drivers</button>
                                </div>
                            </div>
                            
                            <div class="fairness-table-wrapper">
                                <table class="fairness-table">
                                    <thead>
                                        <tr>
                                            <th>Driver</th>
                                            <th>Active Orders</th>
                                            <th>Distance Today</th>
                                            <th>Active Time</th>
                                            <th>Idle vs Working</th>
                                            <th>Fairness Score</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody id="fairness-table-body">
                                        <!-- Rows injected here -->
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="fairness-table-footnote">
                                Fairness Monitor is read-only. Assignment and reassign decisions happen in the Assignments and Disputes modules.
                            </div>
                        </div>
                        
                        <!-- Right: AI Explanation Panel -->
                        <div class="fairness-explanation-panel" id="fairness-explanation-panel">
                            <div class="fairness-explanation-header">
                                <div class="fairness-explanation-title">AI Fairness Explanation</div>
                                <div class="fairness-explanation-sub">
                                    Click a driver row to see why their workload looks like this.
                                </div>
                            </div>
                            
                            <div class="fairness-explanation-content" id="fairness-explanation-content">
                                <!-- Dynamic content -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.init();
    },
    
    // Initialize data and listeners
    init() {
        console.log('[FairnessMonitor] Initializing...');
        
        // Use existing drivers from MockData
        this.drivers = MockData.generateDrivers(12);
        
        // Build synthetic fairness rows from drivers
        this.rows = this.buildFairnessRows(this.drivers);
        
        // Render initial table + explanation
        this.renderTable();
        this.updateOverallStatus();
        this.attachListeners();
    },
    
    // Calculate synthetic metrics per driver
    buildFairnessRows(drivers) {
        const rows = drivers.map(driver => {
            // Basic workload proxies
            const activeOrders = Utils.randomIntBetween(2, 12);
            const distanceKm = Utils.randomIntBetween(15, 90);
            const activeMinutes = Utils.randomIntBetween(60, 360);
            const idleMinutes = Utils.randomIntBetween(10, 120);
            
            // Workload score (internal)
            const workloadScore =
                activeOrders * 4 +
                distanceKm * 0.5 +
                activeMinutes * 0.3;
            
            return {
                driverId: driver.id,
                driverName: driver.name,
                avatar: driver.avatar,
                activeOrders,
                distanceKm,
                activeMinutes,
                idleMinutes,
                workloadScore,
                isNew: Math.random() < 0.2,  // 20% tagged as "new"
                hasDisputes: Math.random() < 0.3 // 30% have workload-related disputes
            };
        });
        
        // Compute average workload
        const avgWorkload =
            rows.reduce((sum, r) => sum + r.workloadScore, 0) / rows.length;
        
        // Convert to Fairness Score (0–100) based on deviation from average
        rows.forEach(r => {
            const deviation = Math.abs(r.workloadScore - avgWorkload);
            // Larger deviation → lower fairness
            let fairness = 100 - (deviation / avgWorkload) * 100;
            fairness = Utils.clamp(Math.round(fairness), 25, 99);
            r.fairnessScore = fairness;
            
            if (fairness >= 80) r.status = 'balanced';
            else if (fairness >= 55) r.status = 'watch';
            else r.status = 'overloaded';
            
            // Simple tag for underutilized (low workload)
            if (r.workloadScore < avgWorkload * 0.7) {
                r.status = 'underutilized';
            }
        });
        
        return rows;
    },
    
    // Attach click handlers for filters, ranges, and table rows
    attachListeners() {
        // Time range buttons
        document.querySelectorAll('.fm-time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.fm-time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.range = btn.getAttribute('data-range');
                this.onRangeChange();
            });
        });
        
        // Filter buttons
        document.querySelectorAll('.fm-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.fm-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filter = btn.getAttribute('data-filter');
                this.renderTable();
            });
        });
        
        // Rows: attach after each renderTable()
        this.attachRowListeners();
    },
    
    attachRowListeners() {
        const rows = document.querySelectorAll('.fairness-row');
        rows.forEach(row => {
            row.addEventListener('click', () => {
                const driverId = row.getAttribute('data-driver-id');
                this.selectedDriverId = driverId;
                this.renderExplanation(driverId);
            });
        });
    },
    
    // Handle time range change (recalculate trend-ish feel)
    onRangeChange() {
        // For hackathon demo, just slightly tweak fairness scores
        const factor = this.range === '1h' ? 1.0 : this.range === 'today' ? 0.95 : 0.9;
        
        this.rows.forEach(r => {
            let adjusted = Math.round(r.fairnessScore * factor + Utils.randomIntBetween(-3, 3));
            adjusted = Utils.clamp(adjusted, 25, 99);
            r.fairnessScore = adjusted;
            
            if (adjusted >= 80) r.status = 'balanced';
            else if (adjusted >= 55) r.status = 'watch';
            else r.status = 'overloaded';
        });
        
        this.renderTable();
        this.updateOverallStatus();
        
        if (this.selectedDriverId) {
            this.renderExplanation(this.selectedDriverId);
        }
    },
    
    // Filter + render table body
    renderTable() {
        const tbody = document.getElementById('fairness-table-body');
        if (!tbody) return;
        
        let rows = [...this.rows];
        
        if (this.filter === 'overloaded') {
            rows = rows.filter(r => r.status === 'overloaded');
        } else if (this.filter === 'underutilized') {
            rows = rows.filter(r => r.status === 'underutilized');
        } else if (this.filter === 'disputed') {
            rows = rows.filter(r => r.hasDisputes);
        } else if (this.filter === 'new') {
            rows = rows.filter(r => r.isNew);
        }
        
        if (rows.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:24px; color: var(--text-muted);">
                        No drivers match this filter for the selected time range.
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = rows.map(r => this.renderRow(r)).join('');
        
        // Re-attach row click listeners after rendering
        this.attachRowListeners();
    },
    
    renderRow(row) {
        const driver = this.drivers.find(d => d.id === row.driverId);
        const statusBadge = this.getStatusBadge(row.status);
        const idlePct = Math.round(row.idleMinutes / (row.idleMinutes + row.activeMinutes) * 100);
        const workingPct = 100 - idlePct;
        
        return `
            <tr class="fairness-row" data-driver-id="${row.driverId}">
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="${driver.avatar}" alt="${row.driverName}" style="width:32px; height:32px; border-radius:999px; object-fit:cover;">
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:600;">${row.driverName}</span>
                            <span style="font-size:11px; color:var(--text-muted);">${row.driverId}${row.isNew ? ' · New' : ''}</span>
                        </div>
                    </div>
                </td>
                <td>${row.activeOrders}</td>
                <td>${row.distanceKm} km</td>
                <td>${Math.round(row.activeMinutes/60)}h ${row.activeMinutes%60}m</td>
                <td style="font-size:12px;">
                    <span style="color:var(--text-secondary);">Idle ${idlePct}% · Working ${workingPct}%</span>
                </td>
                <td>
                    <span style="font-weight:600;">${row.fairnessScore}%</span>
                </td>
                <td>${statusBadge}</td>
            </tr>
        `;
    },
    
    getStatusBadge(status) {
        if (status === 'balanced') {
            return `<span class="badge badge-success">Balanced</span>`;
        }
        if (status === 'watch') {
            return `<span class="badge badge-warning">Watch</span>`;
        }
        if (status === 'overloaded') {
            return `<span class="badge badge-danger">Overloaded</span>`;
        }
        if (status === 'underutilized') {
            return `<span class="badge badge-neutral">Underutilized</span>`;
        }
        return `<span class="badge badge-neutral">Unknown</span>`;
    },
    
    // Overall fleet fairness status (Healthy / Warning / Critical)
    updateOverallStatus() {
        const avgFairness =
            this.rows.reduce((sum, r) => sum + r.fairnessScore, 0) / this.rows.length;
        
        const overloadedCount = this.rows.filter(r => r.status === 'overloaded').length;
        
        const card = document.getElementById('fairness-status-card');
        const valueEl = document.getElementById('fairness-status-value');
        const subEl = document.getElementById('fairness-status-sub');
        
        if (!card || !valueEl || !subEl) return;
        
        card.classList.remove('status-healthy', 'status-warning', 'status-critical');
        
        if (avgFairness >= 80 && overloadedCount === 0) {
            card.classList.add('status-healthy');
            valueEl.textContent = 'Healthy';
            subEl.textContent = 'AI workload distribution is balanced across the fleet.';
        } else if (avgFairness >= 60) {
            card.classList.add('status-warning');
            valueEl.textContent = 'Warning';
            subEl.textContent = 'Some drivers are carrying more workload than others. Monitor closely.';
        } else {
            card.classList.add('status-critical');
            valueEl.textContent = 'Critical';
            subEl.textContent = 'Multiple drivers appear overloaded. Dispatcher should review assignments.';
        }
    },
    
    // Right-side explanation panel
    renderExplanation(driverId) {
        const panel = document.getElementById('fairness-explanation-content');
        if (!panel) return;
        
        const row = this.rows.find(r => r.driverId === driverId);
        const driver = this.drivers.find(d => d.id === driverId);
        if (!row || !driver) return;
        
        // Build human-readable explanation
        const avgFairness =
            this.rows.reduce((sum, r) => sum + r.fairnessScore, 0) / this.rows.length;
        const diff = row.fairnessScore - avgFairness;
        
        const workloadTrendLabel = this.range === '1h' ? 'last 1 hour'
                                : this.range === 'today' ? 'today'
                                : 'this week';
        
        const reasons = [];
        if (row.activeOrders > 8) reasons.push('high number of active orders');
        if (row.distanceKm > 60) reasons.push('long total distance today');
        if (row.activeMinutes > 240) reasons.push('extended active driving time');
        if (row.hasDisputes) reasons.push('recent workload-related disputes');
        if (row.isNew && row.status === 'underutilized') reasons.push('driver is newly onboarded');
        
        const mainReasonText = reasons.length
            ? reasons.join(', ')
            : 'balanced assignment compared to fleet average';
        
        const directionText = diff >= 0 ? 'slightly higher' : 'lower';
        
        panel.innerHTML = `
            <div class="fm-driver-header">
                <div class="fm-driver-info">
                    <img src="${driver.avatar}" alt="${driver.name}" class="fm-driver-avatar">
                    <div>
                        <div class="fm-driver-name">${driver.name}</div>
                        <div class="fm-driver-id">${driver.id}</div>
                    </div>
                </div>
                <div class="fm-driver-score">
                    <div class="fm-score-label">Fairness Score</div>
                    <div class="fm-score-value">${row.fairnessScore}%</div>
                    <div class="fm-score-sub">vs fleet average ${Math.round(avgFairness)}%</div>
                </div>
            </div>
            
            <div class="fm-section">
                <div class="fm-section-title">Workload vs Fleet</div>
                <p class="fm-text">
                    Over the <strong>${workloadTrendLabel}</strong>, this driver has a ${directionText} workload compared to the fleet average.
                    The AI considered proximity to active demand zones, historical availability, and recent acceptance patterns.
                </p>
            </div>
            
            <div class="fm-section">
                <div class="fm-section-title">AI Rationale</div>
                <p class="fm-text">
                    The current workload is influenced by: <strong>${mainReasonText}</strong>.
                    The fairness engine compares each driver to the fleet baseline and tries to keep effort spread within a safe band.
                </p>
                <p class="fm-text">
                    This explanation is provided to help dispatchers audit AI behavior and prepare for potential disputes,
                    without manually changing assignments from this screen.
                </p>
            </div>
            
            <div class="fm-section">
                <div class="fm-section-title">Human Role</div>
                <p class="fm-text">
                    Fairness Monitor is a visibility layer only. If the dispatcher believes this driver is consistently overloaded
                    or underutilized, they can <strong>go to the Assignments or Disputes modules</strong> to take action.
                    No routes are changed from Fairness Monitor itself.
                </p>
            </div>
        `;
    }
};

window.FairnessMonitor = FairnessMonitor;
