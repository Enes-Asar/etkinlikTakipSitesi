// Global değişkenler
let currentUser = null;
let events = [
    {
        id: 1,
        name: "Müzik Festivali",
        date: "15 Haziran 2025",
        location: "İstanbul - Harbiye",
        description: "Ünlü sanatçıların katıldığı büyük müzik festivali",
        capacity: 5000,
        registered: 2340,
        price: 150,
        category: "Müzik",
        organizer: "EventCorp",
        image: "🎵"
    },
    {
        id: 2,
        name: "Teknoloji Konferansı",
        date: "20 Haziran 2025",
        location: "İstanbul - Maslak",
        description: "En son teknoloji trendleri ve yapay zeka",
        capacity: 500,
        registered: 320,
        price: 0,
        category: "Teknoloji",
        organizer: "TechHub",
        image: "💻"
    },
    {
        id: 3,
        name: "Maraton Yarışması",
        date: "25 Haziran 2025",
        location: "İstanbul - Bosphorus",
        description: "Boğaz köprüsü üzerinden geçen maraton",
        capacity: 10000,
        registered: 8500,
        price: 50,
        category: "Spor",
        organizer: "SporClub",
        image: "🏃"
    },
    {
        id: 4,
        name: "Sanat Sergisi",
        date: "30 Haziran 2025",
        location: "İstanbul - Beyoğlu",
        description: "Modern sanat eserlerinin sergilendiği özel etkinlik",
        capacity: 200,
        registered: 145,
        price: 25,
        category: "Sanat",
        organizer: "ArtGallery",
        image: "🎨"
    },
    {
        id: 5,
        name: "Yemek Festivali",
        date: "5 Temmuz 2025",
        location: "İstanbul - Kadıköy",
        description: "Dünya mutfaklarından lezzetler",
        capacity: 3000,
        registered: 1200,
        price: 75,
        category: "Yemek",
        organizer: "FoodLove",
        image: "🍜"
    }
];

let users = [
    {
        id: 1,
        username: "admin",
        password: "admin123",
        email: "admin@etkinlikhub.com",
        name: "Admin User",
        role: "admin",
        registeredEvents: []
    },
    {
        id: 2,
        username: "kullanici1",
        password: "123456",
        email: "user1@email.com",
        name: "Ahmet Yılmaz",
        role: "user",
        registeredEvents: [1, 3]
    }
];

let myEvents = []; // Kullanıcının katıldığı etkinlikler

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    loadUserFromStorage();
    updateUI();
    loadEventStats();
});

// Local Storage'dan kullanıcı bilgilerini yükle
function loadUserFromStorage() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
}

// Kullanıcı durumuna göre UI güncellemesi
function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        if (currentUser) {
            loginBtn.textContent = `Merhaba, ${currentUser.name}`;
            loginBtn.onclick = logout;
        } else {
            loginBtn.textContent = 'Giriş Yap';
            loginBtn.onclick = () => window.location.href = 'pages/login.html';
        }
    }
}

// Ana sayfada etkinlik istatistiklerini güncelle
function loadEventStats() {
    const totalEventsEl = document.getElementById('totalEvents');
    const totalUsersEl = document.getElementById('totalUsers');
    const totalParticipantsEl = document.getElementById('totalParticipants');
    
    if (totalEventsEl) {
        totalEventsEl.textContent = events.length;
    }
    
    if (totalUsersEl) {
        totalUsersEl.textContent = users.length;
    }
    
    if (totalParticipantsEl) {
        const totalParticipants = events.reduce((sum, event) => sum + event.registered, 0);
        totalParticipantsEl.textContent = totalParticipants.toLocaleString();
    }
}

// Etkinliğe katılma fonksiyonu
function joinEvent(eventId) {
    if (!currentUser) {
        alert('Etkinliğe katılmak için önce giriş yapmalısınız!');
        window.location.href = 'pages/login.html';
        return;
    }
    
    const event = events.find(e => e.id == eventId || e.name.toLowerCase().includes(eventId));
    if (!event) {
        alert('Etkinlik bulunamadı!');
        return;
    }
    
    // Zaten kayıtlı mı kontrol et
    if (currentUser.registeredEvents.includes(event.id)) {
        alert('Bu etkinliğe zaten kayıtlısınız!');
        return;
    }
    
    // Kapasite kontrol et
    if (event.registered >= event.capacity) {
        alert('Bu etkinlik dolu! Kapasite sınırına ulaşılmış.');
        return;
    }
    
    // Etkinliğe kaydet
    currentUser.registeredEvents.push(event.id);
    event.registered++;
    
    // Local storage'a kaydet
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    alert(`${event.name} etkinliğine başarıyla kaydoldunuz!`);
    
    // Sayfayı yenile veya UI'yi güncelle
    if (typeof updateEventsList === 'function') {
        updateEventsList();
    }
}

// Çıkış yapma fonksiyonu
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    alert('Başarıyla çıkış yaptınız!');
    window.location.href = '../index.html';
}

// Giriş yapma fonksiyonu
function login(username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return true;
    }
    return false;
}

// Kayıt olma fonksiyonu
function register(userData) {
    // Kullanıcı adı zaten var mı kontrol et
    const existingUser = users.find(u => u.username === userData.username || u.email === userData.email);
    if (existingUser) {
        return false;
    }
    
    // Yeni kullanıcı oluştur
    const newUser = {
        id: users.length + 1,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        name: userData.name,
        role: 'user',
        registeredEvents: []
    };
    
    users.push(newUser);
    return true;
}

// Form validasyonu
function validateForm(formData) {
    const errors = [];
    
    if (!formData.username || formData.username.length < 3) {
        errors.push('Kullanıcı adı en az 3 karakter olmalıdır');
    }
    
    if (!formData.password || formData.password.length < 6) {
        errors.push('Şifre en az 6 karakter olmalıdır');
    }
    
    if (!formData.email || !formData.email.includes('@')) {
        errors.push('Geçerli bir email adresi giriniz');
    }
    
    if (!formData.name || formData.name.length < 2) {
        errors.push('Ad soyad en az 2 karakter olmalıdır');
    }
    
    return errors;
}

// Admin fonksiyonları
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// Etkinlik ekleme fonksiyonu (Admin)
function addEvent(eventData) {
    if (!isAdmin()) {
        alert('Bu işlem için admin yetkisi gereklidir!');
        return false;
    }
    
    const newEvent = {
        id: events.length + 1,
        name: eventData.name,
        date: eventData.date,
        location: eventData.location,
        description: eventData.description,
        capacity: parseInt(eventData.capacity),
        registered: 0,
        price: parseInt(eventData.price),
        category: eventData.category,
        organizer: eventData.organizer,
        image: eventData.image || "📅"
    };
    
    events.push(newEvent);
    return true;
}

// Etkinlik silme fonksiyonu (Admin)
function deleteEvent(eventId) {
    if (!isAdmin()) {
        alert('Bu işlem için admin yetkisi gereklidir!');
        return false;
    }
    
    const eventIndex = events.findIndex(e => e.id == eventId);
    if (eventIndex > -1) {
        events.splice(eventIndex, 1);
        return true;
    }
    return false;
}

// Etkinlik güncelleme fonksiyonu (Admin)
function updateEvent(eventId, eventData) {
    if (!isAdmin()) {
        alert('Bu işlem için admin yetkisi gereklidir!');
        return false;
    }
    
    const eventIndex = events.findIndex(e => e.id == eventId);
    if (eventIndex > -1) {
        events[eventIndex] = { ...events[eventIndex], ...eventData };
        return true;
    }
    return false;
}

// Kullanıcı silme fonksiyonu (Admin)
function deleteUser(userId) {
    if (!isAdmin()) {
        alert('Bu işlem için admin yetkisi gereklidir!');
        return false;
    }
    
    const userIndex = users.findIndex(u => u.id == userId);
    if (userIndex > -1) {
        users.splice(userIndex, 1);
        return true;
    }
    return false;
}

// Etkinlikten çıkma fonksiyonu
function leaveEvent(eventId) {
    if (!currentUser) {
        alert('Bu işlem için giriş yapmalısınız!');
        return;
    }
    
    const eventIndex = currentUser.registeredEvents.indexOf(parseInt(eventId));
    if (eventIndex > -1) {
        currentUser.registeredEvents.splice(eventIndex, 1);
        
        // Etkinlik katılımcı sayısını azalt
        const event = events.find(e => e.id == eventId);
        if (event) {
            event.registered--;
        }
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert('Etkinlikten başarıyla çıkıldınız!');
        
        // Sayfayı yenile
        if (typeof loadUserEvents === 'function') {
            loadUserEvents();
        }
    }
}

// Etkinlik arama fonksiyonu
function searchEvents(query) {
    if (!query) return events;
    
    const lowercaseQuery = query.toLowerCase();
    return events.filter(event => 
        event.name.toLowerCase().includes(lowercaseQuery) ||
        event.location.toLowerCase().includes(lowercaseQuery) ||
        event.category.toLowerCase().includes(lowercaseQuery) ||
        event.description.toLowerCase().includes(lowercaseQuery)
    );
}

// Kategori filtreleme
function filterEventsByCategory(category) {
    if (category === 'all') return events;
    return events.filter(event => event.category === category);
}

// Tarih formatlama
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Fiyat formatlama
function formatPrice(price) {
    if (price === 0) return 'Ücretsiz';
    return `${price} TL`;
}

// Mesaj gösterme fonksiyonu
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Modal açma/kapama fonksiyonları
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Window click ile modal kapama
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Sayfa değiştirme fonksiyonları
function goToEvents() {
    window.location.href = 'pages/events.html';
}

function goToAdmin() {
    if (!currentUser) {
        alert('Admin paneline erişmek için giriş yapmalısınız!');
        window.location.href = 'pages/login.html';
        return;
    }
    
    if (!isAdmin()) {
        alert('Admin paneline erişim yetkiniz yok!');
        return;
    }
    
    window.location.href = 'pages/admin.html';
}

function goToProfile() {
    if (!currentUser) {
        alert('Profilinizi görüntülemek için giriş yapmalısınız!');
        window.location.href = 'pages/login.html';
        return;
    }
    
    window.location.href = 'pages/profile.html';
}

// Debugging için konsola bilgi yazdır
console.log('Etkinlik Takip Sistemi JavaScript yüklendi');
console.log('Toplam etkinlik sayısı:', events.length);
console.log('Toplam kullanıcı sayısı:', users.length);