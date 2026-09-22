document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var name = document.getElementById('contactName').value;
    var phone = document.getElementById('contactPhone').value;
    var type = document.getElementById('contactType').value;
    var message = document.getElementById('contactMessage').value;
    
    var typeText = '';
    switch(type) {
      case 'problem': typeText = 'مشكلة في طلب'; break;
      case 'inquiry': typeText = 'استفسار عن منتج'; break;
      case 'suggestion': typeText = 'اقتراح'; break;
      default: typeText = 'رسالة عامة';
    }
    
    var whatsappMsg = '📩 *رسالة جديدة من موقع ZEIN Store*\n\n';
    whatsappMsg += '👤 *الاسم:* ' + name + '\n';
    whatsappMsg += '📱 *الهاتف:* ' + phone + '\n';
    whatsappMsg += '📝 *النوع:* ' + typeText + '\n\n';
    whatsappMsg += '💬 *الرسالة:*\n' + message;
    
    var encoded = encodeURIComponent(whatsappMsg);
    window.open('https://wa.me/201094040203?text=' + encoded, '_blank');
    
    this.reset();
    alert('تم فتح واتساب! أرسل رسالتك 📩');
  });
});