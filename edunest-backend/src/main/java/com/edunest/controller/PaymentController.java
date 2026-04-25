package com.edunest.controller;

import com.edunest.dto.ApiResponse;
import com.edunest.dto.PaymentRequest;
import com.edunest.dto.PaymentResponse;
import com.edunest.dto.PaymentVerificationRequest;
import com.edunest.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<PaymentResponse>> createOrder(@RequestBody PaymentRequest request, Authentication auth) {
        PaymentResponse response = paymentService.createOrder(request, auth.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Order created", response));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Void>> verifyPayment(@RequestBody PaymentVerificationRequest request, Authentication auth) {
        paymentService.verifyPayment(request, auth.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Payment verified and enrolled successfully", null));
    }
}
