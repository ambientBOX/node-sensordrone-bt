# Sensordrone Node.js API Using Bluetooth 2.1
> node-sensordrone-bt

An API to the Sensorcon Sensordrone that communicates over paired Bluetooth 2.1.

This was created as a complete seperation from the node-sensordrone library as the BLE protocol hangs when working with all the sensors on the sensordrone in a tight loop. This library uses the more robust serial over Bluetooth 2.1 protocol to allow for these tight loops without hanging the sensordrone, making for a robust and touchless integration library.

## Based-off

* [SandeepMistry/Node-Sensordrone](https://github.com/sandeepmistry/node-sensordrone) Jumping 
* [Sensorcon/Sensordrone-Android-Java-Library](http://bitbucket.sensorcon.com/sensordrone-android-java-library)
* [Sensorcon/Sensordrone-iOS-Library](http://bitbucket.sensorcon.com/sensordrone-ios-library)

## Developing With this Library

This library is indended to help developers create desktop and small system utilities for connecting to and reading the Sensorcon Sensordrone (i.e. Connecting the sensordrone to a Beaglebone Black). 

This library works with Node.JS 0.8.x and up and has been tested with 0.8.23 and 0.10.24.

### Installing this Library

npm install sensordrone-bt

### Connecting a Sensordrone

_Note: You must connect to this bluetooth device as a serial paired device on linux this means pairing the device as an rfcomm device on OS X and Windows this means installing the USB to UART bridge driver from http://www.silabs.com/products/mcu/Pages/USBtoUARTBridgeVCPDrivers.aspx_

* Pair your sensordrone with your computer
* Add your serial port identifier to your configuration (i.e. on linux the port would be something like /dev/rfcomm0, or COMM35 on Windows)

### Testing Your Connection

* Connect your sensordrone to this computer
* Run ```SENSORDRONE_PORT=<sensordrone serial port> node test/test.js```

## LICENSE

The MIT License (MIT)

Copyright (c) 2014 AmbientBox

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.