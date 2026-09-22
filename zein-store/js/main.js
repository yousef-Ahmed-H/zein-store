// ===== Main JavaScript File =====

var translations = {
  ar: {
    logoSub: "ستور",
    home: "الرئيسية",
    products: "المنتجات",
    about: "عني",
    contact: "اتصل بنا",
    heroTitle: "أناقتك تبدأ من هنا",
    heroDesc: "اكتشف مجموعتنا الجديدة من الملابس الرجالية الفاخرة",
    shopNow: "تسوق الآن",
    learnMore: "تعرف علينا",
    categories: "تصفح حسب الفئة",
    catShirts: "القمصان",
    catJackets: "الجاكيتات",
    catShoes: "الأحذية",
    catAccessories: "الإكسسوارات",
    bestSellers: "الأكثر مبيعاً",
    viewAll: "عرض الكل",
    featShipping: "شحن مجاني",
    featShippingDesc: "للطلبات أكثر من 500 جنيه",
    featPay: "الدفع عند الاستلام",
    featPayDesc: "آمن ومريح",
    featReplace: "استبدال مجاني",
    featReplaceDesc: "خلال 14 يوم",
    featQuality: "جودة عالية",
    featQualityDesc: "منتجات أصلية 100%",
    newsletterTitle: "اشترك في نشرتنا البريدية",
    newsletterDesc: "احصل على أحدث العروض والتخفيضات",
    emailPlaceholder: "بريدك الإلكتروني",
    subscribe: "اشترك",
    quickLinks: "روابط سريعة",
    contactInfo: "معلومات التواصل",
    footerDesc: "متجر الملابس الرجالية الأفضل في مصر",
    search: "بحث...",
    noResults: "لا توجد نتائج",
    resetFilters: "إعادة تعيين",
    addToCart: "أضف للسلة",
    cart: "السلة",
    emptyCart: "السلة فارغة",
    emptyCartDesc: "لم تقم بإضافة أي منتجات بعد",
    continueShopping: "متابعة التسوق"
  },
  en: {
    logoSub: "Store",
    home: "Home",
    products: "Products",
    about: "About",
    contact: "Contact",
    heroTitle: "Your Elegance Starts Here",
    heroDesc: "Discover our new collection of luxurious men's clothing",
    shopNow: "Shop Now",
    learnMore: "Learn More",
    categories: "Shop by Category",
    catShirts: "Shirts",
    catJackets: "Jackets",
    catShoes: "Shoes",
    catAccessories: "Accessories",
    bestSellers: "Best Sellers",
    viewAll: "View All",
    featShipping: "Free Shipping",
    featShippingDesc: "For orders over 500 EGP",
    featPay: "Cash on Delivery",
    featPayDesc: "Safe and convenient",
    featReplace: "Free Returns",
    featReplaceDesc: "Within 14 days",
    featQuality: "High Quality",
    featQualityDesc: "100% original products",
    newsletterTitle: "Subscribe to Our Newsletter",
    newsletterDesc: "Get the latest offers and discounts",
    emailPlaceholder: "Your email",
    subscribe: "Subscribe",
    quickLinks: "Quick Links",
    contactInfo: "Contact Info",
    footerDesc: "The best men's clothing store in Egypt",
    search: "Search...",
    noResults: "No results found",
    resetFilters: "Reset",
    addToCart: "Add to Cart",
    cart: "Cart",
    emptyCart: "Cart is Empty",
    emptyCartDesc: "You haven't added any products yet",
    continueShopping: "Continue Shopping"
  }
};

var currentLang = localStorage.getItem('zein-lang') || 'ar';

document.addEventListener('DOMContentLoaded', function() {
  // نستنى Firebase يحمل المنتجات الأول
  if (typeof loadProductsFromFirebase === 'function') {
    loadProductsFromFirebase(function() {
      initApp();
    });
  } else {
    initApp();
  }
});

function initApp() {
  setLanguage(currentLang);
  initDarkMode();
  initMobileMenu();
  updateCartBadge();
  
  if (document.getElementById('productsGrid')) {
    if (document.querySelector('.best-sellers')) {
      loadBestSellers();
    }
    if (document.querySelector('.products-page')) {
      initProductsPage();
    }
  }
  
  initFilters();
  initNewsletter();
  initScrollToTop();
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('zein-lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  var elements = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < elements.length; i++) {
    var key = elements[i].getAttribute('data-i18n');
    if (translations[lang][key]) {
      elements[i].textContent = translations[lang][key];
    }
  }
  
  var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
  for (var i = 0; i < placeholders.length; i++) {
    var key = placeholders[i].getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) {
      placeholders[i].placeholder = translations[lang][key];
    }
  }
  
  if (document.getElementById('productsGrid') && document.querySelector('.products-page')) {
    filterProducts();
  }
}

function toggleLanguage() {
  setLanguage(currentLang === 'ar' ? 'en' : 'ar');
}

function initDarkMode() {
  if (localStorage.getItem('zein-dark') === 'true') {
    document.body.classList.add('dark');
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');
  var isDark = document.body.classList.contains('dark');
  localStorage.setItem('zein-dark', isDark);
}

function initMobileMenu() {
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }
}

function showToast(message, type) {
  var container = document.getElementById('toastContainer');
  if (!container) return;
  
  var toast = document.createElement('div');
  toast.className = 'toast ' + (type || 'success');
  toast.innerHTML = '<span>' + message + '</span>';
  container.appendChild(toast);
  
  setTimeout(function() {
    toast.remove();
  }, 3000);
}

function updateCartBadge() {
  var cart = JSON.parse(localStorage.getItem('zein-cart') || '[]');
  var badge = document.getElementById('cartBadge');
  if (badge) {
    var total = 0;
    for (var i = 0; i < cart.length; i++) {
      total += cart[i].quantity;
    }
    badge.textContent = total;
    badge.style.display = total > 0 ? 'block' : 'none';
  }
}

function createProductCard(product) {
  var discount = Math.round((1 - product.price / product.oldPrice) * 100);
  var name = currentLang === 'ar' ? product.name.ar : product.name.en;
  var reviews = product.reviews || 0;
  var rating = product.rating || 0;
  
  var html = '<div class="product-card" onclick="window.location.href=\'product.html?id=' + product.id + '\'">';
  html += '<div class="product-image">';
  html += '<img src="' + product.image + '" alt="' + name + '" loading="lazy">';
  if (discount > 0) html += '<span class="product-badge">-' + discount + '%</span>';
  html += '</div>';
  html += '<div class="product-info">';
  html += '<span class="product-brand">' + product.brand + '</span>';
  html += '<h3 class="product-name">' + name + '</h3>';
  html += '<div class="product-rating"><span class="stars">' + '⭐'.repeat(Math.floor(rating)) + '</span> (' + reviews + ')</div>';
  html += '<div class="product-prices">';
  html += '<span class="current-price">' + product.price + ' ج.م</span>';
  if (product.oldPrice > product.price) html += '<span class="old-price">' + product.oldPrice + ' ج.م</span>';
  html += '</div>';
  html += '<button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(' + product.id + ')">🛒 ' + (currentLang === 'ar' ? 'أضف للسلة' : 'Add to Cart') + '</button>';
  html += '</div>';
  html += '</div>';
  
  return html;
}

function loadBestSellers() {
  var grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  var published = [];
  for (var i = 0; i < PRODUCTS_DATA.length; i++) {
    if (PRODUCTS_DATA[i].published !== false) published.push(PRODUCTS_DATA[i]);
  }
  
  var html = '';
  var count = Math.min(8, published.length);
  for (var i = 0; i < count; i++) {
    html += createProductCard(published[i]);
  }
  grid.innerHTML = html;
}

function initFilters() {
  var searchInput = document.getElementById('searchInput');
  var categoryFilter = document.getElementById('categoryFilter');
  var brandFilter = document.getElementById('brandFilter');
  var sortFilter = document.getElementById('sortFilter');
  var resetBtn = document.getElementById('resetFilters');
  
  if (searchInput) searchInput.addEventListener('input', filterProducts);
  if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
  if (brandFilter) brandFilter.addEventListener('change', filterProducts);
  if (sortFilter) sortFilter.addEventListener('change', filterProducts);
  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
}

function filterProducts() {
  var searchInput = document.getElementById('searchInput');
  var categoryFilter = document.getElementById('categoryFilter');
  var brandFilter = document.getElementById('brandFilter');
  var sortFilter = document.getElementById('sortFilter');
  
  var search = searchInput ? searchInput.value.toLowerCase() : '';
  var category = categoryFilter ? categoryFilter.value : '';
  var brand = brandFilter ? brandFilter.value : '';
  var sort = sortFilter ? sortFilter.value : 'default';
  
  var filtered = [];
  
  for (var i = 0; i < PRODUCTS_DATA.length; i++) {
    var p = PRODUCTS_DATA[i];
    if (p.published === false) continue;
    
    var match = true;
    
    if (search) {
      var nameAr = p.name.ar ? p.name.ar.toLowerCase() : '';
      var nameEn = p.name.en ? p.name.en.toLowerCase() : '';
      var brandName = p.brand ? p.brand.toLowerCase() : '';
      if (nameAr.indexOf(search) === -1 && nameEn.indexOf(search) === -1 && brandName.indexOf(search) === -1) {
        match = false;
      }
    }
    
    if (category && p.category !== category) match = false;
    if (brand && p.brand !== brand) match = false;
    
    if (match) filtered.push(p);
  }
  
  if (sort === 'priceLow') {
    filtered.sort(function(a, b) { return a.price - b.price; });
  } else if (sort === 'priceHigh') {
    filtered.sort(function(a, b) { return b.price - a.price; });
  } else if (sort === 'rating') {
    filtered.sort(function(a, b) { return b.rating - a.rating; });
  }
  
  var grid = document.getElementById('productsGrid');
  var noResults = document.getElementById('noResults');
  
  if (filtered.length === 0) {
    if (grid) grid.style.display = 'none';
    if (noResults) noResults.style.display = 'block';
  } else {
    if (grid) {
      grid.style.display = 'grid';
      var html = '';
      for (var i = 0; i < filtered.length; i++) {
        html += createProductCard(filtered[i]);
      }
      grid.innerHTML = html;
    }
    if (noResults) noResults.style.display = 'none';
  }
}

function resetAllFilters() {
  var searchInput = document.getElementById('searchInput');
  var categoryFilter = document.getElementById('categoryFilter');
  var brandFilter = document.getElementById('brandFilter');
  var sortFilter = document.getElementById('sortFilter');
  
  if (searchInput) searchInput.value = '';
  if (categoryFilter) categoryFilter.value = '';
  if (brandFilter) brandFilter.value = '';
  if (sortFilter) sortFilter.value = 'default';
  
  filterProducts();
}

function initProductsPage() {
  filterProducts();
}

function initNewsletter() {
  var form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast(currentLang === 'ar' ? 'تم الاشتراك بنجاح!' : 'Subscribed!');
      form.reset();
    });
  }
}

function initScrollToTop() {
  var btn = document.createElement('button');
  btn.className = 'scroll-top';
  btn.innerHTML = '↑';
  document.body.appendChild(btn);
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
  
  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('click', function(e) {
  if (e.target.closest('#langBtn')) toggleLanguage();
  if (e.target.closest('#darkModeBtn')) toggleDarkMode();
});