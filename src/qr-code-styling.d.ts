declare module 'qr-code-styling' {
  export interface Options {
    width?: number;
    height?: number;
    type?: 'svg' | 'canvas';
    data?: string;
    image?: string;
    margin?: number;
    qrOptions?: {
      typeNumber?: number;
      mode?: string;
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    };
    imageOptions?: {
      hideBackgroundDots?: boolean;
      imageSize?: number;
      margin?: number;
      crossOrigin?: string;
    };
    dotsOptions?: {
      color?: string;
      gradient?: any;
      type?: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
    };
    cornersSquareOptions?: {
      color?: string;
      gradient?: any;
      type?: 'dot' | 'square' | 'extra-rounded';
    };
    cornersDotOptions?: {
      color?: string;
      gradient?: any;
      type?: 'dot' | 'square';
    };
    backgroundOptions?: {
      color?: string;
      gradient?: any;
    };
  }

  export interface DownloadOptions {
    name?: string;
    extension?: 'png' | 'jpeg' | 'webp' | 'svg';
  }

  export default class QRCodeStyling {
    constructor(options?: Options);
    append(container: HTMLElement): void;
    update(options?: Options): void;
    download(downloadOptions?: DownloadOptions): Promise<void>;
    getRawData(extension?: string): Promise<Blob | null>;
  }
}
