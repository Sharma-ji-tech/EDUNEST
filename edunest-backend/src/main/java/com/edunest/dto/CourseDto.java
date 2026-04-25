package com.edunest.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CourseDto {
    private Long id;
    private String title;
    private String description;
    private Double price;
    private String thumbnail;
    private String instructorName;
    private String status;
    private LocalDateTime createdAt;
}
