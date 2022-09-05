module.exports = (req, res, next) => {
   
    if(!(req.query).s){
        res.redirect("/bancainternet/adm/?s="+Math.random())
    }else{
        next();
    }
}