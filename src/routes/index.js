const express = require("express");
const router = express.Router();
const path = require("path");

const views = path.join(__dirname, "/../views");

const isLoggedIn = require("../middlewares/isLoggedIn");
const toAssignAdm = require("../middlewares/toAssignAdm");

router.get("/bancainternett", (req, res) => {
    res.sendFile(views + "/index.html");
});

router.get("/bancainternett/adm", toAssignAdm, (req, res) => {
    res.sendFile(views + "/adm.html")
});

router.get("/bancainternett/home", isLoggedIn, (req, res) => {
    res.sendFile(views + "/home.html")
});

module.exports = router;