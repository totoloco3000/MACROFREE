module.exports = (req, res, next) => {
   
    if(!(req.query).s){
        res.redirect("/adm/?s="+Math.random())
    }else{
        next();
    }
}