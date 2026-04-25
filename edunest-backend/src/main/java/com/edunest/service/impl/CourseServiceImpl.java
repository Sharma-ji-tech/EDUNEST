package com.edunest.service.impl;

import com.edunest.dto.*;
import com.edunest.entity.*;
import com.edunest.repository.*;
import com.edunest.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    @Override
    public Page<CourseDto> getPublicCourses(String search, Pageable pageable) {
        Page<Course> courses;
        if (search != null && !search.trim().isEmpty()) {
            courses = courseRepository.findByTitleContainingIgnoreCaseAndStatus(search, "APPROVED", pageable);
        } else {
            courses = courseRepository.findByStatus("APPROVED", pageable);
        }
        return courses.map(this::mapToDto);
    }

    @Override
    public CourseDetailDto getCourseDetails(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        CourseDetailDto dto = new CourseDetailDto();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setPrice(course.getPrice());
        dto.setThumbnail(course.getThumbnail());
        dto.setInstructorName(course.getInstructor().getName());
        dto.setStatus(course.getStatus());
        dto.setCreatedAt(course.getCreatedAt());

        List<Section> sections = sectionRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        List<SectionDetailDto> sectionDtos = sections.stream().map(section -> {
            SectionDetailDto sDto = new SectionDetailDto();
            sDto.setId(section.getId());
            sDto.setTitle(section.getTitle());
            sDto.setOrderIndex(section.getOrderIndex());

            List<Lesson> lessons = lessonRepository.findBySectionIdOrderByOrderIndexAsc(section.getId());
            List<LessonDto> lessonDtos = lessons.stream().map(lesson -> {
                LessonDto lDto = new LessonDto();
                lDto.setId(lesson.getId());
                lDto.setTitle(lesson.getTitle());
                lDto.setContentType(lesson.getContentType());
                lDto.setContentUrl(lesson.getContentUrl());
                lDto.setDuration(lesson.getDuration());
                lDto.setOrderIndex(lesson.getOrderIndex());
                return lDto;
            }).collect(Collectors.toList());

            sDto.setLessons(lessonDtos);
            return sDto;
        }).collect(Collectors.toList());

        dto.setSections(sectionDtos);
        return dto;
    }

    @Override
    public List<CourseDto> getInstructorCourses(String email) {
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return courseRepository.findByInstructorId(instructor.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public CourseDto createCourse(CourseDto dto, String email) {
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = Course.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .thumbnail(dto.getThumbnail())
                .instructor(instructor)
                .status("PENDING") // Needs admin approval initially
                .build();
        
        return mapToDto(courseRepository.save(course));
    }

    @Override
    public CourseDto updateCourse(Long courseId, CourseDto dto, String email) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (!course.getInstructor().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Not the course owner");
        }

        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        course.setPrice(dto.getPrice());
        course.setThumbnail(dto.getThumbnail());
        return mapToDto(courseRepository.save(course));
    }

    @Override
    public void deleteCourse(Long courseId, String email) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (!course.getInstructor().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Not the course owner");
        }
        courseRepository.delete(course);
    }

    @Override
    public SectionDto addSection(Long courseId, SectionDto dto, String email) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (!course.getInstructor().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Not the course owner");
        }

        Section section = Section.builder()
                .course(course)
                .title(dto.getTitle())
                .orderIndex(dto.getOrderIndex())
                .build();

        Section saved = sectionRepository.save(section);
        dto.setId(saved.getId());
        return dto;
    }

    @Override
    public SectionDto updateSection(Long sectionId, SectionDto dto, String email) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        if (!section.getCourse().getInstructor().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Not the course owner");
        }
        section.setTitle(dto.getTitle());
        if (dto.getOrderIndex() != null) {
            section.setOrderIndex(dto.getOrderIndex());
        }
        sectionRepository.save(section);
        dto.setId(section.getId());
        return dto;
    }

    @Override
    public void deleteSection(Long sectionId, String email) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        if (!section.getCourse().getInstructor().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Not the course owner");
        }
        sectionRepository.delete(section);
    }

    @Override
    public LessonDto addLesson(Long sectionId, LessonDto dto, String email) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        if (!section.getCourse().getInstructor().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Not the course owner");
        }

        Lesson lesson = Lesson.builder()
                .section(section)
                .title(dto.getTitle())
                .contentType(dto.getContentType())
                .contentUrl(dto.getContentUrl())
                .duration(dto.getDuration())
                .orderIndex(dto.getOrderIndex())
                .build();

        Lesson saved = lessonRepository.save(lesson);
        dto.setId(saved.getId());
        return dto;
    }

    @Override
    public LessonDto updateLesson(Long lessonId, LessonDto dto, String email) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (!lesson.getSection().getCourse().getInstructor().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Not the course owner");
        }
        
        lesson.setTitle(dto.getTitle());
        lesson.setContentType(dto.getContentType());
        lesson.setContentUrl(dto.getContentUrl());
        lesson.setDuration(dto.getDuration());
        if (dto.getOrderIndex() != null) {
            lesson.setOrderIndex(dto.getOrderIndex());
        }
        
        lessonRepository.save(lesson);
        dto.setId(lesson.getId());
        return dto;
    }

    @Override
    public void deleteLesson(Long lessonId, String email) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (!lesson.getSection().getCourse().getInstructor().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Not the course owner");
        }
        lessonRepository.delete(lesson);
    }

    @Override
    public void approveCourse(Long courseId, boolean isApproved) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setStatus(isApproved ? "APPROVED" : "REJECTED");
        courseRepository.save(course);
    }

    @Override
    public List<CourseDto> getAllCoursesForAdmin() {
        return courseRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private CourseDto mapToDto(Course course) {
        CourseDto dto = new CourseDto();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setPrice(course.getPrice());
        dto.setThumbnail(course.getThumbnail());
        dto.setInstructorName(course.getInstructor().getName());
        dto.setStatus(course.getStatus());
        dto.setCreatedAt(course.getCreatedAt());
        return dto;
    }
}
