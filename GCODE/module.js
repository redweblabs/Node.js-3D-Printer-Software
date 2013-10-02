var settings = {
    extrusionMultiplier : 20,
    heightMulitplier : 1,
    speedMultiplier : 1
}

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


module.exports.settings = settings;
module.exports.deconstruct = deconstruct;
module.exports.reconstruct = reconstruct;