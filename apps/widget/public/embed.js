(function (global) {
  // Prevent SSR crashes in Next.js / Nuxt
  if (typeof window === "undefined" || typeof document === "undefined") return;

  function initWidget(customConfig) {
    var config = customConfig || {};
    
    // Fallback to script tag extraction if no config passed
    if (!customConfig) {
      var script =
        document.currentScript ||
        (function () {
          var scripts = document.getElementsByTagName("script");
          return scripts[scripts.length - 1];
        })();

      if (script) {
        config = {
          layout: script.getAttribute("data-layout") || "floating",
          theme: script.getAttribute("data-theme") || "default",
          primary: script.getAttribute("data-primary") || "",
          background: script.getAttribute("data-background") || "",
          foreground: script.getAttribute("data-foreground") || "",
          card: script.getAttribute("data-card") || "",
          radius: script.getAttribute("data-radius") || "",
          host: script.src ? script.src.split("/").slice(0, 3).join("/") : "https://atlas.thecodingant.in"
        };
      }
    }

    var qsParams = new URLSearchParams();
    for (var key in config) {
      if (config[key] && key !== 'host') qsParams.append(key, config[key]);
    }

    var widgetHost = config.host || "https://atlas.thecodingant.in";

    var iframe = document.createElement("iframe");
    iframe.src = widgetHost + "/?" + qsParams.toString();
    iframe.style.position = "fixed";
    iframe.style.border = "none";
    iframe.style.zIndex = "2147483647";
    iframe.style.background = "transparent";
    iframe.style.pointerEvents = "all";

    if (config.layout === "sidebar") {
      iframe.style.top = "0";
      iframe.style.right = "0";
      iframe.style.width = "400px";
      iframe.style.height = "100vh";
    } else {
      iframe.style.bottom = "0";
      iframe.style.right = "0";
      iframe.style.width = "100px";
      iframe.style.height = "100px";
    }

    document.body.appendChild(iframe);

    window.addEventListener("message", function (event) {
      if (event.origin !== widgetHost && widgetHost.indexOf('localhost') === -1) return;

      try {
        var data = JSON.parse(event.data);
        if (data.type === "ATLAS_WIDGET_RESIZE") {
          if (config.layout === "sidebar") return;

          if (data.isOpen) {
            iframe.style.width = "420px";
            iframe.style.height = "750px";
          } else {
            iframe.style.width = "100px";
            iframe.style.height = "100px";
          }
        }
      } catch (e) {}
    });
  }

  // Expose to window for manual init (e.g. via NPM)
  global.AtlasWidget = { init: initWidget };

  // Auto-init if loaded directly via script tag and not an ES module environment
  if (document.currentScript && document.currentScript.hasAttribute("data-layout")) {
    initWidget();
  }

})(typeof window !== "undefined" ? window : this);

