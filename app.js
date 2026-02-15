/* =============================================
   Mombasa Vibe Hotel — Application Logic
   ============================================= */

(function () {
  'use strict';

  // ---------- Fallback Menu Data ----------
  const FALLBACK_MENU = {
    "categories": [
      {
        "id": "seafood", "name": "Seafood Platters", "icon": "🦐",
        "items": [
          { "id": "sf1", "name": "Seafood Platter", "description": "Grilled prawns, calamari, fish fillet, and crab claws served with coconut rice", "price": 2800, "image": "seafood-platter.png", "popular": true },
          { "id": "sf2", "name": "Grilled Lobster Tail", "description": "Fresh lobster tail grilled with garlic butter and served with seasonal vegetables", "price": 3500, "image": "lobster.png", "popular": false },
          { "id": "sf3", "name": "Coconut Prawns", "description": "Jumbo prawns cooked in rich coconut cream and Swahili spices", "price": 1800, "image": "coconut-prawns.png", "popular": true },
          { "id": "sf4", "name": "Fish Tikka", "description": "Marinated fish chunks grilled in tandoori spices with mint chutney", "price": 1500, "image": "fish-tikka.png", "popular": false }
        ]
      },
      {
        "id": "swahili", "name": "Swahili Dishes", "icon": "🍛",
        "items": [
          { "id": "sw1", "name": "Biryani ya Kuku", "description": "Aromatic chicken biryani cooked with saffron, cardamom, and coastal spices", "price": 1200, "image": "biryani.png", "popular": true },
          { "id": "sw2", "name": "Pilau Nyama", "description": "Spiced meat pilau with caramelized onions and whole spices", "price": 1000, "image": "pilau.png", "popular": false },
          { "id": "sw3", "name": "Mbaazi za Nazi", "description": "Pigeon peas in coconut sauce served with freshly baked chapati", "price": 600, "image": "mbaazi.png", "popular": false },
          { "id": "sw4", "name": "Swahili Fish Curry", "description": "Tender fish simmered in a rich tamarind and coconut curry", "price": 1400, "image": "fish-curry.png", "popular": true }
        ]
      },
      {
        "id": "grilled", "name": "Grilled Specials", "icon": "🔥",
        "items": [
          { "id": "gr1", "name": "Mishkaki Platter", "description": "Assorted grilled meat skewers with kachumbari and ugali", "price": 1600, "image": "mishkaki.png", "popular": true },
          { "id": "gr2", "name": "Nyama Choma", "description": "Slow-roasted goat ribs with traditional accompaniments", "price": 1800, "image": "nyama-choma.png", "popular": true },
          { "id": "gr3", "name": "Grilled Chicken Quarter", "description": "Flame-grilled chicken marinated in coastal herbs and lime", "price": 900, "image": "grilled-chicken.png", "popular": false }
        ]
      },
      {
        "id": "drinks", "name": "Drinks & Refreshments", "icon": "🥤",
        "items": [
          { "id": "dr1", "name": "Madafu (Fresh Coconut)", "description": "Chilled fresh coconut water served in the shell", "price": 200, "image": "madafu.png", "popular": true },
          { "id": "dr2", "name": "Tamarind Juice", "description": "Refreshing homemade tamarind juice with a hint of ginger", "price": 250, "image": "tamarind.png", "popular": false },
          { "id": "dr3", "name": "Passion Fruit Mocktail", "description": "Fresh passion fruit blended with mint and soda", "price": 350, "image": "passion-mocktail.png", "popular": false },
          { "id": "dr4", "name": "Dawa Cocktail", "description": "Signature Kenyan cocktail with honey, lime, and vodka", "price": 500, "image": "dawa.png", "popular": true }
        ]
      },
      {
        "id": "desserts", "name": "Desserts", "icon": "🍮",
        "items": [
          { "id": "ds1", "name": "Kashata", "description": "Traditional coconut and sugar confection", "price": 200, "image": "kashata.png", "popular": false },
          { "id": "ds2", "name": "Mandazi & Ice Cream", "description": "Freshly fried mandazi served with vanilla ice cream and honey drizzle", "price": 450, "image": "mandazi.png", "popular": true },
          { "id": "ds3", "name": "Halwa", "description": "Rich Swahili halwa dessert with cardamom and ghee", "price": 300, "image": "halwa.png", "popular": false }
        ]
      }
    ]
  };

  // ---------- State ----------
  const state = {
    menuData: null,
    activeCategory: 'all',
    likedItems: new Set(),
    selectedItems: []
  };

  const WHATSAPP_NUMBER = '254700000000';

  // ---------- DOM References ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initDemoBar();
    showSkeletons();
    loadMenu();
    initReservation();
    initWhatsAppLinks();
    initScrollEffects();
    initActiveNavTracking();
    setMinDate();
  });

  // ---------- Navigation ----------
  function initNav() {
    const toggle = $('#nav-toggle');
    const menu = $('#nav-menu');

    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const isActive = toggle.classList.toggle('active');
        menu.classList.toggle('active');
        toggle.setAttribute('aria-expanded', String(isActive));
        document.body.style.overflow = isActive ? 'hidden' : '';
      });

      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          toggle.classList.remove('active');
          menu.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }

    // Header scroll effect
    const header = $('#header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // ---------- Active Nav Link Tracking ----------
  function initActiveNavTracking() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-menu a');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.3, rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '64px'} 0px -40% 0px` });

    sections.forEach(section => observer.observe(section));
  }

  // ---------- Demo Bar ----------
  function initDemoBar() {
    const bar = $('#demo-bar');
    const closeBtn = $('#demo-close');

    // Only show demo bar if ?demo=1 is in the URL
    if (bar) {
      const params = new URLSearchParams(window.location.search);
      if (!params.has('demo')) {
        bar.classList.add('hidden');
      }
    }

    if (closeBtn && bar) {
      closeBtn.addEventListener('click', () => {
        bar.classList.add('hidden');
      });
    }
  }

  // ---------- Skeleton Loaders ----------
  function showSkeletons() {
    const grid = $('#menu-grid');
    if (!grid) return;
    let html = '';
    for (let i = 0; i < 6; i++) {
      html += `
      <div class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-body">
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>`;
    }
    grid.innerHTML = html;
  }

  // ---------- Menu ----------
  async function loadMenu() {
    try {
      const res = await fetch('data/menu.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.menuData = await res.json();
    } catch (err) {
      console.warn('Fetch failed, using fallback menu data:', err.message);
      state.menuData = FALLBACK_MENU;
    }

    renderMenuTabs();
    renderMenuGrid('all');
    renderPopularItems();
  }

  function renderMenuTabs() {
    const tabs = $('#menu-tabs');
    if (!tabs || !state.menuData) return;

    let html = '<button class="menu-tab active" data-category="all">All</button>';
    state.menuData.categories.forEach(cat => {
      html += `<button class="menu-tab" data-category="${cat.id}">${cat.icon} ${cat.name}</button>`;
    });
    tabs.innerHTML = html;

    tabs.querySelectorAll('.menu-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeCategory = tab.dataset.category;
        renderMenuGrid(state.activeCategory);
      });
    });
  }

  function renderMenuGrid(category) {
    const grid = $('#menu-grid');
    if (!grid || !state.menuData) return;

    let items = [];
    if (category === 'all') {
      state.menuData.categories.forEach(cat => {
        cat.items.forEach(item => {
          items.push({ ...item, categoryName: cat.name, categoryIcon: cat.icon });
        });
      });
    } else {
      const cat = state.menuData.categories.find(c => c.id === category);
      if (cat) {
        items = cat.items.map(item => ({
          ...item,
          categoryName: cat.name,
          categoryIcon: cat.icon
        }));
      }
    }

    grid.innerHTML = items.map(item => createMenuCard(item)).join('');

    // Attach heart listeners
    grid.querySelectorAll('.menu-card-heart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLike(btn.dataset.itemId);
        btn.classList.toggle('liked');
        btn.textContent = btn.classList.contains('liked') ? '❤️' : '🤍';
      });
    });

    // Attach "add" button listeners
    grid.querySelectorAll('.menu-card-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.dataset.itemId;
        const item = findItemById(id);
        if (item) {
          addToSelection(item);
          btn.textContent = '✓ Added';
          btn.classList.add('added');
          setTimeout(() => {
            btn.textContent = 'Add to Order';
            btn.classList.remove('added');
          }, 1500);
        }
      });
    });

    // Attach image error handlers
    grid.querySelectorAll('.menu-card-image img').forEach(img => {
      img.addEventListener('error', handleImageError);
    });

    // Animate cards
    animateCards(grid.querySelectorAll('.menu-card'));
  }

  function createMenuCard(item) {
    const isLiked = state.likedItems.has(item.id);
    const imgSrc = item.image ? `images/${item.image}` : '';

    return `
    <div class="menu-card" data-item-id="${item.id}">
      <div class="menu-card-image">
        ${imgSrc ? `<img src="${imgSrc}" alt="${item.name}" loading="lazy">` : ''}
        ${item.popular ? '<span class="menu-card-badge">Popular</span>' : ''}
        <button class="menu-card-heart ${isLiked ? 'liked' : ''}" data-item-id="${item.id}">
          ${isLiked ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="menu-card-body">
        <h3 class="menu-card-name">${item.name}</h3>
        <p class="menu-card-desc">${item.description}</p>
        <div class="menu-card-footer">
          <div class="menu-card-price">
            KES ${item.price.toLocaleString()}
          </div>
          <button class="btn btn-outline btn-sm menu-card-add" data-item-id="${item.id}">
            Add to Order
          </button>
        </div>
      </div>
    </div>
  `;
  }

  function renderPopularItems() {
    const grid = $('#popular-grid');
    if (!grid || !state.menuData) return;

    let popular = [];
    state.menuData.categories.forEach(cat => {
      cat.items.filter(i => i.popular).forEach(item => {
        popular.push({ ...item, categoryName: cat.name, categoryIcon: cat.icon });
      });
    });

    grid.innerHTML = popular.slice(0, 6).map(item => {
      const imgSrc = item.image ? `images/${item.image}` : '';
      return `
    <div class="popular-card">
      <div class="popular-card-icon">
        ${imgSrc ? `<img src="${imgSrc}" alt="${item.name}" loading="lazy">` : item.categoryIcon}
      </div>
      <div class="popular-card-info">
        <h3 class="popular-card-name">${item.name}</h3>
        <p class="popular-card-category">${item.categoryName}</p>
      </div>
      <div class="popular-card-price">KES ${item.price.toLocaleString()}</div>
    </div>
  `;
    }).join('');

    // Attach image error handlers
    grid.querySelectorAll('.popular-card-icon img').forEach(img => {
      img.addEventListener('error', handleImageError);
    });

    animateCards(grid.querySelectorAll('.popular-card'));
  }

  // ---------- Image Error Handling ----------
  function handleImageError(e) {
    const img = e.target;
    const parent = img.parentElement;
    img.remove();
    parent.classList.add('img-error');
    if (!parent.textContent.trim()) {
      parent.textContent = '🍽️';
    }
  }

  // ---------- Likes / Selection ----------
  function toggleLike(itemId) {
    if (state.likedItems.has(itemId)) {
      state.likedItems.delete(itemId);
    } else {
      state.likedItems.add(itemId);
    }
  }

  function addToSelection(item) {
    const existing = state.selectedItems.find(i => i.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      state.selectedItems.push({ ...item, qty: 1 });
    }
    updateSelectionUI();
  }

  function updateSelectionUI() {
    const summary = $('#selected-items-summary');
    const list = $('#selected-items-list');
    const total = $('#selected-total');

    if (!summary || !list || !total) return;

    if (state.selectedItems.length === 0) {
      summary.style.display = 'none';
      return;
    }

    summary.style.display = 'block';
    list.innerHTML = state.selectedItems.map(item =>
      `<li><span>${item.name} x${item.qty}</span><span>KES ${(item.price * item.qty).toLocaleString()}</span></li>`
    ).join('');

    const totalAmount = state.selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    total.textContent = `Total: KES ${totalAmount.toLocaleString()}`;
  }

  function findItemById(id) {
    if (!state.menuData) return null;
    for (const cat of state.menuData.categories) {
      const item = cat.items.find(i => i.id === id);
      if (item) return { ...item, categoryName: cat.name };
    }
    return null;
  }

  // ---------- Reservation ----------
  function initReservation() {
    const form = $('#reservation-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = $('#guest-name').value.trim();
      const date = $('#guest-date').value;
      const time = $('#guest-time').value;
      const guests = $('#guest-count').value;
      const phone = $('#guest-phone').value.trim();
      const notes = $('#guest-notes').value.trim();

      // Validate phone — supports 07xx, 01xx, +2547xx, +2541xx
      const phoneRegex = /^(\+254|0)[01][0-9]\d{7}$/;
      const cleanPhone = phone.replace(/\s/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        showFormError('#guest-phone', 'Please enter a valid Kenyan phone number (e.g., 0712 345 678 or 0112 345 678)');
        return;
      }

      // Build WhatsApp message
      let message = `🌊 *MOMBASA VIBE HOTEL — Table Reservation*\n\n`;
      message += `👤 *Name:* ${name}\n`;
      message += `📅 *Date:* ${formatDate(date)}\n`;
      message += `🕐 *Time:* ${time}\n`;
      message += `👥 *Guests:* ${guests}\n`;
      message += `📱 *Phone:* ${cleanPhone}\n`;

      if (state.selectedItems.length > 0) {
        message += `\n🍽️ *Pre-selected Items:*\n`;
        let total = 0;
        state.selectedItems.forEach(item => {
          const subtotal = item.price * item.qty;
          message += `  • ${item.name} x${item.qty} — KES ${subtotal.toLocaleString()}\n`;
          total += subtotal;
        });
        message += `\n💰 *Estimated Total:* KES ${total.toLocaleString()}\n`;
      }

      if (notes) {
        message += `\n📝 *Special Requests:* ${notes}\n`;
      }

      message += `\n_Sent from Mombasa Vibe Hotel website_`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    });
  }

  function showFormError(selector, message) {
    const input = $(selector);
    if (!input) return;
    input.focus();

    // Remove any existing error
    const existing = input.parentElement.querySelector('.form-error');
    if (existing) existing.remove();

    const errorEl = document.createElement('p');
    errorEl.className = 'form-error';
    errorEl.style.cssText = 'color:#e74c3c;font-size:0.8rem;margin-top:4px;';
    errorEl.textContent = message;
    input.parentElement.appendChild(errorEl);

    input.addEventListener('input', () => errorEl.remove(), { once: true });
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-KE', options);
  }

  function setMinDate() {
    const dateInput = $('#guest-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }
  }

  // ---------- WhatsApp Links ----------
  function initWhatsAppLinks() {
    const stickyWa = $('#sticky-whatsapp');
    if (stickyWa) {
      stickyWa.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I\'d like to know more about Mombasa Vibe Hotel. 🌊')}`;
    }

    $$('[data-wa-link]').forEach(link => {
      link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I\'d like to know more about Mombasa Vibe Hotel. 🌊')}`;
      link.target = '_blank';
      link.rel = 'noopener';
    });
  }

  // ---------- Scroll Effects ----------
  function initScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    $$('.section-header, .reservation-form, .reservation-info, .about-content, .about-image-grid').forEach(el => {
      el.classList.add('fade-in-element');
      observer.observe(el);
    });
  }

  function animateCards(cards) {
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 80);
    });
  }

})();
