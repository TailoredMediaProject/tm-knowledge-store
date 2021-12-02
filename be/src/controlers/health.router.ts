import {Request, Response, Router} from 'express';
import PersistenceService from "../services/persistence-service";

const router: Router = Router();

router.get('/health', (req: Request, res: Response) => {
    console.log("HEALTH")
    if (new PersistenceService().pingDB()) {
    res.json({statusCode:200, greeting: "Hello World"});
    } else
res.status(500).json({statusCode:500, greeting: "Hello World"});

});

export default router;
