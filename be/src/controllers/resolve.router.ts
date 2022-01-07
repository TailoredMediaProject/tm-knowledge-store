// @ts-ignore
import {Request, Response, Router} from 'express';

const router: Router = Router();

router.get('/resolve', (req: Request, res: Response) => {
  res.json({ statusCode: 200 });
});

export default router;
