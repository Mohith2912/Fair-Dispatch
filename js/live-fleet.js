// ========================================
// LIVE FLEET MODULE v3.0 (CRASH PROOF)
// ========================================

const LiveFleet = {
    // Internal state
    drivers: [],
    mapInitialized: false,
    updateInterval: null,

    // 1. Generate Data Internally (Safe from missing MockData)
    generateSafeDrivers() {
        return Array.from({ length: 12 }, (_, i) => {
            const score = Math.floor(Math.random() * (98 - 40) + 40);
            let status = 'balanced';
            if (score > 80) status = 'overload';
            else if (score > 60) status = 'watch';
            
            return {
                id: `D-10${i + 1}`,
                name: ['Rajesh Kumar', 'Senthil B', 'Arun Vijay', 'Deepak S', 'Manoj K', 'Priya R', 'Suresh T', 'Karthik J', 'Anand M', 'Bala S', 'Vikram L', 'Surya V'][i],
                avatar: `https://i.pravatar.cc/150?u=${i + 10}`,
                effortScore: score,
                deliveries: Math.floor(Math.random() * 15) + 2,
                status: status,
                lat: 11.0168 + (Math.random() - 0.5) * 0.1, // Near Coimbatore
                lng: 76.9558 + (Math.random() - 0.5) * 0.1
            };
        });
    },

    // 2. Main Render Function
    render(container) {
        console.log('[LiveFleet] Rendering...');
        
        try {
            // Load data
            this.drivers = this.generateSafeDrivers();

            // Inject HTML
            container.innerHTML = `
                <section class="live-fleet-page">
                    <!-- Left: Map Card -->
                    <div class="live-fleet-map-card">
                        <div class="live-fleet-header">
                            <div>
                                <h2>Live Fleet Overview</h2>
                                <div class="live-fleet-subtitle">Real-time view of all active delivery partners</div>
                                <div class="live-fleet-kpis">
                                    <div class="live-fleet-kpi" style="background:#eef2ff; color:#4f46e5;">Active: ${this.drivers.length}</div>
                                    <div class="live-fleet-kpi" style="background:#fef2f2; color:#dc2626;">Overloaded: ${this.drivers.filter(d => d.status === 'overload').length}</div>
                                </div>
                            </div>
                        </div>
                        <div id="live-fleet-map-container" style="flex:1; background:#f1f5f9; border-radius:12px; position:relative; min-height:400px; overflow:hidden;">
                             <div id="live-fleet-map" style="width:100%; height:100%; z-index:1;"></div>
                             <!-- Fallback if map fails -->
                             <div id="map-fallback" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; flex-direction:column; color:#64748b; z-index:0;">
                                <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                                <span style="margin-top:8px; font-size:14px;">Map Loading...</span>
                             </div>
                        </div>
                    </div>

                    <!-- Right: Drivers List -->
                    <aside class="live-fleet-right-panel">
                        <div class="right-panel-header">
                            <h3>Driver Workload</h3>
                            <span style="font-size:11px; color:#64748b;">Sorted by effort</span>
                        </div>
                        <div class="driver-filter-chips">
                            <button class="chip active" onclick="LiveFleet.filterDrivers('all', this)">All</button>
                            <button class="chip" onclick="LiveFleet.filterDrivers('balanced', this)">Balanced</button>
                            <button class="chip" onclick="LiveFleet.filterDrivers('watch', this)">Watch</button>
                            <button class="chip" onclick="LiveFleet.filterDrivers('overload', this)">Overloaded</button>
                        </div>
                        <div class="driver-list-scroll" id="driver-list-scroll">
                            <!-- Drivers injected here -->
                        </div>
                    </aside>
                </section>
                
                <!-- Modal -->
                <div id="driver-modal-overlay" class="driver-modal-overlay" style="display:none;">
                    <div class="driver-modal">
                        <div class="driver-modal-header">
                            <h3 id="modal-title">Driver Details</h3>
                            <button onclick="LiveFleet.closeModal()" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
                        </div>
                        <div class="driver-modal-body" id="modal-body"></div>
                        <div style="padding:16px; border-top:1px solid #e2e8f0; text-align:right;">
                            <button onclick="LiveFleet.closeModal()" class="btn-ghost">Close</button>
                        </div>
                    </div>
                </div>
            `;

            // Render List
            this.renderDriverList(this.drivers);

            // Initialize Map (Safely)
            setTimeout(() => this.initMapSafe(), 500);

        } catch (error) {
            console.error('[LiveFleet] Critical Render Error:', error);
            container.innerHTML = `<div style="padding:20px; color:red;">Error loading Live Fleet: ${error.message}</div>`;
        }
    },

    // 3. Safe Map Initialization
    initMapSafe() {
        if (this.mapInitialized) return;

        try {
            const mapEl = document.getElementById('live-fleet-map');
            if (!mapEl) return;

            // Check if Leaflet is loaded
            if (typeof L === 'undefined') {
                console.warn('[LiveFleet] Leaflet not loaded. Showing fallback.');
                document.getElementById('map-fallback').innerHTML = '<span>Map unavailable (Library missing)</span>';
                return;
            }

            // Init Map
            const map = L.map('live-fleet-map').setView([11.0168, 76.9558], 12); // Coimbatore
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);

            // Add Markers
            this.drivers.forEach(d => {
                const color = d.status === 'overload' ? 'red' : d.status === 'watch' ? 'orange' : 'green';
                const circle = L.circleMarker([d.lat, d.lng], {
                    radius: 8,
                    fillColor: color,
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map);
                circle.bindPopup(`<b>${d.name}</b><br>Load: ${d.effortScore}%`);
            });

            this.mapInitialized = true;
            console.log('[LiveFleet] Map initialized successfully');

        } catch (err) {
            console.error('[LiveFleet] Map init failed:', err);
            // Don't crash, just let the fallback show
        }
    },

    // 4. Render Driver List
    renderDriverList(driversToRender) {
        const list = document.getElementById('driver-list-scroll');
        if (!list) return;

        list.innerHTML = driversToRender.map(d => {
            let badgeClass = 'badge-balanced';
            if (d.status === 'overload') badgeClass = 'badge-overload';
            if (d.status === 'watch') badgeClass = 'badge-watch';

            return `
            <div class="driver-card" onclick="LiveFleet.openModal('${d.id}')">
                <div class="driver-avatar-wrapper">
                    <img src="${d.avatar}" class="driver-avatar" alt="${d.name}">
                </div>
                <div class="driver-main">
                    <div class="driver-name-row">
                        <div class="driver-name">${d.name}</div>
                        <div class="driver-id">${d.id}</div>
                    </div>
                    <div class="driver-meta">
                        <span class="badge-status ${badgeClass}" style="text-transform:capitalize">${d.status}</span>
                        <span>${d.deliveries} deliveries</span>
                    </div>
                    <div class="driver-load-bar">
                        <div class="driver-load-fill" style="width:${d.effortScore}%"></div>
                    </div>
                </div>
                <div class="driver-workload">${d.effortScore}%</div>
            </div>
            `;
        }).join('');
    },

    // 5. Filtering
    filterDrivers(status, btnElement) {
        // Update active chip
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        btnElement.classList.add('active');

        // Filter data
        if (status === 'all') {
            this.renderDriverList(this.drivers);
        } else {
            const filtered = this.drivers.filter(d => d.status === status);
            this.renderDriverList(filtered);
        }
    },

    // 6. Modal Functions
    openModal(id) {
        const driver = this.drivers.find(d => d.id === id);
        if (!driver) return;

        const modal = document.getElementById('driver-modal-overlay');
        const body = document.getElementById('modal-body');
        const title = document.getElementById('modal-title');

        title.innerText = driver.name;
        body.innerHTML = `
            <div style="display:flex; gap:15px; margin-bottom:20px;">
                <img src="${driver.avatar}" style="width:60px; height:60px; border-radius:50%;">
                <div>
                    <div style="font-size:18px; font-weight:bold;">${driver.name}</div>
                    <div style="color:#64748b;">${driver.id}</div>
                </div>
            </div>
            <div class="driver-kpi-grid">
                <div class="driver-kpi">
                    <div class="label">Current Load</div>
                    <div class="value">${driver.effortScore}%</div>
                </div>
                <div class="driver-kpi">
                    <div class="label">Status</div>
                    <div class="value" style="text-transform:capitalize">${driver.status}</div>
                </div>
                <div class="driver-kpi">
                    <div class="label">Total Deliveries</div>
                    <div class="value">${driver.deliveries}</div>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    },

    closeModal() {
        document.getElementById('driver-modal-overlay').style.display = 'none';
    }
};

// Export to window so onclicks work
window.LiveFleet = LiveFleet;
console.log('[LiveFleet] Module Loaded');