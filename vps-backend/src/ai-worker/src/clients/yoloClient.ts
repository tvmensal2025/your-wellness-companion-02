import axios from 'axios';

const YOLO_URL = process.env.YOLO_URL || 'http://yolo-service-yolo-detection.0sw627.easypanel.host';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface YoloDetection {
  class: string;
  confidence: number;
  bbox: number[];
}

interface YoloResponse {
  detections: YoloDetection[];
  count: number;
  processing_time: number;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const yoloClient = {
  async detect(imageUrl: string): Promise<YoloResponse> {
    let lastError: any;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🦾 YOLO attempt ${attempt}/${MAX_RETRIES}...`);

        const response = await axios.post(
          `${YOLO_URL}/detect`,
          { image_url: imageUrl },
          {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
          }
        );

        console.log(`✅ YOLO success: ${response.data.count} detections`);
        return response.data;

      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ YOLO attempt ${attempt} failed:`, error.message);

        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY * attempt);
        }
      }
    }

    // All retries failed
    console.error('❌ YOLO failed after all retries');
    throw new Error(`YOLO detection failed: ${lastError.message}`);
  }
};
