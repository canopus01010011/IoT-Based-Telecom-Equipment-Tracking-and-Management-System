import mqtt from 'mqtt';
import { mqttConfig } from '../config/mqttConfig.js';
import { GPSService } from '../services/gpsService.js';
import { emitGPSUpdate } from '../sockets/socketHandler.js';

let client: mqtt.MqttClient | null = null;

export const startMQTT = () => {
  const brokerUrl = mqttConfig.brokerUrl || `${mqttConfig.protocol}://${mqttConfig.host}:${mqttConfig.port}`;
  
  console.log(`📡 Connecting to MQTT broker: ${brokerUrl}`);
  
  const connectOptions: mqtt.IClientOptions = {
    clientId: mqttConfig.clientId,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
  };
  if (mqttConfig.username) connectOptions.username = mqttConfig.username;
  if (mqttConfig.password) connectOptions.password = mqttConfig.password;
  
  client = mqtt.connect(brokerUrl, connectOptions);

  client.on('connect', () => {
    console.log('✅ MQTT Connected to broker');
    
    // Subscribe to all GPS topics (format: ericsson/sites/+/+/gps)
    client?.subscribe('ericsson/sites/+/+/gps', { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Failed to subscribe to ericsson/sites/+/+/gps:', err);
      } else {
        console.log('✅ Subscribed to topic: ericsson/sites/+/+/gps');
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      
      // Extract device_id from topic (ericsson/sites/site_alger/package_001/gps -> package_001)
      const parts = topic.split('/');
      const deviceId = parts[3];
      
      if (!deviceId) {
        console.error('❌ Invalid topic format:', topic);
        return;
      }

      // Extract GPS coordinates (support both lat/lng and latitude/longitude)
      const lat = payload.lat ?? payload.latitude;
      const lng = payload.lng ?? payload.longitude;
      
      if (lat == null || lng == null) {
        console.error('❌ Invalid GPS data: missing lat/lng', payload);
        return;
      }

      console.log(`📡 GPS data from ${deviceId}: ${lat}, ${lng}`);

      // Save to database
      const result = await GPSService.saveGPSData({
        device_id: deviceId,
        lat: Number(lat),
        lng: Number(lng),
        speed: payload.speed,
        heading: payload.heading,
        battery: payload.battery,
        timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      });

      // Emit real-time update via Socket.IO
      if (result && result.gpsId) {
        emitGPSUpdate(result.gpsId, deviceId, result.lat, result.lng);
      }
      
    } catch (error) {
      console.error('❌ Error processing MQTT message:', error);
    }
  });

  client.on('error', (error) => {
    console.error('❌ MQTT Error:', error);
  });

  client.on('reconnect', () => {
    console.log('🔄 MQTT Reconnecting...');
  });

  client.on('offline', () => {
    console.warn('⚠️ MQTT Offline');
  });
};

export const stopMQTT = () => {
  if (client) {
    client.end();
    client = null;
    console.log('📡 MQTT disconnected');
  }
};
