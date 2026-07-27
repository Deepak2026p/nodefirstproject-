import { asyncHandler } from "../utils/asyncHandler.js";
import svgCaptcha from 'svg-captcha';
import { ApiResponse } from "../utils/ApiResponse.js";
import { saveCaptcha } from "../utils/captchaStore.js";
import { generateCaptchaAudio } from "../utils/generateCaptchaAudio.js";

const getCaptcha = asyncHandler(async (req, res) => {
    const captcha = svgCaptcha.create({
        size: 5,
        noise: 3,
        color: true,
        ignoreChars: "0oO1ilI",
        width: '150',
        height: '50',
    })

    const captchaId = await saveCaptcha(captcha.text);
    const audioBuffer = await generateCaptchaAudio(captcha.text);
    const audioBased64 = audioBuffer.toString("base64");

    return res.status(200).json(
        new ApiResponse(200, "captcha generate successfully", {
            captchaId,
            image: captcha.data,
            audio: `data:audio/wav;base64,${audioBase64}`,
        }),
    )
})

export { getCaptcha }