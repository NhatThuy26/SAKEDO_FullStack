document.addEventListener("DOMContentLoaded", function () {
  // Xóa chế độ buyNowMode nếu có (không hiện thông báo)
  const isBuyNowMode = localStorage.getItem("buyNowMode") === "true";
  if (isBuyNowMode) {
    // Không hiện thông báo, chỉ xóa flag
    localStorage.removeItem("buyNowMode");
  }

  renderCart();

  // Gán sự kiện cho nút thanh toán
  const checkoutBtn = document.querySelector(".btn-checkout");
  if (checkoutBtn) {
    checkoutBtn.onclick = handleCheckout;
  }
});

// Hiển thị thông báo khi ở chế độ Mua Ngay
function showBuyNowNotice() {
  const cartContent = document.getElementById("cart-content");
  if (!cartContent) return;

  // Tạo thông báo
  const notice = document.createElement("div");
  notice.id = "buy-now-notice";
  notice.style.cssText = "background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;";
  notice.innerHTML = `
    <span style="color: #856404;"><i class="fas fa-info-circle"></i> Bạn đang ở chế độ <strong>Mua Ngay</strong>. Giỏ hàng cũ được lưu tạm.</span>
    <button onclick="cancelBuyNow()" style="background: #fff; border: 1px solid #856404; color: #856404; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
      <i class="fas fa-arrow-left"></i> Quay lại giỏ hàng
    </button>
  `;
  cartContent.insertBefore(notice, cartContent.firstChild);
}

// Hủy chế độ Mua Ngay và khôi phục giỏ hàng cũ
function cancelBuyNow() {
  const backup = localStorage.getItem("cart_backup");
  if (backup) {
    localStorage.setItem("cart", backup);
    localStorage.removeItem("cart_backup");
  }
  localStorage.removeItem("buyNowMode");
  window.location.reload();
}

// Hàm xử lý đường dẫn ảnh
function getCartImageUrl(imgName) {
  if (!imgName || imgName.trim() === "" || imgName === "no-image.png") {
    return "https://placehold.co/100x100?text=Sakedo";
  }
  // Nếu là link online hoặc base64 -> giữ nguyên
  if (imgName.startsWith("http") || imgName.startsWith("data:")) {
    return imgName;
  }
  // Nếu đã có đường dẫn -> giữ nguyên
  if (imgName.includes("/")) {
    return imgName;
  }
  // Nếu chỉ là tên file -> thêm đường dẫn
  return `../assets/images/${imgName}`;
}

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemsWrapper = document.getElementById("cart-items-wrapper");
  const cartContent = document.getElementById("cart-content");
  const emptyMsg = document.getElementById("empty-cart-msg");

  if (!itemsWrapper) return;

  // Hiện/ẩn nội dung dựa vào giỏ hàng
  if (cart.length === 0) {
    if (cartContent) cartContent.style.display = "none";
    if (emptyMsg) emptyMsg.style.display = "block";
    return;
  } else {
    if (cartContent) cartContent.style.display = "flex";
    if (emptyMsg) emptyMsg.style.display = "none";
  }

  itemsWrapper.innerHTML = "";
  let subTotal = 0;

  cart.forEach((item, index) => {
    // Xử lý giá tiền
    let price = typeof item.price === "string"
      ? parseFloat(item.price.replace(/\./g, "").replace("đ", ""))
      : item.price;
    subTotal += (price * item.quantity);

    // Xử lý ảnh
    let imgSrc = getCartImageUrl(item.image);

    // Xử lý ghi chú
    const noteHtml = item.note ? `<div class="item-note" style="font-size: 0.8rem; color: #888; font-style: italic; margin-top: 4px;"><i class="fas fa-sticky-note" style="margin-right: 5px;"></i>${item.note}</div>` : '';

    itemsWrapper.innerHTML += `
      <div class="cart-item">
        <img src="${imgSrc}" class="item-img" onerror="this.src='https://placehold.co/100x100?text=Sakedo'">
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-price" style="font-weight: 700;">${price.toLocaleString()}đ</span>
          ${noteHtml}
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="updateItemQty(${index}, -1)">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateItemQty(${index}, 1)">+</button>
        </div>
        <i class="fas fa-trash-alt btn-remove" onclick="removeItem(${index})"></i>
      </div>`;
  });

  // Tính tổng (không có phí giao hàng)
  const finalTotal = subTotal;

  if (document.getElementById("sub-total")) {
    document.getElementById("sub-total").textContent = subTotal.toLocaleString() + "đ";
  }
  if (document.getElementById("final-total")) {
    document.getElementById("final-total").textContent = finalTotal.toLocaleString() + "đ";
  }
}

// Xử lý thanh toán
async function handleCheckout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Giỏ hàng trống!");
    return;
  }

  const finalTotalEl = document.getElementById("final-total");
  if (!finalTotalEl) return;

  const amountText = finalTotalEl.textContent.replace(/[^\d]/g, "");
  const amount = parseInt(amountText);

  if (amount <= 0) {
    alert("Số tiền không hợp lệ!");
    return;
  }

  // Lấy phương thức thanh toán được chọn
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  const btn = document.querySelector(".btn-checkout");

  // === THANH TOÁN TIỀN MẶT (COD) ===
  if (paymentMethod === "cod") {
    try {
      if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG XỬ LÝ...';
        btn.disabled = true;
      }

      // Lấy thông tin user
      let userId = null;
      let customerName = "Khách hàng";
      let customerPhone = "";
      let customerAddress = "";

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          userId = user.id || user._id || user.email;
          customerName = user.name || user.fullName || customerName;
          customerPhone = user.phone || "";
          customerAddress = user.address || "";
        }
      } catch (e) { }

      // Tạo order items
      console.log("--> Cart hiện tại (debug note):", cart);
      const orderItems = cart.map(item => {
        console.log("--> Item note:", item.note);
        let rawPrice = item.price;
        if (typeof item.price === 'string') {
          rawPrice = parseFloat(item.price.replace(/\./g, "").replace(/[^\d]/g, ""));
        }
        rawPrice = Number(rawPrice) || 0;

        let safeImage = item.image || "no-image.png";
        if (safeImage.startsWith("data:")) {
          safeImage = "no-image.png";
        } else if (safeImage.includes("/")) {
          safeImage = safeImage.split("/").pop();
        }

        return {
          productName: item.name || "Sản phẩm",
          quantity: Number(item.quantity) || 1,
          price: rawPrice,
          image: safeImage,
          note: item.note || ""
        };
      });

      const orderData = {
        userId: userId,
        customerName: customerName,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        note: "",
        paymentMethod: "COD",
        shippingFee: 0,
        totalAmount: amount,
        status: 0, // 0 = Chờ xác nhận
        items: orderItems
      };

      console.log("--> Đang tạo đơn hàng COD:", orderData);

      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("--> ✅ Đơn hàng COD đã được tạo!", result);

        // Xóa giỏ hàng
        localStorage.removeItem("cart");

        alert("✅ Đặt hàng thành công!\n\nĐơn hàng của bạn đang chờ xác nhận.\nVui lòng chuẩn bị tiền mặt khi nhận hàng.");

        // Chuyển về trang chủ
        window.location.href = "global.html";
      } else {
        const errText = await response.text();
        console.error("--> ❌ Lỗi tạo đơn:", errText);
        alert("Lỗi đặt hàng: " + errText);
        if (btn) {
          btn.innerHTML = '<i class="fas fa-shopping-bag"></i> ĐẶT HÀNG NGAY';
          btn.disabled = false;
        }
      }
    } catch (error) {
      console.error("--> ❌ Lỗi kết nối:", error);
      alert("Lỗi kết nối Server!");
      if (btn) {
        btn.innerHTML = '<i class="fas fa-shopping-bag"></i> ĐẶT HÀNG NGAY';
        btn.disabled = false;
      }
    }
    return;
  }

  // === THANH TOÁN CHUYỂN KHOẢN QR ===
  try {
    if (btn) {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG XỬ LÝ...';
      btn.disabled = true;
    }

    // 1. Lấy thông tin user
    let userId = null;
    let customerName = "Khách hàng";
    let customerPhone = "";
    let customerAddress = "";

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        userId = user.id || user._id || user.email;
        customerName = user.name || user.fullName || customerName;
        customerPhone = user.phone || "";
        customerAddress = user.address || "";
      }
    } catch (e) { }

    // 2. Tạo order items
    const orderItems = cart.map(item => {
      let rawPrice = item.price;
      if (typeof item.price === 'string') {
        rawPrice = parseFloat(item.price.replace(/\./g, "").replace(/[^\d]/g, ""));
      }
      rawPrice = Number(rawPrice) || 0;

      let safeImage = item.image || "no-image.png";
      if (safeImage.startsWith("data:")) {
        safeImage = "no-image.png";
      } else if (safeImage.includes("/")) {
        safeImage = safeImage.split("/").pop();
      }

      return {
        productName: item.name || "Sản phẩm",
        quantity: Number(item.quantity) || 1,
        price: rawPrice,
        image: safeImage,
        note: item.note || ""
      };
    });

    // 3. Tạo order data - LƯU VÀO MONGODB TRƯỚC
    const orderData = {
      userId: userId,
      customerName: customerName,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      note: "",
      paymentMethod: "BANK",
      shippingFee: 0,
      totalAmount: amount,
      status: 0, // 0 = Chờ xác nhận (sẽ được cập nhật khi thanh toán xong)
      items: orderItems
    };

    console.log("--> Đang lưu đơn hàng chuyển khoản vào MongoDB:", orderData);

    const orderResponse = await fetch("http://localhost:8080/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    if (!orderResponse.ok) {
      const errText = await orderResponse.text();
      console.error("--> ❌ Lỗi lưu đơn hàng:", errText);
      alert("Lỗi tạo đơn hàng: " + errText);
      if (btn) {
        btn.innerHTML = '<i class="fas fa-shopping-bag"></i> ĐẶT HÀNG NGAY';
        btn.disabled = false;
      }
      return;
    }

    const orderResult = await orderResponse.json();
    console.log("--> ✅ Đã lưu đơn hàng vào MongoDB:", orderResult);

    // 4. Lưu orderId vào localStorage để xử lý khi thanh toán xong
    localStorage.setItem("pendingOrderId", orderResult.orderId);

    // 5. Xóa giỏ hàng
    localStorage.removeItem("cart");

    // 6. Gọi API tạo link thanh toán PayOS
    console.log("--> Đang gọi API tạo link thanh toán với số tiền:", amount);

    const paymentResponse = await fetch("http://localhost:8080/api/payment/create-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amount }),
    });

    const data = await paymentResponse.json();
    console.log("--> Response từ PayOS:", data);

    if (paymentResponse.ok && data.checkoutUrl) {
      // Chuyển hướng đến trang thanh toán PayOS
      window.location.href = data.checkoutUrl;
    } else {
      alert("Lỗi: " + (data.error || "Server không trả về link thanh toán"));
      if (btn) {
        btn.innerHTML = '<i class="fas fa-shopping-bag"></i> ĐẶT HÀNG NGAY';
        btn.disabled = false;
      }
    }
  } catch (error) {
    console.error("--> Lỗi kết nối Backend:", error);
    alert("Lỗi kết nối Server! Kiểm tra Backend đang chạy không.");
    if (btn) {
      btn.innerHTML = '<i class="fas fa-shopping-bag"></i> ĐẶT HÀNG NGAY';
      btn.disabled = false;
    }
  }
}

function updateItemQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity += change;
  if (cart[index].quantity < 1) cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function removeItem(index) {
  if (confirm("Xóa món này khỏi giỏ hàng?")) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
}