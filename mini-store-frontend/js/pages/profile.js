document.addEventListener("DOMContentLoaded", function () {
  loadProfileData();
  setupActionHandler();
  setupPasswordModal();
  setupAvatarUpload();
});

let isEditing = false;
let tempAvatarBase64 = "";

// 1. TẢI THÔNG TIN
async function loadProfileData() {
  const localUser = JSON.parse(localStorage.getItem("user"));
  if (!localUser || !localUser.email) {
    alert("Vui lòng đăng nhập!");
    window.location.href = "auth.html";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/users/email/${localUser.email}`
    );
    if (!response.ok) throw new Error("User not found");
    const userData = await response.json();

    // Xử lý text
    const displayName =
      userData.name || userData.fullName || userData.email.split("@")[0];
    if (document.getElementById("profile-name"))
      document.getElementById("profile-name").value = displayName;
    if (document.getElementById("profile-email"))
      document.getElementById("profile-email").value = userData.email;
    if (document.getElementById("profile-phone"))
      document.getElementById("profile-phone").value = userData.phone || "";
    if (document.getElementById("profile-address"))
      document.getElementById("profile-address").value = userData.address || "";

    const heroName = document.querySelector(".profile-hero-name");
    if (heroName) heroName.textContent = displayName;

    // Xử lý Avatar hiển thị
    const avatarImg = document.getElementById("profile-avatar-img");
    if (avatarImg) {
      let avatarUrl = userData.avatar;
      // Nếu không có ảnh -> Dùng Avatar chữ
      if (!avatarUrl || avatarUrl.trim() === "") {
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          displayName
        )}&background=d8b26e&color=fff&size=128&bold=true`;
      } else if (
        !avatarUrl.startsWith("http") &&
        !avatarUrl.startsWith("data:image")
      ) {
        const cleanPath = avatarUrl.replace(/^(\.\/|\/|assets\/images\/)/, "");
        avatarUrl = `../assets/images/${cleanPath}`;
      }
      avatarImg.src = avatarUrl;
    }

    localStorage.setItem("currentUserId", userData.id);
  } catch (error) {
    console.error("Lỗi tải profile:", error);
  }
}

// 2. XỬ LÝ CHỌN ẢNH (PREVIEW)
function setupAvatarUpload() {
  const triggerBtn = document.getElementById("btn-trigger-upload");
  const fileInput = document.getElementById("file-upload-input");
  const avatarImg = document.getElementById("profile-avatar-img");

  if (triggerBtn && fileInput) {
    triggerBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        // Kiểm tra file > 5MB thì cảnh báo (Base64 sẽ x1.3 dung lượng)
        if (file.size > 5 * 1024 * 1024) {
          alert("Ảnh quá lớn (>5MB)! Vui lòng chọn ảnh nhẹ hơn.");
          return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
          avatarImg.src = e.target.result;
          tempAvatarBase64 = e.target.result; // Lưu vào biến tạm
          console.log(
            "Đã chọn ảnh mới, độ dài chuỗi:",
            tempAvatarBase64.length
          );
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// 3. XỬ LÝ LƯU (ACTION HANDLER)
function setupActionHandler() {
  const actionBtn = document.getElementById("btn-profile-action");
  const inputs = [
    document.getElementById("profile-name"),
    document.getElementById("profile-phone"),
    document.getElementById("profile-address"),
  ];
  const uploadBtn = document.getElementById("btn-trigger-upload");

  if (actionBtn) {
    actionBtn.addEventListener("click", async function (e) {
      e.preventDefault();

      if (!isEditing) {
        // >>> CHẾ ĐỘ SỬA
        isEditing = true;
        inputs.forEach((input) => {
          if (input) input.disabled = false;
        });
        if (inputs[0]) inputs[0].focus();
        if (uploadBtn) uploadBtn.style.display = "flex";

        actionBtn.innerHTML =
          '<i class="fas fa-save"></i> <span>Lưu thay đổi</span>';
        actionBtn.style.backgroundColor = "var(--primary-color)";
        actionBtn.style.color = "#000";
      } else {
        // >>> CHẾ ĐỘ LƯU
        const userId = localStorage.getItem("currentUserId");

        const updateData = {
          name: document.getElementById("profile-name").value,
          phone: document.getElementById("profile-phone").value,
          address: document.getElementById("profile-address").value,
        };

        // Kiểm tra xem có ảnh mới không
        if (tempAvatarBase64 && tempAvatarBase64.length > 0) {
          console.log("Đang gửi ảnh lên Server...");
          updateData.avatar = tempAvatarBase64;
        } else {
          console.log("Không có ảnh mới được chọn.");
        }

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

            // Cập nhật LocalStorage
            let currentUser = JSON.parse(localStorage.getItem("user"));
            const newUserState = { ...currentUser, ...updatedUser };
            localStorage.setItem("user", JSON.stringify(newUserState));

            alert("Cập nhật thành công!");
            window.location.reload();
          } else {
            // In lỗi ra nếu thất bại
            console.error(
              "Lỗi từ Server:",
              response.status,
              response.statusText
            );
            alert("Cập nhật thất bại! (Có thể ảnh quá lớn)");
            actionBtn.innerHTML =
              '<i class="fas fa-save"></i> <span>Lưu thay đổi</span>';
          }
        } catch (error) {
          console.error("Lỗi kết nối:", error);
          alert("Lỗi kết nối Server! (Kiểm tra lại xem Server có chạy không)");
          actionBtn.innerHTML =
            '<i class="fas fa-save"></i> <span>Lưu thay đổi</span>';
        }
      }
    });
  }
}

// Giữ nguyên setupPasswordModal...
function setupPasswordModal() {
  const modal = document.getElementById("password-modal");
  const openBtn = document.getElementById("btn-open-password-modal");
  const closeBtn = document.getElementById("modal-close");
  const cancelBtn = document.getElementById("btn-cancel");
  const passwordForm = document.getElementById("password-form");
  // ... (Code modal cũ của bạn không đổi)
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
}
