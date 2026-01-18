package com.sakedo.mini_store_backend.repository;
import com.sakedo.mini_store_backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    // Tìm các đơn đặt bàn có thời gian chồng lấn trên cùng 1 bàn
    List<Booking> findByTableNumberAndBookingDateLessThanAndExpiryDateGreaterThan(
            int tableNumber, LocalDateTime expiry, LocalDateTime booking);

    List<Booking> findByUserId(String userId);
}