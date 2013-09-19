var serialport = require("serialport"),
    fs = require('fs'),
    keypress = require('keypress');

var printCommands = [],
    printPosition = 0;

var settings = {
    extrusionMultiplier : 20,
    heightMulitplier : 1,
    speedMultiplier : 1,
    printFile : undefined,
    serialPort : "/dev/tty.usbserial-AH00WXOD",
    printing : false,
    paused : false
}

//===========================================================
// Self executing function - Will run before the file load
// Usage: node [options] print.js [FILE PATH] [SPEED MULTIPLIER]
//===========================================================

var handleArguments = (function(){

    //The absolute or relative file path of the GCODE to be printed;
    if(process.argv[2] != undefined){
        settings.printFile = process.argv[2];
        console.log("Printing file: " + settings.printFile);
    } else {
        process.exit(1);
    }

    //Optional :: The multiplying factor that affects the travelling speed of the printhead
    if(process.argv[3] != undefined){
        settings.speedMultiplier = process.argv[3];
    }

})();

/*var keyEvents = (function(){

    keypress(process.stdin);
    console.log("Got here");

    process.stdin.on('keypress', function(ch, key){
        
        if(key.name === "space" && settings.printing === true){
            //printerCommand("M226")
            
            if(settings.paused === false){
                // printerCommand("M226");
                // process.stdin.pause();
                settings.paused = true;
            } else{
                // printerCommand("");
                settings.paused = false;
            }

        }

        if(key.name === "escape"){
            printerCommand("M112");
            process.exit(0);
        }

    });


    process.stdin.setRawMode(true);
    //process.stdin.resume();

})();*/

fs.readFile(settings.printFile, 'utf8', function (err,data) {

    if (err) {
        return console.log(err);
    }

    printCommands = GCODE.deconstruct(data);

});

var GCODE = (function(){

    function deconstruct(code){

        var printData;

        printData = code.split('\n');

        var newData = [];

        var cS = 0;

        while(cS < printData.length){

            var thisLine = printData[cS].split(";")[0].split(' ');

            if(thisLine.length > 1){
                var lL = 1;

                var printObject = {};
                printObject.commandCode = thisLine[0];
                printObject.other = []


                while(lL < thisLine.length){

                    if(thisLine[lL].indexOf('E') != -1){
                        var tempChunk = parseFloat(thisLine[lL].slice(thisLine[lL].indexOf('E')).split('E')[1], 10);
        
                        if(tempChunk < 4){
                            tempChunk = 4;
                        }
                        printObject.extrusion = tempChunk;

                    } else if(thisLine[lL].indexOf('X') != -1){
                        var xChunk = parseFloat(thisLine[lL].slice(thisLine[lL].indexOf('X')).split('X')[1], 10);

                        printObject.x = xChunk;
                    } else if(thisLine[lL].indexOf('Y') != -1){
                        var yChunk = parseFloat(thisLine[lL].slice(thisLine[lL].indexOf('Y')).split('Y')[1], 10);

                        printObject.y = yChunk;
                    } else if(thisLine[lL].indexOf('Z') != -1){
                        var zChunk = parseFloat(thisLine[lL].slice(thisLine[lL].indexOf('Z')).split('Z')[1], 10);

                        printObject.z = zChunk;
                    } else if(thisLine[lL].indexOf('F') != -1){
                        var fChunk = parseFloat(thisLine[lL].slice(thisLine[lL].indexOf('F')).split('F')[1], 10);

                        printObject.feed = fChunk;
                    } else {

                        if(thisLine[lL] !== " " && thisLine[lL] !== ""){
                            printObject.other.push(thisLine[lL]);
                        }

                    }

                    lL += 1;
                }

                newData.push(printObject);

            }

            cS += 1;

        }

        return newData;

    }

    function reconstruct(command){

        var commands = [];

        if(command === undefined){
            return;
        }

        commands.push(command.commandCode);

        if(command.x){
            commands.push("X" + command.x);
        }

        if(command.y){
            commands.push("Y" + command.y);
        }

        if(command.z){
            commands.push("Z" + command.z * settings.heightMulitplier);
        }

        if(command.feed){
            commands.push("F" + command.feed * settings.speedMultiplier);
        }

        if(command.extrusion){
            
            if(command.extrusion > 0){
                commands.push("E" + command.extrusion * settings.extrusionMultiplier)
            } else {
                commands.push("E5");
            }
        }

        if(command.other){
            commands.push(command.other.join(" "));
        }

        commands = commands.join(' ');

        return commands;

    }

    return{
        deconstruct : deconstruct,
        reconstruct : reconstruct
    };

})();

var SerialPort = serialport.SerialPort;
var sp = new SerialPort(settings.serialPort, { 
    parser: serialport.parsers.readline("\n"),
    baudrate : 19200
});

sp.on("open", function () {
    console.log("Serial Port " + settings.serialPort + " is open.");
    
    printPosition = 0;

    sp.on('data', function(data) {

        if(data.indexOf("ok") != -1 || data == "start\r"){
            
            setTimeout(function(){
                if(settings.paused !== true){
                    printerCommand(GCODE.reconstruct(printCommands[printPosition]));
                }
            },50);
            
        } else {
            console.log("Nope")
        }

    });

});


function printerCommand(comm){

    if(comm !== undefined && comm.indexOf(" ") === comm.length - 1){
        console.log(comm.slice(comm.length - 1, comm.length));
        comm = comm.substring(0, comm.length - 1);
    
    }

    console.log((printPosition + 1) + " / " + printCommands.length + ": " + comm);

    sp.write(comm + "\n", function(err, results) {

        if(err){
            console.log(">>>ERR");
            console.log(err);
            console.log("<<<");
        }

        if(comm !== "M105"){
            printPosition += 1;
        }

    });

}

process.on('exit', function() {
    console.log("Issuing Stop Command");
    printerCommand("M112");    

});