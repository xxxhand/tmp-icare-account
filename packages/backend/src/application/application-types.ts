import { Request, Response, NextFunction } from 'express';

interface IMulterFile {
	path: string;
	originalname: string;
	size: number;
	mimetype: string;
}

export interface ICustomExpressRequest extends Request {
	file: IMulterFile;
	files: Record<string, Array<IMulterFile>>;
};

export const handleExpressAsync = (fn: any) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);

