import { createClient } from "redis";

let client; 

const getRedisClient = async()=>{
    if(client && client.isOpen) return client
    
    client = createClient({
        url: process.env.REDIS_URL || "redis: //localhost:6379"
    })

    client.on("error", (err)=>{
        console.log("[redis ] Client error:", err.message);
    })

    if(!client.isOpen){
        await client.connect();
        console.log("[redis] Connected")
    }
return client;

}

const closeRedis = async() =>{

    if(client && client.isOpen){
        await client.quit()
        client = undefined;
        console.log("[radis] Connection Closed");
    }
};

export {getRedisClient, closeRedis}