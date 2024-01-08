import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import helmet from "helmet";

import session from 'express-session';
const SQLiteStore = require('connect-sqlite3')(session);

const PROD = process.env.NODE_ENV === 'production';
const sessionConfig = {
  store: new SQLiteStore({
    //   dir: 'path/to/store/directory', // Optional, default is current directory
    db: 'database.db',             // Optional, default is 'sessions'
    // ...other options
  }),
  name: 'session_id',              // Custom cookie name
  secret: process.env.EXPRESS_SESSION_KEY,       // Secret key to sign the session ID cookie
  resave: false,                   // Avoid resaving sessions that haven't changed
  saveUninitialized: false,        // Don't save uninitialized sessions
  cookie: {
    httpOnly: true,                // Prevents client-side JS from reading the cookie 
    secure: !!PROD ? true : false,                 // Ensures cookie is only used over HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000,   // Cookie expiration time in milliseconds (e.g., 24 hours)
    sameSite: 'strict',         // Optional, CSRF protection
  }
};

// Import route handlers
// import userRoutes from './src/routes/userRoutes';
// import homeRoutes from './src/routes/homeRoutes';
import apiRoutes from './src/routes/apiRoutes';
// More route imports...

// Initialize Express app
const app = express();
app.use(helmet());
// Database connection (if needed here)
// const db = require('./src/utils/db');


// Heartbeat route
app.get('/ping', (_req, res) => {
  res.send('pong');
})

app.use((req,res,next)=>{
  //log the route
  console.log(req.method, req.url)
  next()
})
// Setup middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join('./', 'public')));


app.use(session(sessionConfig));

// Setup view engine
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'html');


// Define routes
// app.use('/', homeRoutes);
// app.use('/users', userRoutes);
app.use('/api', apiRoutes);
// More routes...

// Catch 404 and forward to error handler
app.use((_req, res) => {
  res.status(404).send('Page not found');
});

// Error handling middleware
app.use((error: string, _req: express.Request, res: express.Response) => {
  console.error(error);
  //Add logging here
  res.status(500).send('Internal Server Error');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;


