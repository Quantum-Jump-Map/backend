import cron from 'node-cron';
import { get_event_num, get_event} from '../Tour/tourAPI.js';
import {get_db_pool} from '../db/eventDb.js';
import moment from 'moment-timezone';
import { getOrCreateAddress } from '../controllers/commentsController.js';

export async function sync_event()
{
    try{
    
        const db = await get_db_pool();

        const cur_time = moment.tz('Asia/Seoul').format('YYYYMMDD');

        const total_event = await get_event_num(cur_time);

        const loop_num = Math.ceil(parseInt(total_event)/100);

        let loop_count = 0;
        let no_coords = 0;

        for(let pagenum =1; pagenum<=loop_num; pagenum++)
        {
            try{
        
                const event_t = await get_event(cur_time, pagenum);

                for(const item of event_t) {
                    try{
                        
                        if(item.mapx==null || item.mapy==null)
                        {
                            no_coords++;
                        }

                        const {is_road, city_id, district_id, RoadOrDongId, address_id} = await getOrCreateAddress(item.mapy, item.mapx);

                        if(!city_id || !district_id ||!RoadOrDongId || !address_id || is_road==null)
                        {
                            console.log("error: null");
                            console.log(is_road);
                            console.log(city_id);
                            console.log(district_id);
                            console.log(RoadOrDongId);
                            console.log(address_id);
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
                            
                            if(event_t[0].modifiedtime!=item.modifiedtime)
                            {
                                await db.execute(`
                                    UPDATE festivals
                                    SET title=?, city_id=?, district_id=?, road_id=?, legal_dong_id=?, address_id=?, is_road=?, event_start_date=?,
                                    event_end_date=?, first_image=?, first_image2=?, mapx=?, mapy=?, createdtime=?, modifiedtime=?, telephone=?
                                    WHERE content_id=?`,
                                    [item.title, city_id, district_id, road_id, legal_dong_id, address_id, is_road, item.eventstartdate, item.eventenddate,
                                    item.firstimage, item.firstimage2, item.mapx, item.mapy, item.createdtime, item.modifiedtime, item.tel, item.contentid]);
                            }

                            loop_count++;
                            continue;
                        }

                        await db.execute(`
                            INSERT INTO festivals
                            (content_id, title, city_id, district_id, road_id, legal_dong_id, address_id, is_road, event_start_date, event_end_date, 
                            first_image, first_image2, mapx, mapy, createdtime, modifiedtime, telephone)
                            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                            [item.contentid, item.title, city_id, district_id, road_id, legal_dong_id, address_id, is_road, item.eventstartdate, item.eventenddate,
                                item.firstimage, item.firstimage2, item.mapx, item.mapy, item.createdtime, item.modifiedtime, item.tel]);

                        loop_count++;

                    } catch(err) {
                        console.error("error in const item of event_t \n", err);
                    }
                }

            } catch(err) {
                
                console.error("error: get_event error \n", err);
            }
        }

        console.log("insert_count: ", loop_count);
        console.log("no coords count: ", no_coords);
        console.log("total event: ", total_event);

    } catch (err) {
        console.error("error in sync func\n", err);
        return;
    }
}


export async function __init_eventdbsync()
{
    try{

        await sync_event();

        cron.schedule('0 0,12 * * *', async ()=>{
            await sync_event();
        });
    } catch(err) {
        console.log("init error: ", err);
        return;
    }
}