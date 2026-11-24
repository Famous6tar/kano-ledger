import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

async function render(node) {
  // 🔑 The Bulletproof Fix:
  // Clone the receipt and append it to the <body> off-screen.
  // This completely removes it from the modal's scrollbars, max-height, and clipping issues.
  const clone = node.cloneNode(true);
  const wrapper = document.createElement("div");
  
  wrapper.style.position = "absolute";
  wrapper.style.left = "-9999px"; // Off-screen
  wrapper.style.top = "0";
  wrapper.style.width = `${node.offsetWidth}px`; // Match original width
  wrapper.style.backgroundColor = "#ffffff";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2, // High resolution
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      width: clone.scrollWidth,
      height: clone.scrollHeight,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
    });
    return canvas;
  } finally {
    // Clean up the off-screen clone
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