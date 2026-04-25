package com.edunest.service;

import com.edunest.dto.PaymentRequest;
import com.edunest.dto.PaymentResponse;
import com.edunest.dto.PaymentVerificationRequest;

public interface PaymentService {
    PaymentResponse createOrder(PaymentRequest request, String email);
    void verifyPayment(PaymentVerificationRequest request, String email);
}
