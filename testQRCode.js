function generateQR(replyToken) {
    const qrData = 'Your QR Code Data'; // Ensure this is a string
    console.log('QR Data:', qrData, 'Type:', typeof qrData);
    return QRCode.toDataURL(qrData)
        .then((url) => {
            console.log('Generated QR code URL:', url);
            const imageMessage = {
                type: 'image',
                originalContentUrl: url,
                previewImageUrl: url
            };
            return client.replyMessage(replyToken, imageMessage).then(response => {
                console.log('QR code reply message sent:', JSON.stringify(response, null, 2));
            }).catch(err => {
                console.error('Error sending QR code reply message:', err.message);
                console.error(err.stack);
            });
        })
        .catch((err) => {
            console.error('Failed to generate QR code:', err.message);
            console.error(err.stack);
            return client.replyMessage(replyToken, {
                type: 'text',
                text: 'Failed to generate QR code.'
            }).then(response => {
                console.log('Error message sent:', JSON.stringify(response, null, 2));
            }).catch(err => {
                console.error('Error sending error message:', err.message);
                console.error(err.stack);
            });
        });
}
