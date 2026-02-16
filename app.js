/* =============================================
   Mombasa Vibe Hotel — Application Logic
   ============================================= */

import { db } from './firebase-config.js';
import { collection, getDocs, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🍽️' },
  { id: 'Breakfast', name: 'Breakfast', icon: '☕' },
  { id: 'Lunch', name: 'Lunch', icon: '🍛' },
  { id: 'Dinner', name: 'Dinner', icon: '🌙' }
];

const state = {
  menuItems: [],
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
  loadMenu(); // Starts with loading state
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

  const header = $('#header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

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

function initDemoBar() {
  const bar = $('#demo-bar');
  const closeBtn = $('#demo-close');

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

// ---------- Menu ----------
async function loadMenu() {
  const grid = $('#menu-grid');
  const popularGrid = $('#popular-grid');

  // Show loading state
  if (grid) {
    grid.innerHTML = '<div class="loading-message">Tafadhali ngojea...</div>';
  }
  if (popularGrid) {
    popularGrid.innerHTML = '<div class="loading-message">Tafadhali ngojea...</div>';
  }

  try {
    const q = query(collection(db, "menu"));
    const querySnapshot = await getDocs(q);

    state.menuItems = [];
    querySnapshot.forEach((doc) => {
      state.menuItems.push({ id: doc.id, ...doc.data() });
    });

    renderMenuTabs();
    renderMenuGrid('all');
    renderPopularItems();
  } catch (err) {
    console.error('Error fetching menu:', err);
    if (grid) grid.innerHTML = '<div class="loading-message" style="color: #e74c3c;">Failed to load menu. Please check your connection.</div>';
    if (popularGrid) popularGrid.innerHTML = '';
  }
}

function renderMenuTabs() {
  const tabs = $('#menu-tabs');
  if (!tabs) return;

  let html = '';
  CATEGORIES.forEach(cat => {
    const activeClass = cat.id === 'all' ? 'active' : '';
    html += `<button class="menu-tab ${activeClass}" data-category="${cat.id}">${cat.icon} ${cat.name}</button>`;
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
  if (!grid) return;

  let items = state.menuItems;
  if (category !== 'all') {
    // Filter by category string (case-insensitive for safety)
    items = items.filter(item =>
      item.category && item.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (items.length === 0) {
    grid.innerHTML = '<div class="loading-message" style="font-size:1rem; opacity:0.7;">No items found in this category.</div>';
    return;
  }

  grid.innerHTML = items.map(item => createMenuCard(item)).join('');

  // Attach listeners
  attachCardListeners(grid);

  // Animate
  animateCards(grid.querySelectorAll('.menu-card'));
}

function createMenuCard(item) {
  const isLiked = state.likedItems.has(item.id);
  // Use image_url from Firestore, fallback to placeholder if missing
  const imgSrc = item.image_url || 'images/placeholder.png';

  return `
    <article class="menu-card" data-item-id="${item.id}" itemscope itemtype="https://schema.org/MenuItem">
      <div class="menu-card-image">
        <img src="${imgSrc}" alt="${item.name}" loading="lazy" itemprop="image">
        ${item.popular ? '<span class="menu-card-badge">Popular</span>' : ''}
        <button class="menu-card-heart ${isLiked ? 'liked' : ''}" data-item-id="${item.id}">
          ${isLiked ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="menu-card-body">
        <h3 class="menu-card-name" itemprop="name">${item.name}</h3>
        <p class="menu-card-desc" itemprop="description">${item.description || ''}</p>
        <div class="menu-card-footer">
          <div class="menu-card-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <meta itemprop="priceCurrency" content="KES">
            <span itemprop="price" content="${item.price}">KES ${Number(item.price).toLocaleString()}</span>
          </div>
          <button class="btn btn-outline btn-sm menu-card-add" data-item-id="${item.id}">
            Add to Order
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderPopularItems() {
  const grid = $('#popular-grid');
  if (!grid) return;

  // Since we don't have a specific "popular" field in the requirement example,
  // we'll just take the first 3 items or random ones.
  // Or check if 'popular' field exists (optional).
  // Let's just take the first 3 items for now to populate the section.
  const popular = state.menuItems.slice(0, 3);

  if (popular.length === 0) {
      grid.innerHTML = '<p style="text-align:center; color:var(--color-text-muted);">Check out our full menu above!</p>';
      return;
  }

  grid.innerHTML = popular.map(item => {
    const imgSrc = item.image_url || 'images/placeholder.png';
    // Find category icon
    const catObj = CATEGORIES.find(c => c.name.toLowerCase() === (item.category || '').toLowerCase()) || { icon: '🍽️' };

    return `
    <div class="popular-card">
      <div class="popular-card-icon">
        <img src="${imgSrc}" alt="${item.name}" loading="lazy">
      </div>
      <div class="popular-card-info">
        <h3 class="popular-card-name">${item.name}</h3>
        <p class="popular-card-category">${catObj.icon} ${item.category || 'Special'}</p>
      </div>
      <div class="popular-card-price">KES ${Number(item.price).toLocaleString()}</div>
    </div>
  `;
  }).join('');

  // Attach image error handlers
  grid.querySelectorAll('.popular-card-icon img').forEach(img => {
    img.addEventListener('error', handleImageError);
  });

  animateCards(grid.querySelectorAll('.popular-card'));
}

function attachCardListeners(container) {
  // Heart
  container.querySelectorAll('.menu-card-heart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleLike(btn.dataset.itemId);
      btn.classList.toggle('liked');
      btn.textContent = btn.classList.contains('liked') ? '❤️' : '🤍';
    });
  });

  // Add Button
  container.querySelectorAll('.menu-card-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.dataset.itemId;
      const item = state.menuItems.find(i => i.id === id);
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

  // Image Error
  container.querySelectorAll('.menu-card-image img').forEach(img => {
    img.addEventListener('error', handleImageError);
  });
}

function handleImageError(e) {
  const img = e.target;
  const parent = img.parentElement;
  img.style.display = 'none'; // Hide broken image
  parent.classList.add('img-error');
  if (!parent.innerText.trim()) {
    parent.innerText = '🍽️';
  }
}

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

    const phoneRegex = /^(\+254|0)[01][0-9]\d{7}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      showFormError('#guest-phone', 'Please enter a valid Kenyan phone number');
      return;
    }

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
