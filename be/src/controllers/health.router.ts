import {Request, Response, Router} from 'express';
import {instance as PersistenceService} from '../services/persistence.service';
import {StatusCodes} from 'http-status-codes';

const router: Router = Router();

router.get('/health', (req: Request, res: Response): void => {
  PersistenceService.pingDB()
    .then((healthCheck: boolean) => {
      if (healthCheck) {
        res.status(StatusCodes.OK).json({
          'status': 'OK', // or "ERROR"
          'details': {
            'mongodb': 'OK' // or "ERROR"
          }
        }
        );
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          'status': 'ERROR',
          'details': {
            'mongodb': 'ERROR'
          }
        });
      }
    })
    .catch((e: unknown) => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e));
});

export default router;
