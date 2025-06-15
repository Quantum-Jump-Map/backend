import cron from 'node-cron'
import { get_event_num, get_event_init, refresh_event } from '../Tour/tourAPI';
import db from '../db/eventDb';
import moment from 'moment-timezone';
import { getOrCreateAddress } from '../controllers/commentsController';

export async function sync_event()
{
    try{
    
        const cur_time = moment.tz('Asia.Seoul').format('YYYYMMDD');

        const total_event = await get_event_num(cur_time);

        const loop_num = Math.ceil(parseInt(total_event)/100);

        for(let pagenum =0; pagenum<loop_num; pagenum++)
        {
            try{
        
                const event_t = await get_event_init(cur_time, i);

                for(const item of event_t)
                {
                    try{
                    
                        const {is_road, city_id, district_id, RoadOrDongId, address_id} = await getOrCreateAddress(item.mapy, item.mapx);

                        if(!is_road || city_id || district_id ||RoadOrDongId || address_id)
                        {
                            console.log("error: null");
                            continue;
                        }

                        if(is_road)
                        {
                            await db.execute(`
                                INSERT INTO festivals
                                (content_id, title, city_id, district_id, road_id, address_id, is_road, event_start_date, event_end_date, 
                                first_image, first_image2, mapx, mapy, createdtime, modifiedtime, telephone)
                                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                                [item.contentid, item.title, city_id, district_id, RoadOrDongId, address_id, is_road, item.eventstartdate, item.eventenddate,
                                    item.firstimage, item.firstimage2, item.mapx, item.mapy, item.createdtime, item.modifiedtime, item.tel]);
                        }

                        else
                        {
                            await db.execute(`
                                INSERT INTO festivals
                                (content_id, title, city_id, district_id, legal_dong_id, address_id, is_road, event_start_date, event_end_date, 
                                first_image, first_image2, mapx, mapy, createdtime, modifiedtime, telephone)
                                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                                [item.contentid, item.title, city_id, district_id, RoadOrDongId, address_id, is_road, item.eventstartdate, item.eventenddate,
                                    item.firstimage, item.firstimage2, item.mapx, item.mapy, item.createdtime, item.modifiedtime, item.tel]);
                        }

                    } catch(err) {
                        console.error("error in const item of event_t \n", err);
                    }
                }

            } catch(err) {
                
                console.error("error: get_event_init error \n", err);
            }
        }

    } catch (err) {
        console.error("error in sync_event func\n", err);
        return;
    }
}



export async function __init_eventdbsync()
{
    try{
    
        const [res] = await db.query(`
            SELECT * FROM festivals`);

        if(res.length==0)
            sync_event();

        cron.schedule('0 0,12 * * *', ()=>{
            
        })
    } catch(err) {
        console.log("init error");
        return;
    }
}