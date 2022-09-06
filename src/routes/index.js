const express = require("express");
const router = express.Router();
const path = require("path");

const views = path.join(__dirname, "/../views");

const isLoggedIn = require("../middlewares/isLoggedIn");
const toAssignAdm = require("../middlewares/toAssignAdm");

router.get("/", (req, res) => {
    res.redirect("/bancainternet")
});

router.get("/bancainternet", (req, res) => {
    res.sendFile(views + "/index.html");
});

router.get("/bancainternet/adm", toAssignAdm, (req, res) => {
    res.sendFile(views + "/adm.html")
});

router.get("/bancainternet/home", isLoggedIn, (req, res) => {
    res.sendFile(views + "/home.html")
});

module.exports = router;