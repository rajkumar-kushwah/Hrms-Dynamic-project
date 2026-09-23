// utils/downloadFile.ts

/**
 * Triggers a browser download from a Blob (e.g. from an axios
 * response with responseType: "blob").
 */
export const downloadBlobAsFile = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
};