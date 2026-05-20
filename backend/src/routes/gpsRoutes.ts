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

export default router;
