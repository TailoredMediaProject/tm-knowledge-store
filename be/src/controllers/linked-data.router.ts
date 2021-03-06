import {NextFunction, Request, Response, Router} from 'express';
import {UtilService} from '../services/util.service';
import {entityServiceInstance} from '../services/entity.service';
import {Entity} from '../models/dbo.models';
import {HEADER_CONTENT_TYPE, MIME_TYPE_N3, MIME_TYPE_RDF_XML, MIME_TYPE_TURTLE} from '../models/constants';
import {StatusCodes} from 'http-status-codes';
import {linkedDataServiceInstance} from '../services/linked-data.service';

const router: Router = Router();

router.get('/:eId', (req: Request, res: Response, next: NextFunction) => {
  const eId: string = UtilService.checkId(req?.params?.eId, 'entity', next);
  const accept = UtilService.checkAcceptHeader(req, [MIME_TYPE_TURTLE, MIME_TYPE_RDF_XML, MIME_TYPE_N3], next);

  entityServiceInstance.getEntityWithoutVocab(eId)
    .then((e: Entity) => {
      const rdf = linkedDataServiceInstance.entityDbo2LinkedData(e, accept);

      if(!!rdf) {
        res.status(StatusCodes.OK)
          .setHeader(HEADER_CONTENT_TYPE, accept)
          .send(rdf);
      }
    })
    .catch(next);
});

export default router;
