/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * 
 * Repository: https://github.com/shaack/cookie-consent-js
 * License: MIT, see file 'LICENSE'
 */

"use strict"

function CookieConsent(props) {

    const self = this
    self.props = {
        buttonPrimaryClass: "btn btn-primary", // the "accept all" buttons class, only used for styling
        buttonSecondaryClass: "btn btn-secondary", // the "accept necessary" buttons class, only used for styling
        autoShowModal: true, // disable autoShowModal on the privacy policy page, to make that page readable
        blockAccess: false, // set "true" to block the access to the website before choosing a cookie configuration
        position: "left", // position ("left" or "right"), if blockAccess is false
        postSelectionCallback: undefined, // callback, after the user has made a selection
        reloadPageIfAccepted: true, //Whether to reload the page if they accept the cookies
        content: {
            "title": "Cookie Settings",
            "body": "We use cookies to personalize content and analyse traffic to our website. You can choose to accept only cookies that are necessary for the website to function or to also allow tracking cookies. For more information, please see our --privacy-policy--.",
            "privacyPolicy": "privacy policy",
            "buttonAcceptAll": "Accept All Cookies",
            "buttonAcceptTechnical": "Reject Non-Necessary Cookies"
        },
        privacyPolicyUrl: "privacy-policy",
        cookieName: "cookie-consent-tracking-allowed",  // the name of the cookie, the cookie is `true` if tracking was accepted
        modalId: "cookieConsentModal" // the id of the modal dialog element
    }
    for (const property in props) {
        if (property !== "content") {
            // noinspection JSUnfilteredForInLoop
            self.props[property] = props[property]
        }
    }
    for (let contentProperty in props.content) {
        self.props.content[contentProperty] = props.content[contentProperty]
    }
    renderModal();

    function renderModal() {
        const _t = self.props.content
        const linkPrivacyPolicy = '<a href="' + self.props.privacyPolicyUrl + '">' + _t.privacyPolicy + '</a>'
        let modalClass = "cookie-consent-modal"
        if (self.props.blockAccess) {
            modalClass += " block-access"
        }
        self.modalContent = '<!-- cookie banner => https://github.com/shaack/cookie-consent-js -->' +
            '<div class="' + modalClass + '">' +
            '<div class="modal-content-wrap ' + self.props.position + '">' +
            '<div class="modal-content">' +
            '<div class="modal-header">--header--</div>' +
            '<div class="modal-body">--body--</div>' +
            '<div class="modal-footer">--footer--</div>' +
            '</div></div><!-- end cookie-consent.js -->'
        self.modalContent = self.modalContent.replace(/--header--/, "<h3 class=\"modal-title\">" + _t.title + "</h3>")
        self.modalContent = self.modalContent.replace(/--body--/,
            _t.body.replace(/--privacy-policy--/, linkPrivacyPolicy)
        )
        self.modalContent = self.modalContent.replace(/--footer--/,
            "<div class='buttons'>" +
            "<button class='btn-accept-necessary " + self.props.buttonSecondaryClass + "'>" + _t.buttonAcceptTechnical + "</button>" +
            "<button class='btn-accept-all " + self.props.buttonPrimaryClass + "'>" + _t.buttonAcceptAll + "</button>" +
            "</div>"
        )
        if (getCookie(self.props.cookieName) === undefined && self.props.autoShowModal) {
            showDialog()
        }
    }

    function setCookie(name, value, days) {
        let expires = ""
        if (days) {
            const date = new Date()
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
            expires = "; expires=" + date.toUTCString()
        }
        document.cookie = name + "=" + (value || "") + expires + "; Path=/; SameSite=Strict;"
    }

    function getCookie(name) {
        const nameEQ = name + "="
        const ca = document.cookie.split(';')
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i]
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length)
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length)
            }
        }
        return undefined
    }

    function removeCookie(name) {
        document.cookie = name + '=; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    }

    function documentReady(fn) {
        if (document.readyState !== 'loading') {
            fn()
        } else {
            document.addEventListener('DOMContentLoaded', fn)
        }
    }

    function hideDialog() {
        self.modal.style.display = "none"
    }

    function showDialog() {
        documentReady(function () {
            self.modal = document.getElementById(self.props.modalId)
            if (!self.modal) {
                self.modal = document.createElement("div")
                self.modal.id = self.props.modalId
                self.modal.innerHTML = self.modalContent
                document.body.append(self.modal)
                self.modal.querySelector(".btn-accept-necessary").addEventListener("click", function () {
                    setCookie(self.props.cookieName, "false", 365)
                    hideDialog()
                    if (self.props.postSelectionCallback) {
                        self.props.postSelectionCallback()
                    }
                })
                self.modal.querySelector(".btn-accept-all").addEventListener("click", function () {
                    setCookie(self.props.cookieName, "true", 365)
                    hideDialog()
                    if (self.props.postSelectionCallback) {
                        self.props.postSelectionCallback()
                    }
                    if (self.props.reloadPageIfAccepted) {
                        location.reload();
                    }
                })
            } else {
                self.modal.style.display = "block"
            }
        }.bind(this))
    }

    // API

    self.reset = function () {
        removeCookie(self.props.cookieName)
        showDialog()
    }

    self.trackingAllowed = function () {
        return getCookie(self.props.cookieName) === "true"
    }

}
