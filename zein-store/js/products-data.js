// ===== Products Data (Firebase-backed) =====

const PRODUCTS_DATA = [];

// تحميل كل المنتجات من Firebase
function loadProductsFromFirebase(callback) {
  if (!window.db) {
    console.warn('Firebase not ready');
    if (callback) callback();
    return;
  }
  
  db.collection('products').get()
    .then(function(snapshot) {
      PRODUCTS_DATA.length = 0;
      snapshot.forEach(function(doc) {
        var data = doc.data();
        data.id = parseInt(doc.id) || data.id;
        PRODUCTS_DATA.push(data);
      });
      PRODUCTS_DATA.sort(function(a, b) { return a.id - b.id; });
      console.log('✅ Loaded ' + PRODUCTS_DATA.length + ' products from Firebase');
      if (callback) callback();
    })
    .catch(function(err) {
      console.error('❌ Error loading products:', err);
      if (callback) callback();
    });
}

// حفظ منتج واحد في Firebase
function saveProductToFirebase(product) {
  if (!window.db) return Promise.reject('Firebase not ready');
  return db.collection('products').doc(String(product.id)).set(product);
}

// حذف منتج واحد من Firebase
function deleteProductFromFirebase(productId) {
  if (!window.db) return Promise.reject('Firebase not ready');
  return db.collection('products').doc(String(productId)).delete();
}