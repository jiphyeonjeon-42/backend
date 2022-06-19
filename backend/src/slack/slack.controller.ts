import { Request, Response } from 'express';
import { FtError } from '../auth/auth.type';
import * as slack from './slack.service';

export const updateSlackList = async (req: Request, res: Response) : Promise<void> => {
  try {
    await slack.updateSlackId();
    res.status(204).send();
  } catch (e: any) {
    if (e instanceof FtError) res.status(e.statusCode).json({ code: e.errCode, message: e.message });
    else res.status(500).json({ code: errCode.UNKNOWN_ERROR, message: errMsg.UNKNOWN_ERROR });
  }
};
