document.addEventListener("DOMContentLoaded", function () {
  loadProfileData();
  setupActionHandler();
  setupPasswordModal();
});

let isEditing = false;

// ============================================================
// 1. TẢI THÔNG TIN NGƯỜI DÙNG
// ============================================================
async function loadProfileData() {
  const localUser = JSON.parse(localStorage.getItem("user"));

  if (!localUser || !localUser.email) {
    alert("Vui lòng đăng nhập!");
    window.location.href = "auth.html";
    return;
  }

  try {
    // Gọi API lấy thông tin mới nhất
    const response = await fetch(
      `http://localhost:8080/api/users/email/${localUser.email}`
    );
    if (!response.ok) throw new Error("User not found");

    const userData = await response.json();

    // Xử lý tên hiển thị
    const displayName =
      userData.name || userData.fullName || userData.email.split("@")[0];

    // --- ĐIỀN DỮ LIỆU VÀO Ô INPUT ---
    // (Thay vì dùng hàm ngoài, mình viết trực tiếp ở đây cho chắc chắn)
    if (document.getElementById("profile-name"))
      document.getElementById("profile-name").value = displayName;

    if (document.getElementById("profile-email"))
      document.getElementById("profile-email").value = userData.email;

    if (document.getElementById("profile-phone"))
      document.getElementById("profile-phone").value = userData.phone || "";

    if (document.getElementById("profile-address"))
      document.getElementById("profile-address").value = userData.address || "";

    // Điền tên to dưới avatar
    const heroName = document.querySelector(".profile-hero-name");
    if (heroName) heroName.textContent = displayName;

    // Xử lý Avatar
    const avatarImg = document.getElementById("profile-avatar-img");
    if (avatarImg) {
      let avatarUrl = userData.avatar;
      if (!avatarUrl || avatarUrl.trim() === "") {
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          displayName
        )}&background=d8b26e&color=fff&size=128&bold=true`;
      } else if (!avatarUrl.startsWith("http")) {
        const cleanPath = avatarUrl.replace(/^(\.\/|\/|assets\/images\/)/, "");
        avatarUrl = `../assets/images/${cleanPath}`;
      }
      avatarImg.src = avatarUrl;
    }

    // Lưu ID để dùng cho việc cập nhật sau này
    localStorage.setItem("currentUserId", userData.id);
  } catch (error) {
    console.error("Lỗi tải profile:", error);
  }
}

// ============================================================
// 2. XỬ LÝ NÚT CHỈNH SỬA / LƯU
// ============================================================
function setupActionHandler() {
  const actionBtn = document.getElementById("btn-profile-action");
  const inputs = [
    document.getElementById("profile-name"),
    document.getElementById("profile-phone"),
    document.getElementById("profile-address"),
  ];

  if (actionBtn) {
    actionBtn.addEventListener("click", async function (e) {
      e.preventDefault();

      if (!isEditing) {
        // >>> CHUYỂN SANG CHẾ ĐỘ SỬA
        isEditing = true;
        inputs.forEach((input) => {
          if (input) input.disabled = false;
        });
        if (inputs[0]) inputs[0].focus();

        actionBtn.innerHTML =
          '<i class="fas fa-save"></i> <span>Lưu thay đổi</span>';
        actionBtn.style.backgroundColor = "var(--primary-color)";
        actionBtn.style.color = "#000";
      } else {
        // >>> THỰC HIỆN LƯU
        const userId = localStorage.getItem("currentUserId");
        if (!userId) return;

        const updateData = {
          name: document.getElementById("profile-name").value, // Đã sửa thành name
          phone: document.getElementById("profile-phone").value,
          address: document.getElementById("profile-address").value,
        };

        try {
          actionBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> <span>Đang lưu...</span>';

          const response = await fetch(
            `http://localhost:8080/api/users/update/${userId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updateData),
            }
          );

          if (response.ok) {
            const updatedUser = await response.json();

            // Cập nhật localStorage
            let currentUser = JSON.parse(localStorage.getItem("user"));
            const newUserState = { ...currentUser, ...updatedUser };
            localStorage.setItem("user", JSON.stringify(newUserState));

            alert("Cập nhật thành công!");
            window.location.reload();
          } else {
            alert("Cập nhật thất bại!");
            actionBtn.innerHTML =
              '<i class="fas fa-save"></i> <span>Lưu thay đổi</span>';
          }
        } catch (error) {
          console.error("Lỗi update:", error);
          alert("Lỗi kết nối Server!");
          actionBtn.innerHTML =
            '<i class="fas fa-save"></i> <span>Lưu thay đổi</span>';
        }
      }
    });
  }
}

// ============================================================
// 3. XỬ LÝ MODAL ĐỔI MẬT KHẨU
// ============================================================
function setupPasswordModal() {
  const modal = document.getElementById("password-modal");
  const openBtn = document.getElementById("btn-open-password-modal");
  const closeBtn = document.getElementById("modal-close");
  const cancelBtn = document.getElementById("btn-cancel");
  const passwordForm = document.getElementById("password-form");

  if (openBtn)
    openBtn.onclick = () => {
      modal.style.display = "flex";
      if (passwordForm) passwordForm.reset();
    };
  if (closeBtn) closeBtn.onclick = () => (modal.style.display = "none");
  if (cancelBtn) cancelBtn.onclick = () => (modal.style.display = "none");
  window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
  };

  if (passwordForm) {
    passwordForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const currentPassword = document.getElementById("current-password").value;
      const newPassword = document.getElementById("new-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;
      const userId = localStorage.getItem("currentUserId");

      if (newPassword !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/users/change-password/${userId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              oldPassword: currentPassword,
              newPassword: newPassword,
            }),
          }
        );

        const result = await response.json();
        if (response.ok) {
          alert("🎉 " + result.message);
          modal.style.display = "none";
          passwordForm.reset();
        } else {
          alert("❌ " + (result.message || "Lỗi đổi mật khẩu"));
        }
      } catch (error) {
        alert("Lỗi kết nối Server!");
      }
    });
  }
}
