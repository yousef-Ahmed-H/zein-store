// ===== AI Chat Assistant "زين" =====

// ⚠️ حط مفتاح Groq بتاعك هنا
const AI_API_KEY = '';
const AI_MODEL = 'allam-2-7b';
const WHATSAPP_NUMBER = '201094040203';

let aiChatOpen = false;
let aiIsLoading = false;
let aiConversationHistory = [];
let aiProductsCache = [];

// ===== تحميل المنتجات من Firebase =====
function aiLoadProducts(callback) {
  if (!window.db) {
    if (callback) callback([]);
    return;
  }
  db.collection('products').get()
    .then(function(snapshot) {
      aiProductsCache = [];
      snapshot.forEach(function(doc) {
        var data = doc.data();
        if (data.published !== false) {
          aiProductsCache.push(data);
        }
      });
      console.log('✅ AI loaded ' + aiProductsCache.length + ' products');
      if (callback) callback(aiProductsCache);
    })
    .catch(function(err) {
      console.error('❌ AI products error:', err);
      if (callback) callback([]);
    });
}

// ===== بناء System Prompt لـ "زين" =====
function aiBuildSystemPrompt() {
  var lang = localStorage.getItem('zein-lang') || 'ar';
  var productsText = '';
  
  if (aiProductsCache.length > 0) {
    productsText = '\n\n📦 المنتجات المتاحة حالياً في المتجر:\n';
    for (var i = 0; i < aiProductsCache.length; i++) {
      var p = aiProductsCache[i];
      productsText += '\n' + (i + 1) + '. ' + (p.name ? p.name.ar : 'منتج') + ' (' + (p.name ? p.name.en : '') + ')\n';
      productsText += '   - الفئة: ' + (p.category || 'غير محدد') + '\n';
      productsText += '   - الماركة: ' + (p.brand || 'غير محدد') + '\n';
      productsText += '   - السعر: ' + p.price + ' ج.م';
      if (p.oldPrice && p.oldPrice > p.price) {
        productsText += ' (بدلاً من ' + p.oldPrice + ' ج.م)';
      }
      productsText += '\n';
      if (p.sizes && p.sizes.length) {
        productsText += '   - المقاسات: ' + p.sizes.join(', ') + '\n';
      }
      if (p.colors && p.colors.length) {
        productsText += '   - الألوان: ' + p.colors.length + ' ألوان متاحة\n';
      }
      if (p.desc) {
        productsText += '   - الوصف: ' + p.desc.ar + '\n';
      }
    }
  } else {
    productsText = '\n\nلا توجد منتجات في المتجر حالياً.\n';
  }
  
  var systemPrompt = '';
  
  if (lang === 'ar') {
    systemPrompt = 'أنت "زين" — المساعد الذكي الرسمي لمتجر ZEIN Store (متجر ملابس رجالية).\n\n';
    systemPrompt += '🎯 شخصيتك:\n';
    systemPrompt += '- ودود ومحترم ومهني\n';
    systemPrompt += '- بتتكلم بالعربي المصري البسيط (مش فصحى ثقيلة)\n';
    systemPrompt += '- ردودك مختصرة ومفيدة (من 1-3 جمل عادةً)\n';
    systemPrompt += '- استخدم الإيموجي باعتدال (1-2 في الرد)\n\n';
    
    systemPrompt += '📋 مهامك:\n';
    systemPrompt += '1. الرد على أسئلة العملاء عن المنتجات (السعر، المقاسات، الألوان، المتوفر)\n';
    systemPrompt += '2. ترشيح منتجات مناسبة لطلبات العميل\n';
    systemPrompt += '3. شرح سياسات المتجر:\n';
    systemPrompt += '   - الشحن: مجاني للطلبات فوق 500 ج.م، وإلا 50 ج.م\n';
    systemPrompt += '   - الدفع: الدفع عند الاستلام\n';
    systemPrompt += '   - الإرجاع: مجاني خلال 14 يوم\n';
    systemPrompt += '   - التوصيل: 2-5 أيام عمل\n';
    systemPrompt += '4. تتبع الطلبات (اسأل العميل عن رقم الطلب)\n';
    systemPrompt += '5. لو العميل محتاج مساعدة بشرية، قوله يكتب "واتساب" أو "تواصل" وهيتنقل تلقائياً\n';
    systemPrompt += '6. لو العميل قال "أضف للسلة" أو "عايز أشتري"، قوله يضغط على المنتج ويضيفه بنفسه من الصفحة\n\n';
    
    systemPrompt += '⚠️ قواعد مهمة:\n';
    systemPrompt += '- مفيش تخيلات، اعتمد على البيانات اللي تحت بس\n';
    systemPrompt += '- لو مش عارف حاجة، قول "معلش مش متأكد، تحب أوصلك بفريق الدعم؟"\n';
    systemPrompt += '- متضيفش أرقام أسعار من عندك، استخدم اللي في القائمة بس\n';
    systemPrompt += '- لو العميل طلب حاجة غير موجودة، اقترح بديل من الموجود\n';
    
    systemPrompt += productsText;
  } else {
    systemPrompt = 'You are "Zein" — the official AI assistant for ZEIN Store (men\'s clothing shop).\n\n';
    systemPrompt += '🎯 Your personality:\n';
    systemPrompt += '- Friendly, respectful, and professional\n';
    systemPrompt += '- Speak in simple, natural English\n';
    systemPrompt += '- Keep replies short and useful (usually 1-3 sentences)\n';
    systemPrompt += '- Use emojis sparingly (1-2 per message)\n\n';
    
    systemPrompt += '📋 Your tasks:\n';
    systemPrompt += '1. Answer customer questions about products (price, sizes, colors, availability)\n';
    systemPrompt += '2. Recommend suitable products\n';
    systemPrompt += '3. Explain shop policies:\n';
    systemPrompt += '   - Shipping: Free for orders over 500 EGP, otherwise 50 EGP\n';
    systemPrompt += '   - Payment: Cash on delivery\n';
    systemPrompt += '   - Returns: Free within 14 days\n';
    systemPrompt += '   - Delivery: 2-5 business days\n';
    systemPrompt += '4. Track orders (ask for order number)\n';
    systemPrompt += '5. If customer needs human help, tell them to type "whatsapp" or "contact"\n';
    systemPrompt += '6. If customer says "add to cart" or "buy", tell them to click the product and add it themselves\n\n';
    
    systemPrompt += '⚠️ Important rules:\n';
    systemPrompt += '- No making things up — only use the data below\n';
    systemPrompt += '- If unsure, say "Sorry I\'m not sure, want me to connect you with support?"\n';
    systemPrompt += '- Don\'t invent prices, use only what\'s listed\n';
    systemPrompt += '- If requested item isn\'t available, suggest an alternative\n';
    
    systemPrompt += productsText;
  }
  
  return systemPrompt;
}

// ===== إرسال رسالة للـ AI =====
async function aiSendMessage(userMessage) {
  if (aiIsLoading) return;
  
  var lang = localStorage.getItem('zein-lang') || 'ar';
  
  if (userMessage.toLowerCase().includes('واتساب') || 
      userMessage.toLowerCase().includes('whatsapp') ||
      userMessage.toLowerCase().includes('تواصل') ||
      userMessage.toLowerCase().includes('contact')) {
    aiAddMessage('bot', lang === 'ar' ? 
      'تمام! هفتحلك واتساب حالاً للتواصل مع فريق الدعم 💬' : 
      'Sure! Opening WhatsApp for you now 💬');
    
    setTimeout(function() {
      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lang === 'ar' ? 'مرحباً، أحتاج مساعدة' : 'Hello, I need help'), '_blank');
    }, 1000);
    return;
  }
  
  aiAddMessage('user', userMessage);
  aiConversationHistory.push({ role: 'user', content: userMessage });
  
  aiShowTyping();
  aiIsLoading = true;
  
  try {
    var messages = [
      { role: 'system', content: aiBuildSystemPrompt() }
    ];
    
    var recentHistory = aiConversationHistory.slice(-10);
    for (var i = 0; i < recentHistory.length; i++) {
      messages.push(recentHistory[i]);
    }
    
    var response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + AI_API_KEY
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    var data = await response.json();
    aiHideTyping();
    
    if (data.error) {
      aiAddMessage('bot', '❌ معلش، فيه مشكلة تقنية. جرب تاني.');
      console.error('AI Error:', data.error);
    } else {
      var botReply = data.choices[0].message.content;
      aiConversationHistory.push({ role: 'assistant', content: botReply });
      aiAddMessage('bot', botReply);
    }
  } catch (err) {
    aiHideTyping();
    console.error('AI Fetch Error:', err);
    aiAddMessage('bot', '❌ معلش، فيه مشكلة في الاتصال. جرب تاني.');
  }
  
  aiIsLoading = false;
}

// ===== إضافة رسالة في الشات =====
function aiAddMessage(type, text) {
  var messagesArea = document.getElementById('aiChatMessages');
  if (!messagesArea) return;
  
  var msg = document.createElement('div');
  msg.className = 'ai-msg ai-msg-' + type;
  msg.textContent = text;
  messagesArea.appendChild(msg);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

// ===== مؤشر الكتابة =====
function aiShowTyping() {
  var messagesArea = document.getElementById('aiChatMessages');
  if (!messagesArea) return;
  
  var typing = document.createElement('div');
  typing.className = 'ai-msg ai-msg-bot ai-msg-typing';
  typing.id = 'aiTypingIndicator';
  typing.innerHTML = '<span></span><span></span><span></span>';
  messagesArea.appendChild(typing);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

function aiHideTyping() {
  var typing = document.getElementById('aiTypingIndicator');
  if (typing) typing.remove();
}

// ===== فتح/قفل الشات =====
function aiToggleChat() {
  aiChatOpen = !aiChatOpen;
  var chatWindow = document.getElementById('aiChatWindow');
  var wrapper = document.getElementById('aiChatWrapper');

if (aiChatOpen) {
  chatWindow.classList.add('open');
  if (wrapper) wrapper.style.display = 'none';
    
    var messagesArea = document.getElementById('aiChatMessages');
    if (messagesArea.children.length === 0) {
      var lang = localStorage.getItem('zein-lang') || 'ar';
      var welcome = lang === 'ar' ? 
  'أهلاً! أنا زين 😊\nعايز تعرف إيه النهاردة؟' :
  'Hi! I\'m Zein 😊\nWhat can I help you with?';
      aiAddMessage('bot', welcome);
    }
    
    setTimeout(function() {
      var input = document.getElementById('aiChatInput');
      if (input) input.focus();
    }, 300);
  } else {
  chatWindow.classList.remove('open');
  if (wrapper) wrapper.style.display = 'flex';
}
}

// ===== إرسال من الـ input =====
function aiSubmit() {
  var input = document.getElementById('aiChatInput');
  if (!input) return;
  
  var text = input.value.trim();
  if (!text || aiIsLoading) return;
  
  input.value = '';
  input.style.height = 'auto';
  aiSendMessage(text);
}

// ===== Quick Reply =====
function aiQuickReply(text) {
  aiSendMessage(text);
}

// ===== بناء واجهة الشات =====
function aiBuildUI() {
  var lang = localStorage.getItem('zein-lang') || 'ar';
  
  // === Wrapper (inline styles مضمونة) ===
  var wrapper = document.createElement('div');
  wrapper.id = 'aiChatWrapper';
  wrapper.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9998;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    pointer-events: none;
  `;
  
  // === Label (بار كبير) ===
  var labelText = lang === 'ar' ? '👋 أهلاً! أنا زين — اسألني أي حاجة' : '👋 Hi! I\'m Zein — Ask me anything';
  
  var label = document.createElement('div');
  label.textContent = labelText;
  label.style.cssText = `
    background: linear-gradient(135deg, #C9A961, #b89651);
    color: #fff;
    padding: 18px 32px;
    border-radius: 40px;
    font-size: 18px;
    font-weight: 800;
    box-shadow: 0 12px 40px rgba(201,169,97,0.65);
    white-space: nowrap;
    cursor: pointer;
    font-family: inherit;
    border: 4px solid #fff;
    pointer-events: auto;
    animation: aiLabelBounce 2s infinite;
    transition: transform 0.3s;
  `;
  label.onmouseover = function() { this.style.transform = 'translateY(-5px)'; };
  label.onmouseout = function() { this.style.transform = 'translateY(0)'; };
  label.onclick = aiToggleChat;
  
  // === Button (زرار كبير) ===
  var btn = document.createElement('button');
  btn.id = 'aiChatBtn';
  btn.innerHTML = '🤖';
  btn.style.cssText = `
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #C9A961, #b89651);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 35px rgba(201,169,97,0.7);
    cursor: pointer;
    transition: all 0.3s;
    border: 5px solid #fff;
    font-size: 40px;
    animation: aiPulse 2s infinite;
    position: relative;
    pointer-events: auto;
  `;
  btn.onclick = aiToggleChat;
  
  // نقطة خضرا
  var dot = document.createElement('span');
  dot.style.cssText = `
    position: absolute;
    top: 2px;
    right: 2px;
    width: 18px;
    height: 18px;
    background: #4ade80;
    border: 4px solid #fff;
    border-radius: 50%;
  `;
  btn.appendChild(dot);
  
  wrapper.appendChild(label);
  wrapper.appendChild(btn);
  document.body.appendChild(wrapper);
  
  // === Chat Window ===
  var chatWindow = document.createElement('div');
  chatWindow.className = 'ai-chat-window';
  chatWindow.id = 'aiChatWindow';
  
  var quickRepliesHtml = lang === 'ar' ?
    '<div class="ai-quick-replies" id="aiQuickReplies">' +
      '<button class="ai-quick-reply" onclick="aiQuickReply(\'عايز قميص\')">👔 قميص</button>' +
      '<button class="ai-quick-reply" onclick="aiQuickReply(\'إيه سياسة الشحن؟\')">🚚 الشحن</button>' +
      '<button class="ai-quick-reply" onclick="aiQuickReply(\'عايز أتواصل مع حد\')">💬 تواصل</button>' +
    '</div>' :
    '<div class="ai-quick-replies" id="aiQuickReplies">' +
      '<button class="ai-quick-reply" onclick="aiQuickReply(\'I want a shirt\')">👔 Shirt</button>' +
      '<button class="ai-quick-reply" onclick="aiQuickReply(\'Shipping policy?\')">🚚 Shipping</button>' +
      '<button class="ai-quick-reply" onclick="aiQuickReply(\'I need to talk to someone\')">💬 Contact</button>' +
    '</div>';
  
  var welcomeTitle = lang === 'ar' ? 'زين — المساعد الذكي' : 'Zein — AI Assistant';
  var welcomeSub = lang === 'ar' ? 'متصل الآن' : 'Online now';
  
  chatWindow.innerHTML =
    '<div class="ai-chat-header">' +
      '<div class="ai-chat-header-info">' +
        '<div class="ai-chat-avatar">🤖</div>' +
        '<div class="ai-chat-header-text">' +
          '<h3>' + welcomeTitle + '</h3>' +
          '<p>' + welcomeSub + '</p>' +
        '</div>' +
      '</div>' +
      '<button class="ai-chat-close" onclick="aiToggleChat()">✕</button>' +
    '</div>' +
    '<div class="ai-chat-messages" id="aiChatMessages"></div>' +
    quickRepliesHtml +
    '<div class="ai-chat-input-area">' +
      '<textarea class="ai-chat-input" id="aiChatInput" rows="1" placeholder="' + (lang === 'ar' ? 'اكتب أو اتكلم...' : 'Type or speak...') + '"></textarea>' +
      '<button class="ai-chat-mic" id="aiChatMic" onclick="aiToggleMic()" title="' + (lang === 'ar' ? 'اضغط واتكلم' : 'Click and speak') + '">🎤</button>' +
      '<button class="ai-chat-send" onclick="aiSubmit()">➤</button>' +
    '</div>';
  
  document.body.appendChild(chatWindow);
  
  var input = document.getElementById('aiChatInput');
  if (input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        aiSubmit();
      }
    });
    
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
  }
}

// ===== Voice Recognition (Microphone) =====
let aiRecognition = null;
let aiIsRecording = false;

function aiToggleMic() {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert('معلش، المتصفح بتاعك مش بيدعم الميكروفون. جرب Chrome أو Edge.');
    return;
  }
  
  var micBtn = document.getElementById('aiChatMic');
  var input = document.getElementById('aiChatInput');
  var lang = localStorage.getItem('zein-lang') || 'ar';
  
  if (aiIsRecording) {
    aiStopMic();
    return;
  }
  
  aiRecognition = new SpeechRecognition();
  aiRecognition.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
  aiRecognition.continuous = false;
  aiRecognition.interimResults = true;
  aiRecognition.maxAlternatives = 1;
  
  aiRecognition.onstart = function() {
    aiIsRecording = true;
    micBtn.classList.add('recording');
    micBtn.innerHTML = '🔴';
    input.placeholder = lang === 'ar' ? '🎤 بتسمع... اتكلم' : '🎤 Listening... speak now';
  };
  
  aiRecognition.onresult = function(event) {
    var transcript = '';
    for (var i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    input.value = transcript;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  };
  
  aiRecognition.onerror = function(event) {
    console.error('Voice error:', event.error);
    aiStopMic();
    
    if (event.error === 'not-allowed') {
      alert('معلش، محتاج تسمح للميكروفون. اقفل الإشعار ده واعمل Refresh للصفحة.');
    }
  };
  
  aiRecognition.onend = function() {
    var wasRecording = aiIsRecording;
    aiStopMic();
    
    if (wasRecording && input.value.trim()) {
      setTimeout(function() {
        aiSubmit();
      }, 300);
    }
  };
  
  try {
    aiRecognition.start();
  } catch (err) {
    console.error('Mic start error:', err);
    aiStopMic();
  }
}

function aiStopMic() {
  aiIsRecording = false;
  var micBtn = document.getElementById('aiChatMic');
  var input = document.getElementById('aiChatInput');
  var lang = localStorage.getItem('zein-lang') || 'ar';
  
  if (micBtn) {
    micBtn.classList.remove('recording');
    micBtn.innerHTML = '🎤';
  }
  
  if (input) {
    input.placeholder = lang === 'ar' ? 'اكتب أو اتكلم...' : 'Type or speak...';
  }
  
  if (aiRecognition) {
    try {
      aiRecognition.stop();
    } catch(e) {}
    aiRecognition = null;
  }
}

// ===== تشغيل =====
function aiInit() {
  if (document.getElementById('aiChatWrapper')) return;
  
  aiBuildUI();
  
  if (typeof loadProductsFromFirebase === 'function') {
    loadProductsFromFirebase(function() {
      aiProductsCache = PRODUCTS_DATA.filter(function(p) { return p.published !== false; });
      console.log('✅ AI ready with ' + aiProductsCache.length + ' products');
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(aiInit, 500);
});