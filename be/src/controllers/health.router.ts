import {Request, Response, Router} from 'express';
import {instance as PersistenceService} from '../services/persistence.service';

const router: Router = Router();

router.get('/health', (req: Request, res: Response): void => {
  PersistenceService.pingDB()
    .then((healthCheck: boolean) => {
      if (healthCheck) {
        res.status(200).json({
          'status': 'OK', // or "ERROR"
          'details': {
            'mongodb': 'OK' // or "ERROR"
          }
        }
        );
      } else {
        res.status(500).json({
          'status': 'ERROR',
          'details': {
            'mongodb': 'ERROR'
          }
        });
      }
    })
    .catch((e: unknown) => res.status(500).json(e));
});

export default router;
