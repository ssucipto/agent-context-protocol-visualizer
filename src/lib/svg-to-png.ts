/**
 * SVG to PNG rasterization utility.
 *
 * Converts an SVG DOM element to a `data:image/png;base64` data URI
 * using the HTML Canvas API. Produces PNG images that work universally
 * in Word (.doc), PDF print output, and all browsers.
 *
 * Key challenge: mermaid SVGs use CSS classes from theme stylesheets.
 * We inline computed styles (fill, stroke, font) before rasterization
 * so the standalone Image retains all visual properties. The root SVG
 * element and all descendants are processed for complete style coverage.
 *
 * @param svgElement - The live SVG element from the DOM
 * @param scale - Output scale factor (default 2x for HiDPI)
 * @returns PNG data URI or null on failure
 */
export async function svgToPngDataUri(
  svgElement: SVGSVGElement,
  scale = 2,
): Promise<string | null> {
  try {
    // 1. Clone and inline computed styles on ALL elements including root
    const clone = svgElement.cloneNode(true) as SVGSVGElement;

    // Collect all elements: root + descendants
    const allOriginal: SVGElement[] = [svgElement as SVGElement];
    svgElement.querySelectorAll('*').forEach((el) => allOriginal.push(el as SVGElement));

    const allCloned: SVGElement[] = [clone as SVGElement];
    clone.querySelectorAll('*').forEach((el) => allCloned.push(el as SVGElement));

    // CSS properties to inline — covers mermaid theme + text positioning
    const PROPS = [
      'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity',
      'stroke-dasharray', 'font-family', 'font-size', 'font-weight',
      'opacity', 'text-anchor', 'dominant-baseline', 'color',
    ];

    // Defaults that should NOT be inlined (would override inherited values)
    const SKIP_VALUES = new Set([
      'normal', 'auto', 'none', 'rgba(0, 0, 0, 0)',
      '0', // stroke-width=0 means no stroke
    ]);

    for (let i = 0; i < allOriginal.length; i++) {
      const orig = allOriginal[i];
      const cln = allCloned[i];
      if (!orig || !cln) continue;

      const computed = window.getComputedStyle(orig);
      const styles: string[] = [];

      for (const prop of PROPS) {
        const val = computed.getPropertyValue(prop);
        if (val && !SKIP_VALUES.has(val) && !val.startsWith('rgba(0, 0, 0, 0')) {
          styles.push(`${prop}:${val}`);
        }
      }

      if (styles.length) {
        const existing = cln.getAttribute('style') || '';
        const newStyles = styles.join(';');
        cln.setAttribute('style', existing ? `${existing};${newStyles}` : newStyles);
      }
    }

    // 2. Determine dimensions from viewBox or bounding rect
    const vb = clone.viewBox?.baseVal;
    let w = vb?.width || svgElement.getBoundingClientRect().width || 800;
    let h = vb?.height || svgElement.getBoundingClientRect().height || 400;
    if (w <= 0) w = 800;
    if (h <= 0) h = 400;

    // 3. Serialize to standalone SVG document with XML declaration
    const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    // 4. Load as Image and draw to Canvas
    const png = await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) { URL.revokeObjectURL(url); resolve(null); return; }

        ctx.scale(scale, scale);
        // White background — SVGs may be transparent (dark theme)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        URL.revokeObjectURL(url);

        // Sanity check: Image must have loaded with actual content
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          console.warn('[svgToPng] image loaded but has zero dimensions');
          resolve(null);
        } else {
          resolve(canvas.toDataURL('image/png'));
        }
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        console.warn('[svgToPng] image load failed:', e);
        resolve(null);
      };
      img.src = url;
    });

    return png;
  } catch (err) {
    console.warn('[svgToPng] exception:', err instanceof Error ? err.message : err);
    return null;
  }
}
