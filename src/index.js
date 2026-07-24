const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = Number.parseInt(process.env.PORT, 10) || 3000;

const start = async () => {
  try {
    await testConnection();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TaskAPI listening on port ${PORT}`);
      console.log(`   ENV:     ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health:  GET /health`);
      console.log(`   Ready:   GET /ready`);
      console.log(`   Metrics: GET /metrics`);
      console.log(`   Tasks:   GET /api/tasks`);
    });

    server.on('error', (err) => {
      console.error('❌ Server error:', err.message);
      process.exit(1);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
};

start();