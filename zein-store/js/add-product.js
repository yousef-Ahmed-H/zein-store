var ADMIN_PASSWORD = 'zein2024';

window.addEventListener('load', function() {
  if (localStorage.getItem('zein-admin-logged') === 'true') {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadProductsFromFirebase(function() {
      initAddProductPage();
    });
  }
});

function checkAdminPassword() {
  var input = document.getElementById('adminPassword').value;
  var error = document.getElementById('loginError');
  
  if (input === ADMIN_PASSWORD) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    localStorage.setItem('zein-admin-logged', 'true');
    loadProductsFromFirebase(function() {
      initAddProductPage();
    });
  } else {
    error.textContent = 'كلمة المرور خاطئة!';
  }
}

function logout() {
  localStorage.removeItem('zein-admin-logged');
  location.reload();
}

document.getElementById('adminPassword').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') checkAdminPassword();
});

var selectedColors = [];

function initAddProductPage() {
  renderAdminProducts();
  
  document.getElementById('addProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    addNewProduct();
  });
}

function addColor() {
  var color = document.getElementById('colorPicker').value;
  if (selectedColors.indexOf(color) === -1) {
    selectedColors.push(color);
    renderSelectedColors();
  }
}

function removeColor(color) {
  var newColors = [];
  for (var i = 0; i < selectedColors.length; i++) {
    if (selectedColors[i] !== color) newColors.push(selectedColors[i]);
  }
  selectedColors = newColors;
  renderSelectedColors();
}

function renderSelectedColors() {
  var container = document.getElementById('selectedColors');
  var html = '';
  for (var i = 0; i < selectedColors.length; i++) {
    html += '<div class="color-tag" style="background:' + selectedColors[i] + '"><span>' + selectedColors[i] + '</span><button onclick="removeColor(\'' + selectedColors[i] + '\')">✕</button></div>';
  }
  container.innerHTML = html;
}

function handleFileSelect(input) {
  var file = input.files[0];
  if (!file) return;
  
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var maxSize = 400;
      var w = img.width;
      var h = img.height;
      
      if (w > maxSize) { h = h * (maxSize / w); w = maxSize; }
      if (h > maxSize) { w = w * (maxSize / h); h = maxSize; }
      
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      
      var base64 = canvas.toDataURL('image/jpeg', 0.6);
      document.getElementById('productImage').value = base64;
      document.getElementById('imagePreview').innerHTML = '<img src="' + base64 + '" alt="معاينة"><button type="button" class="remove-img" onclick="clearImage()">✕</button>';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  document.getElementById('productImage').value = '';
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('productImageFile').value = '';
}

function getSelectedSizes() {
  var checkboxes = document.querySelectorAll('.size-checkboxes input:checked');
  var sizes = [];
  for (var i = 0; i < checkboxes.length; i++) {
    sizes.push(checkboxes[i].value);
  }
  return sizes;
}

function addNewProduct() {
  var nameAr = document.getElementById('productNameAr').value;
  var nameEn = document.getElementById('productNameEn').value;
  var category = document.getElementById('productCategory').value;
  var brand = document.getElementById('productBrand').value;
  var price = parseInt(document.getElementById('productPrice').value);
  var oldPrice = parseInt(document.getElementById('productOldPrice').value) || price;
  var sizes = getSelectedSizes();
  var rating = parseFloat(document.getElementById('productRating').value) || 4.5;
  var descAr = document.getElementById('productDescAr').value;
  var descEn = document.getElementById('productDescEn').value;
  var image = document.getElementById('productImage').value;
  
  if (!image) { alert('يرجى إضافة صورة!'); return; }
  if (sizes.length === 0) { alert('يرجى اختيار مقاس واحد على الأقل!'); return; }
  
  var maxId = 0;
  for (var i = 0; i < PRODUCTS_DATA.length; i++) {
    if (PRODUCTS_DATA[i].id > maxId) maxId = PRODUCTS_DATA[i].id;
  }
  
  var newProduct = {
    id: maxId + 1,
    name: { ar: nameAr, en: nameEn },
    category: category,
    price: price,
    oldPrice: oldPrice,
    rating: rating,
    reviews: 0,
    image: image,
    brand: brand,
    sizes: sizes,
    colors: selectedColors.length > 0 ? selectedColors : ['#000000'],
    desc: { ar: descAr, en: descEn },
    published: false
  };
  
  var submitBtn = document.querySelector('#addProductForm button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ جاري الحفظ...';
  
  saveProductToFirebase(newProduct)
    .then(function() {
      PRODUCTS_DATA.push(newProduct);
      
      document.getElementById('addProductForm').reset();
      selectedColors = [];
      renderSelectedColors();
      clearImage();
      
      var checkboxes = document.querySelectorAll('.size-checkboxes input');
      for (var i = 0; i < checkboxes.length; i++) {
        if (['S','M','L','XL','2XL'].indexOf(checkboxes[i].value) !== -1) {
          checkboxes[i].checked = true;
        } else {
          checkboxes[i].checked = false;
        }
      }
      
      renderAdminProducts();
      alert('✅ تم حفظ المنتج! اضغط "نشر" لإظهاره في المتجر');
    })
    .catch(function(err) {
      console.error(err);
      alert('❌ فشل الحفظ! تأكد من اتصال الإنترنت والإعدادات');
    })
    .finally(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = '💾 حفظ المنتج';
    });
}

function renderAdminProducts() {
  var grid = document.getElementById('adminProductsGrid');
  if (!grid) return;
  
  if (PRODUCTS_DATA.length === 0) {
    grid.innerHTML = '<p class="no-products">لا توجد منتجات بعد</p>';
    return;
  }
  
  var html = '';
  for (var i = 0; i < PRODUCTS_DATA.length; i++) {
    var p = PRODUCTS_DATA[i];
    var status = p.published ? '<span class="status-badge published">✅ منشور</span>' : '<span class="status-badge draft">📝 مسودة</span>';
    
    html += '<div class="admin-product-card">';
    html += '<div class="admin-product-img"><img src="' + p.image + '" alt="' + p.name.ar + '"></div>';
    html += '<div class="admin-product-info">';
    html += '<h4>' + p.name.ar + '</h4>';
    html += '<p>' + p.brand + ' | ' + p.price + ' ج.م</p>';
    html += '<p class="sizes-text">المقاسات: ' + p.sizes.join(', ') + '</p>';
    html += status;
    html += '</div>';
    html += '<div class="admin-product-actions">';
    
    if (p.published) {
      html += '<button class="btn btn-warning btn-sm" onclick="togglePublish(' + p.id + ')">📤 إخفاء</button>';
    } else {
      html += '<button class="btn btn-success btn-sm" onclick="togglePublish(' + p.id + ')">📢 نشر</button>';
    }
    
    html += '<button class="btn btn-danger btn-sm" onclick="deleteProduct(' + p.id + ')">🗑️ حذف</button>';
    html += '</div>';
    html += '</div>';
  }
  
  grid.innerHTML = html;
}

function togglePublish(productId) {
  for (var i = 0; i < PRODUCTS_DATA.length; i++) {
    if (PRODUCTS_DATA[i].id === productId) {
      PRODUCTS_DATA[i].published = !PRODUCTS_DATA[i].published;
      saveProductToFirebase(PRODUCTS_DATA[i]).catch(function(err) {
        console.error(err);
        alert('فشل التحديث');
      });
      break;
    }
  }
  renderAdminProducts();
}

function deleteProduct(productId) {
  if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
  
  deleteProductFromFirebase(productId)
    .then(function() {
      for (var i = PRODUCTS_DATA.length - 1; i >= 0; i--) {
        if (PRODUCTS_DATA[i].id === productId) {
          PRODUCTS_DATA.splice(i, 1);
        }
      }
      renderAdminProducts();
      alert('✅ تم حذف المنتج');
    })
    .catch(function(err) {
      console.error(err);
      alert('❌ فشل الحذف');
    });
}