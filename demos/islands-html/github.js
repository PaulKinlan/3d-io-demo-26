export function handleGithubRequest(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  fetch('https://api.github.com/users/paulkinlan/events', {
    headers: {
      'User-Agent': 'Node.js'
    }
  }).then(response => response.json())
    .then(events => {
      let html = `
  <div class="island-content">
    <ul>`;

      const count = Math.min(events.length, 3);
      for (let i = 0; i < count; i++) {
        const event = events[i];
        let description = '';

        if (event.type === 'PushEvent') {
          description = `Pushed to <code>${event.repo.name}</code>`;
        } else if (event.type === 'IssuesEvent') {
          description = `${event.payload.action} issue on <code>${event.repo.name}</code>`;
        } else if (event.type === 'WatchEvent') {
          description = `Starred <code>${event.repo.name}</code>`;
        } else {
          description = `${event.type.replace('Event', '')} on <code>${event.repo.name}</code>`;
        }

        html += `<li>${description}</li>`;
      }

      html += `</ul>
  </div>`;

      res.write(html);
      res.end();
    }).catch(err => {
      console.error('Failed to fetch GitHub activity:', err);
      res.write('<div class="island-content">Error loading GitHub activity</div>');
      res.end();
    });
}
