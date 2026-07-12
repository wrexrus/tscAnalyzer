import express from 'express';
import { getAst } from '../Controllers/AstController.js';

const router = express.Router();

router.post('/', getAst);

export default router;
