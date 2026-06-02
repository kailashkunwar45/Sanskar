const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Fix: On web, serve index.html for all non-asset routes so
// React Navigation's browser history works on refresh.
config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware) => {
    return (req, res, next) => {
      // If the request is for a non-file path (no extension), serve the bundle
      const url = req.url.split("?")[0];
      const hasExtension = /\.[a-z0-9]+$/i.test(url);
      if (!hasExtension && !url.startsWith("/__") && !url.startsWith("/assets") && url !== "/") {
        req.url = "/";
      }
      return metroMiddleware(req, res, next);
    };
  },
};

module.exports = config;
