#Node.js 3D Printer App
#####This is the Node.js app we use at Redweb to print out objects described in GCODE.

###Usage
The app is pretty simple, just execute it and leave it running until completion. There is no point in the applications execution that will require user intervention.

In order to start the program you need to pass both the serial port you will be connecting to your printer on and the path (either relative or absolute) to the GCODE for the thing your printing.

```
node print.js --port "/dev/tty-blah-blah" --file "printFiles/helloWorld.gcode"
```

###Initial Setup
This app uses a few modules, (https://github.com/voodootikigod/node-serialport "Voodootikigod's Serialport library") for communicating with the printer and (https://github.com/substack/node-optimist "Substack's optimist") for argument parsing.

```
npm install
```

in the directory with the package.json file will install the modules needed for the app, then you're ready to go.

###Possible Arguments

Manadatory
+ --file "PATH/TO/PRINTFILE"
+ --port "SERIAL PORT FOR PRINTER CONNECTION. USUALLY /dev/tty.something"

Optional
+ --speed 1.0 - This is a multiplier that will modify the travel rate of the printhead. This is something we need for our printer.