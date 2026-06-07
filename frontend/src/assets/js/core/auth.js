/**
 * G Design Core Authentication System
 */

function getToken() {
    return localStorage.getItem("token");
}

function setToken(token) {
    localStorage.setItem("token", token);
}

function isAuthenticated() {
    return !!getToken();
}

function logout(expired = false) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    const root = window.ROOT_PATH || '';
    if (expired) {
        window.location.href = root + "/src/pages/auth/login.html?expired=1";
    } else {
        window.location.href = root + "/src/pages/auth/login.html";
    }
}

// Global exposure for non-module scripts
window.auth = {
    getToken,
    setToken,
    isAuthenticated,
    logout
};
