(() => {
  const host = document.querySelector('.ghost-fibers-bg');
  if (!host) return;

  const desktopQuery = window.matchMedia('(min-width: 1081px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let destroyCurrent = null;

  const hexToRgb = hex => {
    const value = String(hex).trim().replace(/^#/, '');
    const normalized = value.length === 3 ? value.replace(/./g, c => c + c) : value;
    const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
    if (!match) return [1, 1, 1];
    return [
      parseInt(match[1], 16) / 255,
      parseInt(match[2], 16) / 255,
      parseInt(match[3], 16) / 255
    ];
  };

  const vertexSource = `#version 300 es
  const vec2 POSITIONS[3] = vec2[3](
    vec2(-1.0, -1.0),
    vec2( 3.0, -1.0),
    vec2(-1.0,  3.0)
  );
  void main() {
    gl_Position = vec4(POSITIONS[gl_VertexID], 0.0, 1.0);
  }`;

  const fragmentSource = `#version 300 es
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uScale;
  uniform float uRotation;
  uniform float uLayers;
  uniform float uWaveAmplitude;
  uniform float uWaveFrequency;
  uniform float uWaveSpeed;
  uniform float uLayerSpeed;
  uniform float uTwist;
  uniform float uTwistFrequency;
  uniform float uTwistSpeed;
  uniform float uLineFrequency;
  uniform float uLineSpacing;
  uniform float uLineSharpness;
  uniform float uGlowFalloff;
  uniform float uGlowIntensity;
  uniform float uBrightness;
  uniform float uBlueBoost;
  uniform float uVignette;
  uniform float uGrain;
  uniform float uRotationSpeed;
  uniform vec3 uLineColor;
  uniform vec3 uGlowColor;

  out vec4 fragColor;
  #define MAX_LAYERS 10

  mat2 rotate2d(float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return mat2(cosine, -sine, sine, cosine);
  }

  float grainHash(vec2 point) {
    point = floor(point);
    float hash = 52.9829189 * fract(dot(point, vec2(0.065, 0.005)));
    return fract(hash);
  }

  float layeredGrain(vec2 fragmentPixel) {
    vec2 point = mod(fragmentPixel + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
    vec2 rotated = mat2(0.8, -0.5, 0.5, 0.8) * point;
    float grain = 0.0;
    grain += 0.40 * grainHash(rotated);
    grain += 0.25 * grainHash(rotated * 2.0 + 17.0);
    grain += 0.20 * grainHash(rotated * 4.0 + 47.0);
    grain += 0.10 * grainHash(rotated * 8.0 + 113.0);
    grain += 0.05 * grainHash(rotated * 16.0 + 191.0);
    return grain;
  }

  void main() {
    vec2 resolution = max(uResolution, vec2(1.0));
    vec2 uv = (2.0 * gl_FragCoord.xy - resolution) / resolution.y;
    float time = uTime * uSpeed;
    vec3 backdrop = vec3(0.027, 0.063, 0.145);
    vec3 centerTone = max(uLineColor * 0.85567 - uGlowColor * 0.06186, vec3(0.0));
    vec3 cloudTone = uLineColor * 0.19588 + uGlowColor * 0.2268;
    vec2 p = uv;
    p /= max(uScale, 0.05);
    p = rotate2d(radians(uRotation) + time * uRotationSpeed) * p;
    vec3 color = vec3(0.0);

    for (int index = 0; index < MAX_LAYERS; index++) {
      float fi = float(index) + 1.0;
      if (fi > uLayers) break;

      p += uWaveAmplitude * sin(p.yx * fi * uWaveFrequency + time * (uWaveSpeed + fi * uLayerSpeed));

      float radius = length(p);
      float polarAngle = atan(p.y, p.x);
      polarAngle += sin(radius * uTwistFrequency - time * uTwistSpeed + fi) * uTwist;
      p = vec2(cos(polarAngle), sin(polarAngle)) * radius;

      float lines = abs(sin(p.x * (uLineFrequency + fi * uLineSpacing) + sin(p.y * 3.0 + time)));
      lines = pow(max(0.0, 1.0 - lines), uLineSharpness);
      color += uLineColor * lines / fi;

      float glow = exp(-uGlowFalloff * abs(sin(p.x * 3.0 + time + fi)));
      color += uGlowColor * glow * uGlowIntensity / (fi * 2.0);
    }

    float center = exp(-2.2 * dot(uv, uv));
    color += centerTone * center;

    float cloud = exp(-1.5 * length(uv + vec2(sin(time * 0.3) * 0.25, cos(time * 0.25) * 0.18)));
    color += cloudTone * cloud;

    float vignette = 1.0 - smoothstep(0.35, 1.45, length(uv));
    color *= mix(1.0 - uVignette, 1.0, vignette);
    color = 1.0 - exp(-color * uBrightness);
    color.b *= uBlueBoost;

    vec3 outputColor = backdrop + color;
    float noise = (layeredGrain(gl_FragCoord.xy) - 0.5) * uGrain;
    outputColor = clamp(outputColor + noise, 0.0, 1.0);
    fragColor = vec4(outputColor, 1.0);
  }`;

  const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('GhostFibers shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const start = () => {
    if (destroyCurrent || !desktopQuery.matches) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'ghost-fibers-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      host.classList.add('ghost-fibers-fallback');
      canvas.remove();
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) {
      canvas.remove();
      host.classList.add('ghost-fibers-fallback');
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('GhostFibers program:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      canvas.remove();
      host.classList.add('ghost-fibers-fallback');
      return;
    }

    gl.useProgram(program);

    const uniform = name => gl.getUniformLocation(program, name);
    const u = {
      resolution: uniform('uResolution'), time: uniform('uTime'), speed: uniform('uSpeed'),
      scale: uniform('uScale'), rotation: uniform('uRotation'), layers: uniform('uLayers'),
      waveAmplitude: uniform('uWaveAmplitude'), waveFrequency: uniform('uWaveFrequency'),
      waveSpeed: uniform('uWaveSpeed'), layerSpeed: uniform('uLayerSpeed'), twist: uniform('uTwist'),
      twistFrequency: uniform('uTwistFrequency'), twistSpeed: uniform('uTwistSpeed'),
      lineFrequency: uniform('uLineFrequency'), lineSpacing: uniform('uLineSpacing'),
      lineSharpness: uniform('uLineSharpness'), glowFalloff: uniform('uGlowFalloff'),
      glowIntensity: uniform('uGlowIntensity'), brightness: uniform('uBrightness'),
      blueBoost: uniform('uBlueBoost'), vignette: uniform('uVignette'), grain: uniform('uGrain'),
      rotationSpeed: uniform('uRotationSpeed'), lineColor: uniform('uLineColor'), glowColor: uniform('uGlowColor')
    };

    // React Bits usage values, adapted to the Cuidar navy/blue palette.
    const lineColor = hexToRgb('#17306D');
    const glowColor = hexToRgb('#365FD2');
    gl.uniform1f(u.speed, 0.1);
    gl.uniform1f(u.scale, 1.37);
    gl.uniform1f(u.rotation, -90);
    gl.uniform1f(u.rotationSpeed, 0.25);
    gl.uniform1f(u.layers, 1);
    gl.uniform1f(u.waveAmplitude, 0);
    gl.uniform1f(u.waveFrequency, 3);
    gl.uniform1f(u.waveSpeed, 0.15);
    gl.uniform1f(u.layerSpeed, 0.08);
    gl.uniform1f(u.twist, 0.1);
    gl.uniform1f(u.twistFrequency, 6);
    gl.uniform1f(u.twistSpeed, 1.2);
    gl.uniform1f(u.lineFrequency, 1);
    gl.uniform1f(u.lineSpacing, 1.55);
    gl.uniform1f(u.lineSharpness, 16);
    gl.uniform1f(u.glowFalloff, 8.5);
    gl.uniform1f(u.glowIntensity, 1.05);
    gl.uniform1f(u.brightness, 2);
    gl.uniform1f(u.blueBoost, 1.25);
    gl.uniform1f(u.vignette, 0.55);
    gl.uniform1f(u.grain, 0.035);
    gl.uniform3fv(u.lineColor, lineColor);
    gl.uniform3fv(u.glowColor, glowColor);

    let frameId = 0;
    let elapsed = 0;
    let previousTime = performance.now();
    let lastRender = 0;
    let visible = true;
    let pageVisible = !document.hidden;
    const fps = 45;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = 1;
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(u.resolution, width, height);
      render();
    };

    const render = () => {
      gl.useProgram(program);
      gl.uniform1f(u.time, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const shouldAnimate = () => visible && pageVisible && !reducedMotion.matches && desktopQuery.matches;

    const loop = now => {
      frameId = 0;
      if (!shouldAnimate()) return;
      const delta = Math.min((now - previousTime) / 1000, 0.1);
      previousTime = now;
      elapsed += delta;
      if (now - lastRender >= 1000 / fps - 0.5) {
        render();
        lastRender = now;
      }
      frameId = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const beginLoop = () => {
      if (!shouldAnimate() || frameId) return;
      previousTime = performance.now();
      frameId = requestAnimationFrame(loop);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? beginLoop() : stopLoop();
    }, { threshold: 0 });
    intersectionObserver.observe(host);

    const onVisibility = () => {
      pageVisible = !document.hidden;
      pageVisible ? beginLoop() : stopLoop();
    };
    const onMotion = () => {
      if (reducedMotion.matches) {
        stopLoop();
        render();
      } else {
        beginLoop();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    reducedMotion.addEventListener?.('change', onMotion);

    resize();
    render();
    beginLoop();
    host.classList.add('is-ready');

    destroyCurrent = () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener?.('change', onMotion);
      gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
      host.classList.remove('is-ready');
      destroyCurrent = null;
    };
  };

  const syncForViewport = () => {
    if (desktopQuery.matches) start();
    else destroyCurrent?.();
  };

  desktopQuery.addEventListener?.('change', syncForViewport);
  syncForViewport();
})();
