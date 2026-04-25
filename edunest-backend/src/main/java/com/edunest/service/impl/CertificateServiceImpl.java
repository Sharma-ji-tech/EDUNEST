package com.edunest.service.impl;

import com.edunest.entity.Certificate;
import com.edunest.entity.Course;
import com.edunest.entity.Enrollment;
import com.edunest.entity.User;
import com.edunest.repository.CertificateRepository;
import com.edunest.repository.CourseRepository;
import com.edunest.repository.EnrollmentRepository;
import com.edunest.repository.UserRepository;
import com.edunest.service.CertificateService;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public String generateCertificate(Long courseId, String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (!enrollment.getCompleted() || enrollment.getProgress() < 100.0) {
            throw new RuntimeException("Course is not fully completed yet.");
        }

        Optional<Certificate> existingCert = certificateRepository.findByStudentIdAndCourseId(student.getId(), courseId);
        if (existingCert.isPresent()) {
            return existingCert.get().getCertificateUrl();
        }

        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String fileName = "cert_" + student.getId() + "_" + courseId + ".pdf";
            String filePath = uploadDir + File.separator + fileName;

            Document document = new Document();
            PdfWriter.getInstance(document, new FileOutputStream(filePath));

            document.open();
            
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 32, BaseColor.BLUE);
            Paragraph title = new Paragraph("CERTIFICATE OF COMPLETION", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(50);
            document.add(title);

            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 16, BaseColor.BLACK);
            Paragraph p1 = new Paragraph("This is to certify that", textFont);
            p1.setAlignment(Element.ALIGN_CENTER);
            document.add(p1);

            Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, BaseColor.BLACK);
            Paragraph name = new Paragraph(student.getName(), nameFont);
            name.setAlignment(Element.ALIGN_CENTER);
            name.setSpacingAfter(30);
            document.add(name);

            Paragraph p2 = new Paragraph("has successfully completed the online course", textFont);
            p2.setAlignment(Element.ALIGN_CENTER);
            document.add(p2);

            Font courseFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, BaseColor.DARK_GRAY);
            Paragraph courseTitle = new Paragraph(course.getTitle(), courseFont);
            courseTitle.setAlignment(Element.ALIGN_CENTER);
            courseTitle.setSpacingAfter(30);
            document.add(courseTitle);

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            Paragraph date = new Paragraph("Date: " + dtf.format(LocalDateTime.now()), textFont);
            date.setAlignment(Element.ALIGN_RIGHT);
            date.setSpacingBefore(50);
            document.add(date);
            
            document.close();

            String downloadUrl = "/api/certificate/download/" + fileName;
            
            Certificate certificate = Certificate.builder()
                    .student(student)
                    .course(course)
                    .certificateUrl(downloadUrl)
                    .build();
            certificateRepository.save(certificate);

            return downloadUrl;

        } catch (Exception e) {
            throw new RuntimeException("Error generating certificate: " + e.getMessage());
        }
    }
}
