import { getRedisClient } from "../db/redisClient.js"

const TTL_SECONDS = 5 * 60;
const KEY_PREFIX = 'captcha';

const generateId = () => `cap_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

const saveCaptcha = async (text) => {
    const client = await getRedisClient();
    const id = generateId();
    await client.set(`${KEY_PREFIX}${id}`, text.toLowerCase(), { EX: TTL_SECONDS });
    return id
};

const getCaptchaText = async(id)=>{

    const client  = await getRedisClient();
    return client.get(`${KEY_PREFIX}${id}`)
};

const consumeCaptcha = async(id)=>{
    const client  = await getRedisClient();
    const key = `${KEY_PREFIX}${id}`
    const text = await client.get(key);
    if(text !== null){
        await client.del(key);
    }
    return text
}


export{saveCaptcha, getCaptchaText, consumeCaptcha}