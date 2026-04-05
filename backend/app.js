const express = require('express');
const cors = require('cors');   //cors allows other types of requests to talk (tells browser that this frontend can talk to backend)
const helmet = require('helmet');   //add security headers to responses
const rateLimit = require('express-rate-limit');    //limits requests
const swaggerUi = require('swagger-ui-express');    //for interactive api docs
const YAML = require('yamljs'); //reads .yaml
const path = require('path');   //helps build file paths

//Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const vehicleRoutes = require('./routes/vehicles');
const rentalRoutes = require('./routes/rentals');
const rideRoutes = require('./routes/rides');
const carpoolRoutes = require('./routes/carpools');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const rideRequestRoutes = require('./routes/rideRequests');
const driverRoutes = require('./routes/drivers');
const analyticsRoutes = require('./routes/analytics');

const app = express();

//global middlewere(ye run krta on every request before it reaches routes)
app.use(helmet());
app.use(cors());
app.use(express.json());    //standard format
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//rate limiting : 200 requests per 15 min per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
//appolied on routes starting with /api
app.use('/api/', limiter);



//swagger docs setup
const swaggerDoc = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
    customCss: '.swagger-ui.topbar { display: none }',
    customSiteTitle: 'Swagger API Docs',
}));


//API routes (v1 used for versioning, so doesnt break old clients if future changes occur)
//eg: any request with /api/v1/routes is routed to authRoutes to handle
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/rentals', rentalRoutes);
app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/carpools', carpoolRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/ride-requests', rideRequestRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/analytics', analyticsRoutes);


app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

//agr oper koi route na chala then this runs
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});


//special 4 params
//explanation:
//When any controller calls next(err),Express skips all normal middleware and jumps here
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});

module.exports = app;
