(() => {
  const COUNTER_ID = 112292795;
  const CONSENT_KEY = "eldar-analytics-consent-v1";
  const SCRIPT_URL = `https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}`;

  let isInitialized = false;

  const getConsent = () => {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch {
      return null;
    }
  };

  const setConsent = (value) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Analytics still works for the current page when storage is unavailable.
    }
  };

  const loadMetrika = () => {
    if (isInitialized) return;
    isInitialized = true;

    window.ym =
      window.ym ||
      function () {
        (window.ym.a = window.ym.a || []).push(arguments);
      };
    window.ym.l = Date.now();

    if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.src = SCRIPT_URL;
      document.head.appendChild(script);
    }

    window.ym(COUNTER_ID, "init", {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: "dataLayer",
      referrer: document.referrer,
      url: window.location.href,
      accurateTrackBounce: true,
      trackLinks: true,
    });
  };

  const sendGoal = (name, params = {}) => {
    if (!isInitialized || typeof window.ym !== "function") return;
    window.ym(COUNTER_ID, "reachGoal", name, params);
  };

  const classifyLink = (link) => {
    const rawHref = link.getAttribute("href") || "";
    if (!rawHref || rawHref === "#") return null;

    if (/\.pdf(?:$|[?#])/i.test(rawHref)) {
      return { name: "resume_open", params: { href: rawHref } };
    }

    if (rawHref.startsWith("mailto:")) {
      return { name: "email_open", params: { address: rawHref.slice(7) } };
    }

    let url;
    try {
      url = new URL(rawHref, window.location.href);
    } catch {
      return null;
    }

    if (url.hostname === "t.me" || url.hostname === "telegram.me") {
      return { name: "telegram_open", params: { href: url.href } };
    }

    const caseMatch = url.pathname.match(/\/cases\/([^/]+)\.html$/i);
    if (url.origin === window.location.origin && caseMatch) {
      return { name: "case_open", params: { case_slug: caseMatch[1] } };
    }

    if (url.origin !== window.location.origin && /^https?:$/.test(url.protocol)) {
      return {
        name: "external_link_open",
        params: { destination: url.hostname, href: url.href },
      };
    }

    return null;
  };

  const bindGoals = () => {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;
      const goal = classifyLink(link);
      if (goal) sendGoal(goal.name, goal.params);
    });

    if (!("IntersectionObserver" in window)) return;

    const observedSections = [
      [document.querySelector("#projects-title")?.closest("section"), "projects_seen"],
      [document.querySelector("#contacts"), "contacts_seen"],
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          sendGoal(entry.target.dataset.analyticsGoal);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.25 },
    );

    observedSections.forEach(([section, goal]) => {
      if (!section) return;
      section.dataset.analyticsGoal = goal;
      observer.observe(section);
    });
  };

  const showConsent = () => {
    if (document.querySelector(".analytics-consent")) return;

    const consent = document.createElement("aside");
    consent.className = "analytics-consent";
    consent.setAttribute("role", "region");
    consent.setAttribute("aria-label", "Настройки аналитики");
    consent.innerHTML = `
      <p class="analytics-consent__text">
        Я использую Яндекс Метрику, чтобы понимать, какие кейсы полезнее посетителям.
        <a href="${document.body.dataset.rootPath || "."}/privacy.html">Подробнее</a>
      </p>
      <div class="analytics-consent__actions">
        <button class="analytics-consent__button analytics-consent__button--secondary" type="button" data-consent="denied">Не разрешать</button>
        <button class="analytics-consent__button analytics-consent__button--primary" type="button" data-consent="granted">Разрешить</button>
      </div>
    `;

    consent.addEventListener("click", (event) => {
      const button = event.target.closest("[data-consent]");
      if (!button) return;
      const value = button.dataset.consent;
      setConsent(value);
      consent.remove();
      if (value === "granted") loadMetrika();
    });

    document.body.appendChild(consent);
  };

  const init = () => {
    bindGoals();

    const consent = getConsent();
    if (consent === "granted") loadMetrika();
    if (consent !== "granted" && consent !== "denied") showConsent();

    document.querySelectorAll("[data-analytics-settings]").forEach((button) => {
      button.addEventListener("click", () => {
        try {
          window.localStorage.removeItem(CONSENT_KEY);
        } catch {
          // Reloading still gives the visitor another chance to choose.
        }
        window.location.reload();
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
