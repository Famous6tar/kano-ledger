import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

async function render(node) {
  const clone = node.cloneNode(true);
  const wrapper = document.createElement("div");
  
  wrapper.style.position = "absolute";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  
  const inlineMaxWidth = node.style.maxWidth;
  const isInvoice = inlineMaxWidth === "800px" || inlineMaxWidth === "800";
  const minWidth = isInvoice ? 800 : 440;
  const targetWidth = Math.max(node.scrollWidth, minWidth);
  
  wrapper.style.width = `${targetWidth}px`;
  wrapper.style.backgroundColor = "#ffffff";
  
  clone.style.width = "100%";
  clone.style.maxWidth = "none";
  clone.style.margin = "0";
  
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    await new Promise(resolve => setTimeout(resolve, 150));
    const baseScale = 2;
    const estimatedPixels = targetWidth * clone.scrollHeight * (baseScale * baseScale);
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
    document.body.removeChild(wrapper);
  }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
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
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, filename);
  }, "image/png", 0.98);
}

export async function generatePdfBlob(node) {
  const canvas = await render(node);
  const image = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    unit: "px",
    format: [canvas.width, canvas.height],
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    compress: true,
  });
  pdf.addImage(image, "PNG", 0, 0, canvas.width, canvas.height);
  return pdf.output("blob");
}

export async function exportPdf(node, filename) {
  const blob = await generatePdfBlob(node);
  downloadBlob(blob, filename);
}

export async function sharePdfBlob(blob, filename, text) {
  const file = new File([blob], filename, { type: "application/pdf" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename, text });
      return true;
    } catch (err) {
      console.warn("Share failed:", err);
      return false;
    }
  }
  return false;
}