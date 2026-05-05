import tgpu, { d, type TgpuRoot, type TgpuTexture, type TgpuUniform } from 'typegpu';
import { taaResolveLayout } from './dataTypes';

export class TaaResolve {
  #root: TgpuRoot;
  #resolvePipeline: any;
  #width: number;
  #height: number;
  
  currentTexture: TgpuTexture;
  historyTexture: TgpuTexture;
  
  constructor(root: TgpuRoot, width: number, height: number) {
    this.#root = root;
    this.#width = width;
    this.#height = height;
    
    this.currentTexture = root['~unstable'].createTexture({
      size: [width, height],
      format: 'rgba8unorm',
    }).$usage('render', 'sampled', 'storage');
    
    this.historyTexture = root['~unstable'].createTexture({
      size: [width, height],
      format: 'rgba8unorm',
    }).$usage('render', 'sampled', 'storage');
    
    this.#resolvePipeline = root.createComputePipeline({
      layout: {
        taa: taaResolveLayout,
      },
      compute: {
        code: `
          @compute @workgroup_size(8, 8)
          fn main(@builtin(global_invocation_id) id: vec3u) {
            let size = textureDimensions(outputTexture);
            if (id.x >= size.x || id.y >= size.y) { return; }
            
            let pos = vec2i(id.xy);
            let current = textureLoad(currentTexture, pos, 0);
            let history = textureLoad(historyTexture, pos, 0);
            
            let alpha = 0.05;
            let result = mix(history, current, alpha);
            
            textureStore(outputTexture, pos, result);
          }
        `,
        entryPoint: 'main',
      },
    });
  }

  resize(width: number, height: number) {
    this.#width = width;
    this.#height = height;
    // Real TAA would re-allocate textures here, but for simplicity we assume fixed size or handle elsewhere
  }

  resolve(commandEncoder: GPUCommandEncoder, outputView: GPUTextureView) {
    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(this.#resolvePipeline);
    computePass.setBindGroup(0, this.#root.createBindGroup(taaResolveLayout, {
      currentTexture: this.currentTexture,
      historyTexture: this.historyTexture,
      outputTexture: outputView,
    }));
    computePass.dispatchWorkgroups(Math.ceil(this.#width / 8), Math.ceil(this.#height / 8));
    computePass.end();
    
    // Copy output back to history for next frame
    commandEncoder.copyTextureToTexture(
      { texture: this.currentTexture.gpuTexture },
      { texture: this.historyTexture.gpuTexture },
      [this.#width, this.#height]
    );
  }
}
