var currentLang = localStorage.getItem('zein-lang') || 'ar';

document.addEventListener('DOMContentLoaded', function() {
  // نستنى Firebase يحمل المنتجات الأول
  if (typeof loadProductsFromFirebase === 'function') {
    loadProductsFromFirebase(function() {
      loadProductDetail();
      loadRelatedProducts();
      updateCartBadge();
    });
  } else {
    loadProductDetail();
    loadRelatedProducts();
    updateCartBadge();
  }
});

function loadProductDetail() {
  var params = new URLSearchParams(window.location.search);
  var productId = parseInt(params.get('id'));
  var product = null;
  
  for (var i = 0; i < PRODUCTS_DATA.length; i++) {
    if (PRODUCTS_DATA[i].id === productId) {
      product = PRODUCTS_DATA[i];
      break;
    }
  }
  
  if (!product) {
    document.getElementById('productDetailGrid').innerHTML = '<div class="error-404"><h2>المنتج غير موجود</h2><a href="products.html" class="btn btn-primary">العودة للمنتجات</a></div>';
    return;
  }
  
  var name = currentLang === 'ar' ? product.name.ar : product.name.en;
  var desc = currentLang === 'ar' ? product.desc.ar : product.desc.en;
  var discount = Math.round((1 - product.price / product.oldPrice) * 100);
  
  var html = '';
  
  html += '<div class="product-gallery">';
  html += '<div class="main-image">';
  html += '<img src="' + product.image + '" alt="' + name + '" id="mainProductImage">';
  if (discount > 0) html += '<span class="discount-badge">-' + discount + '%</span>';
  html += '</div>';
  html += '</div>';
  
  html += '<div class="product-info-detail">';
  html += '<span class="product-brand-label">' + product.brand + '</span>';
  html += '<h1 class="product-title">' + name + '</h1>';
  
  html += '<div class="product-rating-detail">';
  html += '<span class="stars">' + '⭐'.repeat(Math.floor(product.rating)) + '</span>';
  html += '<span class="rating-text">' + product.rating + ' (' + product.reviews + ' تقييم)</span>';
  html += '</div>';
  
  html += '<div class="product-price-box">';
  html += '<span class="current-price-large">' + product.price + ' ج.م</span>';
  if (product.oldPrice > product.price) {
    html += '<span class="old-price-large">' + product.oldPrice + ' ج.م</span>';
    html += '<span class="save-badge">وفر ' + (product.oldPrice - product.price) + ' ج.م</span>';
  }
  html += '</div>';
  
  html += '<div class="product-description-box">';
  html += '<h4>📄 الوصف</h4>';
  html += '<p>' + desc + '</p>';
  html += '</div>';
  
  // الألوان
  html += '<div class="option-section">';
  html += '<h4>🎨 اختر اللون</h4>';
  html += '<div class="color-options">';
  if (product.colors && product.colors.length > 0) {
    for (var i = 0; i < product.colors.length; i++) {
      html += '<button class="color-btn' + (i === 0 ? ' active' : '') + '" style="background:' + product.colors[i] + '" onclick="selectColor(this)"></button>';
    }
  }
  html += '</div>';
  html += '</div>';
  
  // المقاسات
  html += '<div class="option-section">';
  html += '<h4>📏 اختر المقاس</h4>';
  html += '<div class="size-options">';
  if (product.sizes && product.sizes.length > 0) {
    for (var i = 0; i < product.sizes.length; i++) {
      html += '<button class="size-btn' + (i === 0 ? ' active' : '') + '" onclick="selectSize(this)">' + product.sizes[i] + '</button>';
    }
  }
  html += '</div>';
  html += '</div>';
  
  // الكمية
  html += '<div class="option-section">';
  html += '<h4>🔢 الكمية</h4>';
  html += '<div class="quantity-selector-large">';
  html += '<button class="qty-btn" onclick="changeQty(-1)">−</button>';
  html += '<input type="number" id="productQuantity" value="1" min="1" max="10" readonly>';
  html += '<button class="qty-btn" onclick="changeQty(1)">+</button>';
  html += '</div>';
  html += '</div>';
  
  // أزرار الشراء
  html += '<div class="product-actions-detail">';
  html += '<button class="btn btn-primary btn-lg" onclick="addToCartFromProduct()">🛒 أضف للسلة</button>';
  html += '<button class="btn btn-success btn-lg" onclick="buyNow()">⚡ اشتري الآن</button>';
  html += '</div>';
  
  html += '</div>';
  
  document.getElementById('productDetailGrid').innerHTML = html;
}

function selectColor(btn) {
  var btns = document.querySelectorAll('.color-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('active');
  }
  btn.classList.add('active');
}

function selectSize(btn) {
  var btns = document.querySelectorAll('.size-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.remove('active');
  }
  btn.classList.add('active');
}

function changeQty(change) {
  var input = document.getElementById('productQuantity');
  var val = parseInt(input.value) + change;
  if (val >= 1 && val <= 10) {
    input.value = val;
  }
}

function addToCartFromProduct() {
  var params = new URLSearchParams(window.location.search);
  var productId = parseInt(params.get('id'));
  var qty = parseInt(document.getElementById('productQuantity').value) || 1;
  
  var cart = JSON.parse(localStorage.getItem('zein-cart') || '[]');
  var found = false;
  
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === productId) {
      cart[i].quantity += qty;
      found = true;
      break;
    }
  }
  
  if (!found) {
    cart.push({ id: productId, quantity: qty });
  }
  
  localStorage.setItem('zein-cart', JSON.stringify(cart));
  updateCartBadge();
  alert('تمت الإضافة للسلة! ✅');
}

function buyNow() {
  addToCartFromProduct();
  window.location.href = 'cart.html';
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

function loadRelatedProducts() {
  var params = new URLSearchParams(window.location.search);
  var productId = parseInt(params.get('id'));
  
  var related = [];
  for (var i = 0; i < PRODUCTS_DATA.length; i++) {
    if (PRODUCTS_DATA[i].id !== productId && PRODUCTS_DATA[i].published !== false) {
      related.push(PRODUCTS_DATA[i]);
    }
    if (related.length >= 4) break;
  }
  
  var grid = document.getElementById('relatedProducts');
  if (!grid) return;
  
  var html = '';
  for (var i = 0; i < related.length; i++) {
    var p = related[i];
    var name = currentLang === 'ar' ? p.name.ar : p.name.en;
    var discount = Math.round((1 - p.price / p.oldPrice) * 100);
    
    html += '<div class="product-card" onclick="window.location.href=\'product.html?id=' + p.id + '\'">';
    html += '<div class="product-image"><img src="' + p.image + '" alt="' + name + '" loading="lazy">';
    if (discount > 0) html += '<span class="product-badge">-' + discount + '%</span>';
    html += '</div>';
    html += '<div class="product-info">';
    html += '<span class="product-brand">' + p.brand + '</span>';
    html += '<h3 class="product-name">' + name + '</h3>';
    html += '<div class="product-prices"><span class="current-price">' + p.price + ' ج.م</span>';
    if (p.oldPrice > p.price) html += '<span class="old-price">' + p.oldPrice + ' ج.م</span>';
    html += '</div>';
    html += '</div></div>';
  }
  
  grid.innerHTML = html;
}