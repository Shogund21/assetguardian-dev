export const usePrintHandler = () => {
  const handlePrint = () => {
    const printContent = document.querySelector('.print-content');
    if (!printContent) {
      alert('No content found to print. Please ensure the print content is loaded.');
      return;
    }

    // Try to open print window, with fallback for popup blockers
    let printWindow: Window | null = null;
    try {
      printWindow = window.open('', '_blank');
    } catch (error) {
      console.error('Failed to open print window:', error);
    }

    if (!printWindow) {
      // Fallback: Use current window for printing
      const currentContent = document.body.innerHTML;
      const printStyles = generatePrintStyles();
      
      // Temporarily replace page content
      document.head.insertAdjacentHTML('beforeend', `<style id="temp-print-styles">${printStyles}</style>`);
      document.body.innerHTML = printContent.innerHTML;
      document.body.classList.add('print-mode');
      
      // Print and restore
      window.print();
      
      // Restore original content
      document.body.innerHTML = currentContent;
      document.body.classList.remove('print-mode');
      const tempStyles = document.getElementById('temp-print-styles');
      if (tempStyles) tempStyles.remove();
      
      return;
    }

    // Create comprehensive inline styles (no external stylesheet access to avoid CORS)
    const printStyles = generatePrintStyles();

    // Create the print window content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print View</title>
          <meta charset="utf-8">
          <style>
            ${printStyles}
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    // Wait for content to load then print
    printWindow.document.close();
    
    // Handle both load and timeout scenarios
    const printTimeout = setTimeout(() => {
      printWindow?.focus();
      printWindow?.print();
      setupPrintWindowCleanup(printWindow);
    }, 500);

    printWindow.onload = () => {
      clearTimeout(printTimeout);
      printWindow.focus();
      printWindow.print();
      setupPrintWindowCleanup(printWindow);
    };
  };

  return { handlePrint };
};

const setupPrintWindowCleanup = (printWindow: Window | null) => {
  if (!printWindow) return;
  
  // Close the print window after printing
  printWindow.onafterprint = () => {
    printWindow.close();
  };
  
  // Fallback: close after a delay if onafterprint doesn't fire
  setTimeout(() => {
    if (!printWindow.closed) {
      printWindow.close();
    }
  }, 3000);
};

const generatePrintStyles = () => `
  /* Reset and base styles */
  * {
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.6;
    color: #000;
    background: white;
    margin: 0;
    padding: 20px;
    font-size: 12px;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    color: #000;
    margin-top: 0;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }

  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
  h3 { font-size: 18px; }
  h4 { font-size: 16px; }

  p {
    margin: 0 0 16px 0;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    background: white;
  }

  th, td {
    border: 1px solid #d1d5db;
    padding: 8px 12px;
    text-align: left;
    vertical-align: top;
    font-size: 11px;
  }

  th {
    background-color: #f9fafb;
    font-weight: 600;
    color: #374151;
  }

  tbody tr:nth-child(even) {
    background-color: #f9fafb;
  }

  /* QR Code specific styles */
  .qr-code-container {
    text-align: center;
    margin: 20px 0;
  }

  .qr-code-container svg {
    max-width: 200px;
    height: auto;
  }

  /* Layout and spacing */
  .print-content {
    display: block !important;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  /* Page breaks */
  .page-break {
    page-break-before: always;
  }

  .no-break {
    page-break-inside: avoid;
  }

  /* Hide interactive elements */
  button,
  input,
  select,
  textarea,
  .print\\:hidden,
  .no-print {
    display: none !important;
  }

  /* Utility classes */
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }
  .font-bold { font-weight: 700; }
  .font-semibold { font-weight: 600; }
  .mb-4 { margin-bottom: 16px; }
  .mb-6 { margin-bottom: 24px; }
  .mt-4 { margin-top: 16px; }
  .mt-6 { margin-top: 24px; }

  /* Print specific adjustments */
  @media print {
    body {
      padding: 10mm;
      margin: 0;
    }
    
    .print-content {
      margin: 0;
      padding: 0;
    }
    
    h1, h2 {
      page-break-after: avoid;
    }
    
    table {
      page-break-inside: avoid;
    }
    
    tr {
      page-break-inside: avoid;
    }
  }

  /* Equipment and data specific styles */
  .equipment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .equipment-card {
    border: 1px solid #d1d5db;
    padding: 16px;
    border-radius: 4px;
    page-break-inside: avoid;
  }

  .status-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    border: 1px solid #d1d5db;
  }

  /* Link styles for print */
  a {
    color: #000;
    text-decoration: underline;
  }

  a[href]:after {
    content: " (" attr(href) ")";
    font-size: 10px;
    color: #666;
  }
`;