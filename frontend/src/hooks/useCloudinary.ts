import axios from "axios";
import { useState } from "react";

type CloudinaryUploadResult = {
  url: string;
  publicId: string;
};

export function useCloudinary() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    file: File,
    folder: string,
  ): Promise<CloudinaryUploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      );
      formData.append("folder", folder);

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
      );

      const data = response.data;

      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");

      return null;
    } finally {
      setUploading(false);
    }
  };
  const deleteImage = async (publicId: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch("/api/images", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete image";

      setError(message);

      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    error,
  };
}
