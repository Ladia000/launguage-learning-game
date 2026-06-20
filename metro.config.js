const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Zustand v4/v5 ESM files (esm/*.mjs) use import.meta which is not valid
// in Metro's non-module web bundle. Force CJS resolution for zustand on web.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && (moduleName === 'zustand' || moduleName.startsWith('zustand/'))) {
    const cjsName = moduleName === 'zustand' ? 'zustand/index.js' : `${moduleName}.js`;
    return {
      filePath: path.resolve(__dirname, 'node_modules', cjsName.replace(/\//g, path.sep)),
      type: 'sourceFile',
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
