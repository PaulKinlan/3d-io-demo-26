export function handleGithubRequest(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  setTimeout(() => {
    res.write(`
<template for="github-activity">
  <div class="island-content">
    <ul>
      <li>Pushed to <code>3d-io-demo-26</code></li>
      <li>Opened issue on <code>WICG/declarative-partial-updates</code></li>
      <li>Starred <code>three.js</code></li>
    </ul>
  </div>
</template>
`);
    res.end();
  }, 2500);
}
