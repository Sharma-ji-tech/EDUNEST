package com.edunest.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class SectionDetailDto extends SectionDto {
    private List<LessonDto> lessons;
}
