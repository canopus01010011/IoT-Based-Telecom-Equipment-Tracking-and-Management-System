import app from './app.js';
import { createServer } from 'http';
import sequelize from './config/database.js';
import { initializeSocket } from './sockets/socketHandler.js';
import { startMQTT } from './mqtt/mqttBridge.js';
import { mqttConfig } from './config/mqttConfig.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize Socket.IO
    initializeSocket(httpServer);
    
    // Start MQTT Bridge
    startMQTT();

    // Sync database
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');
    
    // Start server
    httpServer.listen(PORT, () => {
      const mqttBroker = mqttConfig.brokerUrl || `${mqttConfig.host}:${mqttConfig.port}`;
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 EquipTrack Backend -         Running               ║
║                                                          ║
║   📍 Server: http://localhost:${PORT}                   ║
║   💚 Health: http://localhost:${PORT}/health            ║
║   🔌 Socket.IO: Active                                  ║
║   📡 MQTT Bridge: Connected to ${mqttBroker}
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
