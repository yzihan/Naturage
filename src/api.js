// const ipAddress = "127.0.0.1";
// const port = "8080";
// const baseUrl = "http://" + ipAddress + ":" + port + "/";

const baseUrl = 'https://4d9c9383.r2.cpolar.top/'

export const baseGetRequest = async (url) => {
    const res = await fetch(baseUrl + url, {
        method: "GET",
        mode: 'cors',
        headers: {
            'content-type': 'application/json',
        },
    });
    return res.json();
}

export const basePostRequest = async (url, data) => {
    const res = await fetch(baseUrl + url, {
        method: "POST",
        mode: 'cors',
        body: data,
    });
    return res.json();
}

export const fetchImageSegmentationResult = async (data) => {
    return await basePostRequest("image_segmentation", data);
}
