// Picks the dominant, vivid colour out of a logo so the whole workspace can adopt it.
export function extractDominantColor(source) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        const buckets = new Map();
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 128) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const light = (max + min) / 2;
          if (light > 240 || light < 16) continue;
          const sat = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
          if (sat < 0.16) continue;
          const key = `${Math.round(r / 24)}-${Math.round(g / 24)}-${Math.round(b / 24)}`;
          const entry = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
          entry.r += r;
          entry.g += g;
          entry.b += b;
          entry.n += 1;
          buckets.set(key, entry);
        }

        const best = [...buckets.values()].sort((a, b) => b.n - a.n)[0];
        if (!best) {
          resolve(null);
          return;
        }
        const toHex = (v) => Math.round(v / best.n).toString(16).padStart(2, "0");
        resolve(`#${toHex(best.r)}${toHex(best.g)}${toHex(best.b)}`);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = source;
  });
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}