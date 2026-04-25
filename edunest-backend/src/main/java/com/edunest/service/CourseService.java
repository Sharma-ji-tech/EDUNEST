package com.edunest.service;

import com.edunest.dto.CourseDetailDto;
import com.edunest.dto.CourseDto;
import com.edunest.dto.SectionDto;
import com.edunest.dto.LessonDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface CourseService {
    Page<CourseDto> getPublicCourses(String search, Pageable pageable);
    CourseDetailDto getCourseDetails(Long courseId);
    
    // Instructor specific
    List<CourseDto> getInstructorCourses(String email);
    CourseDto createCourse(CourseDto courseDto, String email);
    CourseDto updateCourse(Long courseId, CourseDto courseDto, String email);
    void deleteCourse(Long courseId, String email);
    
    SectionDto addSection(Long courseId, SectionDto sectionDto, String email);
    SectionDto updateSection(Long sectionId, SectionDto sectionDto, String email);
    void deleteSection(Long sectionId, String email);
    
    LessonDto addLesson(Long sectionId, LessonDto lessonDto, String email);
    LessonDto updateLesson(Long lessonId, LessonDto lessonDto, String email);
    void deleteLesson(Long lessonId, String email);
    
    // Admin specific
    List<CourseDto> getAllCoursesForAdmin();
    void approveCourse(Long courseId, boolean isApproved);
}
