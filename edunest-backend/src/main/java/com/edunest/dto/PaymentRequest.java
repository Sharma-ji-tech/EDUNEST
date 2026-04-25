package com.edunest.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long courseId;
    private Double amount;
}
