function getCart() {
  return JSON.parse(localStorage.getItem('zein-cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('zein-cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, quantity) {
  quantity = quantity || 1;
  var cart = getCart();
  var existingItem = null;
  
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === productId) {
      existingItem = cart[i];
      break;
    }
  }
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ id: productId, quantity: quantity });
  }
  
  saveCart(cart);
  showToast(currentLang === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart');
}

function removeFromCart(productId) {
  var cart = getCart();
  var newCart = [];
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id !== productId) {
      newCart.push(cart[i]);
    }
  }
  saveCart(newCart);
  loadCartPage();
}

function updateQuantity(productId, change) {
  var cart = getCart();
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === productId) {
      cart[i].quantity += change;
      if (cart[i].quantity <= 0) {
        removeFromCart(productId);
      } else {
        saveCart(cart);
        loadCartPage();
      }
      break;
    }
  }
}

function clearCart() {
  localStorage.removeItem('zein-cart');
  updateCartBadge();
}

function getCartTotal() {
  var cart = getCart();
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    var product = null;
    for (var j = 0; j < PRODUCTS_DATA.length; j++) {
      if (PRODUCTS_DATA[j].id === cart[i].id) {
        product = PRODUCTS_DATA[j];
        break;
      }
    }
    if (product) {
      total += product.price * cart[i].quantity;
    }
  }
  return total;
}

function loadCartPage() {
  var cart = getCart();
  var grid = document.getElementById('cartGrid');
  
  if (!grid) return;
  
  if (cart.length === 0) {
    grid.innerHTML = '<div class="empty-cart" style="grid-column: span 2;"><div class="icon">🛒</div><h3>' + (currentLang === 'ar' ? 'السلة فارغة' : 'Cart is Empty') + '</h3><p>' + (currentLang === 'ar' ? 'لم تقم بإضافة أي منتجات بعد' : "You haven't added any products yet") + '</p><a href="products.html" class="btn btn-primary">' + (currentLang === 'ar' ? 'متابعة التسوق' : 'Continue Shopping') + '</a></div>';
    return;
  }
  
  var subtotal = getCartTotal();
  var shipping = subtotal > 500 ? 0 : 50;
  var discount = localStorage.getItem('zein-coupon') === 'SAVE10' ? subtotal * 0.1 : 0;
  var total = subtotal + shipping - discount;
  
  var cartItemsHtml = '';
  for (var i = 0; i < cart.length; i++) {
    var product = null;
    for (var j = 0; j < PRODUCTS_DATA.length; j++) {
      if (PRODUCTS_DATA[j].id === cart[i].id) {
        product = PRODUCTS_DATA[j];
        break;
      }
    }
    if (!product) continue;
    
    var name = currentLang === 'ar' ? product.name.ar : product.name.en;
    
    cartItemsHtml += '<div class="cart-item">';
    cartItemsHtml += '<div class="cart-item-image"><img src="' + product.image + '" alt="' + name + '"></div>';
    cartItemsHtml += '<div class="cart-item-info">';
    cartItemsHtml += '<span class="brand">' + product.brand + '</span>';
    cartItemsHtml += '<h4>' + name + '</h4>';
    cartItemsHtml += '<div class="price">' + product.price + ' ج.م</div>';
    cartItemsHtml += '<div class="cart-item-quantity">';
    cartItemsHtml += '<button onclick="updateQuantity(' + cart[i].id + ', -1)">−</button>';
    cartItemsHtml += '<span>' + cart[i].quantity + '</span>';
    cartItemsHtml += '<button onclick="updateQuantity(' + cart[i].id + ', 1)">+</button>';
    cartItemsHtml += '</div></div>';
    cartItemsHtml += '<button class="cart-item-remove" onclick="removeFromCart(' + cart[i].id + ')">🗑️</button>';
    cartItemsHtml += '</div>';
  }
  
  grid.innerHTML = '<div class="cart-items">' + cartItemsHtml + '</div>';
  grid.innerHTML += '<div class="cart-summary">';
  grid.innerHTML += '<h3>' + (currentLang === 'ar' ? 'ملخص الطلب' : 'Order Summary') + '</h3>';
  grid.innerHTML += '<div class="summary-row"><span>' + (currentLang === 'ar' ? 'المجموع الفرعي' : 'Subtotal') + '</span><span>' + subtotal.toFixed(2) + ' ج.م</span></div>';
  grid.innerHTML += '<div class="summary-row"><span>' + (currentLang === 'ar' ? 'الشحن' : 'Shipping') + '</span><span>' + (shipping === 0 ? (currentLang === 'ar' ? 'مجاني' : 'Free') : shipping + ' ج.م') + '</span></div>';
  if (discount > 0) {
    grid.innerHTML += '<div class="summary-row" style="color:var(--success);"><span>' + (currentLang === 'ar' ? 'الخصم' : 'Discount') + ' (10%)</span><span>-' + discount.toFixed(2) + ' ج.م</span></div>';
  }
  grid.innerHTML += '<div class="summary-row total"><span>' + (currentLang === 'ar' ? 'الإجمالي' : 'Total') + '</span><span>' + total.toFixed(2) + ' ج.م</span></div>';
  grid.innerHTML += '<div class="coupon-input"><input type="text" id="couponInput" placeholder="' + (currentLang === 'ar' ? 'كوبون الخصم' : 'Coupon Code') + '"><button onclick="applyCoupon()">' + (currentLang === 'ar' ? 'تطبيق' : 'Apply') + '</button></div>';
  grid.innerHTML += '<div class="coupon-message" id="couponMessage"></div>';
  grid.innerHTML += '<button class="checkout-btn" onclick="checkout()">' + (currentLang === 'ar' ? 'إتمام الشراء' : 'Checkout') + '</button>';
  grid.innerHTML += '</div>';
}

function applyCoupon() {
  var input = document.getElementById('couponInput');
  var message = document.getElementById('couponMessage');
  var code = input.value.trim().toUpperCase();
  
  if (code === 'SAVE10') {
    localStorage.setItem('zein-coupon', 'SAVE10');
    message.textContent = currentLang === 'ar' ? 'تم تطبيق الخصم 10%' : '10% discount applied';
    message.className = 'coupon-message success';
    loadCartPage();
  } else {
    localStorage.removeItem('zein-coupon');
    message.textContent = currentLang === 'ar' ? 'كوبون غير صالح' : 'Invalid coupon';
    message.className = 'coupon-message error';
  }
}

function checkout() {
  var cart = getCart();
  if (cart.length === 0) {
    showToast(currentLang === 'ar' ? 'السلة فارغة' : 'Cart is empty', 'error');
    return;
  }
  showCustomerInfoModal();
}

function showCustomerInfoModal() {
  var modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'customerModal';
  modal.innerHTML = '<div class="checkout-modal"><button class="modal-close" onclick="closeCustomerModal()">✕</button><div class="checkout-header"><div class="checkout-icon">📦</div><h3>إتمام الطلب</h3><p>أدخل بيانات التوصيل لإرسال طلبك عبر واتساب</p></div><form id="customerForm" class="checkout-form"><div class="checkout-form-group"><label>👤 الاسم الكامل *</label><input type="text" id="customerName" required placeholder="اكتب اسمك الكامل"></div><div class="checkout-form-group"><label>📱 رقم الهاتف *</label><input type="tel" id="customerPhone" required placeholder="01XXXXXXXXX"></div><div class="checkout-form-group"><label>📍 العنوان التفصيلي *</label><textarea id="customerAddress" required rows="3" placeholder="الشارع - الحي - المدينة"></textarea></div><div class="checkout-form-group"><label>📝 ملاحظات (اختياري)</label><textarea id="customerNotes" rows="2" placeholder="أي ملاحظات"></textarea></div><button type="submit" class="btn btn-primary btn-block btn-lg">💬 إرسال الطلب عبر واتساب</button></form><div class="checkout-footer"><p>🔒 بياناتك آمنة</p></div></div>';
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeCustomerModal();
  });
  
  document.getElementById('customerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    sendWhatsAppOrder();
  });
}

function closeCustomerModal() {
  var modal = document.getElementById('customerModal');
  if (modal) modal.remove();
}

function sendWhatsAppOrder() {
  var name = document.getElementById('customerName').value;
  var phone = document.getElementById('customerPhone').value;
  var address = document.getElementById('customerAddress').value;
  var notes = document.getElementById('customerNotes').value;
  
  var cart = getCart();
  
  var message = '🛒 *طلب جديد من ZEIN Store*\n\n';
  message += '👤 *بيانات العميل:*\n';
  message += 'الاسم: ' + name + '\n';
  message += 'الهاتف: ' + phone + '\n';
  message += 'العنوان: ' + address + '\n';
  if (notes) message += 'ملاحظات: ' + notes + '\n';
  message += '\n📦 *تفاصيل الطلب:*\n';
  message += '━━━━━━━━━━━━━━━━━━\n';
  
  var subtotal = 0;
  
  for (var i = 0; i < cart.length; i++) {
    var product = null;
    for (var j = 0; j < PRODUCTS_DATA.length; j++) {
      if (PRODUCTS_DATA[j].id === cart[i].id) {
        product = PRODUCTS_DATA[j];
        break;
      }
    }
    if (!product) continue;
    
    var productName = currentLang === 'ar' ? product.name.ar : product.name.en;
    var itemTotal = product.price * cart[i].quantity;
    subtotal += itemTotal;
    
    message += (i + 1) + '. *' + productName + '*\n';
    message += '   العلامة: ' + product.brand + '\n';
    message += '   الكمية: ' + cart[i].quantity + '\n';
    message += '   السعر: ' + product.price + ' ج.م\n';
    message += '   الإجمالي: ' + itemTotal + ' ج.م\n\n';
  }
  
  var shipping = subtotal > 500 ? 0 : 50;
  var discount = localStorage.getItem('zein-coupon') === 'SAVE10' ? subtotal * 0.1 : 0;
  var total = subtotal + shipping - discount;
  
  message += '━━━━━━━━━━━━━━━━━━\n';
  message += '💰 *المجموع الفرعي:* ' + subtotal.toFixed(2) + ' ج.م\n';
  if (discount > 0) message += '🎁 *الخصم:* -' + discount.toFixed(2) + ' ج.م\n';
  message += '🚚 *الشحن:* ' + (shipping === 0 ? 'مجاني' : shipping + ' ج.م') + '\n';
  message += '━━━━━━━━━━━━━━━━━━\n';
  message += '✅ *الإجمالي النهائي:* ' + total.toFixed(2) + ' ج.م\n\n';
  message += '✅ *طريقة الدفع:* الدفع عند الاستلام\n\n';
  message += 'شكراً لتسوقك من ZEIN Store! 🙏';
  
  closeCustomerModal();
  
  var whatsappNumber = '201094040203';
  var encodedMessage = encodeURIComponent(message);
  var whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodedMessage;
  
  clearCart();
  window.open(whatsappUrl, '_blank');
}