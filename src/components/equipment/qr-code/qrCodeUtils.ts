
import DOMPurify from "dompurify";
import { Equipment } from "@/types/equipment";

// Sanitize a string for safe HTML insertion
const sanitize = (value: string | null | undefined): string => {
  return DOMPurify.sanitize(value || 'N/A', { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

// Generate a URL for equipment (ensuring it's an absolute URL)
export const generateEquipmentUrl = (equipmentId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/equipment/details/${encodeURIComponent(equipmentId)}`;
};

// Generate HTML for printable QR code page
export const generatePrintableHtml = (equipment: Equipment, qrCodeHtml: string): string => {
  const safeName = sanitize(equipment.name);
  const safeModel = sanitize(equipment.model);
  const safeSerial = sanitize(equipment.serial_number);
  const safeLocation = sanitize(equipment.location);
  const safeStatus = sanitize(equipment.status);
  // Sanitize QR code HTML but allow SVG elements
  const safeQrCode = DOMPurify.sanitize(qrCodeHtml, { 
    USE_PROFILES: { svg: true, html: true },
    ADD_TAGS: ['svg', 'path', 'rect', 'circle', 'g'],
    ADD_ATTR: ['viewBox', 'd', 'fill', 'width', 'height', 'x', 'y', 'rx', 'ry', 'xmlns']
  });

  return `
    <html>
      <head>
        <title>Equipment QR Code - ${safeName}</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; }
          .container { margin: 20px; }
          .details { margin-top: 20px; }
          table { margin: 0 auto; border-collapse: collapse; }
          td, th { padding: 8px; border: 1px solid #ddd; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Equipment QR Code</h2>
          ${safeQrCode}
          <div class="details">
            <h3>${safeName}</h3>
            <table>
              <tr><th>Model</th><td>${safeModel}</td></tr>
              <tr><th>Serial Number</th><td>${safeSerial}</td></tr>
              <tr><th>Location</th><td>${safeLocation}</td></tr>
              <tr><th>Status</th><td>${safeStatus}</td></tr>
            </table>
          </div>
        </div>
      </body>
    </html>
  `;
};
