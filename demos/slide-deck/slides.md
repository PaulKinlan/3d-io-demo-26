# Welcome to the 3D Slide Deck 🚀

A simple markdown-based presentation framework running inside a WebGL iframe.

---

## What can it do?

*   Render **Markdown** directly into HTML.
*   Easily edit `slides.md` to see changes.
*   Click or use *arrow keys* to navigate.
*   Native CSS transitions for a smooth experience!

---

## Code Example

It supports code formatting out-of-the-box!

```javascript
function greet() {
  console.log("Hello from inside the 3D monitor!");
}
```

---

## Advanced Feature: HTML in Canvas 🎨

The future of UI rendering in WebGL:
*   Native DOM elements rendered directly into Canvas.
*   Enables complex UI over 3D scenes without DOM overlays.
*   Uses experimental `layoutsubtree` attribute.
*   *Perfect for rendering this very monitor!*

---

## Advanced Feature: WebGPU 🏎️

The next generation of graphics on the web:
*   Direct access to GPU hardware.
*   Lower overhead than WebGL.
*   Supports compute shaders for GPGPU tasks.
*   Vastly improves performance for complex 3D scenes.

---

## Advanced Feature: View Transitions 🎬

Creating seamless UI transitions made easy:
*   Morph elements between page states automatically.
*   Reduces need for complex custom animation code.
*   Works with Single Page Apps (SPAs) and Multi-Page Apps!

---

## Demo: Interactive Controls 🎛️

Try interacting with these native HTML elements:

<div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-top: 20px;">
  <p><label>Text Input: <input type="text" value="Edit me!"></label></p>
  <p><label>Range Slider: <input type="range" min="0" max="100" value="50"></label></p>
  <p><label>Color Picker: <input type="color" value="#7dc6ff"></label></p>
  <p>
    <label><input type="checkbox" checked> Checkbox</label>
    <label style="margin-left: 20px;"><input type="radio" name="radio"> Radio</label>
  </p>
  <button style="padding: 8px 16px; background: #8effcb; color: #000; border: none; border-radius: 4px; cursor: pointer;">Click Action</button>
</div>

---

## Demo: Semantic HTML & Media 🎥

Modern browsers support rich media and interactive semantics:

<div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-top: 20px;">
  <details>
    <summary style="cursor: pointer; font-weight: bold;">Click to reveal more info</summary>
    <p style="margin-top: 10px;">This is hidden content revealed by the <code>&lt;details&gt;</code> element!</p>
  </details>
  
  <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;">
  
  <p>Progress Bar:</p>
  <progress value="70" max="100" style="width: 100%;"></progress>
</div>

---

## Demo: Customization Selector 🎨

This selector will be used to customize the environment in a future demo.
Select an option to see the placeholder icon update (simulated):

<style>
.theme-picker,
.theme-picker::picker(select) {
  appearance: base-select;
}
.theme-picker {
  padding: 8px;
  background: #0c1118;
  color: #fff;
  border: 1px solid #555;
  border-radius: 4px;
  width: 200px;
}
.theme-picker::picker(select) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
  background: #18283c;
  border: 1px solid #555;
  border-radius: 8px;
}
.theme-picker option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px 5px;
  border: 1px solid #334155;
  border-radius: 6px;
  color: white;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
}
.theme-picker option[value="default"] { background: #0c1118; }
.theme-picker option[value="dark"] { background: #000000; color: #aaaaaa; }
.theme-picker option[value="neon"] { background: #1a0033; border-color: #ff00ff; color: #00ffff; text-shadow: 0 0 5px #ff00ff; }
.theme-picker option[value="retro"] { background: #ffaa00; border-color: #8800ff; color: #8800ff; font-weight: bold; }
</style>
<div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-top: 20px; display: flex; align-items: center; gap: 20px;">
  <div>
    <label for="custom-select" style="display: block; margin-bottom: 8px;">Choose a Theme:</label>
    <select id="custom-select" class="theme-picker" name="theme">
      <button style="background: transparent; border: none; color: inherit; width: 100%; text-align: left; padding: 0; cursor: pointer; display: flex; align-items: center;">
        <selectedcontent></selectedcontent>
      </button>
      <option value="default">Default Theme</option>
      <option value="dark">Sleek Dark Mode</option>
      <option value="neon">Cyberpunk Neon</option>
      <option value="retro">80s Retro</option>
    </select>
  </div>
  
  <div style="display: flex; flex-direction: column; align-items: center;">
    <span>Icon Placeholder:</span>
    <div id="icon-placeholder" style="width: 60px; height: 60px; background: #18283c; border: 2px dashed #7dc6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-top: 8px;">
      🖼️
    </div>
  </div>
</div>

---

## The End

Feel free to open `demos/slide-deck/slides.md` to add more content.

Thank you!
