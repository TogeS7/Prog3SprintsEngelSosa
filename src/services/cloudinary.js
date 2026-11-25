const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function uploadReceipt(uri) {
  return new Promise((resolve, reject) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      reject(new Error('Faltan las variables de entorno de Cloudinary.'));
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    });
    formData.append('upload_preset', UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve(data.secure_url);
        } else {
          reject(
            new Error(
              data.error?.message || 'No se pudo subir el comprobante a Cloudinary.'
            )
          );
        }
      } catch {
        reject(new Error('Respuesta inválida del servidor de Cloudinary.'));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Error de red al subir el comprobante a Cloudinary.'));
    };

    xhr.send(formData);
  });
}

export function getReceiptThumbnail(url, width = 200) {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/w_${width},q_auto/`);
}