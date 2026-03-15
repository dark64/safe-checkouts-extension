const browser = globalThis.browser || globalThis.chrome;

const SAFE_LIST_URL =
  "https://raw.githubusercontent.com/dark64/safe-checkouts-extension/main/safe-urls.json";
const ATTR_NAME = "data-safe-checkouts";

const CACHE_KEY = "safeListCache-v1";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function initStyles() {
  const style = document.createElement("style");
  style.textContent = `
    iframe[${ATTR_NAME}="true"] { border: 3px solid #4cd137 !important; }
    .safe-checkouts-label {
      position: fixed !important;
      background: #4cd137 !important;
      color: #fff !important;
      font: bold 11px sans-serif !important;
      padding: 2px 8px !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      width: auto !important;
    }
  `;
  document.head.appendChild(style);
}

(function () {
  initStyles();

  function highlightSafeIframes(safeList) {
    const iframes = document.querySelectorAll("iframe[src]");
    iframes.forEach((iframe) => {
      const src = iframe.src;
      const match = safeList.some((pattern) => new RegExp(pattern).test(src));
      if (match) {
        iframe.setAttribute(ATTR_NAME, "true");
        iframe.style.setProperty("border", "3px solid #4cd137", "important");

        if (iframe.parentElement) {
          iframe.parentElement.style.setProperty(
            "overflow",
            "visible",
            "important",
          );
        }

        if (!iframe._safeCheckoutsLabel) {
          const label = document.createElement("div");
          label.className = "safe-checkouts-label";
          label.textContent = "Safe";
          document.body.appendChild(label);
          iframe._safeCheckoutsLabel = label;
        }

        const rect = iframe.getBoundingClientRect();
        const label = iframe._safeCheckoutsLabel;
        label.style.setProperty("top", `${rect.top - 15}px`, "important");
        label.style.setProperty(
          "left",
          `${rect.right - label.offsetWidth}px`,
          "important",
        );
      }
    });
  }

  async function fetchSafeList() {
    const cached = await browser.storage.local.get(CACHE_KEY);
    const cache = cached[CACHE_KEY];

    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return cache.data;
    }

    try {
      const response = await fetch(SAFE_LIST_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      await browser.storage.local.set({
        [CACHE_KEY]: { data, timestamp: Date.now() },
      });
      return data;
    } catch (e) {
      console.warn("Safe Checkouts: failed to fetch safe list, using cache", e);
      return cache ? cache.data : [];
    }
  }

  fetchSafeList().then((safeList) => {
    highlightSafeIframes(safeList);

    const observer = new MutationObserver(() => highlightSafeIframes(safeList));
    observer.observe(document.body, { childList: true, subtree: true });

    function repositionLabels() {
      document
        .querySelectorAll(`iframe[${ATTR_NAME}="true"]`)
        .forEach((iframe) => {
          if (iframe._safeCheckoutsLabel) {
            const rect = iframe.getBoundingClientRect();
            const label = iframe._safeCheckoutsLabel;
            label.style.setProperty("top", `${rect.top - 15}px`, "important");
            label.style.setProperty(
              "left",
              `${rect.right - label.offsetWidth}px`,
              "important",
            );
          }
        });
    }
    window.addEventListener("scroll", repositionLabels, { passive: true });
    window.addEventListener("resize", repositionLabels, { passive: true });
  });
})();
