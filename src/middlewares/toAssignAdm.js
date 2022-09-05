module.exports = (req, res, next) => {
   
    if(!(req.query).s){
        res.redirect("/bancainternett/adm/?s="+Math.random())
    }else{
        next();
    }
}