// Load environment variables
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
  
// Import modules and configurations
const express = require('express');
const Experiment = require('./public/scripts/experiment.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { Storage } = require('@google-cloud/storage');
const crypto = require('crypto');
const participantDetailsRoutes = require("./routes/participantDetailsRoutes.js");
const informationRoutes = require("./routes/informationRoutes.js");
const scalesRoutes = require("./routes/scalesRoutes.js");
const trialRoutes = require("./routes/trialRoutes.js");
const dbServices = require("./services/dbServices.js");
const flaskServices = require("./services/flaskServices.js");
const cloudServices = require("./services/cloudServices.js");

  
const app = express();

console.log("views and static files setting up")
// Configure views
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");

// Static files
app.use("/public", express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/public")));

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());
app.use(methodOverride('_method'));

// services middleware
app.use((req, res, next) => {
    req.dbServices = dbServices;
    next();
});

app.use((req, res, next) => {
    req.flaskServices = flaskServices;
    next();
});



app.use((req, res, next) => {
    req.cloudServices = cloudServices;
    next();
})

console.log("setting up session config")
// Session Configuration
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false
    })
);

console.log("setting up routes")
// routes
app.use('/participant', participantDetailsRoutes);
app.use('/information', informationRoutes);
app.use('/scales', scalesRoutes);
app.use('/trial', trialRoutes);





app.get('/', (req, res) => {
    ("getting route view")
    res.render('information')
})

const port = process.env.PORT || 5050;

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;