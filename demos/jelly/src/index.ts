import tgpu from 'typegpu';
import { d } from 'typegpu';
import { CameraController } from './camera';
import { BACKGROUND_COLOR, SLIDER_COLOR } from './constants';
import { ObjectType, rayMarchLayout, sampleLayout, taaResolveLayout } from './dataTypes';
import { Slider } from './slider';
import { TaaResolve } from './taa';

const root = await tgpu.init();

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const context = canvas.getContext('webgpu') as GPUCanvasContext;

const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
  device: root.device,
  format: presentationFormat,
  alphaMode: 'premultiplied',
});

const slider = new Slider(root, d.vec2f(-1, 0), d.vec2f(1, 0), 20);

const camera = new CameraController(
  root,
  d.vec3f(0, 0.5, 2.5),
  d.vec3f(0, 0, 0),
  d.vec3f(0, 1, 0),
  Math.PI / 4,
  canvas.width,
  canvas.height,
);

const taa = new TaaResolve(root, canvas.width, canvas.height);

const lightUniform = root.createUniform(
  d.struct({
    direction: d.vec3f,
    color: d.vec3f,
  }),
  {
    direction: d.vec3f(1, 1, 1).normalize(),
    color: d.vec3f(1, 1, 1),
  },
);

const sceneUniform = root.createUniform(
  d.struct({
    resolution: d.vec2f,
    time: d.f32,
    sliderColor: d.vec3f,
    backgroundColor: d.vec3f,
  }),
  {
    resolution: d.vec2f(canvas.width, canvas.height),
    time: 0,
    sliderColor: SLIDER_COLOR,
    backgroundColor: BACKGROUND_COLOR,
  },
);

const rayMarchShader = `
struct Ray {
  origin: vec3f,
  direction: vec3f,
};

struct HitInfo {
  dist: f32,
  objectType: i32,
  t: f32,
};

fn get_ray(uv: vec2f, viewInv: mat4x4f, projInv: mat4x4f) -> Ray {
  let clip_pos = vec4f(uv * 2.0 - 1.0, 0.0, 1.0);
  var view_pos = projInv * clip_pos;
  view_pos /= view_pos.w;
  let world_pos = viewInv * view_pos;
  
  let origin = viewInv[3].xyz;
  let direction = normalize(world_pos.xyz - origin);
  
  return Ray(origin, direction);
}

fn sdf_scene(p: vec3f) -> HitInfo {
  var res = HitInfo(1e10, 0, 0.0);
  
  // Ground plane
  let d_ground = p.y;
  if (d_ground < res.dist) {
    res = HitInfo(d_ground, i32(ObjectType.BACKGROUND), 0.0);
  }
  
  // Slider (using the precomputed bezier texture)
  // We need to project the 3D point onto the 2D slider plane
  // For this example, let's assume the slider is in the XY plane at Z=0
  let slider_uv = (p.xy - slider.bbox.zw) / (slider.bbox.yx - slider.bbox.zw);
  if (all(slider_uv >= vec2f(0.0)) && all(slider_uv <= vec2f(1.0)) && abs(p.z) < 0.1) {
     let data = textureSampleLevel(bezierTexture, sliderSampler, slider_uv, 0.0);
     let d_slider = length(vec2f(data.x, p.z)) - 0.02;
     if (d_slider < res.dist) {
       res = HitInfo(d_slider, i32(ObjectType.SLIDER), data.y);
     }
  }

  return res;
}

fn get_normal(p: vec3f) -> vec3f {
  let e = vec2f(0.001, 0.0);
  return normalize(vec3f(
    sdf_scene(p + e.xyy).dist - sdf_scene(p - e.xyy).dist,
    sdf_scene(p + e.yxy).dist - sdf_scene(p - e.yxy).dist,
    sdf_scene(p + e.yyx).dist - sdf_scene(p - e.yyx).dist
  ));
}

@fragment
fn main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let uv = pos.xy / scene.resolution;
  let ray = get_ray(uv, camera.viewInv, camera.projInv);
  
  var t = 0.0;
  for (var i = 0; i < 100; i++) {
    let p = ray.origin + ray.direction * t;
    let hit = sdf_scene(p);
    if (hit.dist < 0.001) {
      let n = get_normal(p);
      let l = normalize(light.direction);
      let diff = max(dot(n, l), 0.0);
      
      var color = scene.backgroundColor;
      if (hit.objectType == i32(ObjectType.SLIDER)) {
        color = scene.sliderColor;
      }
      
      return vec4f(color * (diff + 0.1), 1.0);
    }
    t += hit.dist;
    if (t > 100.0) { break; }
  }
  
  return vec4f(scene.backgroundColor, 1.0);
}
`;

const renderPipeline = root.createRenderPipeline({
  layout: {
    camera: camera.cameraUniform,
    light: lightUniform,
    scene: sceneUniform,
    slider: {
      bezierTexture: slider.bezierTexture,
      sliderSampler: root.createSampler({}),
    },
  },
  vertex: {
    code: `
      @vertex
      fn main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {
        var pos = array<vec2f, 3>(
          vec2f(-1.0, -1.0),
          vec2f(3.0, -1.0),
          vec2f(-1.0, 3.0)
        );
        return vec4f(pos[idx], 0.0, 1.0);
      }
    `,
    entryPoint: 'main',
  },
  fragment: {
    code: rayMarchShader,
    entryPoint: 'main',
    targets: [{ format: presentationFormat }],
  },
});

let lastTime = performance.now();
function frame() {
  const now = performance.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  slider.update(dt);
  camera.jitter();
  
  sceneUniform.writePartial({
    time: now / 1000,
  });

  const commandEncoder = root.device.createCommandEncoder();
  
  // Render scene to TAA's current texture
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [{
      view: taa.currentTexture.createView(),
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });
  
  renderPass.setPipeline(renderPipeline);
  renderPass.draw(3);
  renderPass.end();
  
  // TAA Resolve
  taa.resolve(commandEncoder, context.getCurrentTexture().createView());

  root.device.queue.submit([commandEncoder.finish()]);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.updateProjection(Math.PI / 4, canvas.width, canvas.height);
  sceneUniform.writePartial({ resolution: d.vec2f(canvas.width, canvas.height) });
  taa.resize(canvas.width, canvas.height);
});
