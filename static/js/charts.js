// Chart.js configuration and data loading functions

// Chart color schemes
const chartColors = {
    primary: 'rgba(54, 162, 235, 0.8)',
    success: 'rgba(75, 192, 192, 0.8)',
    danger: 'rgba(255, 99, 132, 0.8)',
    warning: 'rgba(255, 206, 86, 0.8)',
    info: 'rgba(153, 102, 255, 0.8)',
    secondary: 'rgba(201, 203, 207, 0.8)'
};

// Dashboard data loading
async function loadDashboardData() {
    console.log('Starting to load dashboard data...');
    
    // First, test if server is reachable
    try {
        console.log('Testing server connection...');
        const healthCheck = await fetch('/api/health', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-cache'
        });
        
        if (!healthCheck.ok) {
            throw new Error(`Server health check failed: ${healthCheck.status}`);
        }
        
        const healthData = await healthCheck.json();
        console.log('✓ Server is running:', healthData);
    } catch (healthError) {
        console.error('✗ Server health check failed:', healthError);
        const errorMsg = 'Cannot connect to server. Please make sure the Flask server is running on http://localhost:5000';
        showError('tempChart', errorMsg);
        showError('conditionChart', errorMsg);
        showError('dailyTempChart', errorMsg);
        return;
    }
    
    try {
        // Load temperature data
        console.log('Loading temperature data...');
        let tempResponse;
        let tempData;
        try {
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            tempResponse = await fetch('/api/temperature-by-location', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                cache: 'no-cache',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!tempResponse.ok) {
                try {
                    tempData = await tempResponse.json();
                    const errorMsg = tempData.error || `Temperature API error: ${tempResponse.status}`;
                    throw new Error(errorMsg);
                } catch (jsonError) {
                    throw new Error(`Server error: ${tempResponse.status} ${tempResponse.statusText}`);
                }
            }
            tempData = await tempResponse.json();
            console.log('✓ Temperature data loaded:', tempData.length, 'locations');
        } catch (fetchError) {
            console.error('✗ Error fetching temperature data:', fetchError);
            if (fetchError.name === 'AbortError') {
                throw new Error('Request timed out. The server may be processing a large dataset. Please try again or check the server terminal for errors.');
            }
            if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch') || fetchError.message.includes('fetch')) {
                throw new Error('Cannot connect to server. Please make sure the Flask server is running on http://localhost:5000. Check the server terminal for error messages.');
            }
            throw fetchError;
        }
        if (tempData.error) {
            showError('tempChart', tempData.error);
        } else if (tempData && tempData.length > 0) {
            createTempChart(tempData);
        } else {
            showError('tempChart', 'No temperature data available');
        }

        // Load condition data
        console.log('Loading condition data...');
        let conditionResponse;
        let conditionData;
        try {
            conditionResponse = await fetch('/api/weather-conditions', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                cache: 'no-cache'
            });
            if (!conditionResponse.ok) {
                try {
                    conditionData = await conditionResponse.json();
                    const errorMsg = conditionData.error || `Conditions API error: ${conditionResponse.status}`;
                    throw new Error(errorMsg);
                } catch (jsonError) {
                    throw new Error(`Server error: ${conditionResponse.status} ${conditionResponse.statusText}`);
                }
            }
            conditionData = await conditionResponse.json();
            console.log('✓ Condition data loaded:', conditionData.length, 'conditions');
        } catch (fetchError) {
            console.error('✗ Error fetching condition data:', fetchError);
            if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch') || fetchError.message.includes('fetch')) {
                throw new Error('Cannot connect to server. Please make sure the Flask server is running on http://localhost:5000');
            }
            throw fetchError;
        }
        if (conditionData.error) {
            showError('conditionChart', conditionData.error);
        } else if (conditionData && conditionData.length > 0) {
            createConditionChart(conditionData);
        } else {
            showError('conditionChart', 'No condition data available');
        }

        // Load daily temperature
        console.log('Loading daily temperature data...');
        let dailyTempResponse;
        let dailyTempData;
        try {
            dailyTempResponse = await fetch('/api/daily-temperature', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                cache: 'no-cache'
            });
            if (!dailyTempResponse.ok) {
                try {
                    dailyTempData = await dailyTempResponse.json();
                    const errorMsg = dailyTempData.error || `Daily temp API error: ${dailyTempResponse.status}`;
                    throw new Error(errorMsg);
                } catch (jsonError) {
                    throw new Error(`Server error: ${dailyTempResponse.status} ${dailyTempResponse.statusText}`);
                }
            }
            dailyTempData = await dailyTempResponse.json();
            console.log('✓ Daily temperature data loaded:', dailyTempData.length, 'days');
        } catch (fetchError) {
            console.error('✗ Error fetching daily temperature data:', fetchError);
            if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch') || fetchError.message.includes('fetch')) {
                throw new Error('Cannot connect to server. Please make sure the Flask server is running on http://localhost:5000');
            }
            throw fetchError;
        }
        if (dailyTempData.error) {
            showError('dailyTempChart', dailyTempData.error);
        } else if (dailyTempData && dailyTempData.length > 0) {
            createDailyTempChart(dailyTempData);
        } else {
            showError('dailyTempChart', 'No daily temperature data available');
        }

        // Update quick stats
        if (tempData && !tempData.error && conditionData && !conditionData.error) {
            updateQuickStats(tempData, conditionData);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('tempChart', error.message);
        showError('conditionChart', error.message);
        showError('dailyTempChart', error.message);
    }
}

// Show error message in chart container
function showError(chartId, message) {
    const ctx = document.getElementById(chartId);
    if (ctx) {
        const parent = ctx.parentElement;
        const isNetworkError = message.includes('Cannot connect to server') || 
                              message.includes('NetworkError') || 
                              message.includes('Failed to fetch');
        
        let errorHtml = `<div class="alert alert-danger" role="alert">
            <strong>Error:</strong> ${message}`;
        
        if (isNetworkError) {
            errorHtml += `<br><br><strong>To fix this:</strong>
            <ol>
                <li>Make sure the Flask server is running</li>
                <li>Open a terminal and run: <code>python app.py</code></li>
                <li>Wait for the message: "Starting Flask server..."</li>
                <li>Refresh this page</li>
            </ol>`;
        } else {
            errorHtml += `<br><small>Please check the console for more details or ensure the server is running correctly.</small>`;
        }
        
        errorHtml += `</div>`;
        parent.innerHTML = errorHtml;
    }
}

// Temperature chart
function createTempChart(data) {
    const ctx = document.getElementById('tempChart');
    if (!ctx) return;
    
    if (!data || data.length === 0) {
        showError('tempChart', 'No data available');
        return;
    }

    const locations = data.map(d => d.location);
    const temps = data.map(d => d.avg_temperature);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locations,
            datasets: [{
                label: 'Average Temperature (°C)',
                data: temps,
                backgroundColor: chartColors.danger,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

// Condition distribution chart
function createConditionChart(data) {
    const ctx = document.getElementById('conditionChart');
    if (!ctx) return;
    
    if (!data || data.length === 0) {
        showError('conditionChart', 'No data available');
        return;
    }

    const conditions = data.map(d => d.condition);
    const counts = data.map(d => d.count);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: conditions,
            datasets: [{
                data: counts,
                backgroundColor: [
                    chartColors.primary,
                    chartColors.success,
                    chartColors.warning,
                    chartColors.info,
                    chartColors.secondary,
                    chartColors.danger
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Daily temperature trend chart
function createDailyTempChart(data) {
    const ctx = document.getElementById('dailyTempChart');
    if (!ctx) return;
    
    if (!data || data.length === 0) {
        showError('dailyTempChart', 'No data available');
        return;
    }

    const dates = data.map(d => d.date);
    const temps = data.map(d => d.avg_temperature);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Daily Average Temperature (°C)',
                data: temps,
                borderColor: chartColors.warning,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

// Update quick stats
function updateQuickStats(tempData, conditionData) {
    try {
        if (!tempData || tempData.length === 0) {
            document.getElementById('totalLocations').textContent = '0';
            document.getElementById('avgTemp').textContent = '-';
            return;
        }
        
        const totalLocations = tempData.length;
        const avgTemp = (tempData.reduce((sum, d) => sum + (d.avg_temperature || 0), 0) / totalLocations).toFixed(2);
        const totalPrecip = conditionData ? conditionData.length : 0;
        const conditions = conditionData ? conditionData.length : 0;

        document.getElementById('totalLocations').textContent = totalLocations;
        document.getElementById('avgTemp').textContent = avgTemp;
        document.getElementById('totalPrecip').textContent = totalPrecip;
        document.getElementById('conditions').textContent = conditions;
    } catch (error) {
        console.error('Error updating quick stats:', error);
        document.getElementById('totalLocations').textContent = '-';
        document.getElementById('avgTemp').textContent = '-';
        document.getElementById('totalPrecip').textContent = '-';
        document.getElementById('conditions').textContent = '-';
    }
}

// Temperature page data loading
async function loadTemperatureData() {
    try {
        // Load average temperature
        let avgTempResponse;
        let avgTempData;
        try {
            avgTempResponse = await fetch('/api/temperature-by-location');
            if (!avgTempResponse.ok) {
                try {
                    avgTempData = await avgTempResponse.json();
                    const errorMsg = avgTempData.error || `API error: ${avgTempResponse.status}`;
                    throw new Error(errorMsg);
                } catch (jsonError) {
                    throw new Error(`Server error: ${avgTempResponse.status} ${avgTempResponse.statusText}`);
                }
            }
            avgTempData = await avgTempResponse.json();
        } catch (fetchError) {
            if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Please make sure the Flask server is running on http://localhost:5000');
            }
            throw fetchError;
        }
        if (avgTempData.error) {
            showError('avgTempChart', avgTempData.error);
            showError('maxMinTempChart', avgTempData.error);
            showError('tempRangeChart', avgTempData.error);
            document.getElementById('tempTableBody').innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading data</td></tr>';
        } else if (avgTempData && avgTempData.length > 0) {
            createAvgTempChart(avgTempData);
        } else {
            showError('avgTempChart', 'No data available');
        }

        // Load max/min temperature
        let maxMinResponse;
        let maxMinData;
        try {
            maxMinResponse = await fetch('/api/max-min-temperature');
            if (!maxMinResponse.ok) {
                try {
                    maxMinData = await maxMinResponse.json();
                    const errorMsg = maxMinData.error || `API error: ${maxMinResponse.status}`;
                    throw new Error(errorMsg);
                } catch (jsonError) {
                    throw new Error(`Server error: ${maxMinResponse.status} ${maxMinResponse.statusText}`);
                }
            }
            maxMinData = await maxMinResponse.json();
        } catch (fetchError) {
            if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Please make sure the Flask server is running on http://localhost:5000');
            }
            throw fetchError;
        }
        if (maxMinData.error) {
            showError('maxMinTempChart', maxMinData.error);
            showError('tempRangeChart', maxMinData.error);
        } else if (maxMinData && maxMinData.length > 0) {
            createMaxMinTempChart(maxMinData);
            createTempRangeChart(maxMinData);
            if (avgTempData && !avgTempData.error) {
                populateTempTable(avgTempData, maxMinData);
            }
        } else {
            showError('maxMinTempChart', 'No data available');
            showError('tempRangeChart', 'No data available');
        }
    } catch (error) {
        console.error('Error loading temperature data:', error);
        showError('avgTempChart', error.message);
        showError('maxMinTempChart', error.message);
        showError('tempRangeChart', error.message);
        const tbody = document.getElementById('tempTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error: ' + error.message + '</td></tr>';
        }
    }
}

function createAvgTempChart(data) {
    const ctx = document.getElementById('avgTempChart');
    if (!ctx) return;
    
    if (!data || data.length === 0) {
        showError('avgTempChart', 'No data available');
        return;
    }

    const locations = data.map(d => d.location);
    const temps = data.map(d => d.avg_temperature);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locations,
            datasets: [{
                label: 'Average Temperature (°C)',
                data: temps,
                backgroundColor: chartColors.danger,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

function createMaxMinTempChart(data) {
    const ctx = document.getElementById('maxMinTempChart');
    if (!ctx) return;
    
    if (!data || data.length === 0) {
        showError('maxMinTempChart', 'No data available');
        return;
    }

    const locations = data.map(d => d.location);
    const maxTemps = data.map(d => d.max_temperature);
    const minTemps = data.map(d => d.min_temperature);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locations,
            datasets: [
                {
                    label: 'Max Temperature (°C)',
                    data: maxTemps,
                    backgroundColor: chartColors.danger,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Min Temperature (°C)',
                    data: minTemps,
                    backgroundColor: chartColors.info,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

function createTempRangeChart(data) {
    const ctx = document.getElementById('tempRangeChart');
    if (!ctx) return;
    
    if (!data || data.length === 0) {
        showError('tempRangeChart', 'No data available');
        return;
    }

    const locations = data.map(d => d.location);
    const ranges = data.map(d => d.max_temperature - d.min_temperature);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: locations,
            datasets: [{
                label: 'Temperature Range (°C)',
                data: ranges,
                borderColor: chartColors.warning,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Temperature Range (°C)'
                    }
                }
            }
        }
    });
}

function populateTempTable(avgData, maxMinData) {
    const tbody = document.getElementById('tempTableBody');
    if (!tbody) return;

    const combined = avgData.map(avg => {
        const maxMin = maxMinData.find(m => m.location === avg.location);
        return {
            location: avg.location,
            avg: avg.avg_temperature,
            max: maxMin ? maxMin.max_temperature : '-',
            min: maxMin ? maxMin.min_temperature : '-'
        };
    });

    tbody.innerHTML = combined.map(item => `
        <tr>
            <td>${item.location}</td>
            <td>${item.avg}</td>
            <td>${item.max}</td>
            <td>${item.min}</td>
        </tr>
    `).join('');
}

// Precipitation page data loading
async function loadPrecipitationData() {
    try {
        let precipResponse;
        let precipData;
        try {
            precipResponse = await fetch('/api/precipitation-by-location');
            if (!precipResponse.ok) {
                try {
                    precipData = await precipResponse.json();
                    const errorMsg = precipData.error || `API error: ${precipResponse.status}`;
                    throw new Error(errorMsg);
                } catch (jsonError) {
                    throw new Error(`Server error: ${precipResponse.status} ${precipResponse.statusText}`);
                }
            }
            precipData = await precipResponse.json();
        } catch (fetchError) {
            if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Please make sure the Flask server is running on http://localhost:5000');
            }
            throw fetchError;
        }
        if (precipData.error) {
            showError('precipChart', precipData.error);
            showError('precipDistChart', precipData.error);
            document.getElementById('precipTableBody').innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error loading data</td></tr>';
        } else if (precipData && precipData.length > 0) {
            createPrecipChart(precipData);
            createPrecipDistChart(precipData);
        } else {
            showError('precipChart', 'No data available');
            showError('precipDistChart', 'No data available');
        }

        let humidityResponse;
        let humidityData;
        try {
            humidityResponse = await fetch('/api/humidity-by-location');
            if (!humidityResponse.ok) {
                try {
                    humidityData = await humidityResponse.json();
                    const errorMsg = humidityData.error || `API error: ${humidityResponse.status}`;
                    throw new Error(errorMsg);
                } catch (jsonError) {
                    throw new Error(`Server error: ${humidityResponse.status} ${humidityResponse.statusText}`);
                }
            }
            humidityData = await humidityResponse.json();
        } catch (fetchError) {
            if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Please make sure the Flask server is running on http://localhost:5000');
            }
            throw fetchError;
        }
        if (humidityData.error) {
            showError('humidityChart', humidityData.error);
        } else if (humidityData && humidityData.length > 0) {
            createHumidityChart(humidityData);
            if (precipData && !precipData.error) {
                populatePrecipTable(precipData, humidityData);
            }
        } else {
            showError('humidityChart', 'No data available');
        }
    } catch (error) {
        console.error('Error loading precipitation data:', error);
        showError('precipChart', error.message);
        showError('precipDistChart', error.message);
        showError('humidityChart', error.message);
        const tbody = document.getElementById('precipTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error: ' + error.message + '</td></tr>';
        }
    }
}

function createPrecipChart(data) {
    const ctx = document.getElementById('precipChart');
    if (!ctx) return;
    
    if (!data || data.length === 0) {
        showError('precipChart', 'No data available');
        return;
    }

    const locations = data.map(d => d.location);
    const precip = data.map(d => d.total_precipitation);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locations,
            datasets: [{
                label: 'Total Precipitation (mm)',
                data: precip,
                backgroundColor: chartColors.primary,
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Precipitation (mm)'
                    }
                }
            }
        }
    });
}

function createPrecipDistChart(data) {
    const ctx = document.getElementById('precipDistChart');
    if (!ctx) return;
    
    if (!data || data.length === 0) {
        showError('precipDistChart', 'No data available');
        return;
    }

    const locations = data.map(d => d.location);
    const precip = data.map(d => d.total_precipitation);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: locations,
            datasets: [{
                data: precip,
                backgroundColor: [
                    chartColors.primary,
                    chartColors.success,
                    chartColors.warning,
                    chartColors.info,
                    chartColors.danger,
                    chartColors.secondary
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createHumidityChart(data) {
    const ctx = document.getElementById('humidityChart');
    if (!ctx) return;
    
    if (!data || data.length === 0) {
        showError('humidityChart', 'No data available');
        return;
    }

    const locations = data.map(d => d.location);
    const humidity = data.map(d => d.avg_humidity);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locations,
            datasets: [{
                label: 'Average Humidity (%)',
                data: humidity,
                backgroundColor: chartColors.success,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    }
                }
            }
        }
    });
}

function populatePrecipTable(precipData, humidityData) {
    const tbody = document.getElementById('precipTableBody');
    if (!tbody) return;

    const combined = precipData.map(precip => {
        const humidity = humidityData.find(h => h.location === precip.location);
        return {
            location: precip.location,
            precip: precip.total_precipitation,
            humidity: humidity ? humidity.avg_humidity : '-'
        };
    });

    tbody.innerHTML = combined.map(item => `
        <tr>
            <td>${item.location}</td>
            <td>${item.precip}</td>
            <td>${item.humidity}</td>
        </tr>
    `).join('');
}

// Statistics page data loading
async function loadStatisticsData() {
    try {
        let statsResponse;
        let statsData;
        try {
            statsResponse = await fetch('/api/location-statistics');
            if (!statsResponse.ok) {
                try {
                    statsData = await statsResponse.json();
                    const errorMsg = statsData.error || `API error: ${statsResponse.status}`;
                    throw new Error(errorMsg);
                } catch (jsonError) {
                    throw new Error(`Server error: ${statsResponse.status} ${statsResponse.statusText}`);
                }
            }
            statsData = await statsResponse.json();
        } catch (fetchError) {
            if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Please make sure the Flask server is running on http://localhost:5000');
            }
            throw fetchError;
        }
        if (statsData.error) {
            const tbody = document.getElementById('statsTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error: ' + statsData.error + '</td></tr>';
            }
            showError('avgTempStatsChart', statsData.error);
            showError('avgHumidityStatsChart', statsData.error);
            showError('avgPrecipStatsChart', statsData.error);
            showError('avgWindStatsChart', statsData.error);
        } else if (statsData && statsData.length > 0) {
            populateStatsTable(statsData);
            createStatsCharts(statsData);
        } else {
            const tbody = document.getElementById('statsTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">No data available</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading statistics data:', error);
        const tbody = document.getElementById('statsTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error: ' + error.message + '</td></tr>';
        }
        showError('avgTempStatsChart', error.message);
        showError('avgHumidityStatsChart', error.message);
        showError('avgPrecipStatsChart', error.message);
        showError('avgWindStatsChart', error.message);
    }
}

function populateStatsTable(data) {
    const tbody = document.getElementById('statsTableBody');
    if (!tbody) return;
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No data available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td><strong>${item.location || '-'}</strong></td>
            <td>${item.avg_temperature || '-'}</td>
            <td>${item.max_temperature || '-'}</td>
            <td>${item.min_temperature || '-'}</td>
            <td>${item.avg_humidity || '-'}</td>
            <td>${item.avg_precipitation || '-'}</td>
            <td>${item.avg_wind_speed || '-'}</td>
            <td>${item.record_count || '-'}</td>
        </tr>
    `).join('');
}

function createStatsCharts(data) {
    if (!data || data.length === 0) {
        return;
    }
    
    const locations = data.map(d => d.location);

    // Average Temperature Chart
    const avgTempCtx = document.getElementById('avgTempStatsChart');
    if (avgTempCtx) {
        new Chart(avgTempCtx, {
            type: 'bar',
            data: {
                labels: locations,
                datasets: [{
                    label: 'Average Temperature (°C)',
                    data: data.map(d => d.avg_temperature),
                    backgroundColor: chartColors.danger
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });
    }

    // Average Humidity Chart
    const avgHumidityCtx = document.getElementById('avgHumidityStatsChart');
    if (avgHumidityCtx) {
        new Chart(avgHumidityCtx, {
            type: 'bar',
            data: {
                labels: locations,
                datasets: [{
                    label: 'Average Humidity (%)',
                    data: data.map(d => d.avg_humidity),
                    backgroundColor: chartColors.success
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: false, min: 0, max: 100 }
                }
            }
        });
    }

    // Average Precipitation Chart
    const avgPrecipCtx = document.getElementById('avgPrecipStatsChart');
    if (avgPrecipCtx) {
        new Chart(avgPrecipCtx, {
            type: 'bar',
            data: {
                labels: locations,
                datasets: [{
                    label: 'Average Precipitation (mm)',
                    data: data.map(d => d.avg_precipitation),
                    backgroundColor: chartColors.warning
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Average Wind Speed Chart
    const avgWindCtx = document.getElementById('avgWindStatsChart');
    if (avgWindCtx) {
        new Chart(avgWindCtx, {
            type: 'bar',
            data: {
                labels: locations,
                datasets: [{
                    label: 'Average Wind Speed (km/h)',
                    data: data.map(d => d.avg_wind_speed),
                    backgroundColor: chartColors.danger
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}



