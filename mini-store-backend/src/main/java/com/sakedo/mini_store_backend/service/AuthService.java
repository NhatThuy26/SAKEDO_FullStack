package com.sakedo.mini_store_backend.service;

import com.sakedo.mini_store_backend.model.User;
import com.sakedo.mini_store_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    // --- 1. HÀM ĐĂNG KÝ (registerUser) ---
    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email này đã được sử dụng!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // --- 2. HÀM ĐĂNG NHẬP (loginUser) ---
    public User loginUser(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                user.setPassword(null);
                return user;
            }
        }
        throw new RuntimeException("Email hoặc mật khẩu không đúng!");
    }

    // --- 3. HÀM GỬI OTP (sendOtp) ---
    public void sendOtp(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email không tồn tại trong hệ thống!");
        }
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);
        emailService.sendOtpEmail(email, otp);
    }

    // --- 4. HÀM XÁC THỰC OTP (verifyOtp) ---
    public boolean verifyOtp(String email, String otpInput) {
        String correctOtp = otpStorage.get(email);
        return correctOtp != null && correctOtp.equals(otpInput);
    }

    // --- 5. HÀM ĐỔI MẬT KHẨU (resetPassword) ---
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpStorage.remove(email);
    }
}