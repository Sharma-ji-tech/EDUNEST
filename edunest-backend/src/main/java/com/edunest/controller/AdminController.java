package com.edunest.controller;

import com.edunest.dto.ApiResponse;
import com.edunest.dto.CourseDto;
import com.edunest.entity.Enrollment;
import com.edunest.entity.User;
import com.edunest.repository.EnrollmentRepository;
import com.edunest.repository.UserRepository;
import com.edunest.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final CourseService courseService;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    // ── Courses ──────────────────────────────────────────────
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<CourseDto>>> getCourses() {
        List<CourseDto> courses = courseService.getAllCoursesForAdmin();
        return ResponseEntity.ok(new ApiResponse<>(true, "All courses retrieved", courses));
    }

    @PutMapping("/courses/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveCourse(@PathVariable Long id, @RequestParam boolean isApproved) {
        courseService.approveCourse(id, isApproved);
        String status = isApproved ? "approved" : "rejected";
        return ResponseEntity.ok(new ApiResponse<>(true, "Course " + status + " successfully", null));
    }

    // ── Users ─────────────────────────────────────────────────
    @GetMapping("/users")
    @Transactional
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("roles", u.getRoles().stream()
                    .map(r -> r.getName().name())
                    .collect(Collectors.toList()));
            map.put("createdAt", u.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "All users retrieved", result));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User deleted successfully", null));
    }

    // ── Platform Stats ────────────────────────────────────────
    @GetMapping("/stats")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlatformStats() {
        long totalUsers = userRepository.count();
        long totalCourses = courseService.getAllCoursesForAdmin().size();
        long totalEnrollments = enrollmentRepository.count();

        List<CourseDto> allCourses = courseService.getAllCoursesForAdmin();
        long approvedCourses = allCourses.stream().filter(c -> "APPROVED".equals(c.getStatus())).count();
        long pendingCourses  = allCourses.stream().filter(c -> "PENDING".equals(c.getStatus())).count();
        long rejectedCourses = allCourses.stream().filter(c -> "REJECTED".equals(c.getStatus())).count();

        // Revenue: sum of (price * enrollments) for each course
        double totalRevenue = enrollmentRepository.findAll().stream()
                .filter(e -> e.getCourse() != null && e.getCourse().getPrice() != null)
                .mapToDouble(e -> e.getCourse().getPrice().doubleValue())
                .sum();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalCourses", totalCourses);
        stats.put("totalEnrollments", totalEnrollments);
        stats.put("approvedCourses", approvedCourses);
        stats.put("pendingCourses", pendingCourses);
        stats.put("rejectedCourses", rejectedCourses);
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(new ApiResponse<>(true, "Stats retrieved", stats));
    }

    // ── Enrollments overview ──────────────────────────────────
    @GetMapping("/enrollments")
    @Transactional
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllEnrollments() {
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        List<Map<String, Object>> result = enrollments.stream().map(e -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("enrollmentId", e.getId());
            map.put("studentName", e.getStudent() != null ? e.getStudent().getName() : "Unknown");
            map.put("studentEmail", e.getStudent() != null ? e.getStudent().getEmail() : "Unknown");
            map.put("courseTitle", e.getCourse() != null ? e.getCourse().getTitle() : "Unknown");
            map.put("progress", e.getProgress());
            map.put("completed", e.getCompleted());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Enrollments retrieved", result));
    }
}
