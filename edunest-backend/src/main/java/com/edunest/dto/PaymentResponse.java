package com.edunest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentResponse {
    private String razorpayOrderId;
    private Double amount;
    private String currency;
}
