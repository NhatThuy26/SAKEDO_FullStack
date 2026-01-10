// --- FILE: js/pages/checkout.js (PHIÊN BẢN DEBUG) ---

console.log("--> FILE JS ĐÃ ĐƯỢC TẢI THÀNH CÔNG!"); // Dòng này hiện nghĩa là file JS đã kết nối đúng

let subTotalAmount = 0;

document.addEventListener("DOMContentLoaded", function () {
  console.log("1. Trang đã tải xong HTML");

  // Kiểm tra giỏ hàng
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  console.log("2. Giỏ hàng hiện có:", cart);

  if (cart.length === 0) {
    console.warn("Giỏ hàng trống!");
    // Tạm thời comment dòng này để test giao diện
    // alert("Giỏ hàng trống!");
    // window.location.href = "/index.html";
    return;
  }

  const miniList = document.getElementById("mini-cart-list");
  if (!miniList) {
    console.error("LỖI: Không tìm thấy thẻ có id='mini-cart-list' trong HTML");
    return;
  }

  // Render
  subTotalAmount = 0;
  cart.forEach((item) => {
    let price = item.price;
    if (typeof price === "string") {
      price = parseFloat(price.replace(/\./g, "").replace("đ", ""));
    }
    subTotalAmount += price * item.quantity;

    miniList.innerHTML += `
            <div class="item-mini">
                <div><b>${item.name}</b> x ${item.quantity}</div>
                <div>${(price * item.quantity).toLocaleString()}đ</div>
            </div>`;
  });

  // Hiển thị tạm tính
  const subTotalEl = document.getElementById("ck-subtotal");
  if (subTotalEl)
    subTotalEl.textContent = subTotalAmount.toLocaleString() + "đ";

  calculateShipping();
});

function calculateShipping() {
  console.log("--> Đang tính phí ship...");
  const districtSelect = document.getElementById("shipping-district");
  const totalEl = document.getElementById("ck-total");
  const shipDisplay = document.getElementById("shipping-fee-display");

  let shippingFee = 0;
  if (districtSelect && districtSelect.value) {
    shippingFee = parseInt(districtSelect.value);
  }

  if (shipDisplay) shipDisplay.textContent = shippingFee.toLocaleString() + "đ";
  if (totalEl)
    totalEl.textContent = (subTotalAmount + shippingFee).toLocaleString() + "đ";
}

// --- HÀM QUAN TRỌNG NHẤT: SUBMIT ---
async function submitOrder() {
  console.log(">>> BẮT ĐẦU ẤN NÚT ĐẶT HÀNG <<<"); // Nếu bấm nút mà không thấy dòng này -> Lỗi HTML

  // 1. Lấy dữ liệu
  const nameEl = document.getElementById("cus-name");
  const phoneEl = document.getElementById("cus-phone");
  const addrEl = document.getElementById("cus-address-detail");
  const distEl = document.getElementById("shipping-district");
  const noteEl = document.getElementById("cus-note");

  if (!nameEl || !phoneEl || !addrEl || !distEl) {
    console.error(
      "LỖI: HTML thiếu id của các ô nhập liệu (cus-name, cus-phone...)"
    );
    alert("Lỗi code HTML: Thiếu ID input");
    return;
  }

  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const addressDetail = addrEl.value.trim();
  const districtValue = distEl.value;
  const note = noteEl ? noteEl.value.trim() : "";

  console.log("Dữ liệu nhập vào:", {
    name,
    phone,
    addressDetail,
    districtValue,
  });

  // 2. Validate
  if (!name || !phone || !addressDetail) {
    console.warn("Chưa điền đủ thông tin");
    alert("Vui lòng điền đủ: Họ tên, SĐT, Địa chỉ!");
    return;
  }

  if (!districtValue) {
    console.warn("Chưa chọn quận");
    alert("Vui lòng chọn Quận/Huyện!");
    return;
  }

  // 3. Chuẩn bị gửi
  const districtName = distEl.options[distEl.selectedIndex].text;
  const fullAddress = `${addressDetail}, ${districtName}, TP. Hồ Chí Minh`;
  const shippingFee = parseInt(districtValue);
  const totalAmount = subTotalAmount + shippingFee;

  // Chuẩn bị Items (Map dữ liệu cho khớp Backend)
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemsToSend = cart.map((item) => {
    let p = item.price;
    if (typeof p === "string")
      p = parseFloat(p.replace(/\./g, "").replace("đ", ""));
    return {
      productName: item.name,
      quantity: item.quantity,
      price: p,
    };
  });

  const orderData = {
    customerName: name,
    customerPhone: phone,
    customerAddress: fullAddress,
    note: note,
    shippingFee: shippingFee,
    totalAmount: totalAmount,
    status: 0,
    items: itemsToSend,
  };

  console.log("--> Đang gửi dữ liệu lên Server:", orderData);

  // 4. Gửi API
  try {
    const response = await fetch("http://localhost:8080/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    console.log("--> Trạng thái Server trả về:", response.status);

    if (response.ok) {
      const result = await response.json();
      console.log("--> THÀNH CÔNG:", result);
      alert("ĐẶT HÀNG THÀNH CÔNG! ID: " + result.orderId);
      localStorage.removeItem("cart");
      window.location.href = "/index.html";
    } else {
      const errText = await response.text();
      console.error("--> LỖI SERVER:", errText);
      alert("Lỗi Server: " + errText);
    }
  } catch (error) {
    console.error("--> LỖI KẾT NỐI (Fetch Error):", error);
    alert(
      "Không thể kết nối đến Backend. Hãy kiểm tra xem IntelliJ có đang chạy không?"
    );
  }
}
