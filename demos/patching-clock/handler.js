

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function handleClockRequest(req, res) {
  const url = req.url;
  if (url === '/demos/patching-clock/' || url === '/demos/patching-clock/index.html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const filePath = path.resolve(__dirname, 'index.html');
    const template = fs.readFileSync(filePath, 'utf-8');
    res.write(template);

    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString();
      res.write(`
<template for="clock">
   <?start name="clock">
      <span>${time}</span>
   <?end>
</template>
`);
    }, 1000);

    req.on('close', () => {
      clearInterval(interval);
    });

    return true;
  }
  return false;
}


