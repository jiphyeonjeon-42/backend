import { Request, Response } from 'express';
import * as status from 'http-status';
import * as slack from './slack.service';

export const updateSlackList = async (req: Request, res: Response) : Promise<void> => {
  try {
    await slack.updateSlackId();
    res.status(204).send();
  } catch (error: any) {
    const errorNumber = parseInt(error.message, 10);
    if (errorNumber >= 400 && errorNumber < 500) {
      next(new ErrorResponse(error.message, status.BAD_REQUEST));
    } else if (error.message === 'DB error') {
      next(new ErrorResponse(errorCode.queryExecutionFailed, status.INTERNAL_SERVER_ERROR));
    } else {
      logger.error(error.message);
      next(new ErrorResponse(errorCode.unknownError, status.INTERNAL_SERVER_ERROR));
    }
  }
};
