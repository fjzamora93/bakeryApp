const fs = require('fs');
const axios = require('axios');


const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            throw (err);
        }
    });
}

exports.deleteFile = deleteFile;


const uploadImageToImgur = async (imagePath) => {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = Buffer.from(imageData).toString('base64');
    const response = await axios.post('https://api.imgur.com/3/image', {
        image: base64Image,
        type: 'base64'
    }, {
        headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
        }
    });
    fs.unlinkSync(imagePath); // Elimina la imagen temporal
    return response.data.data.link;
};

exports.uploadImageToImgur = uploadImageToImgur;