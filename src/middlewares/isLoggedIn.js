module.exports = (req, res, next) => {
    if(!(req.query).s){
        res.redirect("/bancainternett")
    }else{
        next();
    }
}