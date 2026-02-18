// Catalog JavaScript - Generate Landlord Cards Dynamically

let currentSort = 'name';
let filteredLandlords = [...landlords];

// Initialize catalog
function initializeCatalog() {
    renderCatalog();
    setupCatalogEventListeners();
}

// Setup catalog event listeners
function setupCatalogEventListeners() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortCatalog(this.value);
        });
    }
}

// Render catalog cards
function renderCatalog() {
    const catalogGrid = document.getElementById('catalogGrid');
    if (!catalogGrid) return;
    
    if (filteredLandlords.length === 0) {
        catalogGrid.innerHTML = `
            <div class="empty-catalog">
                <h3>Нет доступных помещиков</h3>
                <p>Загляните позже для новых возможностей покупки душ!</p>
            </div>
        `;
        return;
    }
    
    const cardsHTML = filteredLandlords.map((landlord, index) => {
        const totalValue = landlord.souls * landlord.pricePerSoul;
        const isPurchased = app.purchases.some(p => p.landlordId === landlord.id);
        const featuredLandlord = landlord.id === 3; // Nozdrev is featured
        
        return `
            <div class="landlord-card ${isPurchased ? 'purchased' : ''} ${featuredLandlord ? 'featured' : ''}" 
                 data-landlord-id="${landlord.id}"
                 style="animation-delay: ${index * 0.1}s">
                
                <div class="card-header">
                    <h3 class="landlord-name">${landlord.name}</h3>
                    <p class="landlord-title">${landlord.title}</p>
                </div>
                
                <div class="card-image-container">
                    <img src="${landlord.image}" 
                         alt="${landlord.name}" 
                         class="card-image"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI0Y1RTZEMyIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOEI0NTEzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPjx0c3BhbiB4PSIxNTAiIGR5PSI4MCI+UG9ydHJhaXQ8L3RzcGFuPjx0c3BhbiB4PSIxNTAiIGR5PSIxMTAiPk9mPC90c3Bhbj48dHNwYW4geD0iMTUwIiBkeT0iMTQwIj4ke2xhbmRsb3JkLm5hbWV9PC90c3Bhbj48L3RleHQ+Cjwvc3ZnPg=='">
                </div>
                
                <div class="card-details">
                    <div class="detail-row">
                        <span class="detail-label">Доступно душ:</span>
                        <span class="detail-value souls-count">${landlord.souls}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Цена за душу:</span>
                        <span class="detail-value price-per-soul">₽${landlord.pricePerSoul.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Общая стоимость:</span>
                        <span class="detail-value total-value">₽${totalValue.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="card-description">
                    <p>${landlord.description}</p>
                </div>
                
                <div class="card-traits">
                    ${landlord.traits.map(trait => `<span class="trait">${trait}</span>`).join('')}
                </div>
                
                <div class="card-actions">
                    <button class="buy-button ${isPurchased ? 'purchased' : ''}" 
                            onclick="handlePurchase(${landlord.id})"
                            ${isPurchased ? 'disabled' : ''}>
                        ${isPurchased ? '✅ Уже куплено' : '🛒 Купить души'}
                    </button>
                </div>
                
                ${isPurchased ? '<div class="purchased-badge">ПРОДАНО</div>' : ''}
            </div>
        `;
    }).join('');
    
    catalogGrid.innerHTML = cardsHTML;
    
    // Add hover effects for quotes
    addQuoteTooltips();
}

// Add quote tooltips to cards
function addQuoteTooltips() {
    const cards = document.querySelectorAll('.landlord-card');
    
    cards.forEach(card => {
        const landlordId = parseInt(card.dataset.landlordId);
        const landlord = landlords.find(l => l.id === landlordId);
        
        if (landlord && landlord.quote) {
            card.setAttribute('title', `"${landlord.quote}"`);
            card.classList.add('has-quote');
        }
    });
}

// Handle purchase button click
function handlePurchase(landlordId) {
    const landlord = landlords.find(l => l.id === landlordId);
    if (!landlord) return;
    
    // Check if already purchased
    const isPurchased = app.purchases.some(p => p.landlordId === landlordId);
    if (isPurchased) {
        alert(`Вы уже купили души у ${landlord.name}!`);
        return;
    }
    
    // Show confirmation dialog
    const totalCost = landlord.souls * landlord.pricePerSoul;
    const confirmed = confirm(
        `Вы уверены, что хотите купить ${landlord.souls} душ у ${landlord.name} за ₽${totalCost.toFixed(2)}?`
    );
    
    if (confirmed) {
        purchaseSouls(landlordId);
    }
}

// Sort catalog
function sortCatalog(sortBy) {
    currentSort = sortBy;
    
    switch (sortBy) {
        case 'name':
            filteredLandlords.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'souls':
            filteredLandlords.sort((a, b) => b.souls - a.souls);
            break;
        case 'price':
            filteredLandlords.sort((a, b) => a.pricePerSoul - b.pricePerSoul);
            break;
        default:
            filteredLandlords.sort((a, b) => a.id - b.id);
    }
    
    renderCatalog();
}

// Filter catalog by search term
function filterCatalog(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        filteredLandlords = [...landlords];
    } else {
        const term = searchTerm.toLowerCase();
        filteredLandlords = landlords.filter(landlord => 
            landlord.name.toLowerCase().includes(term) ||
            landlord.title.toLowerCase().includes(term) ||
            landlord.description.toLowerCase().includes(term) ||
            landlord.traits.some(trait => trait.toLowerCase().includes(term))
        );
    }
    
    // Apply current sort
    sortCatalog(currentSort);
}

// Filter catalog by traits
function filterByTraits(selectedTraits) {
    if (!selectedTraits || selectedTraits.length === 0) {
        filteredLandlords = [...landlords];
    } else {
        filteredLandlords = landlords.filter(landlord =>
            selectedTraits.some(trait => landlord.traits.includes(trait))
        );
    }
    
    // Apply current sort
    sortCatalog(currentSort);
}

// Get landlord statistics
function getLandlordStats(landlordId) {
    const landlord = landlords.find(l => l.id === landlordId);
    if (!landlord) return null;
    
    const purchases = app.purchases.filter(p => p.landlordId === landlordId);
    
    return {
        landlord,
        purchaseCount: purchases.length,
        totalSoulsSold: purchases.reduce((sum, p) => sum + p.souls, 0),
        totalRevenue: purchases.reduce((sum, p) => sum + p.totalCost, 0),
        isPurchased: purchases.length > 0
    };
}

// Refresh catalog (call after purchases)
function refreshCatalog() {
    renderCatalog();
}

// Add search functionality (optional enhancement)
function addSearchFunctionality() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Поиск помещиков...';
    searchInput.className = 'search-input';
    
    const searchContainer = document.querySelector('.catalog-controls');
    if (searchContainer) {
        searchContainer.appendChild(searchInput);
        
        searchInput.addEventListener('input', function() {
            filterCatalog(this.value);
        });
    }
}

// Add trait filter functionality (optional enhancement)
function addTraitFilters() {
    const allTraits = [...new Set(landlords.flatMap(l => l.traits))];
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'trait-filters';
    
    allTraits.forEach(trait => {
        const checkbox = document.createElement('label');
        checkbox.innerHTML = `
            <input type="checkbox" value="${trait}" onchange="handleTraitFilterChange()">
            ${trait}
        `;
        filterContainer.appendChild(checkbox);
    });
    
    const controlsContainer = document.querySelector('.catalog-controls');
    if (controlsContainer) {
        controlsContainer.appendChild(filterContainer);
    }
}

// Handle trait filter change
function handleTraitFilterChange() {
    const checkboxes = document.querySelectorAll('.trait-filters input[type="checkbox"]:checked');
    const selectedTraits = Array.from(checkboxes).map(cb => cb.value);
    
    filterByTraits(selectedTraits);
}

// Export functions
window.initializeCatalog = initializeCatalog;
window.handlePurchase = handlePurchase;
window.sortCatalog = sortCatalog;
window.filterCatalog = filterCatalog;
window.refreshCatalog = refreshCatalog;
window.getLandlordStats = getLandlordStats;
