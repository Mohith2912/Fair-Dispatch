// Audit Logs Module - FEATURE 7
const AuditLogs = {
    logs: [],
    drivers: [],
    filteredLogs: [],
    filters: {
        dateFrom: null,
        dateTo: null,
        driver: 'all',
        type: 'all'
    },
    
    // Render Audit Logs page
    render(container) {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        container.innerHTML = `
            <div class="content-header">
                <h1>Audit Logs & Compliance</h1>
                <p>Complete action history with PDF export capability</p>
            </div>
            <div class="content-body">
                <div class="audit-logs-wrapper">
                    <!-- Audit Header with Filters -->
                    <div class="audit-header">
                        <div class="audit-header-top">
                            <div class="audit-header-title">System Activity Log</div>
                            <button class="btn-export-pdf" id="export-pdf-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10 9 9 9 8 9"/>
                                </svg>
                                Export PDF
                            </button>
                        </div>
                        
                        <div class="audit-filters">
                            <div class="audit-filter-group">
                                <label class="audit-filter-label">Date From</label>
                                <input type="date" class="audit-filter-input" id="filter-date-from" value="${weekAgo}">
                            </div>
                            
                            <div class="audit-filter-group">
                                <label class="audit-filter-label">Date To</label>
                                <input type="date" class="audit-filter-input" id="filter-date-to" value="${today}">
                            </div>
                            
                            <div class="audit-filter-group">
                                <label class="audit-filter-label">Driver</label>
                                <select class="audit-filter-select" id="filter-driver">
                                    <option value="all">All Drivers</option>
                                </select>
                            </div>
                            
                            <div class="audit-filter-group">
                                <label class="audit-filter-label">Action Type</label>
                                <select class="audit-filter-select" id="filter-type">
                                    <option value="all">All Types</option>
                                    <option value="ai">AI Actions</option>
                                    <option value="human">Human Actions</option>
                                    <option value="dispute">Disputes</option>
                                    <option value="sensor">Sensor Events</option>
                                </select>
                            </div>
                            
                            <div class="audit-filter-buttons">
                                <button class="btn-filter-apply" id="apply-filters-btn">Apply Filters</button>
                                <button class="btn-filter-reset" id="reset-filters-btn">Reset</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Audit Logs Container -->
                    <div class="audit-logs-container">
                        <div class="audit-logs-list" id="audit-logs-list">
                            <!-- Log entries will be injected here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.init();
    },
    
    // Initialize
    init() {
        // Load data
        this.drivers = MockData.generateDrivers(12);
        this.logs = MockData.generateAuditLogs(this.drivers);
        this.filteredLogs = [...this.logs];
        
        // Populate driver filter
        this.populateDriverFilter();
        
        // Render logs
        this.renderLogs();
        
        // Attach listeners
        this.attachFilterListeners();
        this.attachExportListener();
    },
    
    // Populate driver filter dropdown
    populateDriverFilter() {
        const select = document.getElementById('filter-driver');
        if (!select) return;
        
        this.drivers.forEach(driver => {
            const option = document.createElement('option');
            option.value = driver.id;
            option.textContent = `${driver.name} (${driver.id})`;
            select.appendChild(option);
        });
    },
    
    // Render audit logs
    renderLogs() {
        const listContainer = document.getElementById('audit-logs-list');
        if (!listContainer) return;
        
        if (this.filteredLogs.length === 0) {
            listContainer.innerHTML = `
                <div class="audit-logs-empty">
                    <div class="audit-logs-empty-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </div>
                    <div class="audit-logs-empty-title">No Logs Found</div>
                    <div class="audit-logs-empty-text">Try adjusting your filters to see results</div>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = this.filteredLogs.map(log => this.createLogEntry(log)).join('');
    },
    
    // Create log entry HTML
    createLogEntry(log) {
        return `
            <div class="audit-log-entry">
                <div class="audit-log-icon ${log.icon}">
                    ${this.getIconSVG(log.icon)}
                </div>
                <div class="audit-log-content">
                    <div class="audit-log-header">
                        <div class="audit-log-action">${log.action}</div>
                        <div class="audit-log-timestamp">${Utils.formatDateTime(log.timestamp)}</div>
                    </div>
                    <div class="audit-log-description">${log.description}</div>
                    <div class="audit-log-meta">
                        <div class="audit-log-tag">
                            <strong>Driver:</strong> ${log.driverName}
                        </div>
                        <div class="audit-log-tag">
                            <strong>User:</strong> ${log.userId}
                        </div>
                        <div class="audit-action-type ${log.type}">${log.type === 'ai' ? 'AI' : 'Manual'}</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Get icon SVG
    getIconSVG(type) {
        const icons = {
            ai: '<circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>',
            human: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
            dispute: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
            sensor: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'
        };
        
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icons[type] || icons.human}</svg>`;
    },
    
    // Attach filter listeners
    attachFilterListeners() {
        const applyBtn = document.getElementById('apply-filters-btn');
        const resetBtn = document.getElementById('reset-filters-btn');
        
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyFilters());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
    },
    
    // Apply filters
    applyFilters() {
        const dateFrom = document.getElementById('filter-date-from').value;
        const dateTo = document.getElementById('filter-date-to').value;
        const driver = document.getElementById('filter-driver').value;
        const type = document.getElementById('filter-type').value;
        
        this.filters = {
            dateFrom: dateFrom ? new Date(dateFrom) : null,
            dateTo: dateTo ? new Date(dateTo + 'T23:59:59') : null,
            driver: driver,
            type: type
        };
        
        // Filter logs
        this.filteredLogs = this.logs.filter(log => {
            // Date filter
            if (this.filters.dateFrom && log.timestamp < this.filters.dateFrom) return false;
            if (this.filters.dateTo && log.timestamp > this.filters.dateTo) return false;
            
            // Driver filter
            if (this.filters.driver !== 'all' && log.driverId !== this.filters.driver) return false;
            
            // Type filter
            if (this.filters.type !== 'all' && log.type !== this.filters.type) return false;
            
            return true;
        });
        
        this.renderLogs();
        Utils.notify(`Filtered to ${this.filteredLogs.length} logs`, 'success');
    },
    
    // Reset filters
    resetFilters() {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        document.getElementById('filter-date-from').value = weekAgo;
        document.getElementById('filter-date-to').value = today;
        document.getElementById('filter-driver').value = 'all';
        document.getElementById('filter-type').value = 'all';
        
        this.filters = {
            dateFrom: null,
            dateTo: null,
            driver: 'all',
            type: 'all'
        };
        
        this.filteredLogs = [...this.logs];
        this.renderLogs();
        
        Utils.notify('Filters reset', 'info');
    },
    
    // Attach export listener
    attachExportListener() {
        const exportBtn = document.getElementById('export-pdf-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                if (window.PDFExport) {
                    window.PDFExport.exportAuditLogs(this.filteredLogs, this.filters);
                }
            });
        }
    }
};

window.AuditLogs = AuditLogs;
