import math
import subprocess

def get_arc_path(cx, cy, r, start_angle, end_angle, padding_degrees=22):
    start_rad = math.radians(start_angle + padding_degrees)
    end_rad = math.radians(end_angle - padding_degrees)
    
    x1 = cx + r * math.cos(start_rad)
    y1 = cy + r * math.sin(start_rad)
    x2 = cx + r * math.cos(end_rad)
    y2 = cy + r * math.sin(end_rad)
    
    # Large arc flag is 0 because the angle is 90 - 2*padding < 180
    return f"M {x1:.2f} {y1:.2f} A {r} {r} 0 0 1 {x2:.2f} {y2:.2f}"

def generate_svg():
    cx, cy = 400, 300
    r = 200
    node_r = 65

    # 0=Right, 90=Bottom, 180=Left, 270=Top
    arcs = [
        get_arc_path(cx, cy, r, 270, 360), # Top to Right
        get_arc_path(cx, cy, r, 0, 90),    # Right to Bottom
        get_arc_path(cx, cy, r, 90, 180),  # Bottom to Left
        get_arc_path(cx, cy, r, 180, 270)  # Left to Top
    ]

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <!-- Modern drop shadow -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#1A202C" flood-opacity="0.1" />
    </filter>
    <filter id="arrow-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#4A5568" flood-opacity="0.15" />
    </filter>
    
    <!-- Gradients for fun aesthetic -->
    <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4FD1C5" />
      <stop offset="100%" stop-color="#319795" />
    </linearGradient>
    <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B794F4" />
      <stop offset="100%" stop-color="#805AD5" />
    </linearGradient>
    <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F6AD55" />
      <stop offset="100%" stop-color="#DD6B20" />
    </linearGradient>
    <linearGradient id="grad-pink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F687B3" />
      <stop offset="100%" stop-color="#D53F8C" />
    </linearGradient>

    <!-- Clean arrowhead -->
    <marker id="arrow" viewBox="0 0 14 14" refX="10" refY="7" markerWidth="8" markerHeight="8" orient="auto">
      <path d="M 2 2 L 12 7 L 2 12 Q 4 7 2 2 Z" fill="#A0AEC0" />
    </marker>
  </defs>

  <rect width="800" height="600" fill="#F7FAFC" />

  <!-- Smooth arcs -->
  <g stroke="#A0AEC0" stroke-width="6" fill="none" stroke-linecap="round" filter="url(#arrow-shadow)">
    <path d="{arcs[0]}" marker-end="url(#arrow)" />
    <path d="{arcs[1]}" marker-end="url(#arrow)" />
    <path d="{arcs[2]}" marker-end="url(#arrow)" />
    <path d="{arcs[3]}" marker-end="url(#arrow)" />
  </g>

  <!-- Nodes -->
  <!-- Top: Write Code (Blue) -->
  <g transform="translate(400, 100)">
    <circle cx="0" cy="0" r="{node_r}" fill="#ffffff" filter="url(#shadow)" />
    <circle cx="0" cy="0" r="{node_r}" fill="url(#grad-blue)" opacity="0.1" />
    <circle cx="0" cy="0" r="{node_r}" fill="none" stroke="url(#grad-blue)" stroke-width="4" />
    <text x="0" y="8" font-family="system-ui, -apple-system, sans-serif" font-size="42" text-anchor="middle" dominant-baseline="middle">🧑‍💻</text>
  </g>

  <!-- Right: Run (Purple) -->
  <g transform="translate(600, 300)">
    <circle cx="0" cy="0" r="{node_r}" fill="#ffffff" filter="url(#shadow)" />
    <circle cx="0" cy="0" r="{node_r}" fill="url(#grad-purple)" opacity="0.1" />
    <circle cx="0" cy="0" r="{node_r}" fill="none" stroke="url(#grad-purple)" stroke-width="4" />
    <text x="0" y="8" font-family="system-ui, -apple-system, sans-serif" font-size="42" text-anchor="middle" dominant-baseline="middle">▶️</text>
  </g>

  <!-- Bottom: Audit (Orange) -->
  <g transform="translate(400, 500)">
    <circle cx="0" cy="0" r="{node_r}" fill="#ffffff" filter="url(#shadow)" />
    <circle cx="0" cy="0" r="{node_r}" fill="url(#grad-orange)" opacity="0.1" />
    <circle cx="0" cy="0" r="{node_r}" fill="none" stroke="url(#grad-orange)" stroke-width="4" />
    <text x="0" y="8" font-family="system-ui, -apple-system, sans-serif" font-size="42" text-anchor="middle" dominant-baseline="middle">📊</text>
  </g>

  <!-- Left: Fix Bugs (Pink) -->
  <g transform="translate(200, 300)">
    <circle cx="0" cy="0" r="{node_r}" fill="#ffffff" filter="url(#shadow)" />
    <circle cx="0" cy="0" r="{node_r}" fill="url(#grad-pink)" opacity="0.1" />
    <circle cx="0" cy="0" r="{node_r}" fill="none" stroke="url(#grad-pink)" stroke-width="4" />
    <text x="0" y="8" font-family="system-ui, -apple-system, sans-serif" font-size="42" text-anchor="middle" dominant-baseline="middle">🛠️</text>
  </g>

</svg>"""

    with open("closed-loop.svg", "w") as f:
        f.write(svg)

    # Convert to PNG using qlmanage
    subprocess.run(["qlmanage", "-t", "-s", "1000", "-o", ".", "closed-loop.svg"], check=True)
    subprocess.run(["mv", "closed-loop.svg.png", "closed-loop.png"], check=True)

if __name__ == "__main__":
    generate_svg()
