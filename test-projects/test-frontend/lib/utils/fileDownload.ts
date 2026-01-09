import JSZip from "jszip";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Download a single file directly to the user's machine via backend proxy
 */
export const downloadFile = async (fileId: number, filename: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/files/${fileId}/download`);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

/**
 * Download multiple files as a single ZIP archive via backend proxy
 */
export const downloadFilesAsZip = async (
  files: Array<{ fileId: number; filename: string }>,
  zipFilename: string = "files.zip"
): Promise<void> => {
  try {
    const zip = new JSZip();

    // Fetch all files via backend proxy and add them to the zip
    const filePromises = files.map(async (file) => {
      try {
        const response = await fetch(`${API_URL}/files/${file.fileId}/download`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${file.filename}`);
        }
        const blob = await response.blob();
        zip.file(file.filename, blob);
      } catch (error) {
        console.error(`Error adding ${file.filename} to zip:`, error);
        // Continue with other files even if one fails
      }
    });

    await Promise.all(filePromises);

    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Download the zip file
    const blobUrl = window.URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = zipFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error creating zip file:", error);
    throw error;
  }
};

