/** @format */

require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const xss = require("xss-clean");
const hpp = require("hpp");
const bodyParser = require("body-parser");
const rateLimit = "express-rate-limit";
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const fileUpload = require("express-fileupload");

const app = express();

const swaggerFile = require("../../swagger-output.json");
const v1routes = require("../routes/v1/v1");
const uploadController = require("../controllers/upload");

app.use(
    helmet({
        crossOriginEmbeddePolicy: false,
    })
);

app.use(helmet.crossOriginEmbedderPolicy({ policy: "cross-origin" }));

// & Allow Cross-Origin request

app.use(
    cors({
        origin: "*",
    })
);

// & limit request from the same API
const limiter = reteLimit({
    max: 150,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this api , please try again in an hour",
});

app.use("/api", limiter);

//& Data sanitization aganist Xss (clean user input from malicious html comd)
app.use(xss());

//&  Prevent prameter pollution
app.use(hpp());

// & regular middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

//& cookies and file upload
app.use(cookieParser());

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

// app.use('/images', express.static('public/images'))

//& morgan middleware to display logs on console of visited routes
app.use(morgan("dev"));

//& swagger ui documentation for api's
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

//& routes
app.use("/v1", v1routes);
app.use("v1/upload", uploadController);

app.use((err, _req, res, _next) => {
    console.log(err);

    const message = err.message ? err.message : "Server Error occurred";
    const status = err.status ? err.status : 500;
    res.status(status).json({
        message,
    });
});

module.exports = app;
