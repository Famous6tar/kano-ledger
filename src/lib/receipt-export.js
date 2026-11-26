import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

async function render(node) {
  // 1. Clone the element and place it off-screen
  const clone = node.cloneNode(true);
  const wrapper = document.createElement("div");
  
  wrapper.style.position = "absolute";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  
  // Detect if this is an invoice (maxWidth: 800px) or receipt (maxWidth: 440px)
  const inlineMaxWidth = node.style.maxWidth;
  const isInvoice = inlineMaxWidth === "800px" || inlineMaxWidth === "800";
  const minWidth = isInvoice ? 800 : 440;
  
  // On mobile, node.scrollWidth is small (e.g. 350px). We force it to the desktop width.
  const targetWidth = Math.max(node.scrollWidth, minWidth);
  
  wrapper.style.width = `${targetWidth}px`;
  wrapper.style.backgroundColor = "#ffffff";
  
  clone.style.width = "100%";
  clone.style.maxWidth = "none"; // Override inline maxWidth so it fills the wrapper
  clone.style.margin = "0";
  
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    // Wait a brief moment for any images (like the logo) to load inside the clone
    await new Promise(resolve => setTimeout(resolve, 150));

    // 2. Calculate safe scale to avoid mobile canvas limits
    // Most mobile devices max out around 16,777,216 pixels total
    const baseScale = 2;
    const estimatedPixels = targetWidth * clone.scrollHeight * (baseScale * baseScale);
    // If the receipt is too long, drop scale to 1 to prevent blank canvas on iOS
    const finalScale = estimatedPixels > 12000000 ? 1 : baseScale;

    const canvas = await html2canvas(clone, {
      scale: finalScale,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      width: targetWidth,
      height: clone.scrollHeight,
      windowWidth: targetWidth,
      windowHeight: clone.scrollHeight,
    });
    return canvas;
  } finally {
    // 3. Clean up
    document.body.removeChild(wrapper);
  }
}

function download(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function toBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.98));
}

export async function toDataUrl(url) {
  const response = await fetch(url, { mode: "cors" });
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function exportPng(node, filename) {
  const canvas = await render(node);
  download(canvas.toDataURL("image/png"), filename);
}

export async function exportPdf(node, filename) {
  const canvas = await render(node);
  const image = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    unit: "px",
    format: [canvas.width, canvas.height],
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    compress: true,
  });
  pdf.addImage(image, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
}

export async function sharePng(node, filename, text) {
  const canvas = await render(node);
  const blob = await toBlob(canvas);
  const file = new File([blob], filename, { type: "image/png" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: filename, text });
    return true;
  }

  download(URL.createObjectURL(blob), filename);
  return false;
}