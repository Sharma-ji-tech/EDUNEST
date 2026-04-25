package com.edunest.controller;

import com.edunest.dto.ApiResponse;
import com.edunest.dto.CourseDto;
import com.edunest.dto.LessonDto;
import com.edunest.dto.SectionDto;
import com.edunest.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instructor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INSTRUCTOR')")
public class InstructorController {

    private final CourseService courseService;

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<CourseDto>>> getMyCourses(Authentication authentication) {
        List<CourseDto> courses = courseService.getInstructorCourses(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Instructor courses retrieved", courses));
    }

    @PostMapping("/courses")
    public ResponseEntity<ApiResponse<CourseDto>> createCourse(@RequestBody CourseDto courseDto, Authentication authentication) {
        CourseDto created = courseService.createCourse(courseDto, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Course created successfully", created));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<ApiResponse<CourseDto>> updateCourse(@PathVariable Long id, @RequestBody CourseDto courseDto, Authentication authentication) {
        CourseDto updated = courseService.updateCourse(id, courseDto, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Course updated successfully", updated));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id, Authentication authentication) {
        courseService.deleteCourse(id, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Course deleted successfully", null));
    }

    @PostMapping("/courses/{id}/sections")
    public ResponseEntity<ApiResponse<SectionDto>> addSection(@PathVariable Long id, @RequestBody SectionDto sectionDto, Authentication authentication) {
        SectionDto added = courseService.addSection(id, sectionDto, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Section added successfully", added));
    }

    @PutMapping("/sections/{id}")
    public ResponseEntity<ApiResponse<SectionDto>> updateSection(@PathVariable Long id, @RequestBody SectionDto sectionDto, Authentication authentication) {
        SectionDto updated = courseService.updateSection(id, sectionDto, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Section updated successfully", updated));
    }

    @DeleteMapping("/sections/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSection(@PathVariable Long id, Authentication authentication) {
        courseService.deleteSection(id, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Section deleted successfully", null));
    }

    @PostMapping("/sections/{id}/lessons")
    public ResponseEntity<ApiResponse<LessonDto>> addLesson(@PathVariable Long id, @RequestBody LessonDto lessonDto, Authentication authentication) {
        LessonDto added = courseService.addLesson(id, lessonDto, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lesson added successfully", added));
    }

    @PutMapping("/lessons/{id}")
    public ResponseEntity<ApiResponse<LessonDto>> updateLesson(@PathVariable Long id, @RequestBody LessonDto lessonDto, Authentication authentication) {
        LessonDto updated = courseService.updateLesson(id, lessonDto, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lesson updated successfully", updated));
    }

    @DeleteMapping("/lessons/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(@PathVariable Long id, Authentication authentication) {
        courseService.deleteLesson(id, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lesson deleted successfully", null));
    }
}
