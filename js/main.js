// Main JavaScript - Initialization, Purchase Logic, localStorage Updates

// Application State
const app = {
    currentSection: 'home',
    purchases: [],
    totalSouls: 0,
    totalSpent: 0
};

// Landlord Data
const landlords = [
    {
        id: 1,
        name: 'Манилов',
        title: 'Мечтатель',
        souls: 38,
        pricePerSoul: 2.50,
        description: 'Джентльмен с изысканным вкусом и бесконечными мечтами',
        quote: 'Мой дорогой сэр, какая восхитительная возможность!',
        image: 'images/manilov.jpg',
        traits: ['мечтательный', 'вежливый', 'неэффективный']
    },
    {
        id: 2,
        name: 'Коробочка',
        title: 'Вдова',
        souls: 80,
        pricePerSoul: 1.25,
        description: 'Осторожная вдова, которая любит торговаться',
        quote: 'Мне нужно тщательно обдумать это...',
        image: 'images/korobochka.jpg',
        traits: ['осторожная', 'упрямая', 'практичная']
    },
    {
        id: 3,
        name: 'Ноздрев',
        title: 'Прохвост',
        souls: 115,
        pricePerSoul: 0.75,
        description: 'Безрассудный игрок и компульсивный лжец',
        quote: 'Выпьем за эту превосходную сделку!',
        image: 'images/nozdrev.jpg',
        traits: ['безрассудный', 'обаятельный', 'ненадёжный']
    },
    {
        id: 4,
        name: 'Плюшкин',
        title: 'Плюшкин',
        souls: 120,
        pricePerSoul: 0.40,
        description: 'Скупец, который всё собирает, но ничего не тратит',
        quote: 'Возьмите их, просто заберите их прочь!',
        image: 'images/plushkin.jpg',
        traits: ['жадный', 'паранойяльный', 'накопитель']
    },
    {
        id: 5,
        name: 'Собакевич',
        title: 'Медведь',
        souls: 100,
        pricePerSoul: 1.50,
        description: 'Грубый, прямолинейный человек с весом',
        quote: 'Честная сделка для честного человека.',
        image: 'images/sobakevich.jpg',
        traits: ['прямой', 'честный', 'основательный']
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load saved data from localStorage
    loadSavedData();
    
    // Set up navigation
    setupNavigation();
    
    // Initialize catalog
    if (typeof initializeCatalog === 'function') {
        initializeCatalog();
    }
    
    // Update personal cabinet
    updatePersonalCabinet();
    
    // Initialize analytics
    if (typeof initializeAnalytics === 'function') {
        initializeAnalytics();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('Рынок Мёртвых Душ успешно инициализирован!');
}

// Load saved data from localStorage
function loadSavedData() {
    const savedData = localStorage.getItem('deadSoulsMarketplace');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            app.purchases = data.purchases || [];
            app.totalSouls = data.totalSouls || 0;
            app.totalSpent = data.totalSpent || 0;
        } catch (error) {
            console.error('Error loading saved data:', error);
            resetData();
        }
    }
}

// Save data to localStorage
function saveData() {
    const dataToSave = {
        purchases: app.purchases,
        totalSouls: app.totalSouls,
        totalSpent: app.totalSpent,
        lastUpdated: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('deadSoulsMarketplace', JSON.stringify(dataToSave));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            showSection(targetSection);
        });
    });
}

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        app.currentSection = sectionId;
        
        // Update navigation active state
        updateNavigationActive(sectionId);
        
        // Refresh section-specific content
        if (sectionId === 'cabinet') {
            updatePersonalCabinet();
        } else if (sectionId === 'analytics') {
            if (typeof refreshAnalytics === 'function') {
                refreshAnalytics();
            }
        }
    }
}

// Update navigation active state
function updateNavigationActive(activeSectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${activeSectionId}`) {
            link.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            link.style.borderColor = 'var(--accent-color)';
        } else {
            link.style.backgroundColor = 'transparent';
            link.style.borderColor = 'transparent';
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            if (typeof sortCatalog === 'function') {
                sortCatalog(this.value);
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (typeof closeModal === 'function') {
                closeModal();
            }
        }
    });
}

// Purchase souls from landlord
function purchaseSouls(landlordId) {
    const landlord = landlords.find(l => l.id === landlordId);
    if (!landlord) return;
    
    const totalCost = landlord.souls * landlord.pricePerSoul;
    
    // Create purchase record
    const purchase = {
        id: Date.now(),
        landlordId: landlord.id,
        landlordName: landlord.name,
        souls: landlord.souls,
        pricePerSoul: landlord.pricePerSoul,
        totalCost: totalCost,
        timestamp: new Date().toISOString()
    };
    
    // Update application state
    app.purchases.push(purchase);
    app.totalSouls += landlord.souls;
    app.totalSpent += totalCost;
    
    // Save to localStorage
    saveData();
    
    // Show success modal
    if (typeof showPurchaseModal === 'function') {
        showPurchaseModal(purchase);
    }
    
    // Update UI
    updatePersonalCabinet();
    
    console.log(`Куплено ${landlord.souls} душ у ${landlord.name} за ₽${totalCost.toFixed(2)}`);
}

// Update personal cabinet display
function updatePersonalCabinet() {
    // Update stats
    const totalSoulsElement = document.getElementById('totalSouls');
    const totalSpentElement = document.getElementById('totalSpent');
    const landlordCountElement = document.getElementById('landlordCount');
    
    if (totalSoulsElement) {
        totalSoulsElement.textContent = app.totalSouls.toLocaleString();
    }
    
    if (totalSpentElement) {
        totalSpentElement.textContent = `₽${app.totalSpent.toFixed(2)}`;
    }
    
    if (landlordCountElement) {
        const uniqueLandlords = [...new Set(app.purchases.map(p => p.landlordName))];
        landlordCountElement.textContent = uniqueLandlords.length;
    }
    
    // Update purchase history
    updatePurchaseHistory();
}

// Update purchase history display
function updatePurchaseHistory() {
    const historyContainer = document.getElementById('purchaseHistory');
    if (!historyContainer) return;
    
    if (app.purchases.length === 0) {
        historyContainer.innerHTML = '<p class="empty-state">Покупок пока нет. Начните строить свою империю!</p>';
        return;
    }
    
    const historyHTML = app.purchases.slice().reverse().map(purchase => {
        const date = new Date(purchase.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        return `
            <div class="purchase-item">
                <div class="purchase-header">
                    <strong>${purchase.landlordName}</strong>
                    <span class="purchase-date">${formattedDate}</span>
                </div>
                <div class="purchase-details">
                    <span class="souls-count">${purchase.souls} душ</span>
                    <span class="price">₽${purchase.totalCost.toFixed(2)}</span>
                </div>
            </div>
        `;
    }).join('');
    
    historyContainer.innerHTML = historyHTML;
}

// Sell random soul (for fun)
function sellRandomSoul() {
    if (app.totalSouls === 0) {
        alert('У вас нет душ для продажи! Сначала купите несколько.');
        return;
    }
    
    const soulsToSell = Math.floor(Math.random() * Math.min(10, app.totalSouls)) + 1;
    const sellPrice = (Math.random() * 2 + 0.5).toFixed(2);
    const totalEarned = (soulsToSell * sellPrice).toFixed(2);
    
    app.totalSouls -= soulsToSell;
    app.totalSpent = Math.max(0, app.totalSpent - parseFloat(totalEarned));
    
    saveData();
    updatePersonalCabinet();
    
    alert(`Вы продали ${soulsToSell} душ за ₽${totalEarned}!`);
}

// Reset cabinet (clear all data)
function resetCabinet() {
    if (confirm('Вы уверены, что хотите сбросить кабинет? Это удалит всю историю покупок.')) {
        resetData();
        updatePersonalCabinet();
        
        if (typeof refreshAnalytics === 'function') {
            refreshAnalytics();
        }
        
        alert('Ваш кабинет был сброшен. Начните заново!');
    }
}

// Reset all application data
function resetData() {
    app.purchases = [];
    app.totalSouls = 0;
    app.totalSpent = 0;
    
    try {
        localStorage.removeItem('deadSoulsMarketplace');
    } catch (error) {
        console.error('Error resetting data:', error);
    }
}

// Get application statistics
function getStatistics() {
    const landlordStats = {};
    
    landlords.forEach(landlord => {
        const purchases = app.purchases.filter(p => p.landlordId === landlord.id);
        landlordStats[landlord.id] = {
            name: landlord.name,
            totalSouls: purchases.reduce((sum, p) => sum + p.souls, 0),
            totalRevenue: purchases.reduce((sum, p) => sum + p.totalCost, 0),
            purchaseCount: purchases.length
        };
    });
    
    return {
        landlordStats,
        totalPurchases: app.purchases.length,
        totalSouls: app.totalSouls,
        totalSpent: app.totalSpent
    };
}

// Export functions for other modules
window.app = app;
window.landlords = landlords;
window.purchaseSouls = purchaseSouls;
window.showSection = showSection;
window.sellRandomSoul = sellRandomSoul;
window.resetCabinet = resetCabinet;
window.getStatistics = getStatistics;
