document.addEventListener('DOMContentLoaded', () => {
    initScrollEffects();
    initFilters();
    initTiltEffect();
    initLightning();
    initHueSlider();
});

/**
 * Global Configuration for Lightning
 */
const lightningConfig = {
    hue: 220,
    xOffset: 0,
    speed: 1.6,
    intensity: 0.6,
    size: 2
};

/**
 * WebGL Space Nebula Effect
 */
function initLightning() {
    const canvas = document.getElementById('lightning-canvas');
    if (!canvas) return;

    // Use WebGL2 for #version 300 es support
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("WebGL2 not supported, cannot render Space Nebula");
        return;
    }

    const resizeCanvas = () => {
        const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Vertex Shader (Simple Pass-through)
    const vertexShaderSource = `#version 300 es
      precision highp float;
      in vec4 position;
      void main() {
        gl_Position = position;
      }
    `;

    // Fragment Shader (Space Nebula)
    const fragmentShaderSource = `#version 300 es
        /*********
        * made by Matthias Hurrle (@atzedent)
        *
        *	To explore strange new worlds, to seek out new life
        *	and new civilizations, to boldly go where no man has
        *	gone before.
        */
        precision highp float;
        out vec4 O;
        uniform vec2 resolution;
        uniform float time;
        #define FC gl_FragCoord.xy
        #define T time
        #define R resolution
        #define MN min(R.x,R.y)
        // Returns a pseudo random number for a given point (white noise)
        float rnd(vec2 p) {
          p=fract(p*vec2(12.9898,78.233));
          p+=dot(p,p+34.56);
          return fract(p.x*p.y);
        }
        // Returns a pseudo random number for a given point (value noise)
        float noise(in vec2 p) {
          vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
          float
          a=rnd(i),
          b=rnd(i+vec2(1,0)),
          c=rnd(i+vec2(0,1)),
          d=rnd(i+1.);
          return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
        }
        // Returns a pseudo random number for a given point (fractal noise)
        float fbm(vec2 p) {
          float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
          for (int i=0; i<5; i++) {
            t+=a*noise(p);
            p*=2.*m;
            a*=.5;
          }
          return t;
        }
        float clouds(vec2 p) {
            float d=1., t=.0;
            for (float i=.0; i<3.; i++) {
                float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
                t=mix(t,d,a);
                d=a;
                p*=2./(i+1.);
            }
            return t;
        }
        void main(void) {
            vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
            vec3 col=vec3(0);
            float bg=clouds(vec2(st.x+T*.5,-st.y));
            uv*=1.-.3*(sin(T*.2)*.5+.5);
            for (float i=1.; i<12.; i++) {
                uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
                vec2 p=uv;
                float d=length(p);
                col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
                float b=noise(i+p+bg*1.731);
                col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
                col=mix(col,vec3(bg*.25,bg*.137,bg*.05),d);
            }
            O=vec4(col,1);
        }
    `;

    // Compile Helper
    const compileShader = (source, type) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Shader compile error:", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) { console.error("Could not create program"); return; }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program linking error:", gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);

    // Buffers and Attributes
    const vertices = new Float32Array([
      -1, 1, -1, -1, 1, 1, 1, -1
    ]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    // Uniform Locations
    const resolutionLoc = gl.getUniformLocation(program, "resolution");
    const timeLoc = gl.getUniformLocation(program, "time");

    const startTime = performance.now();
    
    const render = () => {
        // Handle resizing dynamically if needed, though event listener handles it mostly
        // gl.viewport(0, 0, canvas.width, canvas.height); // Already set in resize
        
        gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
        gl.uniform1f(timeLoc, (performance.now() - startTime) / 1000.0);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    };
    
    requestAnimationFrame(render);
}

/**
 * Initialize Hue Slider
 */
function initHueSlider() {
    const sliderInput = document.getElementById('hue-slider-native');
    const thumb = document.querySelector('.slider-thumb');
    const fill = document.querySelector('.slider-fill');
    const valueLabel = document.querySelector('.slider-value');

    if (!sliderInput) return;

    const updateSlider = () => {
        const val = parseInt(sliderInput.value);
        lightningConfig.hue = val; // Update WebGL config

        const min = parseInt(sliderInput.min);
        const max = parseInt(sliderInput.max);
        const percent = ((val - min) / (max - min)) * 100;

        if (thumb) thumb.style.left = `${percent}%`;
        if (fill) fill.style.width = `${percent}%`;
        if (valueLabel) valueLabel.textContent = `${val}°`;
    };

    sliderInput.addEventListener('input', updateSlider);
    
    // Initial update
    updateSlider();
}

/**
 * Parallax and Scroll Reveal Effects
 */
function initScrollEffects() {
    const cards = document.querySelectorAll('.news-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.1}s`;
        observer.observe(card);
    });
}

/**
 * Filter System Logic
 */
function initFilters() {
    // Dropdown toggle logic if needed for mobile or complex interactions
    // Most filtering is currently handled via direct links (SSR)
}

/**
 * Vanilla JS Tilt Effect for Cards
 */
function initTiltEffect() {
    const cards = document.querySelectorAll('.news-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.5s ease';
        });
    });
}
