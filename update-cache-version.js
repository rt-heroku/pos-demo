#!/usr/bin/env node

/**
 * Update Cache Version Script
 * 
 * This script automatically updates the cache version in the service worker
 * and HTML files to ensure proper cache invalidation on deployment.
 */

const fs = require('fs');
const path = require('path');

// Generate new cache version based on current timestamp
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hour = String(now.getHours()).padStart(2, '0');
const minute = String(now.getMinutes()).padStart(2, '0');

const newVersion = `v${year}${month}${day}-${hour}${minute}`;

console.log(`Updating cache version to: ${newVersion}`);

// Update service worker
const swPath = path.join(__dirname, 'public', 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Update CACHE_VERSION
swContent = swContent.replace(
    /const CACHE_VERSION = '[^']*';/,
    `const CACHE_VERSION = '${newVersion}';`
);

fs.writeFileSync(swPath, swContent);
console.log('✅ Updated service worker cache version');

// Update HTML cache busting versions
const htmlPath = path.join(__dirname, 'public', 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Update all script version parameters
const versionPattern = /v=\d{8}-\d{4}/g;
htmlContent = htmlContent.replace(versionPattern, `v=${newVersion}`);

fs.writeFileSync(htmlPath, htmlContent);
console.log('✅ Updated HTML cache busting versions');

console.log(`\n🎉 Cache version updated to ${newVersion}`);
console.log('📦 Ready for deployment!');