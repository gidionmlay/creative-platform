/**
 * Admin Courses API Connection Layer
 */

(function() {

const ADMIN_COURSES_BASE_URL = "http://127.0.0.1:8000/api/v1/admin";

// Auth headers fetched globally

async function fetchAPI(endpoint, method = "GET", body = null) {
    try {
        const options = { method, headers: window.api.getAuthHeaders() };
        if (body) options.body = JSON.stringify(body);
        
        const res = await fetch(`${ADMIN_COURSES_BASE_URL}${endpoint}`, options);
        let data = null;
        if (res.status !== 204) {
            data = await res.json();
        }
        return { ok: res.ok, data };
    } catch (error) {
        console.error(`API Error ${method} ${endpoint}`, error);
        return { ok: false, data: null };
    }
}

window.adminCoursesApi = {
    // --- COURSES ---
    getCourses: () => fetchAPI('/courses/'),
    getCourse: (id) => fetchAPI(`/courses/${id}/`), // Wait, public detail is fine, or admin detail? Using standard detail for now since it includes nested modules. 
                                                     // Actually, the nested modules are from the PUBLIC endpoint. 
                                                     // The prompt asks for building UI. We should hit the public GET /api/v1/courses/{id}/detail/ for the full tree.
    getCourseTree: async (id) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/v1/courses/${id}/detail/`, {
                headers: window.api.getAuthHeaders()
            });
            return { ok: res.ok, data: await res.json() };
        } catch (e) { return { ok: false }; }
    },
    createCourse: (data) => fetchAPI('/courses/', 'POST', data),
    updateCourse: (id, data) => fetchAPI(`/courses/${id}/`, 'PATCH', data),
    deleteCourse: (id) => fetchAPI(`/courses/${id}/`, 'DELETE'),

    // --- MODULES ---
    createModule: (courseId, data) => fetchAPI(`/courses/${courseId}/modules/`, 'POST', data),
    updateModule: (id, data) => fetchAPI(`/modules/${id}/`, 'PATCH', data),
    deleteModule: (id) => fetchAPI(`/modules/${id}/`, 'DELETE'),
    reorderModules: (dataArray) => fetchAPI(`/modules/reorder/`, 'PATCH', dataArray),

    // --- LESSONS ---
    createLesson: (moduleId, data) => fetchAPI(`/modules/${moduleId}/lessons/`, 'POST', data),
    updateLesson: (id, data) => fetchAPI(`/lessons/${id}/`, 'PATCH', data),
    deleteLesson: (id) => fetchAPI(`/lessons/${id}/`, 'DELETE'),
    reorderLessons: (dataArray) => fetchAPI(`/lessons/reorder/`, 'PATCH', dataArray),

    // --- ENROLLMENTS & ANALYTICS ---
    getEnrollments: () => fetchAPI(`/enrollments/`)
};

})();
