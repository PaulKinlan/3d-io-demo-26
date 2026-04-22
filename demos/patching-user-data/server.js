import http from 'node:http';

export function handleUserDataRequest(req, res) {
  const url = req.url;
  if (url === '/demos/patching-user-data/' || url === '/demos/patching-user-data/index.html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    res.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DevStore - Patching Demo</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f9fafb;
      color: #1f2937;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0;
      min-height: 100vh;
    }
    .store-header {
      width: 100%;
      padding: 1.5rem 2rem;
      background: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e5e7eb;
      box-sizing: border-box;
    }
    .brand {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      letter-spacing: -0.025em;
    }
    .cart {
      font-size: 1.1rem;
      cursor: pointer;
      color: #4b5563;
    }
    .cart-count {
      background: #111827;
      color: #ffffff;
      border-radius: 50%;
      padding: 0.1rem 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      margin-left: 0.25rem;
      vertical-align: middle;
    }
    .store-content {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      padding: 3rem 2rem;
    }
    .product-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 2rem;
      width: 360px;
      height: 480px; /* Fixed size */
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .skeleton {
      background: #f3f4f6;
      background-image: linear-gradient(
        90deg,
        #f3f4f6 0px,
        #e5e7eb 40px,
        #f3f4f6 80px
      );
      background-size: 200px 100%;
      animation: shimmer 1.5s infinite linear;
      border-radius: 6px;
    }
    @keyframes shimmer {
      0% { background-position: -100px 0; }
      100% { background-position: 100px 0; }
    }
    .skeleton-image {
      height: 200px;
      width: 100%;
      margin-bottom: 1.5rem;
      border-radius: 8px;
    }
    .skeleton-title {
      height: 1.75rem;
      width: 60%;
      margin-bottom: 0.75rem;
    }
    .skeleton-price {
      height: 1.25rem;
      width: 25%;
      margin-bottom: 1rem;
    }
    .skeleton-text {
      height: 0.875rem;
      width: 100%;
      margin-bottom: 0.5rem;
    }
    .skeleton-text.short {
      width: 70%;
    }
    .skeleton-button {
      height: 2.75rem;
      width: 100%;
      margin-top: auto;
      border-radius: 8px;
    }
    
    /* Real Content Styles */
    .product-image {
      height: 200px;
      background: #f3f4f6;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      color: #9ca3af;
      font-weight: 500;
      margin-bottom: 1.5rem;
    }
    .product-info h2 {
      margin: 0 0 0.25rem 0;
      color: #111827;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.025em;
    }
    .price {
      color: #4b5563;
      font-size: 1.1rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    .role {
      color: #6b7280;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.75rem;
    }
    .bio {
      font-size: 0.875rem;
      line-height: 1.5;
      color: #4b5563;
      margin-bottom: 1.5rem;
    }
    .buy-btn {
      background: #111827;
      color: #ffffff;
      border: none;
      padding: 0.875rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-top: auto;
      width: 100%;
    }
    .buy-btn:hover {
      background: #1f2937;
    }
  </style>
</head>
<body>
  <header class="store-header">
    <div class="brand">DevStore</div>
    <div class="cart">🛒 <span class="cart-count">0</span></div>
  </header>
  <main class="store-content">
    <div class="product-card">
      <section>
        <?start name="user-data">
          <div class="skeleton skeleton-image"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-price"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
          <div class="skeleton skeleton-button"></div>
        <?end>
      </section>
    </div>
  </main>
`);

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

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  const server = http.createServer((req, res) => {
    // Rewrite root requests to the demo path for the handler
    if (req.url === '/' || req.url === '/index.html') {
      req.url = '/demos/patching-user-data/';
    }
    
    if (!handleUserDataRequest(req, res)) {
      res.statusCode = 404;
      res.end('Not Found');
    }
  });

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
