import axios from 'axios';

const KakaoAPI = axios.create({
    baseURL: 'https://dapi.kakao.com/v2/local',
    timeout: 5000,
    headers: {
        Authorization: `KakaoAK ${process.env.KakaoAK}`
    }
});

export async function CoordToAddress(lat, lng) {
    try {
        const res = await KakaoAPI.get('/geo/coord2address.json', {
            params: { x: lng, y: lat }
        });

        if (!res.data.documents.length)
            return null;
        
        

        return res.data.documents[0]?.road_address || null;

    } catch (err) {
        console.error("error", err);
        return null;
    }
}

export async function AddressToCoord(address) {
    try {
        const res = await KakaoAPI.get('/search/address.json', {
            params: { query: address }
        });

        if (!res.data.documents.length)
            return null;

        const document = res.data.documents[0];
        return {
            x: parseFloat(document.x),
            y: parseFloat(document.y)
        };

    } catch (err) {
        console.error("error", err);
        return null;
    }
}
