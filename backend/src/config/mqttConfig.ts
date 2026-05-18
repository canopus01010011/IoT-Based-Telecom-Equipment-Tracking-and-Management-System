import dotenv from 'dotenv';
dotenv.config();

export const mqttConfig = {
  host: process.env.MQTT_HOST || 'broker.hivemq.com',
  port: parseInt(process.env.MQTT_PORT || '1883'),
  protocol: 'mqtt',
  clientId: `equiptrack-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
};