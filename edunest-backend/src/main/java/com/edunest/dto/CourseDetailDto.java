package com.edunest.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class CourseDetailDto extends CourseDto {
    private List<SectionDetailDto> sections;
}
