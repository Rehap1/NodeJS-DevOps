const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = parseInt(process.env.PORT) || 3000;

const start = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 TaskAPI running on http://localhost:${PORT}`);
      console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health:  GET /health`);
      console.log(`   Metrics: GET /metrics`);
      console.log(`   Tasks:   GET /api/tasks`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
};

start();
