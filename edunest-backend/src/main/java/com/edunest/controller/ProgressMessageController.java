package com.edunest.controller;

import com.edunest.entity.Enrollment;
import com.edunest.entity.Lesson;
import com.edunest.repository.EnrollmentRepository;
import com.edunest.repository.LessonRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import org.springframework.transaction.annotation.Transactional;

@Controller
@RequiredArgsConstructor
public class ProgressMessageController {

    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Data
    public static class ProgressEvent {
        private Long studentId;
        private Long lessonId;
    }

    @MessageMapping("/lesson/complete")
    @Transactional
    public void markLessonComplete(@Payload ProgressEvent event) {
        Lesson lesson = lessonRepository.findById(event.getLessonId())
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        Long courseId = lesson.getSection().getCourse().getId();
        
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(event.getStudentId(), courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        double currentProgress = enrollment.getProgress() != null ? enrollment.getProgress() : 0.0;
        double newProgress = Math.min(100.0, currentProgress + 10.0); // Demo increment
        
        enrollment.setProgress(newProgress);
        if (newProgress >= 100.0) {
            enrollment.setCompleted(true);
        }
        enrollmentRepository.save(enrollment);

        messagingTemplate.convertAndSend("/topic/progress/" + event.getStudentId(), newProgress);
    }
}
