import {NextFunction, Request, Response, Router} from 'express';
import {UtilService} from '../services/util.service';
import {entityServiceInstance} from '../services/entity.service';
import {Entity} from '../models/dbo.models';
import {HEADER_CONTENT_TYPE, MIME_TYPE_TURTLE} from '../models/constants';
import {StatusCodes} from 'http-status-codes';
import {KnowledgeError} from '../models/knowledge-error.model';

const router: Router = Router();

router.get('/:eId', (req: Request, res: Response, next: NextFunction) => {
  const eId: string = UtilService.checkId(req?.params?.eId, 'entity', next);
  const accept = UtilService.checkAcceptHeader(req, [MIME_TYPE_TURTLE], next);

  entityServiceInstance.getEntityWithoutVocab(eId)
    .then((e: Entity) => {
      const rdf = UtilService.entityDbo2LinkedData(e, accept, next);

      if(!!rdf) {
        res.status(StatusCodes.OK)
          .setHeader(HEADER_CONTENT_TYPE, accept)
          .send(rdf);
      } else {
        next(new KnowledgeError(StatusCodes.INTERNAL_SERVER_ERROR, `Could not create RDF for the Content-Type ${accept}`))
      }
    })
    .catch(next);
});

export default router;
