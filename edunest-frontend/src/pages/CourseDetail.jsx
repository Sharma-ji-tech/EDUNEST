import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetails } from '../api/courseApi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    getCourseDetails(id).then(setCourse).catch(console.error);
  }, [id]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleEnroll = async () => {
    if (!user) {
      alert("Please login first");
      navigate('/login');
      return;
    }
    
    try {
      const res = await api.post('/payment/create-order', {
        courseId: id,
        amount: course.price
      });
      
      const { razorpayOrderId, amount, currency } = res.data.data;
      
      const resCode = await loadRazorpayScript();
      if (!resCode) {
        alert('Razorpay SDK failed to load');
        return;
      }

      const options = {
        key: 'rzp_test_SYaBpmGGQtblOd',
        amount: Math.round(amount * 100),
        currency: currency,
        name: 'EduNest',
        description: `Enrollment for ${course.title}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            await api.post('/payment/verify', {
              courseId: id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            alert('Payment Successful! You are enrolled.');
            navigate('/student/dashboard');
          } catch (err) {
            alert('Payment Verification Failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#3b82f6'
        }
      };
      
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      alert(err.response?.data?.message || 'Error initiating payment');
    }
  };

  if (!course) return <div>Loading...</div>;

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <h1>{course.title}</h1>
      <p style={{ marginTop: '10px', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Instructor: {course.instructorName}</p>
      
      <div style={{ margin: '30px 0' }}>
        <h3>Description</h3>
        <p style={{ marginTop: '10px', lineHeight: '1.6' }}>{course.description}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <h2 style={{ color: 'var(--success-color)' }}>Price: ₹{course.price}</h2>
        <button onClick={handleEnroll} className="btn-primary" style={{ padding: '15px 30px', fontSize: '1.2rem' }}>
          Enroll Now
        </button>
      </div>
    </div>
  );
};
export default CourseDetail;
