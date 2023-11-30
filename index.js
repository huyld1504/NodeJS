// import { format } from "date-fns";
const express = require('express');
const format = require("date-fns");
const path = require('path');
const cors = require('cors');
const PORT = process.env.PORT || 3500;
const { logger } = require('./middlewares/logEvent');
const  errorHandler  = require('./middlewares/errorHandler');

// const cookieParser = require('cookie-parser');
// const exp = require('constants');

const app = express();

/*
        Customize middleware logger
*/
app.use(logger);

//Cross Origin Resource Sharing
const whiteList = ["https://www.google.com", "http://127.0.0.1:5500", "http://localhost:3500"];
const corsOptions = {
        origin: (origin, callback) => {
                if (whiteList.indexOf(origin) !== -1) {
                        callback(null, true);
                } else {
                        callback(new Error('Not allowed by Cors'));
                }
        },
        optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

/*
        + Built-in middleware to handle urlencoded data
        + In other words, from data:  "content-type: application/x-www-form-urlencoded"
*/
app.use(express.urlencoded({ extended: false }));

/*
        Built-in middleware for json
*/
app.use(express.json());

/*
        serve static files
*/
app.use(express.static(path.join(__dirname, "/public")));

//This function is used for set time in reality situation.
const myApp = function (req, res, next) {
        console.log("Already set time!");
        req.myApp = Date.now();
        next();
}

/*
        Middleware functions are functions that have access to the request object (req), the response object (res), and the next function in the application’s request-response cycle. The next function is a function in the Express router which, when invoked, executes the middleware succeeding the current middleware.
*/
{/*
app.get('^/$|/index(.html)?', (req, res) => {
        let responseText = "Hello World! <br>";
        responseText += `<small>Requested at: <b>${format.format(req.myApp, "yyyy/MM/dd HH:mm:ss")}</b></small>`;
        res.send(responseText);
});
*/}

/*
        Router and Routing Handler in express JS 
*/
app.use(myApp);
app.get("^/$|/index(.html)?", (req, res, next) => {
        res.sendFile(path.join(__dirname, "views", "index.html"));
        let responseText = "";
        responseText += `<h1>The exact time at: ${format.format(req.myApp, "yyyy/MM/dd HH:mm:ss")}</h1>`;
        res.send(responseText);
});
app.get("/new-page(.html)?", (req, res) => {
        res.sendFile(path.join(__dirname, "views", "new-page.html"));
});

app.get("/old-page(.html)?", (req, res) => {
        res.redirect(301, "/new-page.html"); //302 by default
});

//Route handlers
app.get("/hello(.html)?", (req, res, next) => {
        console.log("attempted to load hello.html");
        next();
}, (req, res) => {
        res.send('Hello world!');
});

// app.use("/hello(.html)?", (req, res) => {
//         console.log("attempted to load hello.html");
//         res.send("hello World");
// })

app.get("/data(.json)?", (req, res, next) => {
        console.log("Data was sent successfully!!!");
        next();
}, (req, res) => {
        res.sendFile(path.join(__dirname, "data", "data.json"))
})

//Chaining route handler

const one = (req, res, next) => {
        console.log("one");
        next();
};

const two = (req, res, next) => {
        console.log("two");
        next();
};

const three = (req, res) => {
        console.log("three");
        res.send("Finish!");
};

app.get("/chain(html)?", [one, two, three]);

//404 Notfound if the path doesn't exist
app.all("*", (req, res) => {
        res.status(404).sendFile(path.join(__dirname, 'views', "404.html"));
});

/*
        Customize the middleware error Logger
*/
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
