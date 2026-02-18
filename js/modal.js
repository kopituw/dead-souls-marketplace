// Modal JavaScript - Modal Open/Close Logic

let currentModal = null;
let modalTimeout = null;

// Initialize modal system
function initializeModals() {
    setupModalEventListeners();
}

// Setup modal event listeners
function setupModalEventListeners() {
    // Close modal when clicking outside
    document.addEventListener('click', function(event) {
        const modal = document.getElementById('purchaseModal');
        if (modal && modal.classList.contains('show')) {
            const modalContent = modal.querySelector('.modal-content');
            if (!modalContent.contains(event.target)) {
                closeModal();
            }
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
    
    // Close button functionality
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
}

// Show purchase modal
function showPurchaseModal(purchase) {
    const modal = document.getElementById('purchaseModal');
    if (!modal) return;
    
    // Clear any existing timeout first
    if (modalTimeout) {
        clearTimeout(modalTimeout);
        modalTimeout = null;
    }
    
    const landlord = landlords.find(l => l.id === purchase.landlordId);
    if (!landlord) return;
    
    // Update modal content
    updateModalContent(purchase, landlord);
    
    // Show modal with animation
    modal.classList.add('show', 'success');
    modal.classList.remove('closing');
    
    currentModal = modal;
    
    // Don't auto-close - let user close manually
    // modalTimeout = setTimeout(() => {
    //     closeModal();
    // }, 5000);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    console.log('Показано модальное окно покупки для:', purchase.landlordName);
}

// Update modal content
function updateModalContent(purchase, landlord) {
    const modalMessage = document.getElementById('modalMessage');
    if (!modalMessage) return;
    
    const date = new Date(purchase.timestamp);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    modalMessage.innerHTML = `
        <div class="purchase-details">
            <h3>🎊 Поздравляем!</h3>
            <p>Вы успешно приобрели души <strong class="landlord-name">${landlord.name}</strong>!</p>
            
            <div class="purchase-summary">
                <div class="summary-row">
                    <span class="label">Помещик:</span>
                    <span class="value">${landlord.name} - ${landlord.title}</span>
                </div>
                <div class="summary-row">
                    <span class="label">Приобретено душ:</span>
                    <span class="value souls-count">${purchase.souls} душ</span>
                </div>
                <div class="summary-row">
                    <span class="label">Цена за душу:</span>
                    <span class="value">₽${purchase.pricePerSoul.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span class="label">Общие инвестиции:</span>
                    <span class="value total-cost">₽${purchase.totalCost.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span class="label">Дата покупки:</span>
                    <span class="value">${formattedDate}</span>
                </div>
            </div>
            
            <div class="landlord-quote">
                <blockquote>
                    <em>"${landlord.quote}"</em>
                    <footer>— ${landlord.name}</footer>
                </blockquote>
            </div>
            
            <div class="next-steps">
                <p><strong>Следующие шаги:</strong></p>
                <ul>
                    <li>Посетите свой <a href="#" onclick="showSection('cabinet'); closeModal(); return false;">Личный Кабинет</a> чтобы посмотреть свою империю</li>
                    <li>Проверьте <a href="#" onclick="showSection('analytics'); closeModal(); return false;">Аналитику</a> для получения рыночной информации</li>
                    <li>Продолжайте покупки, чтобы расширить свою коллекцию</li>
                </ul>
            </div>
        </div>
    `;
}

// Show custom modal
function showModal(title, message, type = 'success', autoClose = true) {
    const modal = document.getElementById('purchaseModal');
    if (!modal) return;
    
    // Clear any existing timeout first
    if (modalTimeout) {
        clearTimeout(modalTimeout);
        modalTimeout = null;
    }
    
    // Update modal header
    const modalHeader = modal.querySelector('.modal-header h2');
    if (modalHeader) {
        modalHeader.textContent = title;
    }
    
    // Update modal body
    const modalMessage = document.getElementById('modalMessage');
    if (modalMessage) {
        modalMessage.innerHTML = message;
    }
    
    // Set modal type
    modal.className = 'modal show';
    modal.classList.add(type);
    modal.classList.remove('closing');
    
    currentModal = modal;
    
    // Auto-close only if specified and not a detailed modal
    if (autoClose) {
        modalTimeout = setTimeout(() => {
            closeModal();
        }, 3000);
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('purchaseModal');
    if (!modal || !modal.classList.contains('show')) return;
    
    // Clear auto-close timeout
    if (modalTimeout) {
        clearTimeout(modalTimeout);
        modalTimeout = null;
    }
    
    // Add closing animation
    modal.classList.add('closing');
    modal.classList.remove('success', 'error', 'warning');
    
    // Hide modal after animation
    setTimeout(() => {
        modal.classList.remove('show', 'closing');
        currentModal = null;
        
        // Restore body scroll
        document.body.style.overflow = '';
    }, 300);
    
    console.log('Модальное окно закрыто');
}

// Show error modal
function showErrorModal(title, message) {
    showModal(title, message, 'error', false);
}

// Show warning modal
function showWarningModal(title, message) {
    showModal(title, message, 'warning', false);
}

// Show confirmation modal
function showConfirmationModal(title, message, onConfirm, onCancel) {
    const modal = document.getElementById('purchaseModal');
    if (!modal) return;
    
    // Update modal content
    const modalHeader = modal.querySelector('.modal-header h2');
    const modalMessage = document.getElementById('modalMessage');
    const modalFooter = modal.querySelector('.modal-footer');
    
    if (modalHeader) {
        modalHeader.textContent = title;
    }
    
    if (modalMessage) {
        modalMessage.innerHTML = `<p>${message}</p>`;
    }
    
    if (modalFooter) {
        modalFooter.innerHTML = `
            <button class="modal-button confirm-button" onclick="handleConfirm()">Подтвердить</button>
            <button class="modal-button cancel-button" onclick="handleCancel()">Отмена</button>
        `;
    }
    
    // Store callbacks
    window.currentConfirmCallback = onConfirm;
    window.currentCancelCallback = onCancel;
    
    // Show modal
    modal.classList.add('show', 'warning');
    modal.classList.remove('closing');
    
    currentModal = modal;
    document.body.style.overflow = 'hidden';
}

// Handle confirmation
function handleConfirm() {
    if (window.currentConfirmCallback) {
        window.currentConfirmCallback();
    }
    closeModal();
    
    // Clean up callbacks
    window.currentConfirmCallback = null;
    window.currentCancelCallback = null;
}

// Handle cancellation
function handleCancel() {
    if (window.currentCancelCallback) {
        window.currentCancelCallback();
    }
    closeModal();
    
    // Clean up callbacks
    window.currentConfirmCallback = null;
    window.currentCancelCallback = null;
}

// Show loading modal
function showLoadingModal(message = 'Обработка...') {
    const modal = document.getElementById('purchaseModal');
    if (!modal) return;
    
    const modalHeader = modal.querySelector('.modal-header h2');
    const modalMessage = document.getElementById('modalMessage');
    const modalFooter = modal.querySelector('.modal-footer');
    
    if (modalHeader) {
        modalHeader.textContent = 'Пожалуйста, подождите';
    }
    
    if (modalMessage) {
        modalMessage.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }
    
    if (modalFooter) {
        modalFooter.style.display = 'none';
    }
    
    modal.classList.add('show');
    modal.classList.remove('closing');
    
    currentModal = modal;
    document.body.style.overflow = 'hidden';
}

// Hide loading modal
function hideLoadingModal() {
    const modalFooter = document.querySelector('.modal-footer');
    if (modalFooter) {
        modalFooter.style.display = 'block';
    }
    
    closeModal();
}

// Modal keyboard navigation
function setupModalKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        if (!currentModal || !currentModal.classList.contains('show')) return;
        
        switch (event.key) {
            case 'Tab':
                // Trap focus within modal
                event.preventDefault();
                focusModalElements();
                break;
            case 'Enter':
                // Trigger primary action
                const primaryButton = currentModal.querySelector('.modal-button:not(.cancel-button)');
                if (primaryButton) {
                    primaryButton.click();
                }
                break;
        }
    });
}

// Focus modal elements for accessibility
function focusModalElements() {
    if (!currentModal) return;
    
    const focusableElements = currentModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }
}

// Initialize modal system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeModals();
    setupModalKeyboardNavigation();
});

// Export functions
window.showPurchaseModal = showPurchaseModal;
window.showModal = showModal;
window.showErrorModal = showErrorModal;
window.showWarningModal = showWarningModal;
window.showConfirmationModal = showConfirmationModal;
window.showLoadingModal = showLoadingModal;
window.hideLoadingModal = hideLoadingModal;
window.closeModal = closeModal;
window.handleConfirm = handleConfirm;
window.handleCancel = handleCancel;
