// ===== Floating Chat Button (يوديك لصفحة زين) =====
(function() {
  function createButton() {
    // متضيفهوش في صفحة الشات نفسها
    if (window.location.pathname.includes('ai-chat.html')) return;
    if (document.getElementById('zeinChatBtn')) return;
    
    var btn = document.createElement('button');
    btn.id = 'zeinChatBtn';
    btn.innerHTML = '🤖';
    btn.title = 'تحدث مع زين';
    btn.style.cssText = [
      'position:fixed',
      'bottom:25px',
      'right:25px',
      'width:70px',
      'height:70px',
      'background:linear-gradient(135deg,#C9A961,#b89651)',
      'border:5px solid #fff',
      'border-radius:50%',
      'font-size:34px',
      'cursor:pointer',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'box-shadow:0 10px 35px rgba(201,169,97,0.6)',
      'z-index:9999',
      'transition:transform 0.3s ease',
      'animation:zeinPulse 2s infinite'
    ].join(';');
    
    var dot = document.createElement('span');
    dot.style.cssText = 'position:absolute;top:2px;right:2px;width:16px;height:16px;background:#4ade80;border:3px solid #fff;border-radius:50%;';
    btn.appendChild(dot);
    
    btn.onmouseover = function() { this.style.transform = 'scale(1.1) rotate(10deg)'; };
    btn.onmouseout = function() { this.style.transform = 'scale(1) rotate(0deg)'; };
    btn.onclick = function() { window.location.href = 'ai-chat.html'; };
    
    document.body.appendChild(btn);
    
    if (!document.getElementById('zeinChatStyle')) {
      var style = document.createElement('style');
      style.id = 'zeinChatStyle';
      style.textContent = '@keyframes zeinPulse{0%{box-shadow:0 0 0 0 rgba(201,169,97,0.7)}70%{box-shadow:0 0 0 25px rgba(201,169,97,0)}100%{box-shadow:0 0 0 0 rgba(201,169,97,0)}}@media(max-width:768px){#zeinChatBtn{width:60px!important;height:60px!important;font-size:28px!important;bottom:20px!important;right:20px!important}}';
      document.head.appendChild(style);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
})();