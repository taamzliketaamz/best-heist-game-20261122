// Night Train Heist — input.js
// Raw input only: which keys are held, where the mouse last clicked (a move order for
// the thief), and one-shot presses for the tools and for starting or restarting.

export function makeInput(canvas) {
  const input = {
    keys: new Set(),
    pressed: new Set(),
    click: null,
  };

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key.startsWith('arrow')) event.preventDefault();
    if (!input.keys.has(key)) input.pressed.add(key);
    input.keys.add(key);
  });
  window.addEventListener('keyup', (event) => {
    input.keys.delete(event.key.toLowerCase());
  });
  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    input.click = { x, y };
    input.pressed.add('click');
  });

  return input;
}

// Reads and clears the one-shot presses (tools, start, restart) once per frame.
export function takePresses(input) {
  const out = new Set(input.pressed);
  input.pressed.clear();
  return out;
}
