angular.module("tictactoe", ['ngRoute', 'firebase'])
    .config(function ($routeProvider) {

        $routeProvider
            .when("/", { templateUrl: "views/login.html" })
            .when("/game", { templateUrl: "views/game.html" })
            .otherwise({redirectTo:'/'});
    })
    .controller("tic", tic)
    .controller("loginCtrl", loginCtrl)

gridSizeX = 1000;
gridSizeY = 1000;

icon_size = 100;


function loginCtrl($firebaseAuth, $location, $firebaseObject, $scope) {
    var login = this;
    var auth = $firebaseAuth();
    login.loginWithGoogle = function () {
        var promise = auth.$signInWithPopup("google")

        promise.then(function (result) {
            var leaderRef = firebase.database().ref("leaderboard/" + result.user.uid);
            var leaderboard = $firebaseObject(leaderRef);
            leaderboard.$loaded().then(function () {
                if (leaderboard.lat == null){
                    leaderboard.displayName = result.user.displayName;
                    // leaderboard.photoURL = result.user.photoURL;
                    leaderboard.photoURL = "#"+Math.floor(Math.random()*16777215).toString(16);
                    leaderboard.msg = "";
                    leaderboard.lat = -7500 + Math.floor(Math.random()*500);
                    leaderboard.lon = -250 + Math.floor(Math.random()*500);
                    leaderboard.dark = "dark";
                }
                var gX = Math.floor(leaderboard.lon/gridSizeX);
                var gY = Math.floor(leaderboard.lat/gridSizeY);
                leaderboard.gridId = gX + '_' + gY
                var gridRef = firebase.database().ref("grid/" + leaderboard.gridId +'/'+result.user.uid);
                grid = $firebaseObject(gridRef);

                grid.displayName = leaderboard.displayName;
                grid.photoURL = leaderboard.photoURL;
                grid.msg = leaderboard.msg;
                grid.lat = leaderboard.lat;
                grid.lon = leaderboard.lon;
                grid.dark = leaderboard.dark;

                grid.$save().then(function () {
                    leaderboard.$save().then(function () {
                        $location.path("/game");
                        console.log("working just fine");
                    });
                });

            });

        })
        .catch(function (error) {
            console.error("Authentication failed:", error);
        });
    }

    login.loginWithEmail = function () {
        displayname = document.getElementById('displayname').value
        email = document.getElementById('email').value
        password = document.getElementById('password').value
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function (result) {
            var leaderRef = firebase.database().ref("leaderboard/" + result.uid);
            var leaderboard = $firebaseObject(leaderRef);
            leaderboard.$loaded().then(function () {
                if (leaderboard.lat == null){
                    leaderboard.displayName = displayname;
                    // leaderboard.photoURL = result.user.photoURL;
                    leaderboard.photoURL = "#"+Math.floor(Math.random()*16777215).toString(16);
                    leaderboard.msg = "";
                    leaderboard.lat = -7500 + Math.floor(Math.random()*500);
                    leaderboard.lon = -250 + Math.floor(Math.random()*500);
                    leaderboard.dark = "dark";
                }
                var gX = Math.floor(leaderboard.lon/gridSizeX);
                var gY = Math.floor(leaderboard.lat/gridSizeY);
                leaderboard.gridId = gX + '_' + gY
                var gridRef = firebase.database().ref("grid/" + leaderboard.gridId +'/'+result.uid);
                grid = $firebaseObject(gridRef);

                grid.displayName = leaderboard.displayName;
                grid.photoURL = leaderboard.photoURL;
                grid.msg = leaderboard.msg;
                grid.lat = leaderboard.lat;
                grid.lon = leaderboard.lon;
                grid.dark = leaderboard.dark;

                grid.$save().then(function () {
                    leaderboard.$save().then(function () {
                        $location.path("/game");
                        console.log("working just fine");
                    });
                });

            });
        })
        .catch(function(error) {
            firebase.auth().signInWithEmailAndPassword(email, password).then(function (result) {
                var leaderRef = firebase.database().ref("leaderboard/" + result.uid);
                var leaderboard = $firebaseObject(leaderRef);
                leaderboard.$loaded().then(function () {
                    if (leaderboard.lat == null){
                        leaderboard.displayName = displayname;
                        // leaderboard.photoURL = result.user.photoURL;
                        leaderboard.photoURL = "#"+Math.floor(Math.random()*16777215).toString(16);
                        leaderboard.msg = "";
                        leaderboard.lat = -7500 + Math.floor(Math.random()*500);
                        leaderboard.lon = -250 + Math.floor(Math.random()*500);
                        leaderboard.dark = "dark";
                    }
                    var gX = Math.floor(leaderboard.lon/gridSizeX);
                    var gY = Math.floor(leaderboard.lat/gridSizeY);
                    leaderboard.gridId = gX + '_' + gY
                    var gridRef = firebase.database().ref("grid/" + leaderboard.gridId +'/'+result.uid);
                    grid = $firebaseObject(gridRef);

                    grid.displayName = leaderboard.displayName;
                    grid.photoURL = leaderboard.photoURL;
                    grid.msg = leaderboard.msg;
                    grid.lat = leaderboard.lat;
                    grid.lon = leaderboard.lon;
                    grid.dark = leaderboard.dark;

                    grid.$save().then(function () {
                        leaderboard.$save().then(function () {
                            $location.path("/game");
                            console.log("working just fine");
                        });
                    });

                });
            })
            .catch(function(error) {
                console.log(error)
            });
        });
    }
}


function tic($routeParams, $firebaseObject, $firebaseAuth,$location,$firebaseArray,$scope,$timeout) {
    var t = this;
    var auth = $firebaseAuth();
    auth.$onAuthStateChanged(function (user) {
        if (user) {
            t.user = user;
            leaderRef = firebase.database().ref("leaderboard/" + t.user.uid);
            t.leaderboard = $firebaseObject(leaderRef);
            t.leaderboard.$loaded().then(function () {
                gridRef = firebase.database().ref("grid/" + t.leaderboard.gridId + '/' + t.user.uid);
                t.grid = $firebaseObject(gridRef);
            });
        }
        else {
            $location.path("/");
        }
    })

    up = false; right = false; left = false; down = false;
    stopUp = false; stopRight = false; stopLeft = false; stopDown = false;

    gameloop = setInterval(update, 100);
    peeppoll = setInterval(pollPeeps, 1000);

    sceneUpdateTimeSeconds = 0.1*60.0

    longtemps();
    setInterval(longtemps, sceneUpdateTimeSeconds*1000);
    document.addEventListener("keydown",keyDownHandler, false);
    document.addEventListener("keyup",keyUpHandler, false);
    t.neighbors = []
    t.doubleCheck = []

    function keyDownHandler(event) {
        if (event.keyCode == '38') {
            up = true;
            stopUp = false;
        } else if (event.keyCode == '39') {
            right = true;
            stopRight = false;
        } else if (event.keyCode == '40') {
            down = true;
            stopDown = false;
        } else if (event.keyCode == '37') {
            left = true;
            stopLeft = false;
        }
    }

    function keyUpHandler(event) {
        if (event.keyCode == '38') {
            stopUp = true;
        } else if (event.keyCode == '39') {
            stopRight = true;
        } else if (event.keyCode == '40') {
            stopDown = true;
        } else if (event.keyCode == '37') {
            stopLeft = true;
        }
    }

    function update() {
        stepSize = 10
        if (up | right | down | left){
            if (up) {
                t.leaderboard.lat = t.leaderboard.lat + stepSize;
                if (stopUp){
                    up = false
                }
            }
            if (right){
                t.leaderboard.lon = t.leaderboard.lon - stepSize;
                if (stopRight){
                    right = false
                }
            }
            if (down){
                t.leaderboard.lat = t.leaderboard.lat - stepSize;
                if (stopDown){
                    down = false
                }
            }
            if (left){
                t.leaderboard.lon = t.leaderboard.lon + stepSize;
                if (stopLeft){
                    left = false
                }
            }
            t.leaderboard.$save()
            // svgElement.style.transform = "translate("+(t.leaderboard.lon-x)+"px, "+(t.leaderboard.lat-y)+"px)";
        }

        document.querySelectorAll('.neighbors').forEach(e => e.remove());

        var x = window.innerWidth / 2;
        var y = window.innerHeight / 2;

        for (var i = 0; i < t.neighbors.length; i++) {
            n = t.neighbors[i]
            elem = document.createElement("h5");
            elem.className = "neighbors "+n.dark
            elem.style.textAlign = "center"
            elem.style.position = "fixed"
            elem.style.top = (-n.lat + t.leaderboard.lat) + (y - icon_size/2) + "px"
            elem.style.left = (-n.lon + t.leaderboard.lon) + (x - icon_size/2) + "px"
            elem.innerHTML = n['innerHTML']
            document.body.appendChild(elem);
        }
        svgElement = document.getElementById('brcmap')
        svgElement.style.left = (-(svgElement.width/2)+t.leaderboard.lon+x)+'px';
        svgElement.style.top = (-(svgElement.height/2)+t.leaderboard.lat+y)+'px';
    }

    function pollPeeps() {
        led_check = document.getElementById('leds');
        if (led_check!=null){
            if (!t.night){
                led_check.checked = false;
            }
            leds = led_check.checked;
            if (leds && t.leaderboard.dark=='dark'){
                t.leaderboard.dark = 'led';
                t.grid.dark = 'led';
                t.leaderboard.$save();
                t.grid.$save();
            } else if (!leds && t.leaderboard.dark=='led'){
                t.leaderboard.dark = 'dark';
                t.grid.dark = 'dark';
                t.leaderboard.$save();
                t.grid.$save();
            }
        } else{
            t.leaderboard.dark = 'dark';
            t.grid.dark = 'dark';
            t.leaderboard.$save();
            t.grid.$save();
        }



        var gX = Math.floor(t.leaderboard.lon/gridSizeX);
        var gY = Math.floor(t.leaderboard.lat/gridSizeY);
        var gridId = gX + '_' + gY
        var msg = document.getElementById('message').value

        // update grid location
        if (t.leaderboard.gridId != gridId){
            firebase.database().ref("grid/" + t.leaderboard.gridId +'/'+t.user.uid).remove()
            t.doubleCheck.push(t.leaderboard.gridId)

            t.leaderboard.gridId = gridId;
            t.leaderboard.$save();

            var gridRef = firebase.database().ref("grid/" + gridId +'/'+t.user.uid);
            t.grid = $firebaseObject(gridRef);

            t.grid.displayName = t.leaderboard.displayName;
            t.grid.photoURL = t.leaderboard.photoURL;
            t.grid.msg = msg;
            t.grid.$save();
        }

        // double check that everything has been removed
        newDoubleCheck = []
        for (i=0; i < t.doubleCheck.length; i++){
            if (t.doubleCheck[i]!=t.leaderboard.gridId){
                var checkRef = firebase.database().ref("grid/" + t.doubleCheck[i] +'/'+t.user.uid);
                checkRef.on('value', function(snapshot) {
                   if (snapshot.exists()){
                      firebase.database().ref("grid/" + t.doubleCheck[i] +'/'+t.user.uid).remove();
                      newDoubleCheck.push(t.doubleCheck[i]);
                   }
                });
            }
        }
        t.doubleCheck = newDoubleCheck

        // update message
        if (msg != t.leaderboard.msg){
            t.leaderboard.msg = msg;
            t.leaderboard.$save();
            t.grid.msg = msg;
        }
        if (!t.night){
            t.dark = false;
        }

        t.grid.lat = t.leaderboard.lat;
        t.grid.lon = t.leaderboard.lon;
        t.grid.dark = t.leaderboard.dark;
        t.grid.$save();

        // find neighbors and add them to display list
        t.neighbors = [];
        var gX = Math.floor(t.leaderboard.lon/gridSizeX);
        var gY = Math.floor(t.leaderboard.lat/gridSizeY);
        for (ix=-1; ix<2; ix++){
            for (iy=-1; iy<2; iy++){
                gridId = (gX+ix)+'_'+(gY+iy)
                firebase.database().ref("grid/" + gridId).on('value', function(snap){
                    snap.forEach(function(childNode){
                        if (childNode.key != t.user.uid) {
                            displayObj = {};
                            displayObj.lat = childNode.val().lat;
                            displayObj.lon = childNode.val().lon;
                            displayObj.dark = childNode.val().dark;
                            // photo = '<img src="'+childNode.val().photoURL+'" alt="loading" class="img-circle image">'
                            circleColor = childNode.val().photoURL;
                            if (t.night && childNode.val().dark=='dark'){
                                circleColor = 'black';
                            }
                            photo = '<svg height="100" width="100"><circle cx="50" cy="50" r="40" stroke="'+circleColor+'" stroke-width="3" fill="'+circleColor+'" /></svg>'
                            displayObj.innerHTML = childNode.val().displayName+'<br/>'+photo+'<br/><span style="border-color: black; border-style: solid; border-width:thin;padding:0 2px;width:20px;">'+childNode.val().msg+'</span>';
                            t.neighbors.push(displayObj);
                        }
                    });
                });
            }
        }
    }

    // runs periodically
    function longtemps() {
        var envRef = firebase.database().ref("environment");
        var environment = $firebaseObject(envRef);
        environment.$loaded().then(function () {
            document.getElementById('whiteout').style.opacity = environment.opacity;
            environment.hour = environment.hour + 0.1;
            if (environment.hour > 24.0) {
                environment.hour = 0;
            }
            environment.$save();
            brcHour = environment.hour;
            // day
            var r0 = 252;
            var g0 = 249;
            var b0 = 242;
            // sunset
            var r1 = 237;
            var g1 = 147;
            var b1 = 82;
            // night
            var r2 = 10;
            var g2 = 0;
            var b2 = 0;

            if (brcHour < 4){
                var rt = r2;
                var gt = g2;
                var bt = b2;
                t.night = true;
            } else if (brcHour < 6) {
                var rt = r2 + (r0-r2)*(brcHour - 4)/2.0;
                var gt = g2 + (g0-g2)*(brcHour - 4)/2.0;
                var bt = b2 + (b0-b2)*(brcHour - 4)/2.0;
                t.night = false;
            } else if (brcHour < 18){
                var rt = r0;
                var gt = g0;
                var bt = b0;
                t.night = false;
            } else if (brcHour < 19) {
                var rt = r0 + (r1-r0)*(brcHour-18);
                var gt = g0 + (g1-g0)*(brcHour-18);
                var bt = b0 + (b1-b0)*(brcHour-18);
                t.night = false;
            } else if (brcHour < 20) {
                var rt = r1 + (r2-r1)*(brcHour-19);
                var gt = g1 + (g2-g1)*(brcHour-19);
                var bt = b1 + (b2-b1)*(brcHour-19);
                t.night = true;
            } else {
                var rt = r2;
                var gt = g2;
                var bt = b2;
                t.night = true;
            }
            document.body.style.backgroundColor = 'rgb(' + rt + ',' + gt + ',' + bt + ')';
        });
    }
}


