
import { Equipment } from "@/types/equipment";

// Generate a URL for equipment (ensuring it's an absolute URL)
export const generateEquipmentUrl = (equipmentId: string): string => {
  // Get the base URL of the current window location
  const baseUrl = window.location.origin;
  // Create an absolute URL by combining the base URL with the relative path
  return `${baseUrl}/equipment/details/${equipmentId}`;
};

// Generate HTML for printable QR code page
export const generatePrintableHtml = (equipment: Equipment, qrCodeHtml: string): string => {
  return `
    <html>
      <head>
        <title>Equipment QR Code - ${equipment.name}</title>
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
          ${qrCodeHtml}
          <div class="details">
            <h3>${equipment.name}</h3>
            <table>
              <tr>
                <th>Model</th>
                <td>${equipment.model || 'N/A'}</td>
              </tr>
              <tr>
                <th>Serial Number</th>
                <td>${equipment.serial_number || 'N/A'}</td>
              </tr>
              <tr>
                <th>Location</th>
                <td>${equipment.location || 'N/A'}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>${equipment.status || 'N/A'}</td>
              </tr>
            </table>
          </div>
        </div>
      </body>
    </html>
  `;
};
