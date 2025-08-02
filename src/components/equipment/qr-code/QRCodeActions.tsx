import { useRef } from "react";
import { Printer, Download, Share2, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Equipment } from "@/types/equipment";
import { generateEquipmentUrl, generatePrintableHtml } from "./qrCodeUtils";

interface QRCodeActionsProps {
  equipment: Equipment;
  qrCodeContainerRef: React.RefObject<HTMLDivElement>;
  size: number;
}

export function QRCodeActions({ equipment, qrCodeContainerRef, size }: QRCodeActionsProps) {
  const { toast } = useToast();
  const equipmentUrl = generateEquipmentUrl(equipment.id);

  const handlePrint = () => {
    const qrCodeContent = qrCodeContainerRef.current?.innerHTML;
    if (!qrCodeContent) {
      toast({
        title: "Error",
        description: "QR code content not found. Please wait for it to load.",
        variant: "destructive",
      });
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
      // Fallback: Use current window with temporary content replacement
      toast({
        title: "Info",
        description: "Opening print view in current window. Your page will be restored after printing.",
      });
      
      const currentContent = document.body.innerHTML;
      const printableHtml = generatePrintableHtml(equipment, qrCodeContent);
      
      // Extract just the body content from the generated HTML
      const bodyMatch = printableHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      const bodyContent = bodyMatch ? bodyMatch[1] : qrCodeContent;
      
      // Temporarily replace page content
      document.body.innerHTML = bodyContent;
      document.body.className = 'print-mode';
      
      // Print and restore
      window.print();
      
      // Restore original content after a short delay
      setTimeout(() => {
        document.body.innerHTML = currentContent;
        document.body.className = '';
      }, 100);
      
      return;
    }

    // Create enhanced print window content
    const printableHtml = generatePrintableHtml(equipment, qrCodeContent);
    printWindow.document.write(printableHtml);
    printWindow.document.close();

    // Handle both load and timeout scenarios
    const printTimeout = setTimeout(() => {
      printWindow?.focus();
      printWindow?.print();
      setupQRPrintCleanup(printWindow);
    }, 500);

    printWindow.onload = () => {
      clearTimeout(printTimeout);
      printWindow.focus();
      printWindow.print();
      setupQRPrintCleanup(printWindow);
    };

    toast({
      title: "Success",
      description: "Print window opened. Complete printing to continue.",
    });
  };

  const setupQRPrintCleanup = (printWindow: Window | null) => {
    if (!printWindow) return;
    
    printWindow.onafterprint = () => {
      printWindow.close();
    };
    
    // Fallback cleanup
    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.close();
      }
    }, 3000);
  };

  const handleDownload = () => {
    const svg = document.querySelector('.qr-code-container svg') as SVGElement;
    if (!svg) {
      toast({
        title: "Error",
        description: "QR code SVG not found.",
        variant: "destructive",
      });
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    canvas.width = size;
    canvas.height = size;
    
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `${equipment.name.replace(/\s+/g, '_')}_QRCode.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Success",
          description: "QR code downloaded successfully.",
        });
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(equipmentUrl)
      .then(() => {
        toast({
          title: "Success",
          description: "Link copied to clipboard.",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy link.",
          variant: "destructive",
        });
      });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `QR Code for ${equipment.name}`,
        text: `Equipment details for ${equipment.name}`,
        url: equipmentUrl,
      }).catch(() => {
        toast({
          title: "Error",
          description: "Failed to share QR code.",
          variant: "destructive",
        });
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Button 
        onClick={handlePrint}
        className="w-full bg-[#1EAEDB] hover:bg-[#33C3F0] text-white"
      >
        <Printer className="mr-2 h-4 w-4" /> Print
      </Button>
      <Button 
        onClick={handleDownload}
        className="w-full bg-[#1EAEDB] hover:bg-[#33C3F0] text-white"
      >
        <Download className="mr-2 h-4 w-4" /> Download
      </Button>
      <Button 
        onClick={handleCopyLink}
        className="w-full bg-[#1EAEDB] hover:bg-[#33C3F0] text-white"
      >
        <Clipboard className="mr-2 h-4 w-4" /> Copy Link
      </Button>
      <Button 
        onClick={handleShare}
        className="w-full bg-[#1EAEDB] hover:bg-[#33C3F0] text-white"
      >
        <Share2 className="mr-2 h-4 w-4" /> Share
      </Button>
    </div>
  );
}
