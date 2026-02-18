// Analytics JavaScript - Simple Charts and Visual Stats

let analyticsData = null;

// Initialize analytics
function initializeAnalytics() {
    updateAnalyticsData();
    renderCharts();
    setupAnalyticsEventListeners();
}

// Setup analytics event listeners
function setupAnalyticsEventListeners() {
    // Refresh analytics when section is shown, but not if modal is open
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'analytics' && 
                mutation.target.classList.contains('active') && 
                !document.querySelector('.modal.show')) {
                refreshAnalytics();
            }
        });
    });
    
    const analyticsSection = document.getElementById('analytics');
    if (analyticsSection) {
        observer.observe(analyticsSection, { attributes: true, attributeFilter: ['class'] });
    }
}

// Update analytics data
function updateAnalyticsData() {
    const stats = getStatistics();
    analyticsData = {
        ...stats,
        landlordAnalytics: calculateLandlordAnalytics(),
        marketInsights: calculateMarketInsights()
    };
}

// Calculate landlord-specific analytics
function calculateLandlordAnalytics() {
    const landlordAnalytics = {};
    
    landlords.forEach(landlord => {
        const purchases = app.purchases.filter(p => p.landlordId === landlord.id);
        const totalSouls = purchases.reduce((sum, p) => sum + p.souls, 0);
        const totalRevenue = purchases.reduce((sum, p) => sum + p.totalCost, 0);
        
        landlordAnalytics[landlord.id] = {
            name: landlord.name,
            title: landlord.title,
            quote: landlord.quote,
            traits: landlord.traits,
            soulsAvailable: landlord.souls,
            pricePerSoul: landlord.pricePerSoul,
            totalSoulsSold: totalSouls,
            totalRevenue: totalRevenue,
            purchaseCount: purchases.length,
            profitMargin: landlord.pricePerSoul > 1 ? 'high' : landlord.pricePerSoul > 0.75 ? 'medium' : 'low',
            greedLevel: calculateGreedLevel(landlord.pricePerSoul),
            weirdnessScore: calculateWeirdnessScore(landlord)
        };
    });
    
    return landlordAnalytics;
}

// Calculate greed level based on price
function calculateGreedLevel(pricePerSoul) {
    if (pricePerSoul >= 2.0) return 'чрезвычайно_жадный';
    if (pricePerSoul >= 1.5) return 'очень_жадный';
    if (pricePerSoul >= 1.0) return 'умеренно_жадный';
    if (pricePerSoul >= 0.5) return 'слегка_жадный';
    return 'не_жадный';
}

// Calculate weirdness score based on traits
function calculateWeirdnessScore(landlord) {
    const weirdTraits = ['мечтательный', 'безрассудный', 'паранойяльный', 'накопитель'];
    const score = landlord.traits.filter(trait => weirdTraits.includes(trait)).length;
    return score;
}

// Calculate market insights
function calculateMarketInsights() {
    const totalLandlords = landlords.length;
    const purchasedLandlords = Object.values(analyticsData?.landlordAnalytics || {})
        .filter(l => l.purchaseCount > 0).length;
    
    const avgPricePerSoul = landlords.reduce((sum, l) => sum + l.pricePerSoul, 0) / totalLandlords;
    const totalAvailableSouls = landlords.reduce((sum, l) => sum + l.souls, 0);
    
    return {
        marketPenetration: (purchasedLandlords / totalLandlords) * 100,
        averagePricePerSoul: avgPricePerSoul,
        totalMarketValue: totalAvailableSouls * avgPricePerSoul,
        marketEfficiency: app.totalSpent > 0 ? (app.totalSouls / app.totalSpent) * 100 : 0
    };
}

// Render all charts
function renderCharts() {
    renderProfitChart();
    renderGreedyChart();
    renderWeirdChart();
}

// Render most profitable landlords chart
function renderProfitChart() {
    const chartContainer = document.getElementById('profitChart');
    if (!chartContainer) return;
    
    const profitData = Object.values(analyticsData.landlordAnalytics)
        .filter(landlord => landlord.totalRevenue > 0)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5);
    
    if (profitData.length === 0) {
        chartContainer.innerHTML = '<p class="no-data">Прибыльных помещиков пока нет. Сделайте несколько покупок!</p>';
        return;
    }
    
    const maxRevenue = Math.max(...profitData.map(d => d.totalRevenue));
    
    const chartHTML = `
        <div class="chart-bars">
            ${profitData.map((landlord, index) => {
                const percentage = (landlord.totalRevenue / maxRevenue) * 100;
                return `
                    <div class="bar-container" style="animation-delay: ${index * 0.1}s">
                        <div class="bar profit-bar" 
                             style="height: ${percentage}%"
                             data-tooltip="${landlord.name}: ₽${landlord.totalRevenue.toFixed(2)} из ${landlord.totalSoulsSold} душ"
                             onclick="event.stopPropagation(); showLandlordDetails(${landlords.find(l => l.name === landlord.name)?.id})">
                            <div class="bar-label">${landlord.name}</div>
                            <div class="bar-value">₽${landlord.totalRevenue.toFixed(0)}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    chartContainer.innerHTML = chartHTML;
}

// Render most greedy landlords chart
function renderGreedyChart() {
    const chartContainer = document.getElementById('greedyChart');
    if (!chartContainer) return;
    
    const greedyData = landlords
        .map(landlord => ({
            ...landlord,
            analytics: analyticsData.landlordAnalytics[landlord.id]
        }))
        .sort((a, b) => b.pricePerSoul - a.pricePerSoul)
        .slice(0, 5);
    
    const maxPrice = Math.max(...greedyData.map(d => d.pricePerSoul));
    
    const chartHTML = `
        <div class="chart-bars">
            ${greedyData.map((landlord, index) => {
                const percentage = (landlord.pricePerSoul / maxPrice) * 100;
                const greedLevel = analyticsData.landlordAnalytics[landlord.id].greedLevel;
                return `
                    <div class="bar-container" style="animation-delay: ${index * 0.1}s">
                        <div class="bar greedy-bar ${greedLevel}" 
                             style="height: ${percentage}%"
                             data-tooltip="${landlord.name}: ₽${landlord.pricePerSoul.toFixed(2)} за душу - ${landlord.analytics.quote}"
                             onclick="event.stopPropagation(); showLandlordDetails(${landlord.id})">
                            <div class="bar-label">${landlord.name}</div>
                            <div class="bar-value">₽${landlord.pricePerSoul.toFixed(2)}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    chartContainer.innerHTML = chartHTML;
}

// Render weirdest landlords chart
function renderWeirdChart() {
    const chartContainer = document.getElementById('weirdChart');
    if (!chartContainer) return;
    
    const weirdData = landlords
        .map(landlord => ({
            ...landlord,
            analytics: analyticsData.landlordAnalytics[landlord.id]
        }))
        .sort((a, b) => b.analytics.weirdnessScore - a.analytics.weirdnessScore)
        .slice(0, 5);
    
    const maxWeirdness = Math.max(...weirdData.map(d => d.analytics.weirdnessScore));
    
    if (maxWeirdness === 0) {
        chartContainer.innerHTML = '<p class="no-data">Все помещики кажутся совершенно нормальными... или нет?</p>';
        return;
    }
    
    const chartHTML = `
        <div class="chart-bars">
            ${weirdData.map((landlord, index) => {
                const percentage = maxWeirdness > 0 ? (landlord.analytics.weirdnessScore / maxWeirdness) * 100 : 0;
                return `
                    <div class="bar-container" style="animation-delay: ${index * 0.1}s">
                        <div class="bar weird-bar" 
                             style="height: ${percentage}%"
                             data-tooltip="${landlord.name}: Оценка странности ${landlord.analytics.weirdnessScore}/3 - ${landlord.analytics.quote}"
                             onclick="event.stopPropagation(); showLandlordDetails(${landlord.id})">
                            <div class="bar-label">${landlord.name}</div>
                            <div class="bar-value">${landlord.analytics.weirdnessScore}/3</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    chartContainer.innerHTML = chartHTML;
}

// Show landlord details in modal
function showLandlordDetails(landlordId) {
    const landlord = landlords.find(l => l.id === landlordId);
    const analytics = analyticsData.landlordAnalytics[landlordId];
    
    if (!landlord || !analytics) return;
    
    const detailsHTML = `
        <h3>${landlord.name} - ${landlord.title}</h3>
        <div class="landlord-details">
            <p><strong>Описание:</strong> ${landlord.description}</p>
            <p><strong>Черты:</strong> ${landlord.traits.join(', ')}</p>
            <p><strong>Цитата:</strong> <em>"${landlord.quote}"</em></p>
            
            <div class="analytics-details">
                <h4>Аналитика производительности:</h4>
                <ul>
                    <li>Доступно душ: ${analytics.soulsAvailable}</li>
                    <li>Цена за душу: ₽${analytics.pricePerSoul.toFixed(2)}</li>
                    <li>Всего продано душ: ${analytics.totalSoulsSold}</li>
                    <li>Общий доход: ₽${analytics.totalRevenue.toFixed(2)}</li>
                    <li>Количество покупок: ${analytics.purchaseCount}</li>
                    <li>Уровень жадности: ${analytics.greedLevel.replace(/_/g, ' ')}</li>
                    <li>Оценка странности: ${analytics.weirdnessScore}/3</li>
                </ul>
            </div>
        </div>
    `;
    
    // Add small delay to avoid conflicts
    setTimeout(() => {
        showModal('Аналитика помещика', detailsHTML, 'success', false);
    }, 100);
}

// Refresh analytics
function refreshAnalytics() {
    // Don't refresh if modal is open
    if (document.querySelector('.modal.show')) {
        return;
    }
    
    updateAnalyticsData();
    renderCharts();
    
    // Add refresh animation
    const charts = document.querySelectorAll('.chart-container');
    charts.forEach(chart => {
        chart.style.animation = 'fadeIn 0.5s ease';
    });
}

// Export analytics data as JSON
function exportAnalyticsData() {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `dead-souls-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// Generate market report
function generateMarketReport() {
    const insights = analyticsData.marketInsights;
    
    const reportHTML = `
        <h3>📊 Отчет об анализе рынка</h3>
        <div class="market-report">
            <div class="report-section">
                <h4>Обзор рынка</h4>
                <ul>
                    <li>Проникновение на рынок: ${insights.marketPenetration.toFixed(1)}%</li>
                    <li>Средняя цена за душу: ₽${insights.averagePricePerSoul.toFixed(2)}</li>
                    <li>Общая стоимость рынка: ₽${insights.totalMarketValue.toFixed(2)}</li>
                    <li>Ваша рыночная эффективность: ${insights.marketEfficiency.toFixed(1)}%</li>
                </ul>
            </div>
            
            <div class="report-section">
                <h4>Ваша производительность</h4>
                <ul>
                    <li>Всего приобретено душ: ${app.totalSouls}</li>
                    <li>Общие инвестиции: ₽${app.totalSpent.toFixed(2)}</li>
                    <li>Приобретено помещиков: ${[...new Set(app.purchases.map(p => p.landlordName))].length}</li>
                    <li>Средняя стоимость за душу: ₽${app.totalSouls > 0 ? (app.totalSpent / app.totalSouls).toFixed(2) : '0.00'}</li>
                </ul>
            </div>
            
            <div class="report-section">
                <h4>Рекомендации</h4>
                <ul>
                    ${generateRecommendations()}
                </ul>
            </div>
        </div>
    `;
    
    showModal('Отчет об анализе рынка', reportHTML, 'success', false);
}

// Generate recommendations based on analytics
function generateRecommendations() {
    const recommendations = [];
    
    if (app.purchases.length === 0) {
        recommendations.push('<li>Начните с покупки у Ноздрёва - он предлагает лучшую цену!</li>');
    } else {
        const avgCost = app.totalSpent / app.totalSouls;
        
        if (avgCost > 1.5) {
            recommendations.push('<li>Подумайте о покупке у Плюшкина для лучшей цены.</li>');
        } else if (avgCost < 0.8) {
            recommendations.push('<li>Вы получаете отличные сделки! Подумайте о Манилове для премиальных душ.</li>');
        }
        
        const purchasedCount = [...new Set(app.purchases.map(p => p.landlordName))].length;
        if (purchasedCount < 3) {
            recommendations.push('<li>Диверсифицируйте свой портфель, покупая у большего количества помещиков.</li>');
        }
    }
    
    if (app.totalSouls > 200) {
        recommendations.push('<li>Отлично! Вы строите грозную империю душ.</li>');
    }
    
    return recommendations.join('');
}

// Export functions
window.initializeAnalytics = initializeAnalytics;
window.refreshAnalytics = refreshAnalytics;
window.showLandlordDetails = showLandlordDetails;
window.exportAnalyticsData = exportAnalyticsData;
window.generateMarketReport = generateMarketReport;
