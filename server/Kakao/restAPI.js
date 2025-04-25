import axios from 'axios';

const KakaoAPI = axios.create(
    {
        baseURL: 'https://dapi.kakao.com/v2/local',
        timeout: 5000,
        headers: {
            Authorization: `KakaoAK ${KakaoAK}`
        }
    }
);

export async function CoordToAddress(lat, lng)
{
    try{
        const res = await KakaoAPI.get('/geo/coord2address.json', {
            params: {
                x: lat,
                y: lng
            }
        });

        const documents = res.data.documents[0];
        
        if(documents.length==0)
            return null;
    
        return documents.road_address;

    } catch(err) {
        console.error("error", err);
        return null;
    }
}

export async function AddressToCoord(address)
{
    try{
        const res = await KakaoAPI.get('/search/address.json', {
            params: {
                query: address
            }
        });

        const documents = res.data.documents[0];
        
        if(documents.length==0)
            return null;
    
        return {
            x: parseFloat(documents.x),
            y: parseFloat(documents.y)
        };

    } catch(err) {
        console.error("error", err);
        return null;
    }
}