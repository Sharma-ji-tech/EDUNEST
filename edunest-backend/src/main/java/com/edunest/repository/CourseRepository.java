package com.edunest.repository;

import com.edunest.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructorId(Long instructorId);
    Page<Course> findByStatus(String status, Pageable pageable);
    Page<Course> findByTitleContainingIgnoreCaseAndStatus(String title, String status, Pageable pageable);
}
