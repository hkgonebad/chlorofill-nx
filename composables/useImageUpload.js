import imageCompression from "browser-image-compression";
import { useSupabaseClient } from "#imports"; // Nuxt 3 auto-import

export function useImageUpload() {
  const supabase = useSupabaseClient();
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  /**
   * Compresses an image file and uploads it to Supabase Storage.
   *
   * @param {File} file - The image file to compress and upload.
   * @param {object} params - Parameters for uploading.
   * @param {string} params.bucketName - The Supabase Storage bucket name.
   * @param {string} params.filePath - The path within the bucket (e.g., 'user_id/category/').
   * @param {string} params.fileName - The desired name for the file in storage.
   * @param {object} [params.compressionOptions] - Options for browser-image-compression.
   * @param {string[]} [params.allowedTypes] - Array of allowed MIME types. Defaults to ["image/jpeg", "image/png", "image/webp"].
   * @returns {Promise<{ publicUrl: string | null, error: Error | null, path: string | null }>}
   */
  const compressAndUploadImage = async (file, { bucketName, filePath, fileName, compressionOptions, allowedTypes = ALLOWED_TYPES }) => {
    if (!file) {
      return { publicUrl: null, error: new Error("No file provided."), path: null };
    }
    if (!bucketName || !filePath || !fileName) {
      return { publicUrl: null, error: new Error("Bucket name, file path, and file name are required."), path: null };
    }

    if (!allowedTypes.includes(file.type)) {
      return { publicUrl: null, error: new Error(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}. Provided: ${file.type}`), path: null };
    }

    const defaultCompressionOptions = {
      maxSizeMB: 1, // Max file size in MB
      maxWidthOrHeight: 1920, // Max width or height
      useWebWorker: true,
      // Progress: (progress) => { console.log(`Compression progress: ${progress}%`); }, // Optional progress callback
    };

    const options = { ...defaultCompressionOptions, ...compressionOptions };

    try {
      console.log(`Original file name: ${file.name}, type: ${file.type}, size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      const compressedFile = await imageCompression(file, options);
      console.log(`Compressed file name: ${compressedFile.name}, type: ${compressedFile.type}, size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

      const fullStoragePath = `${filePath.replace(/\/$/, "")}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage.from(bucketName).upload(fullStoragePath, compressedFile, {
        cacheControl: "3600",
        upsert: true,
        // Supabase infers content type from file extension, but explicit can be good.
        // However, browser-image-compression might change the file type (e.g. to JPEG for compression)
        // So it's safer to let Supabase infer or ensure `compressedFile.type` is accurate if set manually.
        contentType: compressedFile.type,
      });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return { publicUrl: null, error: uploadError, path: null };
      }

      if (uploadData && uploadData.path) {
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fullStoragePath);

        if (urlData && urlData.publicUrl) {
          return { publicUrl: urlData.publicUrl, error: null, path: fullStoragePath };
        } else {
          console.error("Error fetching public URL, but upload seemed successful. Path:", fullStoragePath);
          return { publicUrl: null, error: new Error("Failed to retrieve public URL after upload."), path: fullStoragePath };
        }
      } else {
        console.error("Upload seemed successful but no path returned from Supabase.");
        return { publicUrl: null, error: new Error("Upload successful but no path returned."), path: null };
      }
    } catch (error) {
      console.error("Image compression or upload failed:", error);
      // Ensure the error message is passed through
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { publicUrl: null, error: new Error(`Compression/upload failed: ${errorMessage}`), path: null };
    }
  };

  return {
    compressAndUploadImage,
    ALLOWED_TYPES, // Expose for use in input accept attributes if needed
  };
}
