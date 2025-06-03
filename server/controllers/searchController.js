import db from '../db/appDb.js';
import appdb from '../db/userDb.js';

export async function search(req, res){
 
    try{

        

    } catch(err){
        
        console.error("error: ", err);
        res.status(501).json({
            error: err
        });

        return;
    }
}