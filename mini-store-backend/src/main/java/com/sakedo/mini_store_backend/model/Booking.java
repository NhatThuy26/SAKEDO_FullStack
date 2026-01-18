package com.sakedo.mini_store_backend.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
public class Booking {
    @Id
    private String id;
    private String userId;       // Bắt buộc đăng nhập nên cần ID này
    private String fullName;
    private String phone;
    private int guestCount;
    private LocalDateTime bookingDate; // Ngày giờ khách chọn
    private LocalDateTime expiryDate;  // Tự động = bookingDate + 3 tiếng
    private int tableNumber;           // Số bàn hệ thống tự gán
    private String status;             // "PENDING", "CONFIRMED"
}