/**
 * Courses API Connection Layer
 */

const BASE_URL = "http://127.0.0.1:8000/api/v1";

async function getCourseDetail(id) {
    try {
        const res = await fetch(`${BASE_URL}/courses/${id}/`, {
            method: "GET",
            headers: window.api.getAuthHeaders()
        });
        const responseData = await res.json();
        return { ok: res.ok, data: responseData };
    } catch (error) {
        console.error("API Error fetching course details", error);
        return { ok: false, data: null };
    }
}

async function markLessonComplete(id) {
    try {
        const res = await fetch(`${BASE_URL}/student/lessons/${id}/complete/`, {
            method: "POST",
            headers: window.api.getAuthHeaders()
        });
        const responseData = await res.json();
        return { ok: res.ok, data: responseData };
    } catch (error) {
        console.error("API Error marking lesson complete", error);
        return { ok: false, data: null };
    }
}

window.coursesApi = {
    getCourseDetail,
    markLessonComplete
};
