import {Request, Response, Router} from 'express';
import PersistenceService from "../services/persistence.service";

const router: Router = Router();

router.get('/health', async (req: Request, res: Response) => {
    const health_check = await PersistenceService.pingDB()

    if (health_check) {
        res.status(200).json({
                "status": "OK", // or "ERROR"
                "details": {
                    "mongodb": "OK" // or "ERROR"
                }
            }
        )
    } else {
        res.status(500).json({
            "status": "ERROR",
            "details": {
                "mongodb": "ERROR"
            }
        });
    }
});

export default router;
