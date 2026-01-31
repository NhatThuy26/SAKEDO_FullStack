document.addEventListener("DOMContentLoaded", function () {
  loadHeader();
});

async function loadHeader() {
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (!headerPlaceholder) return;

  const assetRoot = "../";

  headerPlaceholder.innerHTML = `
    <header class="header">
      <div class="container header-inner">
        <a href="global.html" class="logo">
          <img src="${assetRoot}assets/images/logo.png" alt="Sakedo Logo" />
        </a>
        <nav class="navbar">
          <ul class="nav-list">
            <li><a href="global.html" class="nav-link">Trang Chủ</a></li>
            <li><a href="menu.html" class="nav-link">Thực Đơn</a></li>
            <li><a href="booking.html" class="nav-link">Đặt Bàn</a></li>
            <li><a href="contact.html" class="nav-link">Liên Hệ</a></li>
            <li><a href="profile.html" class="nav-link">Cá Nhân</a></li>
          </ul>
        </nav>
        
        <!-- Thanh tìm kiếm mini với gợi ý -->
        <div class="header-search">
          <input type="text" id="header-search-input" class="search-input" placeholder="Tìm món..." 
            oninput="showSearchSuggestions(this.value)" 
            onkeydown="handleSearchKeydown(event)"
            onfocus="showSearchSuggestions(this.value)"
            autocomplete="off">
          <button class="search-btn" onclick="performHeaderSearch()">
            <i class="fas fa-search"></i>
          </button>
          <div id="search-suggestions" class="search-suggestions"></div>
        </div>
        
        <div class="header-actions" id="header-user-area">
            <a href="cart.html" class="cart-btn">
                <i class="fas fa-shopping-basket"></i><span class="cart-count">0</span>
            </a>
            <a href="auth.html" class="btn btn-primary btn-login-primary">Đăng Nhập</a>
        </div>
      </div>
    </header>
  `;

  highlightActiveMenu();
  await updateLoginState(assetRoot);
  updateCartBadge();
}

async function updateLoginState(assetRoot) {
  const userArea = document.getElementById("header-user-area");
  let localUser = JSON.parse(localStorage.getItem("user"));

  if (localUser && localUser.email && userArea) {
    let currentUser = localUser;

    try {
      const response = await fetch(
        `http://localhost:8080/api/users/email/${localUser.email}`
      );
      if (response.ok) {
        const apiUser = await response.json();
        currentUser = {
          ...apiUser,
          avatar: apiUser.avatar || localUser.avatar
        };
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    } catch (error) {
      console.warn("Server offline, dùng dữ liệu cũ.");
    }

    let displayName = currentUser.name || currentUser.fullName;

    if (!displayName || displayName.trim() === "") {
      if (currentUser.email) {
        displayName = currentUser.email.split("@")[0];
      } else {
        displayName = "Khách hàng";
      }
    }

    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=d8b26e&color=fff&size=128&bold=true`;
    let finalAvatarUrl = defaultAvatarUrl;

    if (currentUser.avatar && currentUser.avatar.trim() !== "") {
      if (currentUser.avatar.startsWith("http") || currentUser.avatar.startsWith("data:")) {
        finalAvatarUrl = currentUser.avatar;
      } else {
        const cleanPath = currentUser.avatar.replace(
          /^(\.\/|\/|assets\/images\/)/,
          ""
        );
        finalAvatarUrl = `${assetRoot}assets/images/${cleanPath}`;
      }
    }

    userArea.innerHTML = `
        <a href="cart.html" class="cart-btn cart-btn-clean">
            <i class="fas fa-shopping-basket"></i>
            <span class="cart-count">0</span>
        </a>
        
        <div class="user-dropdown user-dropdown-container" onclick="window.location.href='profile.html'">
            <img src="${finalAvatarUrl}" 
                 alt="${displayName}" 
                 class="user-avatar-img"
                 onerror="this.src='${defaultAvatarUrl}'"
            >
            <span class="user-display-name">${displayName}</span>
        </div>
        
        <button onclick="handleLogout()" class="btn-logout-icon" title="Đăng xuất">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    `;
  }
}

function highlightActiveMenu() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    if (currentPath.includes(link.getAttribute("href")))
      link.classList.add("active");
  });
}

function updateCartBadge() {
  const isBuyNowMode = localStorage.getItem("buyNowMode") === "true";
  let cart;

  if (isBuyNowMode) {
    cart = JSON.parse(localStorage.getItem("cart_backup")) || [];
  } else {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  }

  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document
    .querySelectorAll(".cart-count")
    .forEach((b) => (b.innerText = total));
}

window.handleLogout = function () {
  if (confirm("Bạn có chắc muốn đăng xuất?")) {
    localStorage.removeItem("user");
    window.location.href = "auth.html";
  }
};

// Danh sách món ăn để gợi ý
const searchableItems = [
  { id: 1, name: "Cơm Tấm Sườn Bì Chả", section: "best-sellers" },
  { id: 2, name: "Phở Bò Tái Nạm", section: "best-sellers" },
  { id: 3, name: "Bánh Mì Chảo", section: "best-sellers" },
  { id: 4, name: "Bún Bò Huế", section: "best-sellers" },
  { id: 5, name: "Hủ Tiếu Nam Vang", section: "best-sellers" },
  { id: 6, name: "Cơm Gà Xối Mỡ", section: "best-sellers" },
  { id: 7, name: "Bánh Xèo Giòn", section: "best-sellers" },
  { id: 8, name: "Gỏi Cuốn Tôm Thịt", section: "best-sellers" },
  { id: 9, name: "Cơm Chiên Dương Châu", section: "main-dishes" },
  { id: 10, name: "Bún Riêu Cua", section: "main-dishes" },
  { id: 11, name: "Nem Nướng Nha Trang", section: "main-dishes" },
  { id: 12, name: "Thịt Kho Tàu", section: "main-dishes" },
  { id: 13, name: "Cá Kho Tộ", section: "main-dishes" },
  { id: 14, name: "Mì Quảng Đà Nẵng", section: "main-dishes" },
  { id: 15, name: "Gà Nướng Mật Ong", section: "main-dishes" },
  { id: 16, name: "Vịt Quay Bắc Kinh", section: "main-dishes" },
  { id: 17, name: "Bò Kho Bánh Mì", section: "main-dishes" },
  { id: 18, name: "Chè Khúc Bạch", section: "desserts" },
  { id: 19, name: "Chè Thái Thập Cẩm", section: "desserts" },
  { id: 20, name: "Chè Chuối Nướng", section: "desserts" },
  { id: 21, name: "Bánh Flan Caramen", section: "desserts" },
  { id: 22, name: "Bánh Đậu Xanh", section: "desserts" },
  { id: 23, name: "Bánh Lọt Lá Dứa", section: "desserts" },
  { id: 24, name: "Trà Sen Vàng", section: "desserts" },
  { id: 25, name: "Nước Chanh Tươi", section: "desserts" },
  { id: 26, name: "Bánh Dâu Tây", section: "desserts" },
];

let selectedSuggestionIndex = -1;

// Hiển thị gợi ý tìm kiếm
window.showSearchSuggestions = function (query) {
  const suggestionsContainer = document.getElementById("search-suggestions");
  if (!suggestionsContainer) return;

  if (!query || query.trim().length < 1) {
    suggestionsContainer.style.display = "none";
    selectedSuggestionIndex = -1;
    return;
  }

  const lowerQuery = query.toLowerCase().trim();
  const matches = searchableItems.filter(item =>
    item.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 6); // Giới hạn 6 gợi ý

  if (matches.length === 0) {
    suggestionsContainer.innerHTML = '<div class="suggestion-empty">Không tìm thấy món ăn</div>';
    suggestionsContainer.style.display = "block";
    return;
  }

  suggestionsContainer.innerHTML = matches.map((item, index) => `
    <div class="suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}" 
         onclick="selectSuggestion(${item.id}, '${item.name}', '${item.section}')"
         data-index="${index}">
      <i class="fas fa-utensils"></i>
      <span>${highlightMatch(item.name, query)}</span>
    </div>
  `).join('');

  suggestionsContainer.style.display = "block";
};

// Highlight từ khóa trong kết quả
function highlightMatch(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<strong>$1</strong>');
}

// Chọn gợi ý
window.selectSuggestion = function (id, name, section) {
  const searchInput = document.getElementById("header-search-input");
  if (searchInput) searchInput.value = name;

  const suggestionsContainer = document.getElementById("search-suggestions");
  if (suggestionsContainer) suggestionsContainer.style.display = "none";

  // Chuyển đến trang menu với thông tin món ăn
  window.location.href = `menu.html?productId=${id}&section=${section}&name=${encodeURIComponent(name)}`;
};

// Xử lý phím mũi tên và Enter
window.handleSearchKeydown = function (event) {
  const suggestionsContainer = document.getElementById("search-suggestions");
  const items = suggestionsContainer ? suggestionsContainer.querySelectorAll('.suggestion-item') : [];

  if (event.key === "ArrowDown") {
    event.preventDefault();
    selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, items.length - 1);
    updateSelectedSuggestion(items);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
    updateSelectedSuggestion(items);
  } else if (event.key === "Enter") {
    event.preventDefault();
    if (selectedSuggestionIndex >= 0 && items[selectedSuggestionIndex]) {
      items[selectedSuggestionIndex].click();
    } else {
      performHeaderSearch();
    }
  } else if (event.key === "Escape") {
    if (suggestionsContainer) suggestionsContainer.style.display = "none";
    selectedSuggestionIndex = -1;
  }
};

function updateSelectedSuggestion(items) {
  items.forEach((item, index) => {
    item.classList.toggle('selected', index === selectedSuggestionIndex);
  });
}

// Tìm kiếm chung
window.performHeaderSearch = function () {
  const searchInput = document.getElementById("header-search-input");
  if (searchInput && searchInput.value.trim()) {
    const query = encodeURIComponent(searchInput.value.trim());
    window.location.href = `menu.html?search=${query}`;
  }
};

// Ẩn gợi ý khi click ra ngoài
document.addEventListener("click", function (e) {
  const searchContainer = document.querySelector(".header-search");
  const suggestionsContainer = document.getElementById("search-suggestions");
  if (searchContainer && suggestionsContainer && !searchContainer.contains(e.target)) {
    suggestionsContainer.style.display = "none";
    selectedSuggestionIndex = -1;
  }
});
