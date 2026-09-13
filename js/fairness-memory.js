// Fairness Memory Module - FEATURE 3
const FairnessMemory = {
    drivers: [],
    selectedDriverId: null,
    chart: null,
    timelineDays: 7,
    
    // Render Fairness Memory page
    render(container) {
        container.innerHTML = `
            <div class="content-header">
                <h1>Fairness Memory</h1>
                <p>Historical justice layer - proving fairness over time</p>
            </div>
            <div class="content-body">
                <div class="fairness-memory-wrapper">
                    <!-- Driver Selector -->
                    <div class="memory-selector-card">
                        <div class="memory-selector-header">Select Driver to Analyze</div>
                        <select class="memory-driver-select" id="memory-driver-select">
                            <option value="">Choose a driver...</option>
                        </select>
                        <div class="memory-timeline-controls">
                            <button class="timeline-btn active" data-days="7">7 Days</button>
                            <button class="timeline-btn" data-days="14">14 Days</button>
                        </div>
                    </div>
                    
                    <!-- Chart Container -->
                    <div class="memory-chart-container">
                        <div class="memory-chart-header">
                            <div class="memory-chart-title">Effort Score History</div>
                            <div class="memory-chart-legend">
                                <div class="legend-item">
                                    <div class="legend-line driver"></div>
                                    <span>Driver Workload</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-line fleet"></div>
                                    <span>Fleet Average</span>
                                </div>
                            </div>
                        </div>
                        <div class="memory-chart-wrapper">
                            <canvas id="memory-chart-canvas" class="memory-chart-canvas"></canvas>
                        </div>
                        <div class="memory-comparison-stats" id="comparison-stats">
                            <!-- Stats will be injected here -->
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
        
        // Populate driver selector
        this.populateDriverSelector();
        
        // Attach listeners
        this.attachDriverSelectListener();
        this.attachTimelineListeners();
        
        // Select first driver by default
        if (this.drivers.length > 0) {
            this.selectedDriverId = this.drivers[0].id;
            document.getElementById('memory-driver-select').value = this.selectedDriverId;
            this.renderChart();
        }
    },
    
    // Populate driver selector
    populateDriverSelector() {
        const select = document.getElementById('memory-driver-select');
        if (!select) return;
        
        this.drivers.forEach(driver => {
            const option = document.createElement('option');
            option.value = driver.id;
            option.textContent = `${driver.name} (${driver.id})`;
            select.appendChild(option);
        });
    },
    
    // Attach driver select listener
    attachDriverSelectListener() {
        const select = document.getElementById('memory-driver-select');
        if (!select) return;
        
        select.addEventListener('change', (e) => {
            this.selectedDriverId = e.target.value;
            if (this.selectedDriverId) {
                this.renderChart();
            }
        });
    },
    
    // Attach timeline listeners
    attachTimelineListeners() {
        const btns = document.querySelectorAll('.timeline-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.timelineDays = parseInt(btn.getAttribute('data-days'));
                this.renderChart();
            });
        });
    },
    
    // Render chart
    renderChart() {
        if (!this.selectedDriverId) return;
        
        const driver = this.drivers.find(d => d.id === this.selectedDriverId);
        if (!driver) return;
        
        // Get chart data
        const chartData = this.prepareChartData(driver);
        
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Create new chart
        const ctx = document.getElementById('memory-chart-canvas');
        if (!ctx) return;
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: `${driver.name} Workload`,
                        data: chartData.driverEffort,
                        borderColor: AppConfig.chartConfig.defaultColors.primary,
                        backgroundColor: 'rgba(0, 91, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: AppConfig.chartConfig.defaultColors.primary
                    },
                    {
                        label: 'Fleet Average',
                        data: chartData.fleetAverage,
                        borderColor: AppConfig.chartConfig.defaultColors.secondary,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: AppConfig.chartConfig.defaultColors.secondary
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#1a202c',
                        bodyColor: '#4a5568',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 40,
                        max: 100,
                        grid: {
                            color: '#f3f4f6'
                        },
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        // Update comparison stats
        this.updateComparisonStats(driver, chartData);
    },
    
    // Prepare chart data
    prepareChartData(driver) {
        const history = driver.effortHistory.slice(-this.timelineDays);
        
        return {
            labels: history.map(h => {
                const date = new Date(h.date);
                return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            }),
            driverEffort: history.map(h => h.effortScore),
            fleetAverage: history.map(() => Utils.randomIntBetween(65, 75)) // Mock fleet average
        };
    },
    
    // Update comparison stats
    updateComparisonStats(driver, chartData) {
        const statsContainer = document.getElementById('comparison-stats');
        if (!statsContainer) return;
        
        const driverAvg = Utils.calculateAverage(chartData.driverEffort);
        const fleetAvg = Utils.calculateAverage(chartData.fleetAverage);
        const difference = driverAvg - fleetAvg;
        const trend = difference > 5 ? 'negative' : difference < -5 ? 'positive' : 'neutral';
        
        const peakEffort = Math.max(...chartData.driverEffort);
        const lowestEffort = Math.min(...chartData.driverEffort);
        
        statsContainer.innerHTML = `
            <div class="comparison-stat-item">
                <div class="comparison-stat-label">Driver Average</div>
                <div class="comparison-stat-value">${driverAvg.toFixed(1)}%</div>
            </div>
            <div class="comparison-stat-item">
                <div class="comparison-stat-label">Fleet Average</div>
                <div class="comparison-stat-value">${fleetAvg.toFixed(1)}%</div>
            </div>
            <div class="comparison-stat-item">
                <div class="comparison-stat-label">Difference</div>
                <div class="comparison-stat-value">${difference > 0 ? '+' : ''}${difference.toFixed(1)}%</div>
                <div class="comparison-stat-change ${trend}">
                    ${trend === 'positive' ? '✓ Below average (Good)' : trend === 'negative' ? '⚠ Above average' : '— Near average'}
                </div>
            </div>
            <div class="comparison-stat-item">
                <div class="comparison-stat-label">Peak Effort</div>
                <div class="comparison-stat-value">${peakEffort}%</div>
            </div>
            <div class="comparison-stat-item">
                <div class="comparison-stat-label">Lowest Effort</div>
                <div class="comparison-stat-value">${lowestEffort}%</div>
            </div>
            <div class="comparison-stat-item">
                <div class="comparison-stat-label">Variance</div>
                <div class="comparison-stat-value">${(peakEffort - lowestEffort).toFixed(1)}%</div>
            </div>
        `;
    }
};

window.FairnessMemory = FairnessMemory;
