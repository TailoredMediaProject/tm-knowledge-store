// @ts-ignore
import {Request, Response, Router} from 'express';

const router: Router = Router();

router.get('/vocab', async (req: Request, res: Response) => {
  res.json({statusCode:200});
});

router.post('/vocab', (req: Request, res: Response) => {
  res.json({statusCode:200});
});

router.put('/vocab/:id', (req: Request, res: Response) => {
  res.json({statusCode:200});
});

router.get('/vocab/:id', (req: Request, res: Response) => {
  res.json({statusCode:200});
});

router.delete('/vocab/:id', (req: Request, res: Response) => {
  res.json({statusCode:200});
});

router.get('/vocab/:id/entities', (req: Request, res: Response) => {
  res.json({statusCode:200});
});

router.post('/vocab/:id/entities', (req: Request, res: Response) => {
  res.json({statusCode:200});
});

router.get('/vocab/:id/entities/:id', (req: Request, res: Response) => {
  res.json({statusCode:200});
});

router.put('/vocab/:id/entities/:id', (req: Request, res: Response) => {
  res.json({statusCode:200});
});

router.delete('/vocab/:id/entities/:id', (req: Request, res: Response) => {
  res.json({statusCode:200});
});

export default router;
