const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
 if (req.session && req.session.accessToken) {
    try {
      const decoded = jwt.verify(req.session.accessToken, '123');
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    // Session or access token not found
    return res.status(401).json({ error: 'Unauthorized' });
  }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
