require('dotenv').config();

//imprt express app
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3000;

(async () => {
    //verifying if database is available and running
    await testConnection();

    app.listen(PORT, () => {
        console.log(`API running on  http://localhost:${PORT}`);
        console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
    });
})();
