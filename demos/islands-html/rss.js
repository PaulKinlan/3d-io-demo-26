async function fetchAndParseRSS(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let count = 0;
    
    while ((match = itemRegex.exec(text)) !== null && count < 3) {
      const itemContent = match[1];
      const titleMatch = itemContent.match(/<title>(.*?)<\/title>/);
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
      
      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1');
        const link = linkMatch[1];
        items.push({ title, link });
        count++;
      }
    }
    return items;
  } catch (e) {
    console.error(`Failed to fetch RSS from ${url}:`, e);
    return [];
  }
}

export function handleRSSRequest(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  Promise.all([
    fetchAndParseRSS('https://paul.kinlan.me/index.xml'),
    fetchAndParseRSS('https://aifoc.us/index.xml')
  ]).then(([paulItems, aifocusItems]) => {
    let html = `
<template for="rss-list">
  <div class="island-content">
    <h4>paul.kinlan.me</h4>
    <ul>`;

    paulItems.forEach(item => {
      html += `<li><a href="${item.link}">${item.title}</a></li>`;
    });

    html += `</ul>
    <h4>aifoc.us</h4>
    <ul>`;

    aifocusItems.forEach(item => {
      html += `<li><a href="${item.link}">${item.title}</a></li>`;
    });

    html += `</ul>
  </div>
</template>`;

    res.write(html);
    res.end();
  }).catch(err => {
    res.write('<template for="rss-list"><div class="island-content">Error loading feeds</div></template>');
    res.end();
  });
}
