import cron from 'node-cron';
import { get_event_num, get_event} from '../Tour/tourAPI.js';
import db from '../db/eventDb.js';
import moment from 'moment-timezone';
import { getOrCreateAddress } from '../controllers/commentsController.js';

export async function sync_event()
{
    try{
    
        const cur_time = moment.tz('Asia/Seoul').format('YYYYMMDD');

        const total_event = await get_event_num(cur_time);

        const loop_num = Math.ceil(parseInt(total_event)/100);

        for(let pagenum =0; pagenum<loop_num; pagenum++)
        {
            try{
        
                const event_t = await get_event(cur_time, pagenum);

                for(const item of event_t) {
                    try{
                        
                        const {is_road, city_id, district_id, RoadOrDongId, address_id} = await getOrCreateAddress(item.mapy, item.mapx);

                        if(!is_road || !city_id || !district_id ||!RoadOrDongId || !address_id)
                        {
                            console.log("error: null");
                            continue;
                        }

                        let road_id = null, legal_dong_id = null;

                        if(is_road)
                            road_id= RoadOrDongId;
                        else
                            legal_dong_id = RoadOrDongId;


                        const [event_t] = await db.query(`
                            SELECT content_id, modifiedtime
                            FROM festivals
                            WHERE content_id=?`, [item.contentid]);

                        if(event_t.length!=0)  //먄약 해당 event가 있으면
                        {
                            if(event_t.modifiedtime!=item.modifiedtime)
                            {
                                await db.execute(`
                                    UPDATE festivals
                                    SET title=?, city_id=?, district_id=?, road_id=?, legal_dong_id=?, address_id=?, is_road=?, event_start_date=?,
                                    event_end_date=?, first_image=?, first_image2=?, mapx=?, mapy=?, createdtime=?, modifiedtime=?, telephone=?
                                    WHERE content_id=?, 
                                    [item.title, city_id, district_id, road_id, legal_dong_id, address_id, is_road, item.eventstartdate, item.eventenddate,
                                    item.firstimage, item.firstimage2, item.mapx, item.mapy, item.createdtime, item.modifiedtime, item.tel, item.contentid]`);

                                continue;
                            }
                        }

                        await db.execute(`
                            INSERT INTO festivals
                            (content_id, title, city_id, district_id, road_id, legal_dong_id, address_id, is_road, event_start_date, event_end_date, 
                            first_image, first_image2, mapx, mapy, createdtime, modifiedtime, telephone)
                            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                            [item.contentid, item.title, city_id, district_id, road_id, legal_dong_id, address_id, is_road, item.eventstartdate, item.eventenddate,
                                item.firstimage, item.firstimage2, item.mapx, item.mapy, item.createdtime, item.modifiedtime, item.tel]);

                    } catch(err) {
                        console.error("error in const item of event_t \n", err);
                    }
                }

            } catch(err) {
                
                console.error("error: get_event error \n", err);
            }
        }

    } catch (err) {
        console.error("error in sync func\n", err);
        return;
    }
}


export async function __init_eventdbsync()
{
    try{
    
        const [res] = await db.query(`
            SELECT * FROM festivals`);

        if(res.length==0)
            await sync_event();

        cron.schedule('0 0,12 * * *', async ()=>{
            await sync_event();
        });
    } catch(err) {
        console.log("init error: ", err);
        return;
    }
}