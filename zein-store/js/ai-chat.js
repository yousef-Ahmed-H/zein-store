// ===== AI Chat Button (بيوديك لصفحة زين) =====

(function() {
  // بنستنى الصفحة تحمل
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
  
  function createButton() {
    // متضيفش الزرار لو إحنا جوه صفحة الشات نفسها
    if (window.location.pathname.includes('ai-chat.html')) return;
    
    // متضيفش الزرار لو موجود أصلاً
    if (document.getElementById('zeinChatBtn')) return;
    
    var lang = localStorage.getItem('zein-lang') || 'ar';
    var btnTitle = lang === 'ar' ? 'تحدث مع زين' : 'Chat with Zein';
    
    var btn = document.createElement('button');
    btn.id = 'zeinChatBtn';
    btn.innerHTML = '🤖';
    btn.title = btnTitle;
    btn.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 75px;
      height: 75px;
      background: linear-gradient(135deg, #C9A961, #b89651);
      border: 5px solid #fff;
      border-radius: 50%;
      font-size: 38px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 35px rgba(201,169,97,0.7);
      z-index: 9999;
      transition: all 0.3s ease;
      animation: zeinBtnPulse 2s infinite;
      position: fixed;
    `;
    
    // نقطة خضراء
    var dot = document.createElement('span');
    dot.style.cssText = `
      position: absolute;
      top: 0;
      right: 0;
      width: 18px;
      height: 18px;
      background: #4ade80;
      border: 4px solid #fff;
      border-radius: 50%;
    `;
    btn.appendChild(dot);
    
    btn.onmouseover = function() { this.style.transform = 'scale(1.1) rotate(10deg)'; };
    btn.onmouseout = function() { this.style.transform = 'scale(1) rotate(0deg)'; };
    btn.onclick = function() {
      // لو إحنا في الصفحة الرئيسية أو أي صفحة داخل فولدر، نروح لصفحة الشات
      window.location.href = 'ai-chat.html';
    };
    
    document.body.appendChild(btn);
    
    // CSS animation
    var style = document.createElement('style');
    style.textContent = `
      @keyframes zeinBtnPulse {
        0% { box-shadow: 0 0 0 0 rgba(201,169,97,0.7); }
        70% { box-shadow: 0 0 0 25px rgba(201,169,97,0); }
        100% { box-shadow: 0 0 0 0 rgba(201,169,97,0); }
      }
      @media (max-width: 768px) {
        #zeinChatBtn {
          width: 65px !important;
          height: 65px !important;
          font-size: 32px !important;
          bottom: 20px !important;
          right: 20px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
})();