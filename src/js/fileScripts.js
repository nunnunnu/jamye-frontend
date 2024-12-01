export function base64ToFile(base64String) {
    const byteString = atob(base64String.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }
    const mimeMatch = base64String.match(/data:(.*?);base64,/);
    var fileType = "png"
    if (mimeMatch && mimeMatch[1]) {
        fileType = mimeMatch[1].split('/')[1]; // "image/png" -> "png"
    }
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}` +
                      `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const randomString = Math.random().toString(36).substring(2, 7); // 랜덤 문자 5자리 생성;
    return new File([uint8Array], `${timestamp}_${randomString}.${fileType}`, { type: 'image/jpeg' }); // MIME 타입을 적절히 설정
}