// ===== AI Chat Page Logic =====

const PAGE_MODEL = 'allam-2-7b';
const PAGE_WHATSAPP = '201094040203';

let pageHistory = [];
let pageLoading = false;
let pageProducts = [];
let pageRecognition = null;
let pageRecording = false;

// ===== Init =====
window.addEventListener('load', function() {
  loadPageProducts();
  showWelcome();
});

function loadPageProducts() {
  if (typeof loadProductsFromFirebase === 'function') {
    loadProductsFromFirebase(function() {
      pageProducts = (PRODUCTS_DATA || []).filter(function(p) { return p.published !== false; });
      console.log('✅ Chat page loaded ' + pageProducts.length + ' products');
    });
  }
}

function showWelcome() {
  var msg = 'أهلاً بيك في ZEIN Store! 👋\nأنا زين، مساعدك الشخصي في المتجر.\n\nاسألني عن أي حاجة:\n• 👔 المنتجات والأسعار\n• 📏 المقاسات والألوان\n• 🚚 الشحن والإرجاع\n• 💳 طرق الدفع\n\nأو اضغط على زرار 🎤 عشان تتكلم!';
  addPageMsg('bot', msg);
}

// ===== System Prompt =====
function buildPagePrompt() {
  var productsText = '';
  
  if (pageProducts.length > 0) {
    productsText = '\n\n📦 المنتجات المتاحة حالياً:\n';
    for (var i = 0; i < pageProducts.length; i++) {
      var p = pageProducts[i];
      productsText += '\n' + (i+1) + '. ' + (p.name ? p.name.ar : 'منتج') + '\n';
      productsText += '   - الماركة: ' + (p.brand || '-') + '\n';
      productsText += '   - السعر: ' + p.price + ' ج.م';
      if (p.oldPrice && p.oldPrice > p.price) productsText += ' (بدلاً من ' + p.oldPrice + ' ج.م)';
      productsText += '\n';
      if (p.sizes && p.sizes.length) productsText += '   - المقاسات: ' + p.sizes.join(', ') + '\n';
      if (p.desc) productsText += '   - الوصف: ' + p.desc.ar + '\n';
    }
  } else {
    productsText = '\n\nلا توجد منتجات حالياً.\n';
  }
  
  return 'أنت "زين" — المساعد الذكي لمتجر ZEIN Store (ملابس رجالية).\n\n' +
    '🎯 شخصيتك:\n- ودود ومحترم\n- بتتكلم بالعربي المصري البسيط\n- ردودك مختصرة ومفيدة (1-3 جمل)\n- إيموجي باعتدال\n\n' +
    '📋 مهامك:\n' +
    '1. الرد على أسئلة المنتجات (سعر، مقاسات، ألوان)\n' +
    '2. ترشيح منتجات مناسبة\n' +
    '3. سياسات المتجر:\n' +
    '   • الشحن: مجاني للطلبات فوق 500 ج.م، وإلا 50 ج.م\n' +
    '   • الدفع: إنستا باي (دفع شحن أو كامل) أو دفع عند الاستلام\n' +
    '   • الإرجاع: مجاني خلال 14 يوم\n' +
    '   • التوصيل: 2-5 أيام عمل\n' +
    '4. لو العميل محتاج مساعدة بشرية، قوله يكتب "واتساب" وهيتنقل تلقائياً\n\n' +
    '⚠️ قواعد:\n- اعتمد على البيانات اللي تحت بس\n- متخترعش أسعار\n- لو مش عارف، قول "تحب أوصلك بالدعم؟"\n' +
    productsText;
}

// ===== Send Message =====
async function submitChat() {
  var input = document.getElementById('chatInput');
  var text = input.value.trim();
  if (!text || pageLoading) return;
  
  input.value = '';
  input.style.height = 'auto';
  await sendToAI(text);
}

function sendQuickReply(text) {
  if (pageLoading) return;
  sendToAI(text);
}

async function sendToAI(userMsg) {
  if (pageLoading) return;
  
  // واتساب
  if (userMsg.toLowerCase().includes('واتساب') || userMsg.toLowerCase().includes('تواصل') || userMsg.toLowerCase().includes('whatsapp')) {
    addPageMsg('user', userMsg);
    addPageMsg('bot', 'تمام! بفتحلك واتساب حالاً 💬');
    setTimeout(function() {
      window.open('https://wa.me/' + PAGE_WHATSAPP + '?text=' + encodeURIComponent('مرحباً، أحتاج مساعدة'), '_blank');
    }, 800);
    return;
  }
  
  addPageMsg('user', userMsg);
  pageHistory.push({ role: 'user', content: userMsg });
  
  showTyping();
  pageLoading = true;
  disableInput(true);
  
  try {
    var messages = [{ role: 'system', content: buildPagePrompt() }];
    var recent = pageHistory.slice(-10);
    for (var i = 0; i < recent.length; i++) messages.push(recent[i]);
    
    var response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: PAGE_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    var data = await response.json();
    hideTyping();
    
    if (data.error) {
      addPageMsg('bot', '❌ معلش فيه مشكلة تقنية. جرب تاني.');
      console.error(data.error);
    } else {
      var reply = data.choices[0].message.content;
      pageHistory.push({ role: 'assistant', content: reply });
      addPageMsg('bot', reply);
    }
  } catch (err) {
    hideTyping();
    console.error(err);
    addPageMsg('bot', '❌ مشكلة في الاتصال. جرب تاني.');
  }
  
  pageLoading = false;
  disableInput(false);
}

// ===== UI Helpers =====
function addPageMsg(type, text) {
  var area = document.getElementById('chatMessages');
  if (!area) return;
  var msg = document.createElement('div');
  msg.className = 'page-msg page-msg-' + type;
  msg.textContent = text;
  area.appendChild(msg);
  area.scrollTop = area.scrollHeight;
}

function showTyping() {
  var area = document.getElementById('chatMessages');
  var t = document.createElement('div');
  t.className = 'page-msg-typing';
  t.id = 'pageTypingIndicator';
  t.innerHTML = '<span></span><span></span><span></span>';
  area.appendChild(t);
  area.scrollTop = area.scrollHeight;
}

function hideTyping() {
  var t = document.getElementById('pageTypingIndicator');
  if (t) t.remove();
}

function disableInput(disabled) {
  var btn = document.getElementById('chatSendBtn');
  if (btn) btn.disabled = disabled;
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function clearChatPage() {
  if (!confirm('هل تريد بدء محادثة جديدة؟')) return;
  document.getElementById('chatMessages').innerHTML = '';
  pageHistory = [];
  showWelcome();
}

// ===== Microphone =====
function toggleMicPage() {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert('معلش، المتصفح بتاعك مش بيدعم الميكروفون. جرب Chrome أو Edge.');
    return;
  }
  
  var micBtn = document.getElementById('chatMicBtn');
  var input = document.getElementById('chatInput');
  var lang = localStorage.getItem('zein-lang') || 'ar';
  
  if (pageRecording) {
    stopMicPage();
    return;
  }
  
  pageRecognition = new SR();
  pageRecognition.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
  pageRecognition.continuous = false;
  pageRecognition.interimResults = true;
  
  pageRecognition.onstart = function() {
    pageRecording = true;
    micBtn.classList.add('recording');
    micBtn.innerHTML = '🔴';
    input.placeholder = '🎤 بتسمع... اتكلم';
  };
  
  pageRecognition.onresult = function(e) {
    var text = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      text += e.results[i][0].transcript;
    }
    input.value = text;
    autoResize(input);
  };
  
  pageRecognition.onerror = function(e) {
    console.error(e);
    stopMicPage();
    if (e.error === 'not-allowed') {
      alert('معلش، محتاج تسمح للميكروفون.');
    }
  };
  
  pageRecognition.onend = function() {
    var wasRec = pageRecording;
    stopMicPage();
    if (wasRec && input.value.trim()) {
      setTimeout(submitChat, 300);
    }
  };
  
  try {
    pageRecognition.start();
  } catch (e) {
    console.error(e);
    stopMicPage();
  }
}

function stopMicPage() {
  pageRecording = false;
  var micBtn = document.getElementById('chatMicBtn');
  var input = document.getElementById('chatInput');
  var lang = localStorage.getItem('zein-lang') || 'ar';
  
  if (micBtn) {
    micBtn.classList.remove('recording');
    micBtn.innerHTML = '🎤';
  }
  if (input) {
    input.placeholder = 'اكتب أو اتكلم...';
  }
  if (pageRecognition) {
    try { pageRecognition.stop(); } catch(e) {}
    pageRecognition = null;
  }
}