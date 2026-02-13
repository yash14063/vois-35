/* ===========================================
   VisionCare AI - SPA Router
   router.js
   =========================================== */

import CONFIG from './config.js';

class Router {

    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.rootElement = document.getElementById("app");
        this.protectedRoutes = [];
        this.authenticated = true; // Demo mode
    }

    /* ===========================================
       REGISTER ROUTE
    =========================================== */
    register(path, options) {

        this.routes[path] = {
            render: options.render,
            beforeEnter: options.beforeEnter || null,
            title: options.title || "VisionCare"
        };

        if (options.protected) {
            this.protectedRoutes.push(path);
        }
    }

    /* ===========================================
       NAVIGATE TO ROUTE
    =========================================== */
    async navigate(path) {

        if (!this.routes[path]) {
            this.render404();
            return;
        }

        if (this.protectedRoutes.includes(path) && !this.authenticated) {
            console.warn("🔒 Unauthorized access blocked");
            this.navigate("/login");
            return;
        }

        const route = this.routes[path];

        if (route.beforeEnter) {
            const allow = await route.beforeEnter();
            if (!allow) return;
        }

        this.currentRoute = path;
        window.history.pushState({}, "", path);

        document.title = route.title;

        this.render(route.render);
    }

    /* ===========================================
       RENDER VIEW
    =========================================== */
    async render(renderFunction) {

        if (!this.rootElement) return;

        if (CONFIG.ENV.DEBUG) {
            console.log("🧭 Navigating to:", this.currentRoute);
        }

        const content = await renderFunction();

        this.rootElement.innerHTML = "";
        this.rootElement.appendChild(content);
    }

    /* ===========================================
       HANDLE BACK/FORWARD BUTTON
    =========================================== */
    initPopState() {

        window.addEventListener("popstate", () => {
            const path = window.location.pathname;
            this.navigate(path);
        });
    }

    /* ===========================================
       START ROUTER
    =========================================== */
    start(defaultRoute = "/") {

        this.initPopState();

        const path = window.location.pathname;

        if (this.routes[path]) {
            this.navigate(path);
        } else {
            this.navigate(defaultRoute);
        }
    }

    /* ===========================================
       404 PAGE
    =========================================== */
    render404() {

        const div = document.createElement("div");
        div.className = "page-404";
        div.innerHTML = `
            <h1>404</h1>
            <p>Page Not Found</p>
            <button id="goHome">Go Home</button>
        `;

        div.querySelector("#goHome").addEventListener("click", () => {
            this.navigate("/");
        });

        this.rootElement.innerHTML = "";
        this.rootElement.appendChild(div);
    }

    /* ===========================================
       AUTH MANAGEMENT (Demo)
    =========================================== */
    login() {
        this.authenticated = true;
    }

    logout() {
        this.authenticated = false;
        this.navigate("/login");
    }

    isAuthenticated() {
        return this.authenticated;
    }
}

export default Router;

