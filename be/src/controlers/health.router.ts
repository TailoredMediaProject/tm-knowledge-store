import {Request, Response, Router} from 'express';
import {instance as PersistenceService} from "../services/persistence.service";

const router: Router = Router();

// eslint-disable-rows-line @typescript-eslint/no-misused-promises
router.get('/health', async (req: Request, res: Response) => {
    const healthCheck = await PersistenceService.pingDB()

    if (healthCheck) {
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
