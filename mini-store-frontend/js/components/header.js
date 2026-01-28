document.addEventListener("DOMContentLoaded", function () {
  loadHeader();
});

async function loadHeader() {
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (!headerPlaceholder) return;

  const assetRoot = "../";

  // Vẽ khung Header cơ bản (Chưa có user)
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
        <div class="header-actions" id="header-user-area">
            <a href="cart.html" class="cart-btn">
                <i class="fas fa-shopping-basket"></i><span class="cart-count">0</span>
            </a>
            <a href="auth.html" class="btn btn-primary" style="background-color: var(--primary-color); color: #fff !important;">Đăng Nhập</a>
        </div>
      </div>
    </header>
  `;

  highlightActiveMenu();
  await updateLoginState(assetRoot); // Gọi hàm cập nhật user
  updateCartBadge();
}

// --- HÀM CẬP NHẬT TRẠNG THÁI (ĐÃ SỬA LỖI LOGIC) ---
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
        // Kết hợp dữ liệu: ưu tiên avatar từ localStorage nếu API không có
        currentUser = {
          ...apiUser,
          avatar: apiUser.avatar || localUser.avatar // Giữ avatar local nếu API không có
        };
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    } catch (error) {
      console.warn("Server offline, dùng dữ liệu cũ.");
    }

    // 1. TÍNH TOÁN TÊN TRƯỚC
    // Ưu tiên 'name' -> 'fullName' -> 'email'
    let displayName = currentUser.name || currentUser.fullName;

    // Nếu tên chưa có -> Lấy từ email
    if (!displayName || displayName.trim() === "") {
      if (currentUser.email) {
        displayName = currentUser.email.split("@")[0];
      } else {
        displayName = "Khách hàng";
      }
    }

    // 2. TÍNH TOÁN AVATAR TRƯỚC
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

    // 3. SAU KHI CÓ BIẾN MỚI GÁN VÀO HTML
    userArea.innerHTML = `
        <a href="cart.html" class="cart-btn" style="text-decoration: none;">
            <i class="fas fa-shopping-basket"></i>
            <span class="cart-count">0</span>
        </a>
        
        <div class="user-dropdown" style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin-left: 15px;" onclick="window.location.href='profile.html'">
            <img src="${finalAvatarUrl}" 
                 alt="${displayName}" 
                 style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #d8b26e;"
                 onerror="this.src='${defaultAvatarUrl}'"
            >
            <span style="font-weight: 700; color: #333; font-size: 0.95rem;">${displayName}</span>
        </div>
        
        <button onclick="handleLogout()" style="margin-left: 15px; background: none; border: none; color: #d32f2f; cursor: pointer; font-size: 1.2rem;" title="Đăng xuất">
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
  // Nếu đang ở chế độ Mua Ngay, hiển thị số lượng từ cart_backup (giỏ hàng cũ)
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
