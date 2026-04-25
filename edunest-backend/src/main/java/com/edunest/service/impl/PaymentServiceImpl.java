package com.edunest.service.impl;

import com.edunest.dto.PaymentRequest;
import com.edunest.dto.PaymentResponse;
import com.edunest.dto.PaymentVerificationRequest;
import com.edunest.entity.Course;
import com.edunest.entity.Enrollment;
import com.edunest.entity.Payment;
import com.edunest.entity.User;
import com.edunest.repository.CourseRepository;
import com.edunest.repository.EnrollmentRepository;
import com.edunest.repository.PaymentRepository;
import com.edunest.repository.UserRepository;
import com.edunest.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpaySecret;

    @Override
    @Transactional
    public PaymentResponse createOrder(PaymentRequest request, String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), course.getId())) {
            throw new RuntimeException("Student is already enrolled in this course");
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpaySecret);
            
            JSONObject orderRequest = new JSONObject();
            // Amount is in subunits (paise)
            int amountInPaise = (int) (request.getAmount() * 100);
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);
            String orderId = order.get("id");

            Payment payment = Payment.builder()
                    .student(student)
                    .course(course)
                    .amount(request.getAmount())
                    .razorpayOrderId(orderId)
                    .status("PENDING")
                    .build();

            paymentRepository.save(payment);

            return new PaymentResponse(orderId, request.getAmount(), "INR");

        } catch (Exception e) {
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void verifyPayment(PaymentVerificationRequest request, String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment record not found"));

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpaySecret);

            if (isValid) {
                payment.setStatus("SUCCESS");
                payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
                paymentRepository.save(payment);

                Enrollment enrollment = Enrollment.builder()
                        .student(student)
                        .course(course)
                        .progress(0.0)
                        .completed(false)
                        .build();
                enrollmentRepository.save(enrollment);
            } else {
                payment.setStatus("FAILED");
                paymentRepository.save(payment);
                throw new RuntimeException("Payment signature verification failed");
            }
        } catch (Exception e) {
            throw new RuntimeException("Payment verification error: " + e.getMessage());
        }
    }
}
