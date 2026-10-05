const fs = require('fs');
let code = fs.readFileSync('src/components/PaperCrumple.jsx', 'utf8');

// add html2canvas import
code = "import html2canvas from 'html2canvas';\n" + code;

// change signature
code = code.replace(/const PaperCrumple = \({[\s\S]*?className = '',\n  style\n}\) => {/, 
`const PaperCrumple = ({
  children,
  width = 320,
  height = 400,
  sceneHeight = 560,
  imageFit = 'cover',
  releaseBehavior = 'restore',
  crumpleAmount = 0.85,
  crumpleDuration = 0.55,
  releaseDuration = 0.4,
  foldCount = 6,
  foldSharpness = 0.6,
  wrinkleDepth = 0.65,
  creaseStrength = 0.18,
  paperColor = '#f4f0e8',
  roughness = 0.92,
  paperTexture = 0.08,
  lightIntensity = 1.8,
  lightAngle = -35,
  shadow = true,
  shadowOpacity = 0.08,
  draggable = true,
  dragRotation = 10,
  dragRadius = 180,
  returnToOrigin = true,
  rotation = 0,
  seed = 7,
  detail = 64,
  disabled = false,
  resetKey = 0,
  onStateChange,
  onError,
  className = '',
  style
}) => {`);

// add contentRef
code = code.replace(/const rootRef = useRef\(null\);/, `const rootRef = useRef(null);\n  const contentRef = useRef(null);`);

// replace load logic
code = code.replace(/if \(src\) {[\s\S]*?options\.current\.onError\?\(\w+\);\n\s*}\n\s*} else {[\s\S]*?}\n\s*return \(\) => {/g, 
`if (children) {
      setTimeout(() => {
        if (!contentRef.current || disposed) return;
        html2canvas(contentRef.current, { backgroundColor: null }).then(canvas => {
          if (disposed) return;
          const frontTexture = new THREE.CanvasTexture(canvas);
          frontTexture.colorSpace = THREE.SRGBColorSpace;
          frontTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          const imageAspect = canvas.width / canvas.height;
          const targetAspect = paperWidth / paperHeight;
          let rx = 1, ry = 1;
          if (imageFit === 'cover') {
             if (imageAspect > targetAspect) rx = targetAspect / imageAspect;
             else ry = imageAspect / targetAspect;
          } else {
             if (imageAspect > targetAspect) ry = imageAspect / targetAspect;
             else rx = targetAspect / imageAspect;
          }
          frontTexture.repeat.set(rx, ry);
          frontTexture.offset.set((1 - rx) / 2, (1 - ry) / 2);
          
          frontMaterial.map = frontTexture;
          backMaterial.map = frontTexture;
          depthMaterial.map = frontTexture;
          frontMaterial.needsUpdate = backMaterial.needsUpdate = depthMaterial.needsUpdate = true;
          
          textures.add(frontTexture);
          ready = true;
          setStatus('ready');
          hit.disabled = options.current.disabled;
          wake();
        }).catch(err => {
          if (disposed) return;
          setStatus('error');
          options.current.onError?.(err);
        });
      }, 50);
    } else {
      setStatus('error');
      options.current.onError?.(new Error('PaperCrumple requires children.'));
    }
    return () => {`);

// change return DOM
code = code.replace(/<img[\s\S]*?\/>/g, 
`<div ref={contentRef} className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: \`translate(-50%, -50%) rotate(\${rotation}deg)\` }}>
          {children}
        </div>`);

fs.writeFileSync('src/components/PaperCrumple.jsx', code);
