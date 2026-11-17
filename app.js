/**
 * UNIQUE DENTAL CLINIC PVT. LTD. - JAVASCRIPT
 * Location: Chabahil Chowk, Kathmandu, Nepal
 * Managing Director: Dr. Barun Giri
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Live Operating Hours Status Badge
  initClinicStatus();

  // 2. Sticky Header Animation & Scroll Spy
  initHeaderScroll();

  // 3. Mobile Navigation Drawer
  initMobileNav();

  // 4. Services Filter Tabs
  initServiceFilters();

  // 5. Interactive FAQ Accordion
  initFaqAccordion();
});

/**
 * Checks current time and updates Open/Closed badge
 * Hours: Monday - Sunday: 9:00 AM - 8:00 PM (20:00)
 */
function initClinicStatus() {
  const statusBadge = document.getElementById('clinic-status-badge');
  const statusText = document.getElementById('clinic-status-text');
  if (!statusBadge || !statusText) return;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const totalMinutes = currentHour * 60 + currentMinute;

  const openMinutes = 9 * 60; // 9:00 AM
  const closeMinutes = 20 * 60; // 8:00 PM

  if (totalMinutes >= openMinutes && totalMinutes < closeMinutes) {
    statusBadge.className = 'status-badge open';
    statusText.textContent = 'Open Today until 8:00 PM';
  } else {
    statusBadge.className = 'status-badge closed';
    statusText.textContent = 'Opens Tomorrow at 9:00 AM';
    const pulse = statusBadge.querySelector('.status-pulse');
    if (pulse) pulse.style.background = '#f59e0b';
  }
}

/**
 * Sticky header shadow and active link highlighting on scroll
 */
function initHeaderScroll() {
  const header = document.getElementById('main-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Scrollspy
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });
}

/**
 * Mobile drawer toggle
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const isExpanded = navLinks.classList.contains('active');
    toggleBtn.setAttribute('aria-expanded', isExpanded);
    toggleBtn.innerHTML = isExpanded
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
  });

  // Close when clicking link
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Enhanced Services Directory Filter & Search:
 * Handles Category filter buttons, live search query, table vs card view switcher,
 * dynamic count updates, and empty state display.
 */
function initServiceFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('service-search-input');
  const searchClearBtn = document.getElementById('service-search-clear');
  const countBadge = document.getElementById('services-count');
  const resetLink = document.getElementById('services-reset-btn');
  const emptyState = document.getElementById('services-empty-state');
  const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
  const tableView = document.getElementById('services-table-view');
  const cardsView = document.getElementById('services-cards-view');

  const tableRows = document.querySelectorAll('.service-row');
  const serviceCards = document.querySelectorAll('.service-card');

  let activeCategory = 'all';
  let searchQuery = '';

  // 1. Category Filter Clicks
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });

  // 2. Search Input Handling
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (searchClearBtn) {
        searchClearBtn.style.display = searchQuery.length > 0 ? 'block' : 'none';
      }
      applyFilters();
    });

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClearBtn.style.display = 'none';
        searchInput.focus();
        applyFilters();
      });
    }
  }

  // 3. Reset Button Click
  if (resetLink) {
    resetLink.addEventListener('click', () => {
      activeCategory = 'all';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      if (searchClearBtn) searchClearBtn.style.display = 'none';

      filterBtns.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
      });

      applyFilters();
    });
  }

  // 4. View Switcher Toggle (Table vs Cards)
  viewToggleBtns.forEach(toggleBtn => {
    toggleBtn.addEventListener('click', () => {
      viewToggleBtns.forEach(b => b.classList.remove('active'));
      toggleBtn.classList.add('active');

      const targetView = toggleBtn.getAttribute('data-view');
      if (targetView === 'table') {
        if (tableView) tableView.style.display = 'block';
        if (cardsView) cardsView.style.display = 'none';
      } else {
        if (tableView) tableView.style.display = 'none';
        if (cardsView) cardsView.style.display = 'grid';
      }
    });
  });

  // Core Filtering Logic
  function applyFilters() {
    let visibleCount = 0;

    // Filter table rows
    tableRows.forEach(row => {
      const category = row.getAttribute('data-category') || '';
      const text = (row.textContent || '').toLowerCase();
      const matchesCategory = (activeCategory === 'all' || category === activeCategory);
      const matchesSearch = !searchQuery || text.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    // Filter cards
    serviceCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const text = (card.textContent || '').toLowerCase();
      const matchesCategory = (activeCategory === 'all' || category === activeCategory);
      const matchesSearch = !searchQuery || text.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    // Update Counter
    if (countBadge) {
      countBadge.textContent = visibleCount;
    }

    // Show/hide empty state
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    // Show/hide reset link if filters are active
    if (resetLink) {
      const isFiltered = activeCategory !== 'all' || searchQuery.length > 0;
      resetLink.style.display = isFiltered ? 'inline-block' : 'none';
    }
  }
}

/**
 * FAQ Accordion interaction
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close other FAQs
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });

      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });
}
