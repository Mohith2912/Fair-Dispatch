// Map Manager for Live Fleet
const MapManager = {
    map: null,
    markers: {},
    
    // Initialize map
    init(containerId = 'map') {
        const config = AppConfig.mapConfig;
        
        // Create Leaflet map
        this.map = L.map(containerId, {
            zoomControl: true,
            attributionControl: true
        }).setView(config.defaultCenter, config.defaultZoom);
        
        // Add tile layer
        L.tileLayer(config.tileLayer, {
            attribution: config.attribution,
            maxZoom: config.maxZoom,
            minZoom: config.minZoom
        }).addTo(this.map);
        
        return this.map;
    },
    
    // Add or update driver markers
    updateMarkers(drivers) {
        if (!this.map) return;
        
        // Clear existing markers
        this.clearMarkers();
        
        // Add new markers
        drivers.forEach(driver => {
            this.addDriverMarker(driver);
        });
    },
    
    // Add single driver marker
    addDriverMarker(driver) {
        if (!this.map || !driver.location) return;
        
        // Determine marker color based on workload
        const markerClass = Utils.getWorkloadClass(driver.effortScore);
        const markerColor = this.getMarkerColor(markerClass);
        
        // Create custom icon
        const icon = L.divIcon({
            className: 'custom-marker-wrapper',
            html: `<div class="custom-marker marker-${markerClass}" style="background: ${markerColor};">
                     ${driver.deliveries}
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        
        // Create marker
        const marker = L.marker(driver.location, { icon: icon });
        
        // Add popup
        const popupContent = this.createPopupContent(driver);
        marker.bindPopup(popupContent);
        
        // Add click handler to open driver profile
        marker.on('click', () => {
            if (window.DriverProfile) {
                window.DriverProfile.show(driver.id);
            }
        });
        
        // Add to map
        marker.addTo(this.map);
        
        // Store reference
        this.markers[driver.id] = marker;
    },
    
    // Get marker color based on workload
    getMarkerColor(workloadClass) {
        switch(workloadClass) {
            case 'available':
                return AppConfig.statusColors.available;
            case 'moderate':
                return AppConfig.statusColors.moderate;
            case 'overloaded':
                return AppConfig.statusColors.overloaded;
            default:
                return '#718096';
        }
    },
    
    // Create popup content
    createPopupContent(driver) {
        return `
            <div style="min-width: 200px; font-family: 'Inter', sans-serif;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <img src="${driver.avatar}" 
                         alt="${driver.name}" 
                         style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <div>
                        <div style="font-weight: 600; font-size: 14px; color: #1a202c;">${driver.name}</div>
                        <div style="font-size: 11px; color: #718096;">${driver.id}</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                    <div>
                        <div style="color: #718096;">Deliveries</div>
                        <div style="font-weight: 600; color: #1a202c;">${driver.deliveries}</div>
                    </div>
                    <div>
                        <div style="color: #718096;">Effort</div>
                        <div style="font-weight: 600; color: #1a202c;">${driver.effortScore}</div>
                    </div>
                    <div>
                        <div style="color: #718096;">Fairness</div>
                        <div style="font-weight: 600; color: #1a202c;">${driver.fairnessIndex}</div>
                    </div>
                    <div>
                        <div style="color: #718096;">Status</div>
                        <div style="font-weight: 600; color: ${this.getMarkerColor(Utils.getWorkloadClass(driver.effortScore))}">${driver.workload}</div>
                    </div>
                </div>
                <button onclick="DriverProfile.show('${driver.id}')" 
                        style="width: 100%; margin-top: 10px; padding: 8px; background: #005bea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                    View Full Profile
                </button>
            </div>
        `;
    },
    
    // Clear all markers
    clearMarkers() {
        Object.values(this.markers).forEach(marker => {
            marker.remove();
        });
        this.markers = {};
    },
    
    // Center map on specific driver
    centerOnDriver(driverId) {
        const marker = this.markers[driverId];
        if (marker) {
            this.map.setView(marker.getLatLng(), 14);
            marker.openPopup();
        }
    },
    
    // Fit bounds to show all drivers
    fitAllDrivers() {
        if (!this.map || Object.keys(this.markers).length === 0) return;
        
        const group = L.featureGroup(Object.values(this.markers));
        this.map.fitBounds(group.getBounds().pad(0.1));
    },
    
    // Destroy map
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.markers = {};
    }
};

window.MapManager = MapManager;
