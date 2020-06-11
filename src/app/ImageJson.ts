export interface ImageJSON {
    image: string;
    image_roi: {
        x: number,
        y: number,
        width: number,
        height: number;
    }
}