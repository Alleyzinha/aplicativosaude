const { getDefaultConfig } = require('expo/metro-config');
const { fruityviceProxy } = require('./server/fruityviceProxy.cjs');

const config = getDefaultConfig(__dirname);
const originalEnhancer = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (middleware, metroServer) => {
  const original = originalEnhancer ? originalEnhancer(middleware, metroServer) : middleware;
  return (request, response, next) => {
    if (request.url?.split('?')[0] === '/api/fruits') {
      void fruityviceProxy(request, response);
      return;
    }
    original(request, response, next);
  };
};

module.exports = config;
