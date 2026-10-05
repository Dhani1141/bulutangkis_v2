const fs = require('fs');
let code = fs.readFileSync('src/components/PaperCrumple.jsx', 'utf8');

const target = `    if (src) {
      Promise.all([load(src), backSrc ? load(backSrc) : Promise.resolve(null)])
        .then(([frontTexture, backTexture]) => {
          if (disposed) return;
          if (backTexture) {
            backTexture.repeat.x *= -1;
            backTexture.offset.x = 1 - backTexture.offset.x;
          }
          frontMaterial.map = frontTexture;
          backMaterial.map = backTexture || frontTexture;
          depthMaterial.map = frontTexture;
          frontMaterial.needsUpdate = backMaterial.needsUpdate = depthMaterial.needsUpdate = true;
          ready = true;
          setStatus('ready');
          hit.disabled = options.current.disabled;
          wake();
        })
        .catch(error => {
          if (disposed) return;
          setStatus('error');
          options.current.onError?.(error);
        });
    } else {
      setStatus('error');
      options.current.onError?.(new Error('PaperCrumple requires an image src.'));
    }`;

const replacement = `    if (children) {
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
    }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/PaperCrumple.jsx', code);
