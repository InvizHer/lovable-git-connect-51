import { useRef } from "react";
import { QRCode } from "react-qrcode-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface QRCodeSectionProps {
  boxToken: string;
  boxTitle: string;
  className?: string;
}

export const QRCodeSection = ({ boxToken, boxTitle, className = "" }: QRCodeSectionProps) => {
  const qrRef = useRef<any>(null);
  
  // Get current domain
  const complaintUrl = `${window.location.origin}/complaint/${boxToken}`;

  const handleDownloadPNG = () => {
    try {
      if (qrRef.current) {
        const canvas = qrRef.current.canvas.current as HTMLCanvasElement;
        
        // Create a new canvas with extra space for title
        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');
        
        if (!ctx) {
          toast.error("Failed to create download canvas");
          return;
        }

        // Set dimensions (QR + title space)
        const padding = 40;
        const titleHeight = 60;
        finalCanvas.width = canvas.width + (padding * 2);
        finalCanvas.height = canvas.height + titleHeight + (padding * 2);

        // Fill background (respect theme)
        const isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark ? '#1a1a1a' : '#ffffff';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        // Draw QR code
        ctx.drawImage(canvas, padding, padding);

        // Draw title
        ctx.fillStyle = isDark ? '#ffffff' : '#000000';
        ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textY = canvas.height + padding + (titleHeight / 2);
        ctx.fillText(boxTitle, finalCanvas.width / 2, textY);

        // Download
        finalCanvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${boxTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("QR Code downloaded successfully!");
          }
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download QR code");
    }
  };

  const handleDownloadSVG = () => {
    try {
      if (qrRef.current) {
        const canvas = qrRef.current.canvas.current as HTMLCanvasElement;
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create SVG with embedded image and title
        const svgWidth = 400;
        const svgHeight = 480;
        const isDark = document.documentElement.classList.contains('dark');
        
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
            <rect width="100%" height="100%" fill="${isDark ? '#1a1a1a' : '#ffffff'}"/>
            <image href="${dataUrl}" x="40" y="40" width="320" height="320"/>
            <text x="200" y="400" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" fill="${isDark ? '#ffffff' : '#000000'}">${boxTitle}</text>
          </svg>
        `;
        
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${boxTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.svg`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("SVG downloaded successfully!");
      }
    } catch (error) {
      console.error("SVG download error:", error);
      toast.error("Failed to download SVG");
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          QR Code for This Complaint Box
        </CardTitle>
        <CardDescription>
          Share this QR code to let users submit complaints easily
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {/* QR Code */}
        <div className="flex flex-col items-center gap-4 p-6 bg-background border border-border rounded-lg">
          <div className="relative">
            <QRCode
              ref={qrRef}
              value={complaintUrl}
              size={280}
              qrStyle="squares"
              eyeRadius={8}
              logoImage="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='white' rx='50'/%3E%3Ctext x='50' y='50' text-anchor='middle' dominant-baseline='central' font-family='system-ui, -apple-system, sans-serif' font-size='16' font-weight='bold' fill='%23000000'%3ETellUs%3C/text%3E%3C/svg%3E"
              logoWidth={70}
              logoHeight={70}
              logoOpacity={1}
              removeQrCodeBehindLogo={true}
              logoPadding={6}
              logoPaddingStyle="circle"
              fgColor="hsl(var(--foreground))"
              bgColor="hsl(var(--background))"
            />
          </div>
          
          {/* Title below QR */}
          <p className="text-center font-semibold text-base mt-2 px-4">
            {boxTitle}
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Button
            onClick={handleDownloadPNG}
            variant="default"
            className="flex-1 gap-2"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
          <Button
            onClick={handleDownloadSVG}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Download className="h-4 w-4" />
            Download SVG
          </Button>
        </div>

        {/* URL Display */}
        <div className="w-full max-w-sm">
          <p className="text-xs text-muted-foreground text-center break-all">
            {complaintUrl}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
