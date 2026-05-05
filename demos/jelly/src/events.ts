export function setupEvents(
  canvas: HTMLCanvasElement,
  onDrag: (x: number, y: number) => void,
) {
  let isDragging = false;

  const handleMove = (x: number, y: number) => {
    if (!isDragging) return;
    
    // Normalize coordinates to [-1, 1]
    const nx = (x / canvas.clientWidth) * 2 - 1;
    const ny = -((y / canvas.clientHeight) * 2 - 1);
    
    onDrag(nx, ny);
  };

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleMove(e.clientX, e.clientY);
  });

  window.addEventListener('mousemove', (e) => {
    handleMove(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, { passive: false });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });
}
