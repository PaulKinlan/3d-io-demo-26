import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';



const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function handleIslandsShell(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  try {
    const filePath = path.resolve(__dirname, 'index.html');
    const template = fs.readFileSync(filePath, 'utf-8');
    res.end(template);
  } catch (e) {
    console.error('Error reading index.html:', e);
    res.statusCode = 500;
    res.end('Error reading index.html');
  }
}

