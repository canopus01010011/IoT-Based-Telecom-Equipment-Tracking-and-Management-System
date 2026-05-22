import { Router } from 'express';
import { GPSController } from '../controllers/gpsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// IoT bridge ingestion endpoint. Secured only when IOT_API_TOKEN is configured.
router.post('/iot', GPSController.ingestIoTGPS);

// All GPS routes require authentication
router.use(authenticate);

// Get all equipment with live locations
router.get('/live', GPSController.getAllLiveLocations);

// Get GPS history for specific equipment
router.get('/equipment/:equipmentId/history', GPSController.getEquipmentHistory);

// Get live GPS location for a container
router.get('/container/:containerId/live', GPSController.getContainerLiveLocation);

// Get GPS history for a container
router.get('/container/:containerId/history', GPSController.getContainerHistory);

// Get planned route waypoints by route name (e.g., OS-Draria, OS-APN)
router.get('/route/:routeName', GPSController.getRoute);

export default router;
