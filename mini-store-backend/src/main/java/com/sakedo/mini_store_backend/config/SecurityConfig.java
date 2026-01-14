package com.sakedo.mini_store_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. TẮT CSRF (Quan trọng: Nếu không tắt, POST sẽ bị chặn)
                .csrf(csrf -> csrf.disable())

                // 2. CẤU HÌNH CORS (Cho phép Frontend gọi vào)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. PHÂN QUYỀN (Cho phép tất cả API hoạt động không cần đăng nhập)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").permitAll() // Cho phép hết các link bắt đầu bằng /api/
                        .anyRequest().permitAll() // Tạm thời mở hết để test cho dễ
                );

        return http.build();
    }

    // Cấu hình CORS chi tiết
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*")); // Cho phép mọi nguồn (Frontend)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Cho phép mọi hành động
        configuration.setAllowedHeaders(Arrays.asList("*")); // Cho phép mọi header

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}