import JSZip from "jszip";

/**
 * Download a single file directly to the user's machine
 */
export const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
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
 * Download multiple files as a single ZIP archive
 */
export const downloadFilesAsZip = async (
  files: Array<{ url: string; filename: string }>,
  zipFilename: string = "files.zip"
): Promise<void> => {
  try {
    const zip = new JSZip();

    // Fetch all files and add them to the zip
    const filePromises = files.map(async (file) => {
      try {
        const response = await fetch(file.url);
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

/**
 * Get download URL from the backend
 */
export const getDownloadUrl = async (
  fileId: number,
  apiUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
): Promise<string> => {
  const response = await fetch(`${apiUrl}/files/${fileId}/download-url`);
  if (!response.ok) {
    throw new Error(`Failed to get download URL: ${response.statusText}`);
  }
  const data = await response.json();
  return data.url;
};
