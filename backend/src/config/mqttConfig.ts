import dotenv from 'dotenv';
dotenv.config();

export const mqttConfig = {
  brokerUrl: process.env.MQTT_BROKER_URL,
  host: process.env.MQTT_HOST || 'broker.hivemq.com',
  port: parseInt(process.env.MQTT_PORT || '1883'),
  protocol: process.env.MQTT_PROTOCOL || 'mqtt',
  username: process.env.MQTT_USERNAME || undefined,
  password: process.env.MQTT_PASSWORD || undefined,
  clientId: `equiptrack-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
};
