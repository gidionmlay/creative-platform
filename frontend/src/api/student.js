/**
 * Student API Connection Layer
 */

(function() {
    var STUDENT_BASE_URL = "http://127.0.0.1:8000/api/v1";

    // Auth headers fetched globally

    async function getCourses() {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };

        try {
            var res = await fetch(STUDENT_BASE_URL + "/courses/", {
                method: "GET",
                headers: window.api.getAuthHeaders()
            });
            var responseData = await res.json();
            return { ok: res.ok, data: responseData };
        } catch (error) {
            console.error("API Error fetching courses", error);
            return { ok: false, data: null };
        }
    }

    async function getMyCourses() {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };

        try {
            var res = await fetch(STUDENT_BASE_URL + "/student/my-courses/", {
                method: "GET",
                headers: window.api.getAuthHeaders()
            });
            var responseData = await res.json();
            return { ok: res.ok, data: responseData };
        } catch (error) {
            console.error("API Error fetching my courses", error);
            return { ok: false, data: null };
        }
    }

    async function enrollCourse(id) {
        var token = window.auth ? window.auth.getToken() : localStorage.getItem("token");
        if (!token) return { ok: false, data: { detail: "Unauthorized" } };

        try {
            var res = await fetch(STUDENT_BASE_URL + "/courses/" + id + "/enroll/", {
                method: "POST",
                headers: window.api.getAuthHeaders()
            });
            var responseData = await res.json();
            return { ok: res.ok, data: responseData };
        } catch (error) {
            console.error("API Error enrolling in course", error);
            return { ok: false, data: null };
        }
    }

    window.studentApi = {
        getCourses: getCourses,
        getMyCourses: getMyCourses,
        enrollCourse: enrollCourse
    };

})();
