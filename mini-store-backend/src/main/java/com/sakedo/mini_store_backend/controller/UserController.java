package com.sakedo.mini_store_backend.controller;

import com.sakedo.mini_store_backend.model.User;
import com.sakedo.mini_store_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Cho phép Frontend gọi API mà không bị chặn
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Công cụ mã hóa mật khẩu (Để tạo user mẫu có pass đã mã hóa)
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // -----------------------------------------------------------
    // 1. API TẠO USER MẪU (Giống trong hình bạn gửi)
    // URL: http://localhost:8080/api/users/init
    // -----------------------------------------------------------
    @GetMapping("/init")
    public String initUser() {
        // Kiểm tra nếu user ID "1" chưa tồn tại thì mới tạo
        if (!userRepository.existsById("1")) {
            // LƯU Ý: Để dòng này không báo lỗi, file Model/User.java PHẢI CÓ constructor 7 tham số
            User user = new User(
                    "1",                                // id
                    "Nguyễn Văn A",                     // fullName
                    "usthy@1234gmail.com",              // email
                    "0123456789",                       // phone
                    "123 Đường ABC, Quận 8, TP.HCM",    // address
                    "avata1.png",                       // avatar
                    passwordEncoder.encode("123456")    // password (Mã hóa luôn cho an toàn)
            );

            userRepository.save(user);
            return "Đã tạo User mẫu thành công!";
        }
        return "User mẫu ID '1' đã tồn tại, không cần tạo lại.";
    }

    // -----------------------------------------------------------
    // 2. API LẤY THÔNG TIN USER THEO EMAIL (Hỗ trợ trang Profile)
    // URL: http://localhost:8080/api/users/email/usthy@1234gmail.com
    // -----------------------------------------------------------
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setPassword(null); // Xóa pass trước khi trả về Frontend để bảo mật
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.badRequest().body("Không tìm thấy user có email: " + email);
        }
    }

    // -----------------------------------------------------------
    // 3. API CẬP NHẬT THÔNG TIN USER
    // -----------------------------------------------------------
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User userDetails) {
        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Cập nhật các trường thông tin
            user.setFullName(userDetails.getFullName());
            user.setPhone(userDetails.getPhone());

            // Dòng này cần file User.java có getter/setter cho address
            user.setAddress(userDetails.getAddress());

            // user.setAvatar(userDetails.getAvatar()); // Mở ra nếu muốn cập nhật avatar

            User updatedUser = userRepository.save(user);
            updatedUser.setPassword(null); // Bảo mật

            return ResponseEntity.ok(updatedUser);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}