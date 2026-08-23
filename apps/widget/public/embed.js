(function () {
  var script =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

  var config = {
    layout: script.getAttribute("data-layout") || "floating",
    theme: script.getAttribute("data-theme") || "default",
    primary: script.getAttribute("data-primary") || "",
    background: script.getAttribute("data-background") || "",
    foreground: script.getAttribute("data-foreground") || "",
    card: script.getAttribute("data-card") || "",
    radius: script.getAttribute("data-radius") || "",
  };

  var qsParams = new URLSearchParams();
  for (var key in config) {
    if (config[key]) qsParams.append(key, config[key]);
  }

  // Set this to your actual production URL when deployed
  var widgetHost =
    script.src.split("/").slice(0, 3).join("/") || "http://localhost:5174";

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
    // For floating and bottom, we cover the corner area.
    // The widget app itself manages opening/closing.
    // To prevent the iframe from blocking clicks when closed, we could use postMessage,
    // but a simple trick is to keep pointerEvents all, and let the React app fill the space.
    // Wait, if it fills 400x700, clicks on the transparent part won't pass through to the host page.
    // So we *must* implement a simple postMessage listener to resize the iframe dynamically.

    iframe.style.bottom = "0";
    iframe.style.right = "0";
    iframe.style.width = "100px"; // Initial closed size
    iframe.style.height = "100px";
  }

  document.body.appendChild(iframe);

  // Listen for resize messages from the widget
  window.addEventListener("message", function (event) {
    if (event.origin !== widgetHost) return;

    try {
      var data = JSON.parse(event.data);
      if (data.type === "ATLAS_WIDGET_RESIZE") {
        if (config.layout === "sidebar") return; // Sidebar is fixed

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
})();
