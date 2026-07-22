import{Router} from 'express';
import {getCaptcha, getCaptchaAudio} from '../controllers/captcha.controllers.js'

const router = Router();

router.get("/generate", getCaptcha);
router.get("/audio", getCaptchaAudio)

export default router;
                 