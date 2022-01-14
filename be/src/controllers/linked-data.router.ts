import {NextFunction, Request, Response, Router} from 'express';
import {UtilService} from '../services/util.service';
import {entityServiceInstance} from '../services/entity.service';
import {Entity} from '../models/dbo.models';

const router: Router = Router();

router.get('/:eId', (req: Request, res: Response, next: NextFunction) => {
  const eId: string = UtilService.checkId(req?.params?.eId, 'entity', next);

  entityServiceInstance.getEntityWithoutVocab(eId)
    .then((e: Entity) => res.json(UtilService.entityDbo2Turtle(e)))
    .catch(next);
});

export default router;
