import { spawn } from 'child_process'

const spellOut = (text) => text.split('').join("...");

const generateCaptchaAudio = () => {
    return new Promise((resolve, reject) => {
        const spoken = spellOut(text);

        const espeak = spawn("espeak-ng", [
            "-v", "en", "-s", "130", "--stdout", spoken,
        ]);

        const chunks = [];
        espeak.stdout.on("data", (chunk)=>{chunks.push(chunk)});
        espeak.stderr.on("data", ()=>{});
        espeak.on("error", (err)=>{
            reject(new Error(`Failed to spawn espeak': ${err.message}`));
        })

        espeak.on("close", (code)=>{
         if(code !== 0 && chunks.length === 0){
            return reject(new error (`espeak-ng exited with code ${code}`))
         }
         resolve(Buffer.concat(chuncks));
        })

    })
}

export {generateCaptchaAudio}