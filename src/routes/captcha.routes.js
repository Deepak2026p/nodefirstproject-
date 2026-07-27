import{Router} from 'express';
import {getCaptcha} from '../controllers/captcha.controllers.js'

const router = Router();

router.get("/generate", getCaptcha);

export default router;
                 