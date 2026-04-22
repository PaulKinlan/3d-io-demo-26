

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function handleUserDataRequest(req, res) {
  const url = req.url;
  if (url === '/demos/patching-user-data/' || url === '/demos/patching-user-data/index.html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const filePath = path.resolve(__dirname, 'index.html');
    const template = fs.readFileSync(filePath, 'utf-8');
    res.write(template);

    setTimeout(() => {
      res.write(`
<template for="user-data">
  <div class="product-image">PK</div>
  <div class="product-info">
    <h2>Paul Kinlan</h2>
    <div class="price">$99 / hr</div>
    <div class="role">Chrome Developer Relations</div>
    <p class="bio">Lead for Chrome Developer Relations at Google. Passionate about the web, open standards, and building great developer experiences.</p>
    <button class="buy-btn">Hire Now</button>
  </div>
</template>
`);
      res.end();
    }, 2500);

    return true;
  }
  return false;
}


