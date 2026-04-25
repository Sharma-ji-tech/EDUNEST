package com.edunest.dto;

import lombok.Data;

@Data
public class PaymentVerificationRequest {
    private Long courseId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}
