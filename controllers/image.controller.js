import { uploadToCloudinary } from '../services/cloudinary.service.js';
import axios from 'axios';
import logger from '../utils/logger.js';

// @desc    Generate Image
// @route   POST /api/image/generate
// @access  Public
export const generateImage = async (req, res, next) => {
    try {
        console.log("DEBUG: Received Image Gen Request. BodyType:", typeof req.body, "BodyKeys:", req.body ? Object.keys(req.body) : 'null');
        const { prompt } = req.body || {};

        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        console.log(`[Backend] Received image generation request for prompt: "${prompt}"`);
        logger.info(`[Image Generation] Generating image for prompt: "${prompt}"`);

        // Using nologo=true and a seed for improved reliability and bypass caching
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${Date.now()}`;
        console.log(`[Image Generation] Fetching from: ${imageUrl}`);

        // Fetch the image as a buffer
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });

        const buffer = Buffer.from(response.data, 'binary');
        console.log(`[Image Generation] Got buffer, size: ${buffer.length} bytes`);

        if (buffer.length === 0) {
            logger.error(`[Image Generation] Empty buffer received from ${imageUrl}`);
            return res.status(502).json({
                success: false,
                message: 'Received empty image from generation service. Please try a different prompt.'
            });
        }

        // Upload to Cloudinary
        console.log(`[Image Generation] Uploading ${buffer.length} bytes to Cloudinary...`);
        const cloudResult = await uploadToCloudinary(buffer, {
            folder: 'generated_images',
            public_id: `gen_${Date.now()}`
        });

        logger.info(`[Image Generation] Image uploaded to Cloudinary: ${cloudResult.secure_url}`);

        res.status(200).json({
            success: true,
            data: cloudResult.secure_url
        });
    } catch (error) {
        logger.error(`[Image Generation] Error: ${error.message}`);
        if (error.response) {
            logger.error(`[Image Generation] Source Status: ${error.response.status}`);
            logger.error(`[Image Generation] Source Data: ${error.response.data?.toString().substring(0, 200)}`);
        }

        res.status(500).json({
            success: false,
            message: `Image generation failed: ${error.message}`,
            details: error.response?.statusText || "Internal Server Error"
        });
    }
};
