import api from './axios';

export const getPublicCourses = async () => {
  const response = await api.get('/courses');
  return response.data.data.content || response.data.data;
};

export const getCourseDetails = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data.data;
};

export const getInstructorCourses = async () => {
  const response = await api.get('/instructor/courses');
  return response.data.data;
};

export const addSectionToCourse = async (courseId, data) => {
  const response = await api.post(`/instructor/courses/${courseId}/sections`, data);
  return response.data;
};

export const addLessonToSection = async (sectionId, data) => {
  const response = await api.post(`/instructor/sections/${sectionId}/lessons`, data);
  return response.data;
};

export const updateSection = async (sectionId, data) => {
  const response = await api.put(`/instructor/sections/${sectionId}`, data);
  return response.data;
};

export const deleteSection = async (sectionId) => {
  const response = await api.delete(`/instructor/sections/${sectionId}`);
  return response.data;
};

export const updateLesson = async (lessonId, data) => {
  const response = await api.put(`/instructor/lessons/${lessonId}`, data);
  return response.data;
};

export const deleteLesson = async (lessonId) => {
  const response = await api.delete(`/instructor/lessons/${lessonId}`);
  return response.data;
};

