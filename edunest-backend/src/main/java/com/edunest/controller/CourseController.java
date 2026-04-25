package com.edunest.controller;

import com.edunest.dto.ApiResponse;
import com.edunest.dto.CourseDetailDto;
import com.edunest.dto.CourseDto;
import com.edunest.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CourseDto>>> getCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<CourseDto> courses = courseService.getPublicCourses(null, PageRequest.of(page, size));
        return ResponseEntity.ok(new ApiResponse<>(true, "Courses retrieved successfully", courses));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<CourseDto>>> searchCourses(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<CourseDto> courses = courseService.getPublicCourses(q, PageRequest.of(page, size));
        return ResponseEntity.ok(new ApiResponse<>(true, "Courses searched successfully", courses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDetailDto>> getCourseDetails(@PathVariable Long id) {
        CourseDetailDto details = courseService.getCourseDetails(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Course details retrieved", details));
    }
}
