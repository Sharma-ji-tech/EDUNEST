package com.edunest.dto;

import lombok.Data;

@Data
public class LessonDto {
    private Long id;
    private String title;
    private String contentType;
    private String contentUrl;
    private Integer duration;
    private Integer orderIndex;
}
