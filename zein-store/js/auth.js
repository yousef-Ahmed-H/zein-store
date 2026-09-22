// ===== Authentication Functions =====

function getUsers() {
  return JSON.parse(localStorage.getItem('zein-users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('zein-users', JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('zein-current-user') || 'null');
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('zein-current-user', JSON.stringify(user));
  } else {
    localStorage.removeItem('zein-current-user');
  }
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function register(name, email, password) {
  const users = getUsers();
  
  if (users.find(u => u.email === email)) {
    return { success: false, message: currentLang === 'ar' ? 'البريد مسجل بالفعل' : 'Email already registered' };
  }
  
  const newUser = { name, email, password, createdAt: new Date().toISOString() };
  users.push(newUser);
  saveUsers(users);
  
  return { success: true, message: currentLang === 'ar' ? 'تم التسجيل بنجاح' : 'Registration successful' };
}

function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return { success: false, message: currentLang === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials' };
  }
  
  setCurrentUser(user);
  return { success: true, message: currentLang === 'ar' ? 'تم الدخول بنجاح' : 'Login successful' };
}

function logout() {
  setCurrentUser(null);
  window.location.href = 'index.html';
}

function updateUserUI() {
  const user = getCurrentUser();
  const loginBtn = document.getElementById('loginBtn') || document.getElementById('userBtn');
  
  if (loginBtn) {
    if (user) {
      loginBtn.innerHTML = `<span>👤 ${user.name.split(' ')[0]}</span>`;
      loginBtn.title = user.name;
      loginBtn.onclick = (e) => {
        e.preventDefault();
        if (confirm(currentLang === 'ar' ? 'هل تريد تسجيل الخروج?' : 'Do you want to logout?')) {
          logout();
        }
      };
    } else {
      loginBtn.innerHTML = '<span>👤</span>';
      loginBtn.title = currentLang === 'ar' ? 'تسجيل الدخول' : 'Login';
      loginBtn.onclick = null;
    }
  }
}

function initAuth() {
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authMessage = document.getElementById('authMessage');
  
  if (loginTab && registerTab) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.style.display = 'flex';
      registerForm.style.display = 'none';
      authMessage.textContent = '';
    });
    
    registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      registerForm.style.display = 'flex';
      loginForm.style.display = 'none';
      authMessage.textContent = '';
    });
  }
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      const result = login(email, password);
      
      if (result.success) {
        authMessage.textContent = result.message;
        authMessage.className = 'auth-message success';
        showToast(result.message, 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
      } else {
        authMessage.textContent = result.message;
        authMessage.className = 'auth-message error';
      }
    });
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('regConfirmPassword').value;
      
      if (password !== confirmPassword) {
        authMessage.textContent = currentLang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match';
        authMessage.className = 'auth-message error';
        return;
      }
      
      if (password.length < 6) {
        authMessage.textContent = currentLang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
        authMessage.className = 'auth-message error';
        return;
      }
      
      const result = register(name, email, password);
      
      if (result.success) {
        authMessage.textContent = result.message;
        authMessage.className = 'auth-message success';
        showToast(result.message, 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
      } else {
        authMessage.textContent = result.message;
        authMessage.className = 'auth-message error';
      }
    });
  }
  
  updateUserUI();
}

document.addEventListener('DOMContentLoaded', () => {
  updateUserUI();
});