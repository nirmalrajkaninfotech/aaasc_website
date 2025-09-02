import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const unlinkAsync = promisify(fs.unlink);

/**
 * Downloads a file from a URL and saves it to the specified directory
 * @param {string} url - The URL of the file to download
 * @param {string} targetDir - The target directory to save the file
 * @param {Object} options - Additional options
 * @param {string} [options.filename] - Custom filename (without extension)
 * @param {string[]} [options.allowedTypes] - Allowed MIME types
 * @param {number} [options.maxSize] - Maximum file size in bytes
 * @returns {Promise<{filePath: string, filename: string, mimeType: string, size: number}>}
 */
export async function downloadFile(url, targetDir, options = {}) {
  try {
    // Ensure target directory exists
    await mkdirAsync(targetDir, { recursive: true });
    
    // Get the filename from URL or generate one
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const originalFilename = pathParts[pathParts.length - 1];
    const ext = path.extname(originalFilename) || '.bin';
    const filename = `${options.filename || uuidv4()}${ext}`;
    const filePath = path.join(targetDir, filename);
    
    // Download the file
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      maxContentLength: options.maxSize || 10 * 1024 * 1024, // 10MB default
    });
    
    // Check MIME type if allowedTypes is provided
    const mimeType = response.headers['content-type'];
    if (options.allowedTypes && !options.allowedTypes.includes(mimeType)) {
      throw new Error(`File type ${mimeType} is not allowed`);
    }
    
    // Check file size
    const contentLength = parseInt(response.headers['content-length'], 10);
    if (options.maxSize && contentLength > options.maxSize) {
      throw new Error(`File size (${contentLength} bytes) exceeds maximum allowed size (${options.maxSize} bytes)`);
    }
    
    // Write file to disk
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    // Get file stats
    const stats = fs.statSync(filePath);
    
    return {
      filePath,
      filename,
      mimeType,
      size: stats.size,
      originalName: originalFilename
    };
  } catch (error) {
    // Clean up partially downloaded file if it exists
    if (fs.existsSync(filePath)) {
      await unlinkAsync(filePath).catch(() => {});
    }
    throw error;
  }
}

/**
 * Uploads a file to a remote server
 * @param {string} filePath - Path to the local file
 * @param {string} uploadUrl - The URL to upload the file to
 * @param {Object} [options] - Additional options
 * @param {Object} [options.headers] - Additional headers to include
 * @param {Object} [options.data] - Additional form data to include
 * @returns {Promise<Object>} - The server response
 */
export async function uploadFile(filePath, uploadUrl, options = {}) {
  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    
    // Add file to form data
    formData.append('file', fileStream, path.basename(filePath));
    
    // Add additional form data if provided
    if (options.data) {
      Object.entries(options.data).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    // Make the request
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        ...(options.headers || {})
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
}

/**
 * Fetches an image from a URL and returns it as a base64 string
 * @param {string} url - The URL of the image
 * @returns {Promise<{data: string, mimeType: string}>} - Base64 encoded image and its MIME type
 */
export async function fetchImageAsBase64(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    
    return {
      data: `data:${mimeType};base64,${base64}`,
      mimeType
    };
  } catch (error) {
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
}

/**
 * Validates if a URL is accessible and returns its content type
 * @param {string} url - The URL to validate
 * @returns {Promise<{isValid: boolean, status: number, contentType: string, contentLength: number}>}
 */
export async function validateUrl(url) {
  try {
    const response = await axios.head(url, {
      maxRedirects: 5,
      validateStatus: () => true // Don't throw on non-200 status
    });
    
    return {
      isValid: response.status >= 200 && response.status < 400,
      status: response.status,
      contentType: response.headers['content-type'] || '',
      contentLength: parseInt(response.headers['content-length'] || '0', 10)
    };
  } catch (error) {
    return {
      isValid: false,
      status: 0,
      contentType: '',
      contentLength: 0,
      error: error.message
    };
  }
}

/**
 * Creates a temporary file with the given content
 * @param {Buffer|string} content - The file content
 * @param {string} [extension='.tmp'] - The file extension
 * @returns {Promise<{path: string, cleanup: Function}>} - Path to the temporary file and a cleanup function
 */
export async function createTempFile(content, extension = '.tmp') {
  const tempDir = path.join(__dirname, '../../temp');
  await mkdirAsync(tempDir, { recursive: true });
  
  const tempPath = path.join(tempDir, `${uuidv4()}${extension}`);
  await writeFileAsync(tempPath, content);
  
  return {
    path: tempPath,
    cleanup: async () => {
      try {
        if (fs.existsSync(tempPath)) {
          await unlinkAsync(tempPath);
        }
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
  };
}

/**
 * Resizes an image to the specified dimensions while maintaining aspect ratio
 * @param {string} inputPath - Path to the input image
 * @param {string} outputPath - Path to save the resized image
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} quality - Image quality (0-100)
 * @returns {Promise<void>}
 */
export async function resizeImage(inputPath, outputPath, maxWidth, maxHeight, quality = 85) {
  try {
    const sharp = await import('sharp');
    
    await sharp.default(inputPath)
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality })
      .toFile(outputPath);
      
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
}

/**
 * Generates a thumbnail for an image
 * @param {string} imagePath - Path to the source image
 * @param {string} outputDir - Directory to save the thumbnail
 * @param {number} [width=300] - Thumbnail width
 * @param {number} [height=200] - Thumbnail height
 * @returns {Promise<{path: string, width: number, height: number}>}
 */
export async function generateThumbnail(imagePath, outputDir, width = 300, height = 200) {
  try {
    await mkdirAsync(outputDir, { recursive: true });
    
    const ext = path.extname(imagePath);
    const filename = `${path.basename(imagePath, ext)}_thumb${ext}`;
    const outputPath = path.join(outputDir, filename);
    
    await resizeImage(imagePath, outputPath, width, height);
    
    return {
      path: outputPath,
      filename,
      width,
      height
    };
  } catch (error) {
    throw new Error(`Thumbnail generation failed: ${error.message}`);
  }
}

/**
 * Extracts metadata from an image file
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} - Image metadata
 */
export async function getImageMetadata(imagePath) {
  try {
    const sharp = await import('sharp');
    const metadata = await sharp.default(imagePath).metadata();
    
    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      size: fs.statSync(imagePath).size,
      hasAlpha: metadata.hasAlpha,
      hasProfile: metadata.hasProfile,
      isProgressive: metadata.isProgressive,
      space: metadata.space,
      channels: metadata.channels,
      density: metadata.density
    };
  } catch (error) {
    throw new Error(`Failed to extract image metadata: ${error.message}`);
  }
}
