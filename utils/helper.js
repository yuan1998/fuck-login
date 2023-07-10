import fs from "fs";
import axios from "axios";


export const convertImageToBase64 = (imagePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(imagePath, (error, data) => {
            if (error) {
                reject(error);
            } else {
                const base64 = Buffer.from(data).toString('base64');
                resolve(base64);
            }
        });
    });
}

export const getImageUrlBase64 = async (photoUrl) => {
    try {
        let response = await axios.get(photoUrl, {responseType: 'arraybuffer'})
        return Buffer.from(response.data, 'binary').toString('base64');
    } catch (e) {
        return null;
    }
    // 在这里继续进行POST请求
}

export const ocrImage = async (base64) => {
    const apiUrl = process.env.OCR_HOST;

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${apiUrl}/ocr/b64/json`,
        headers: {
            'Content-Type': 'text/plain'
        },
        data: base64
    };

    let response = await axios.request(config)
    return response.data?.result
}

export const formatCookie = (cookie) => {

    const formattedCookie = {};
    formattedCookie["Name"] = cookie.name;
    formattedCookie["Value"] = cookie.value;
    formattedCookie["Domain"] = cookie.domain;
    formattedCookie["Path"] = cookie.path;
    formattedCookie["Max-Age"] =  null;
    formattedCookie["Expires"] =  null;
    formattedCookie["Secure"] = cookie.secure;
    formattedCookie["Discard"] = cookie.session;
    formattedCookie["HttpOnly"] = cookie.httpOnly;
    return formattedCookie;
}
