// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
const TELEGRAM_BOT_TOKEN = '8390510447:AAEbFNzynKe53aqAZpi94X1V32rWuIYsvVU';
const TELEGRAM_CHAT_ID = '1284056184';

// ========== КЛАСС КОРЗИНЫ ==========
class ShoppingCart {
    constructor() {
        this.items = [];
        this.promoCode = null;
        this.deliveryPrice = 200;
        this.minOrderAmount = 500;
        this.loadCart();
    }

    // Добавление товара
    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
            console.log(`✅ Увеличено количество: ${existingItem.name} - ${existingItem.quantity} шт`);
        } else {
            this.items.push({
                ...item,
                quantity: 1
            });
            console.log(`✅ Добавлен новый товар: ${item.name}`);
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showNotification(`✅ ${item.name} добавлено в корзину`);
        return true;
    }

    // Удаление товара
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartCount();
        this.showNotification(`🗑 Товар удален из корзины`);
    }

    // Изменение количества
    updateQuantity(itemId, quantity) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartCount();
                console.log(`✅ Количество изменено: ${item.name} - ${item.quantity} шт`);
            }
        }
    }

    // Очистка корзины
    clearCart() {
        this.items = [];
        this.promoCode = null;
        this.saveCart();
        this.updateCartCount();
    }

    // Подсчет суммы - ИСПРАВЛЕНО!
    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getTotal() {
        let total = this.getSubtotal();
        // Доставка ТОЛЬКО если сумма меньше минимальной
        if (total < this.minOrderAmount) {
            total += this.deliveryPrice;
        }
        return total;
    }

    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Сохранение в localStorage
    saveCart() {
        localStorage.setItem('maestroCart', JSON.stringify({
            items: this.items,
            promoCode: this.promoCode
        }));
    }

    // Загрузка из localStorage
    loadCart() {
        const saved = localStorage.getItem('maestroCart');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.items = data.items || [];
                this.promoCode = data.promoCode || null;
                console.log('📦 Загружена корзина:', this.items.length, 'товаров');
            } catch (e) {
                this.items = [];
            }
        }
    }

    // Обновление счетчика
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const total = this.getTotalItems();
            cartCount.textContent = total;
            cartCount.style.display = total > 0 ? 'flex' : 'none';
        }
    }

    // Уведомление
    showNotification(message) {
        let notification = document.querySelector('.cart-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'cart-notification';
            document.body.appendChild(notification);
        }
        
        notification.innerHTML = `<span style="color: #4CAF50; margin-right: 8px;">✓</span>${message}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ КОРЗИНЫ ==========
const cart = new ShoppingCart();

// ========== ГЛОБАЛЬНАЯ ФУНКЦИЯ ДОБАВЛЕНИЯ ==========
window.addToCart = function(product) {
    cart.addItem(product);
    
    // Анимация иконки корзины
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
    }
};

// ========== ОБРАБОТЧИК ДЛЯ КНОПОК "В КОРЗИНУ" ==========
function handleAddToCartClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const btn = e.currentTarget;
    
    if (btn.disabled) return;
    btn.disabled = true;
    setTimeout(() => { btn.disabled = false; }, 500);
    
    const card = btn.closest('.gor1, .gor2, .gor3, .gor4, .gor5');
    if (!card) {
        btn.disabled = false;
        return;
    }
    
    const img = card.querySelector('.gorphoto');
    const titleEl = card.querySelector('.gorzag span');
    const priceEl = card.querySelector('.gorcena');
    
    if (!titleEl || !priceEl) {
        btn.disabled = false;
        return;
    }
    
    let price = priceEl.textContent.replace('₽', '').trim();
    if (price.includes('/')) {
        price = price.split('/')[0].trim();
    }
    price = parseInt(price.replace(/\s/g, '')) || 0;
    
    // Используем data-product-id если есть, иначе генерируем из названия
    let productId = btn.dataset.productId;
    if (!productId) {
        productId = `product-${titleEl.textContent.trim()}-${price}`
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .toLowerCase();
    }
    
    const product = {
        id: productId,
        name: titleEl.textContent.trim(),
        price: price,
        image: img?.src || '',
        description: card.querySelector('.goropisanie')?.textContent?.trim() || ''
    };
    
    console.log('🛒 Добавляем товар:', product);
    window.addToCart(product);
    
    btn.style.backgroundColor = '#4CAF50';
    btn.textContent = '✓ Добавлено';
    btn.classList.add('added');
    
    setTimeout(() => {
        btn.style.backgroundColor = '#8B0000';
        btn.textContent = 'В корзину';
        btn.classList.remove('added');
    }, 1000);
}

// ========== ФУНКЦИИ ДЛЯ СТРАНИЦЫ КОРЗИНЫ ==========
function renderCartPage() {
    console.log('🔄 Рендеринг страницы корзины');
    
    const cartEmpty = document.getElementById('cartEmpty');
    const cartContent = document.getElementById('cartContent');
    const cartItems = document.getElementById('cartItems');
    const cartTotalItems = document.getElementById('cartTotalItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    const orderTotalModal = document.getElementById('orderTotalModal');

    cart.updateCartCount();

    if (cart.items.length === 0) {
        if (cartEmpty) cartEmpty.style.display = 'flex';
        if (cartContent) cartContent.style.display = 'none';
        return;
    } else {
        if (cartEmpty) cartEmpty.style.display = 'none';
        if (cartContent) cartContent.style.display = 'grid';
    }

    if (cartItems) {
        cartItems.innerHTML = cart.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-product">
                    <img class="cart-product-img" src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.png'">
                    <div class="cart-product-info">
                        <h4>${item.name}</h4>
                        <p class="cart-product-desc">${item.description || ''}</p>
                    </div>
                </div>
                <div class="cart-price">${item.price} ₽</div>
                <div class="cart-quantity">
                    <button class="cart-quantity-btn minus-btn" data-id="${item.id}">−</button>
                    <input type="number" class="cart-quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                    <button class="cart-quantity-btn plus-btn" data-id="${item.id}">+</button>
                </div>
                <div class="cart-item-total">${item.price * item.quantity} ₽</div>
                <div class="cart-remove">
                    <button class="cart-remove-btn" data-id="${item.id}">×</button>
                </div>
            </div>
        `).join('');
    }

    const subtotal = cart.getSubtotal();
    const total = cart.getTotal();
    const totalItems = cart.getTotalItems();

    if (cartTotalItems) cartTotalItems.textContent = totalItems;
    if (cartSubtotal) cartSubtotal.textContent = `${subtotal} ₽`;
    if (cartTotal) cartTotal.textContent = `${total} ₽`;
    if (orderTotalModal) orderTotalModal.textContent = `${total} ₽`;
    
    attachCartEvents();
}

function attachCartEvents() {
    document.querySelectorAll('.minus-btn').forEach(btn => {
        btn.removeEventListener('click', handleMinus);
        btn.addEventListener('click', handleMinus);
    });
    
    document.querySelectorAll('.plus-btn').forEach(btn => {
        btn.removeEventListener('click', handlePlus);
        btn.addEventListener('click', handlePlus);
    });
    
    document.querySelectorAll('.cart-quantity-input').forEach(input => {
        input.removeEventListener('change', handleQuantityChange);
        input.addEventListener('change', handleQuantityChange);
        input.removeEventListener('input', handleQuantityInput);
        input.addEventListener('input', handleQuantityInput);
    });
    
    document.querySelectorAll('.cart-remove-btn').forEach(btn => {
        btn.removeEventListener('click', handleRemove);
        btn.addEventListener('click', handleRemove);
    });
}

function handleMinus(e) {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    const item = cart.items.find(i => i.id === id);
    if (item) {
        cart.updateQuantity(id, item.quantity - 1);
        renderCartPage();
    }
}

function handlePlus(e) {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    const item = cart.items.find(i => i.id === id);
    if (item) {
        cart.updateQuantity(id, item.quantity + 1);
        renderCartPage();
    }
}

function handleQuantityChange(e) {
    const id = e.currentTarget.dataset.id;
    let value = parseInt(e.currentTarget.value);
    if (isNaN(value) || value < 1) {
        value = 1;
        e.currentTarget.value = 1;
    }
    cart.updateQuantity(id, value);
    renderCartPage();
}

function handleQuantityInput(e) {
    let value = e.currentTarget.value.replace(/\D/g, '');
    if (value === '') value = '1';
    e.currentTarget.value = value;
}

function handleRemove(e) {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    cart.removeItem(id);
    renderCartPage();
}

// ========== ВАЛИДАЦИЯ ФОРМЫ ЗАКАЗА ==========
function validateOrderForm() {
    let isValid = true;
    
    const name = document.getElementById('orderName');
    const nameError = document.getElementById('orderName-error');
    if (!name.value.trim()) {
        nameError.textContent = 'Введите имя';
        nameError.style.display = 'block';
        name.classList.add('input-error');
        isValid = false;
    } else if (name.value.trim().length < 2) {
        nameError.textContent = 'Имя должно содержать минимум 2 символа';
        nameError.style.display = 'block';
        name.classList.add('input-error');
        isValid = false;
    } else {
        nameError.style.display = 'none';
        name.classList.remove('input-error');
    }
    
    const phone = document.getElementById('orderPhone');
    const phoneError = document.getElementById('orderPhone-error');
    const phoneDigits = phone.value.replace(/\D/g, '');
    if (!phone.value.trim()) {
        phoneError.textContent = 'Введите телефон';
        phoneError.style.display = 'block';
        phone.classList.add('input-error');
        isValid = false;
    } else if (phoneDigits.length !== 11) {
        phoneError.textContent = 'Телефон должен содержать 11 цифр';
        phoneError.style.display = 'block';
        phone.classList.add('input-error');
        isValid = false;
    } else if (!phoneDigits.startsWith('7') && !phoneDigits.startsWith('8')) {
        phoneError.textContent = 'Телефон должен начинаться с 7 или 8';
        phoneError.style.display = 'block';
        phone.classList.add('input-error');
        isValid = false;
    } else {
        phoneError.style.display = 'none';
        phone.classList.remove('input-error');
    }
    
    const address = document.getElementById('orderAddress');
    const addressError = document.getElementById('orderAddress-error');
    if (!address.value.trim()) {
        addressError.textContent = 'Введите адрес доставки';
        addressError.style.display = 'block';
        address.classList.add('input-error');
        isValid = false;
    } else if (address.value.trim().length < 5) {
        addressError.textContent = 'Введите полный адрес';
        addressError.style.display = 'block';
        address.classList.add('input-error');
        isValid = false;
    } else {
        addressError.style.display = 'none';
        address.classList.remove('input-error');
    }
    
    return isValid;
}

// ========== ФОРМАТИРОВАНИЕ ТЕЛЕФОНА ==========
function formatOrderPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    if (value.length > 0 && !(value.startsWith('7') || value.startsWith('8'))) value = '7' + value;
    
    if (value.length === 11) {
        const code = value.startsWith('7') ? '+7' : '8';
        input.value = `${code} (${value.substring(1, 4)}) ${value.substring(4, 7)}-${value.substring(7, 9)}-${value.substring(9, 11)}`;
    } else if (value.length > 1) {
        const code = value.startsWith('7') ? '+7' : '8';
        input.value = `${code} (${value.substring(1, 4)}`;
        if (value.length > 4) input.value += `) ${value.substring(4)}`;
    } else if (value.length === 1) {
        input.value = value === '7' ? '+7' : '8';
    }
}

// ========== ОТПРАВКА ЗАКАЗА В TELEGRAM ==========
function sendOrderToTelegram(orderData) {
    const itemsList = orderData.items.map(item => 
        `• ${item.name} — ${item.quantity} шт × ${item.price} ₽ = ${item.quantity * item.price} ₽`
    ).join('\n');
    
    const message = `🛒 НОВЫЙ ЗАКАЗ\n\n` +
        `👤 Клиент: ${orderData.name}\n` +
        `📞 Телефон: ${orderData.phone}\n` +
        `📍 Адрес: ${orderData.address}\n` +
        `💬 Комментарий: ${orderData.comment || 'Нет'}\n\n` +
        `📦 СОСТАВ ЗАКАЗА:\n${itemsList}\n\n` +
        `💰 Сумма заказа: ${orderData.total} ₽\n` +
        `🕐 Время заказа: ${new Date().toLocaleString('ru-RU')}`;
    
    return fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            chat_id: TELEGRAM_CHAT_ID, 
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Telegram response:', data);
        return data.ok === true;
    })
    .catch(error => {
        console.error('Telegram error:', error);
        return false;
    });
}

// ========== ФУНКЦИИ ДЛЯ ФОРМЫ БРОНИРОВАНИЯ ==========
function createErrorElement(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return null;
    
    let errorElement = input.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.id = inputId + '-error';
        input.parentNode.appendChild(errorElement);
    }
    return errorElement;
}

function showError(inputId, message) {
    const errorElement = document.getElementById(inputId + '-error') || createErrorElement(inputId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        const input = document.getElementById(inputId);
        if (input) input.classList.add('input-error');
    }
}

function hideError(inputId) {
    const errorElement = document.getElementById(inputId + '-error');
    if (errorElement) {
        errorElement.style.display = 'none';
        const input = document.getElementById(inputId);
        if (input) input.classList.remove('input-error');
    }
}

function clearAllErrors() {
    ['name', 'fam', 'tel', 'data', 'clock', 'gost'].forEach(field => hideError(field));
}

function validateName() {
    const name = document.getElementById('name')?.value.trim();
    if (!name) { showError('name', 'Введите ваше имя'); return false; }
    if (name.length < 2) { showError('name', 'Имя должно содержать минимум 2 символа'); return false; }
    hideError('name'); return true;
}

function validateFam() {
    const fam = document.getElementById('fam')?.value.trim();
    if (!fam) { showError('fam', 'Введите вашу фамилию'); return false; }
    if (fam.length < 2) { showError('fam', 'Фамилия должна содержать минимум 2 символа'); return false; }
    hideError('fam'); return true;
}

function validateTel() {
    const tel = document.getElementById('tel')?.value.trim();
    if (!tel) { showError('tel', 'Введите ваш телефон'); return false; }
    const phoneDigits = tel.replace(/\D/g, '');
    if (phoneDigits.length !== 11) { showError('tel', 'Телефон должен содержать 11 цифр'); return false; }
    if (!(phoneDigits.startsWith('7') || phoneDigits.startsWith('8'))) { showError('tel', 'Телефон должен начинаться с 7 или 8'); return false; }
    hideError('tel'); return true;
}

function validateData() {
    const data = document.getElementById('data')?.value;
    if (!data) { showError('data', 'Введите дату мероприятия'); return false; }
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(data)) { showError('data', 'Формат даты: дд.мм.гггг'); return false; }
    const [day, month, year] = data.split('.').map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) { 
        showError('data', 'Неправильная дата'); return false; 
    }
    const today = new Date(); 
    today.setHours(0, 0, 0, 0);
    if (date < today) { showError('data', 'Дата не может быть в прошлом'); return false; }
    hideError('data'); return true;
}

function validateClock() {
    const clock = document.getElementById('clock')?.value;
    if (!clock) { showError('clock', 'Введите время мероприятия'); return false; }
    if (!/^\d{2}:\d{2}$/.test(clock)) { showError('clock', 'Формат времени: чч:мм'); return false; }
    const [hours, minutes] = clock.split(':').map(Number);
    if (hours < 0 || hours > 23) { showError('clock', 'Часы должны быть от 00 до 23'); return false; }
    if (minutes < 0 || minutes > 59) { showError('clock', 'Минуты должны быть от 00 до 59'); return false; }
    if (hours < 8 || hours > 22) { showError('clock', 'Время работы: с 08:00 до 22:00'); return false; }
    hideError('clock'); return true;
}

function validateGost() {
    const gost = document.getElementById('gost')?.value;
    if (!gost) { showError('gost', 'Введите количество гостей'); return false; }
    const guests = parseInt(gost);
    if (isNaN(guests) || !Number.isInteger(guests)) { showError('gost', 'Введите целое число'); return false; }
    if (guests < 20) { showError('gost', 'Минимум 20 гостей'); return false; }
    if (guests > 70) { showError('gost', 'Максимум 70 гостей'); return false; }
    hideError('gost'); return true;
}

function validateForm() {
    clearAllErrors();
    let isValid = true;
    if (!validateName()) isValid = false;
    if (!validateFam()) isValid = false;
    if (!validateTel()) isValid = false;
    if (!validateData()) isValid = false;
    if (!validateClock()) isValid = false;
    if (!validateGost()) isValid = false;
    return isValid;
}

function sendToTelegram(message) {
    return fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            chat_id: TELEGRAM_CHAT_ID, 
            text: message 
        })
    })
    .then(response => response.json())
    .then(data => data.ok === true)
    .catch(() => false);
}

function sendForm(event) {
    if (event) event.preventDefault();
    if (!validateForm()) {
        const firstError = document.querySelector('.field-error[style*="display: block"]');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
    }
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        fam: document.getElementById('fam').value.trim(),
        tel: document.getElementById('tel').value.trim(),
        data: document.getElementById('data').value,
        clock: document.getElementById('clock').value,
        gost: document.getElementById('gost').value
    };
    
    let formattedPhone = formData.tel;
    const phoneDigits = formData.tel.replace(/\D/g, '');
    if (phoneDigits.length === 11) {
        formattedPhone = phoneDigits.startsWith('7') ? '+7' : '8';
        formattedPhone += ` (${phoneDigits.substring(1, 4)}) ${phoneDigits.substring(4, 7)}-${phoneDigits.substring(7, 9)}-${phoneDigits.substring(9)}`;
    }
    
    const message = `🍽 НОВАЯ ЗАЯВКА НА БРОНИРОВАНИЕ\n\n` +
        `👤 Клиент: ${formData.name} ${formData.fam}\n` +
        `📞 Телефон: ${formattedPhone}\n` +
        `📅 Дата: ${formData.data}\n` +
        `⏰ Время: ${formData.clock}\n` +
        `👥 Гостей: ${formData.gost}\n\n` +
        `🕐 Время бронирования: ${new Date().toLocaleString('ru-RU')}`;
    
    const submitBtn = document.querySelector('.btnbron');
    const originalText = submitBtn?.textContent || 'Отправить';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
    }
    
    sendToTelegram(message)
        .then(success => {
            if (success) {
                showModal();
                document.getElementById('loginForm')?.reset();
                clearAllErrors();
            } else {
                alert('⚠️ Ошибка отправки. Пожалуйста, попробуйте еще раз или позвоните нам.');
            }
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    
    return false;
}

// ========== ТЕМНАЯ ТЕМА ==========
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// ========== КНОПКА НАВЕРХ ==========
function initGoTop() {
    const goTopBtn = document.querySelector(".go-top");
    if (!goTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            goTopBtn.classList.add('show');
        } else {
            goTopBtn.classList.remove('show');
        }
    });
    
    goTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM загружен, инициализация...');
    
    // ===== СЛАЙДЕР =====
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length > 0) {
        let currentSlide = 0;
        const totalSlides = slides.length;
        
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            if (index >= totalSlides) currentSlide = 0;
            if (index < 0) currentSlide = totalSlides - 1;
            
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }
        
        function nextSlide() {
            currentSlide++;
            if (currentSlide >= totalSlides) currentSlide = 0;
            showSlide(currentSlide);
        }
        
        function prevSlide() {
            currentSlide--;
            if (currentSlide < 0) currentSlide = totalSlides - 1;
            showSlide(currentSlide);
        }
        
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });
        
        setInterval(nextSlide, 10000);
        showSlide(currentSlide);
    }
    
    // ===== МОДАЛЬНЫЕ ОКНА (БРОНИРОВАНИЕ) =====
    const modalcontainer = document.getElementById('modalcontainer');
    const modalClose = document.getElementById('modalClose');
    const modalBtn = document.getElementById('modalBtn');
    
    window.showModal = function() {
        if (modalcontainer) {
            modalcontainer.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };
    
    window.hideModal = function() {
        if (modalcontainer) {
            modalcontainer.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    };
    
    if (modalClose) modalClose.addEventListener('click', hideModal);
    if (modalBtn) modalBtn.addEventListener('click', hideModal);
    
    if (modalcontainer) {
        modalcontainer.addEventListener('click', function(event) {
            if (event.target === modalcontainer) hideModal();
        });
    }
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modalcontainer?.classList.contains('active')) {
            hideModal();
        }
    });
    
    // ===== ФОРМАТИРОВАНИЕ ТЕЛЕФОНА (БРОНИРОВАНИЕ) =====
    const phoneInput = document.getElementById('tel');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            if (value.length > 0 && !(value.startsWith('7') || value.startsWith('8'))) value = '7' + value;
            
            if (value.length === 11) {
                const code = value.startsWith('7') ? '+7' : '8';
                e.target.value = `${code} (${value.substring(1, 4)}) ${value.substring(4, 7)}-${value.substring(7, 9)}-${value.substring(9, 11)}`;
            } else if (value.length > 1) {
                const code = value.startsWith('7') ? '+7' : '8';
                e.target.value = `${code} (${value.substring(1, 4)}`;
                if (value.length > 4) e.target.value += `) ${value.substring(4)}`;
            } else if (value.length === 1) {
                e.target.value = value === '7' ? '+7' : '8';
            }
            hideError('tel');
        });
    }
    
    // ===== ФОРМАТИРОВАНИЕ ДАТЫ =====
    const dateInput = document.getElementById('data');
    if (dateInput) {
        dateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.substring(0, 8);
            if (value.length >= 2) value = value.substring(0, 2) + '.' + value.substring(2);
            if (value.length >= 5) value = value.substring(0, 5) + '.' + value.substring(5);
            e.target.value = value;
            hideError('data');
        });
        
        dateInput.addEventListener('focus', function() {
            if (!this.value) this.placeholder = 'дд.мм.гггг';
        });
        
        dateInput.addEventListener('blur', function() {
            this.placeholder = 'Введите дату мероприятия';
        });
    }
    
    // ===== ФОРМАТИРОВАНИЕ ВРЕМЕНИ =====
    const timeInput = document.getElementById('clock');
    if (timeInput) {
        timeInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9:]/g, '').replace(/:/g, '');
            if (value.length > 4) value = value.substring(0, 4);
            if (value.length >= 3) value = value.substring(0, 2) + ':' + value.substring(2);
            e.target.value = value;
            if (value.length === 2 && !value.includes(':')) e.target.value = value + ':';
            hideError('clock');
        });
        
        timeInput.addEventListener('keydown', function(e) {
            if (!((e.key >= '0' && e.key <= '9') || e.key === 'Backspace' || e.key === 'Delete' || 
                  e.key === 'Tab' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
                  e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Home' || e.key === 'End')) {
                e.preventDefault();
            }
        });
    }
    
    // ===== ИНИЦИАЛИЗАЦИЯ ФОРМЫ БРОНИРОВАНИЯ =====
    ['name', 'fam', 'tel', 'data', 'clock', 'gost'].forEach(field => createErrorElement(field));
    
    const form = document.getElementById('loginForm');
    if (form) {
        const submitBtn = document.querySelector('.btnbron');
        if (submitBtn) submitBtn.addEventListener('click', sendForm);
        form.addEventListener('submit', sendForm);
        
        const fields = ['name', 'fam', 'tel', 'data', 'clock', 'gost'];
        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el) {
                el.addEventListener('input', () => hideError(field));
                el.addEventListener('blur', () => {
                    if (field === 'name') validateName();
                    if (field === 'fam') validateFam();
                    if (field === 'tel') validateTel();
                    if (field === 'data') validateData();
                    if (field === 'clock') validateClock();
                    if (field === 'gost') validateGost();
                });
            }
        });
    }
    
    // ===== ХЛЕБНЫЕ КРОШКИ =====
    const urlParams = new URLSearchParams(window.location.search);
    const fromButton = urlParams.get('from');
    const breadcrumbsElement = document.getElementById('breadcrumbs');
    if (breadcrumbsElement) {
        breadcrumbsElement.style.display = fromButton === 'button' ? 'flex' : 'none';
    }
    
    // ===== ТЕМНАЯ ТЕМА =====
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    const themeToggle = document.querySelector('.text222');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // ===== КНОПКА НАВЕРХ =====
    initGoTop();
    
    // ===== ИНИЦИАЛИЗАЦИЯ КОРЗИНЫ =====
    cart.updateCartCount();
    
    // ===== ИНИЦИАЛИЗАЦИЯ КНОПОК "В КОРЗИНУ" =====
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.removeEventListener('click', handleAddToCartClick);
        btn.addEventListener('click', handleAddToCartClick);
    });
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.classList?.contains('add-to-cart-btn')) {
                            node.removeEventListener('click', handleAddToCartClick);
                            node.addEventListener('click', handleAddToCartClick);
                        }
                        node.querySelectorAll?.('.add-to-cart-btn').forEach(btn => {
                            btn.removeEventListener('click', handleAddToCartClick);
                            btn.addEventListener('click', handleAddToCartClick);
                        });
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // ===== ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ КОРЗИНЫ =====
    if (document.getElementById('cartItems')) {
        console.log('🛒 Страница корзины, рендерим...');
        renderCartPage();
        
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                if (cart.items.length === 0) {
                    alert('Корзина пуста');
                    return;
                }
                
                // ИСПРАВЛЕНО: Проверяем subtotal, а не total!
                if (cart.getSubtotal() < 500) {
                    alert('Минимальная сумма заказа 500 ₽');
                    return;
                }
                
                const orderTotal = document.getElementById('orderTotalModal');
                if (orderTotal) orderTotal.textContent = `${cart.getTotal()} ₽`;
                
                const modal = document.getElementById('orderModal');
                if (modal) modal.classList.add('active');
            });
        }
        
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            const orderPhone = document.getElementById('orderPhone');
            if (orderPhone) {
                orderPhone.addEventListener('input', function() {
                    formatOrderPhone(this);
                    const error = document.getElementById('orderPhone-error');
                    if (error) error.style.display = 'none';
                    this.classList.remove('input-error');
                });
            }
            
            orderForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (!validateOrderForm()) {
                    const firstError = document.querySelector('#orderModal .field-error[style*="display: block"]');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    return;
                }
                
                const name = document.getElementById('orderName').value.trim();
                const phone = document.getElementById('orderPhone').value.trim();
                const address = document.getElementById('orderAddress').value.trim();
                const comment = document.getElementById('orderComment')?.value.trim() || '';
                
                const orderData = {
                    name: name,
                    phone: phone,
                    address: address,
                    comment: comment,
                    items: cart.items.map(item => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    })),
                    total: cart.getTotal()
                };
                
                console.log('📦 Отправка заказа:', orderData);
                
                const submitBtn = document.querySelector('#orderForm .btnbron');
                const originalText = submitBtn?.textContent || 'Подтвердить заказ';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Отправка...';
                }
                
                sendOrderToTelegram(orderData).then(success => {
                    if (success) {
                        document.getElementById('orderModal')?.classList.remove('active');
                        cart.clearCart();
                        renderCartPage();
                        
                        const successModal = document.getElementById('successModal');
                        if (successModal) successModal.classList.add('active');
                        
                        orderForm.reset();
                    } else {
                        alert('❌ Ошибка отправки заказа. Пожалуйста, попробуйте еще раз.');
                    }
                }).finally(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                });
            });
        }
        
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                document.getElementById('orderModal')?.classList.remove('active');
            });
        }
        
        const successModalClose = document.getElementById('successModalClose');
        if (successModalClose) {
            successModalClose.addEventListener('click', () => {
                document.getElementById('successModal')?.classList.remove('active');
            });
        }
        
        const continueShoppingBtn = document.getElementById('continueShoppingBtn');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                window.location.href = 'gor.html';
            });
        }
        
        const promoBtn = document.getElementById('promoBtn');
        if (promoBtn) {
            promoBtn.addEventListener('click', function() {
                const input = document.getElementById('promoInput');
                if (input.value === 'MAESTRO10') {
                    alert('✅ Промокод применен! Скидка 10%');
                } else {
                    alert('❌ Неверный промокод');
                }
            });
        }
    }
    
    console.log('✅ Инициализация завершена');
});