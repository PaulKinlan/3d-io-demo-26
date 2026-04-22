export function handleProjectsRequest(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  setTimeout(() => {
    res.write(`
  <div class="island-content">
    <ul>
      <li><strong>Web MCP</strong> - Model Context Protocol for Web</li>
      <li><strong>HTML in Canvas</strong> - Native rendering</li>
      <li><strong>DPU Demos</strong> - This site!</li>
    </ul>
  </div>
`);
    res.end();
  }, 1000);
}
