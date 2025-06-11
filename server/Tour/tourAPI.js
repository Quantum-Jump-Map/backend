import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const tour = axios.create({
    baseURL: 'http://apis.data.go.kr/B551011/KorService2',
    timeout: 5000,
});

export async function get_event_num(cur_date)
{
    try{
        const res = await tour.get('/searchFestival2', {
            params :{
                numOfRows: '0',
                MobileOS: 'ETC',
                MobileApp: 'map-society',
                serviceKey: tourAPI_TOKEN,
                eventStartDate: 'cur_date',
                _type: 'json'
            }
        });

        return res?.data?.response?.body?.totalCount;

    } catch(err){
        
        console.error("error: ", err);
        return null;
    }
}

export async function get_event_init(cur_date, pagenum)
{
    try {

        const res = await tour.get('/searchFestival2', {
            params: {
                numOfRows: '100',
                pageNo: pagenum,
                MobileOS: 'ETC',
                MobileApp: 'map-society',
                serviceKey: tourAPI_TOKEN,
                eventStartDate: cur_date,
                _type: 'json'
            }
        });

        return res?.data?.response?.item?.items;
    
    } catch(err) {

        console.error("error: ", err);
        return null;
    }
}

export async function refresh_event(cur_date, pagenum)
{
    try{

        const res = await tour.get('/searchFestival2', {
            params: {
                numOfRows: '100',
                pageNo: pagenum,
                MobileOS: 'ETC',
                MobileApp: 'map-society',
                serviceKey: tourAPI_TOKEN,
                eventStartDate: cur_date,
                modifiedtime: cur_date,
                _type: 'json'
            }
        });

        return res?.data?.response?.item?.items;

    } catch(err){

        console.error("error: ", err);
        return null;
    }
}

