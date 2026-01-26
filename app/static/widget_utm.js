// widget_utm.js
// https://boxcatering-ai-prod.todo.ltd/static/widget_utm.js
// odoo link
// https://erp.box-catering.ua/init_widget_session

/**
 * Returns a string of UTM parameters from the current URL
 * @returns {string} a string of UTM parameters, e.g. "utm_source=source&utm_medium=medium"
 */
function getUTMParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = [];
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((param) => {
        if (urlParams.has(param)) {
            utmParams.push(`${param}=${urlParams.get(param)}`);
        }
    });
    return utmParams.length ? utmParams.join("&") : "";
}

/**
 * Sends a POST request to the specified link with UTM parameters from the current URL.
 * The request body is a JSON object with the following properties:
 * - jsonrpc: "2.0"
 * - params: an object with the following properties:
 *   - uid: the current user's ID
 *   - action: the action that triggered the request
 *   - ga_session: the current GA session ID, or an empty string if not available
 *   - site: the current hostname, or an empty string if not available
 * The function logs the response to the console and retries the request on error.
 * @param {string} link - the URL to send the request to
 * @param {string} action - the action that triggered the request
 */
function sendUTMParams(link, action) {
    const utmQuery = getUTMParams();

    let utmQueryObject = {};

    if (utmQuery) {
        utmQueryObject = utmQuery.split("&").reduce((acc, param) => {
            const [key, value] = param.split("=");
            acc[key] = decodeURIComponent(value);
            return acc;
        }, {});
    }

    utmQueryObject.uid = uid;
    utmQueryObject.action = action;
    utmQueryObject.ga_session = localStorage.getItem("ga4_session_id") ?? "";
    utmQueryObject.site = location.hostname ?? window.location.hostname ?? "domain_detect_blocked";

    /**
     * Sends a POST request to the specified link with UTM parameters from the current URL.
     * @returns {Promise<Response>} a promise that resolves to the response object
     * @throws {Error} if the request fails
     */
    let postToOdoo = async () => {
        const response = await fetch(link, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                params: utmQueryObject,
            }),
        });
        return await response;
    };

    postToOdoo()
        .then((data) => {
            console.log("response:", data);
        })
        .catch((error) => {
            console.error("error:", error);
            setTimeout(() => {
                postToOdoo()
                    .then((data) => {
                        console.log("retry response:", data);
                    })
                    .catch((error) => {
                        console.error("retry error:", error);
                    });
            }, 1000);
        });
}

const lsodoo = "https://erp.box-catering.ua/init_widget_session"; // odoo link

let uid = genUID();

/**
 * Generates a random UUID and updates the Telegram, Viber and Messenger buttons' href attributes with the generated UUID.
 * @returns {string} a random UUID, e.g. "10000000-1000-4000-8000-100000000000"
 */
function genUID() {
    const uid = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16));

    if (uid) {
        document.getElementById("telegram-btn").href = document.getElementById("telegram-btn").href.split("?start=")[0];
        document.getElementById("viber-btn").href = document.getElementById("viber-btn").href.split("&context=")[0];
        document.getElementById("messenger-btn").href = document.getElementById("messenger-btn").href.split("?ref=")[0];

        document.getElementById("telegram-btn").href += `?start=${uid}`;
        document.getElementById("viber-btn").href += `&context=${uid}`;
        document.getElementById("messenger-btn").href += `?ref=${uid}`;
    }
    return uid;
}

const telegram = document.querySelector("#telegram-btn");
/**
 * Sends a request to the specified Odoo endpoint with the "widget_Telegram_click" UTM parameter when the Telegram button is clicked.
 */
telegram.onclick = function () {
    sendUTMParams(lsodoo, "widget_Telegram_click");
};

const viber = document.querySelector("#viber-btn");
/**
 * Sends a request to the specified Odoo endpoint with the "widget_viber_click" UTM parameter when the Viber button is clicked.
 */
viber.onclick = function () {
    sendUTMParams(lsodoo, "widget_viber_click");
};

const facebook = document.querySelector("#messenger-btn");
/**
 * Sends a request to the specified Odoo endpoint with the "widget_facebook_click" UTM parameter when the Facebook button is clicked.
 */
facebook.onclick = function () {
    sendUTMParams(lsodoo, "widget_facebook_click");
};
