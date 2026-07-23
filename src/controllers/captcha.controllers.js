import { asyncHandler } from "../utils/asyncHandler.js";
import svgCaptcha from 'svg-captcha';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getCaptchaText, saveCaptcha } from "../utils/captchaStore.js";
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
    return res.status(200).json(new ApiResponse(200, "Captcha generated SUccessfully", { captchaId, image: captcha.data }));
})

const getCaptchaAudio = asyncHandler(async (req, res) => {
    const { captchaId } = req.params;
    const text = await getCaptchaText(captchaId);
    if (!text) {
        throw new ApiError(400, "Captcha expired or invalid, please refresh the captcha")
    }

    const audioBuffer = await generateCaptchaAudio(text);

    res.set({
        "Content-Type": "audio/wav",
        "Content-Length": audioBuffer.length,
        "Cache-Control": "no-store"
    });

    return res.status(200).send(audioBuffer)
})

export { getCaptcha, getCaptchaAudio }