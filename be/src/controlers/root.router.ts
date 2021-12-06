// @ts-ignore
import {Request, Response, Router} from 'express';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send(`Up and running`);
});

export default router;
