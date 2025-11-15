import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode as QrCodeIcon } from "lucide-react";
import { toast } from "sonner";
import QRCodeStyling from "qr-code-styling";

interface QRCodeSectionProps {
  boxToken: string;
  boxTitle: string;
  className?: string;
}

export const QRCodeSection = ({ boxToken, boxTitle, className = "" }: QRCodeSectionProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const complaintUrl = `${window.location.origin}/complaint/${boxToken}`;

  useEffect(() => {
    if (!qrRef.current) return;

    // Determine QR size based on viewport
    const isMobile = window.innerWidth < 640;
    const qrSize = isMobile ? 250 : 300;

    // Create QR code instance with TellUs branding
    qrCodeInstance.current = new QRCodeStyling({
      width: qrSize,
      height: qrSize,
      type: "canvas",
      data: complaintUrl,
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='white'/%3E%3Ctext x='100' y='115' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-size='40' font-weight='bold' fill='%2309090b'%3ETellUs%3C/text%3E%3C/svg%3E",
      dotsOptions: {
        color: "#09090b",
        type: "rounded"
      },
      backgroundOptions: {
        color: "#ffffff"
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 8,
        imageSize: 0.3
      },
      cornersSquareOptions: {
        color: "#09090b",
        type: "extra-rounded"
      },
      cornersDotOptions: {
        color: "#09090b",
        type: "dot"
      }
    });

    // Clear and append QR code
    qrRef.current.innerHTML = "";
    qrCodeInstance.current.append(qrRef.current);
  }, [complaintUrl]);

  const handleDownloadPNG = async () => {
    if (!qrCodeInstance.current) {
      toast.error("QR code not ready");
      return;
    }

    try {
      setIsGenerating(true);
      
      // Get the canvas element
      const canvas = qrRef.current?.querySelector("canvas");
      if (!canvas) {
        throw new Error("Canvas not found");
      }

      // Create a new canvas with extra space for title and description
      const finalCanvas = document.createElement("canvas");
      const ctx = finalCanvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      const padding = 40;
      const titleHeight = 50;
      const descHeight = 60;
      finalCanvas.width = canvas.width + (padding * 2);
      finalCanvas.height = canvas.height + titleHeight + descHeight + (padding * 2);

      // Fill background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      // Draw QR code
      ctx.drawImage(canvas, padding, padding);

      // Draw title
      ctx.fillStyle = "#09090b";
      ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const titleY = canvas.height + padding + 25;
      ctx.fillText(boxTitle, finalCanvas.width / 2, titleY);

      // Draw description text
      ctx.fillStyle = "#6b7280";
      ctx.font = "12px system-ui, -apple-system, sans-serif";
      
      const descText = `Scan this QR code to submit your complaint via ${boxTitle} complaint box`;
      const maxWidth = finalCanvas.width - (padding * 2);
      const words = descText.split(' ');
      let line = '';
      let lineY = titleY + 30;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, finalCanvas.width / 2, lineY);
          line = words[i] + ' ';
          lineY += 18;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, finalCanvas.width / 2, lineY);

      // Download
      finalCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${boxTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_qr.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("QR Code downloaded successfully!");
        }
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadSVG = async () => {
    if (!qrCodeInstance.current) {
      toast.error("QR code not ready");
      return;
    }

    try {
      setIsGenerating(true);
      
      // Download using the library's built-in method
      await qrCodeInstance.current.download({
        name: `${boxTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_qr`,
        extension: "svg"
      });
      
      toast.success("SVG downloaded successfully!");
    } catch (error) {
      console.error("SVG download error:", error);
      toast.error("Failed to download SVG");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className={`glass-card border-primary/20 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
          <QrCodeIcon className="h-5 w-5 text-primary" />
          QR Code for This Complaint Box
        </CardTitle>
        <CardDescription>
          Share this QR code to let users submit complaints easily
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {/* QR Code */}
        <div className="flex flex-col items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-xl shadow-sm">
          <div 
            ref={qrRef} 
            className="bg-white p-3 sm:p-4 rounded-lg shadow-inner w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] flex items-center justify-center"
          />
          
          {/* Title below QR */}
          <p className="text-center font-semibold text-sm sm:text-base mt-2 px-4 text-foreground">
            {boxTitle}
          </p>
          
          {/* Descriptive text */}
          <p className="text-center text-xs sm:text-sm text-muted-foreground px-2 sm:px-4 leading-relaxed">
            Scan this QR code to submit your complaint via <span className="font-medium text-foreground">{boxTitle}</span> complaint box
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Button
            onClick={handleDownloadPNG}
            variant="default"
            className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={isGenerating}
          >
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
          <Button
            onClick={handleDownloadSVG}
            variant="outline"
            className="flex-1 gap-2"
            disabled={isGenerating}
          >
            <Download className="h-4 w-4" />
            Download SVG
          </Button>
        </div>

        {/* URL Display */}
        <div className="w-full max-w-sm p-3 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground text-center break-all font-mono">
            {complaintUrl}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
