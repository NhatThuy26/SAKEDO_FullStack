package com.sakedo.mini_store_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender getJavaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);

        // Điền trực tiếp email và pass ứng dụng của bạn vào đây để đảm bảo chạy 100%
        mailSender.setUsername("nhimvleggo@gmail.com");
        mailSender.setPassword("hsphqvdfujfkznjw");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        // props.put("mail.debug", "true"); // Bỏ comment nếu muốn xem log chi tiết

        return mailSender;
    }
}