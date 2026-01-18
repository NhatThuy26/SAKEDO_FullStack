document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 1. Lấy dữ liệu
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const quantity = parseInt(document.getElementById('quantity').value); // Ép kiểu số
            const note = document.getElementById('note').value;

            // Kiểm tra dữ liệu cơ bản
            if (!date || !time) {
                alert("Vui lòng chọn đầy đủ ngày và giờ đặt bàn!");
                return;
            }

            // KIỂM TRA QUY ĐỊNH SỐ LƯỢNG KHÁCH (Tối đa 20 người)
            if (quantity > 20) {
                alert("Sakedo chỉ phục vụ tối đa 20 khách mỗi bàn. Vui lòng liên hệ hotline để đặt tiệc lớn hơn!");
                return;
            }
            if (quantity <= 0) {
                alert("Số lượng khách không hợp lệ!");
                return;
            }

            // 2. Chuyển đổi sang định dạng LocalDateTime ISO cho Java
            const bookingDateISO = `${date}T${time}:00`;

            // 3. Lấy thông tin user
            const user = JSON.parse(localStorage.getItem('user')) || { id: "guest_user" };

            const bookingData = {
                userId: user.id,
                fullName: name,
                phone: phone,
                guestCount: quantity,
                bookingDate: bookingDateISO,
                status: "PENDING"
            };

            try {
                const response = await fetch('http://localhost:8080/api/bookings/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert(`ĐẶT BÀN THÀNH CÔNG!
- Số bàn: ${result.tableNumber}
- Thời gian giữ bàn: 3 tiếng (đến ${new Date(result.expiryDate).toLocaleTimeString()})`);
                    window.location.reload(); 
                } else {
                    // Hiển thị lỗi từ Backend (Hết bàn hoặc trùng lịch)
                    alert("Thông báo: " + (result.message || "Hiện tại đã hết bàn phù hợp trong khung giờ này!"));
                }
            } catch (err) {
                console.error("Kết nối thất bại:", err);
                alert("Không thể kết nối đến máy chủ Backend!");
            }
        });
    }
});