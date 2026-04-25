package com.edunest.controller;

import com.edunest.dto.ApiResponse;
import com.edunest.dto.CourseDto;
import com.edunest.entity.Course;
import com.edunest.entity.Enrollment;
import com.edunest.entity.User;
import com.edunest.repository.EnrollmentRepository;
import com.edunest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @GetMapping("/my")
    @Transactional
    public ResponseEntity<ApiResponse<List<CourseDto>>> getMyEnrollments(Authentication authentication) {
        User student = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        List<CourseDto> courses = enrollments.stream()
                .map(e -> {
                    Course c = e.getCourse();
                    CourseDto dto = new CourseDto();
                    dto.setId(c.getId());
                    dto.setTitle(c.getTitle());
                    dto.setDescription(c.getDescription());
                    dto.setThumbnail(c.getThumbnail());
                    dto.setInstructorName(c.getInstructor().getName());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(true, "Enrolled courses retrieved", courses));
    }
}
