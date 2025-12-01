import express from 'express'
import ChatController from '../Controllers/ChatController.js';

const router = express.Router();

router.post('/',ChatController);

export default router;