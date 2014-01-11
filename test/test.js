/************************************************************************************
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 AmbientBox
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 ************************************************************************************
 * AmbientBOX Node.JS Sensordrone Bluetooth 2.1 Library
 * 
 * Library for interacting with a sensordrone over a bluetooth serial connection.
 * 
 * AmbientBOX (http://ambientbox.com) is in the process of creating an ambience 
 * analytics system for commercial spaces.
 * 
 * @author: Paul Ryan (paul@simplycomplex.co) for more information
 * @src: http://github.com/ambientBOX/node-sensordrone-bt
 * @issues: http://github.com/ambientBOX/node-sensordrone-bt/issues
 * 
 * Expected Output: 
 * -----------------------------------
 * Got a reading from the Sensordrone:
 * { temperature: 
 *    { celsius: 26.92794677734374,
 *      kelvin: 300.0779467773437,
 *      farenheit: 80.47030419921873 },
 *   humidity: 21.4,
 *   ppmCO: 0,
 *   oxidizing: 2940.3,
 *   reducing: 210091.2,
 *   light: 
 *    { red: 27.8,
 *      green: 28.5,
 *      blue: 19.3,
 *      clear: 57.9,
 *      lux: 21.8,
 *      temp: 4093.6 },
 *   pressure: 82524,
 *   altitude: 1698.241760875757,
 *   irTemperature: 
 *    { celsius: 23.394339615895205,
 *      kelvin: 296.5443396158952,
 *      farenheit: 74.10981130861137 },
 *   voltage: 2.522344322344322,
 *   capacitance: 2630.5250305250306 }
 ************************************************************************************/

 var async = require('async'),
	sensordrone = require('../src/bluetooth.js'),
	config = require('./config.js');

function flashLEDs(finalCallback){
	async.series([
		// Cycle Through the LEDs flashing Red then Blue then Green (each light will flash for 50ms)
		function(callback){
			sensordrone.setLeds(255, 0, 0, 255, 0, 0, callback);
		},
		function(callback){
			setTimeout(function(){
				sensordrone.setLeds(0, 255, 0, 0, 255, 0, callback);
			}, 50);
		},
		function(callback){
			setTimeout(function(){
				sensordrone.setLeds(0, 0, 255, 0, 0, 255, callback);
			}, 50);
		},
		function(callback){
			setTimeout(function(){
				sensordrone.setLeds(0, 0, 0, 0, 0, 0, function(){
					callback();
					finalCallback();
				});
			}, 50);
		}
	]);
}

function getReading(finalCallback) {
	var droneReading = {};
	async.series([
		function(callback){
			flashLEDs(callback);
		},

		// Read the Current Ambient Temprature
		function(callback){
			sensordrone.readAmbientTemperature(function(temperature) {
				droneReading.temperature = temperature;
				callback();
			});
		},
		function(callback){
			flashLEDs(callback);
		},

		// Read the Current Ambient Humidity
		function(callback){
			sensordrone.readHumidity(function(humidity) {
				droneReading.humidity = parseFloat(humidity.toFixed(1));
				callback();
			});
		},
		function(callback){
			flashLEDs(callback);
		},

		// Read the CO in PPM
		function(callback){
			sensordrone.readPrecisionGas(function(ppmCO) {
				droneReading.ppmCO = parseFloat(ppmCO.toFixed(1));
				callback();
			});
		},
		function(callback){
			flashLEDs(callback);
		},

		// Read the Current Oxidizing Gas in Ohms
		function(callback) {
			sensordrone.enableOxidizingGas(function() {
				callback();
			});
		},
		
		function(callback) {
			setTimeout(function() {
			  sensordrone.readOxidizingGas(function(ohms) {
				droneReading.oxidizing = parseFloat(ohms.toFixed(1));
				callback();
			  });
			}, 1000);
		},
		
		function(callback) {
			sensordrone.disableOxidizingGas(function() {
				 callback();
			});
		}, 
		function(callback){
			flashLEDs(callback);
		},

		// Read the Current Reducing Gas in Ohms
		function(callback) {
			sensordrone.enableReducingGas(function() {
				callback();
			});
		},	   
		function(callback) {
			setTimeout(function() {
				sensordrone.readReducingGas(function(ohms) {
					droneReading.reducing = parseFloat(ohms.toFixed(1));
					callback();
				});
			}, 1000);
		},

		function(callback) {
			sensordrone.disableReducingGas(function() {
				callback();
			});
		},
		function(callback){
			flashLEDs(callback);
		},

		// Read the Red, Green, Blue and Clear ambient levels and calculate the lux and color temprature
		function(callback) {
			sensordrone.enableRGBC(function() {
				callback();
			});
		},
		function(callback) {
			setTimeout(function() {
				sensordrone.readRGBC(function(red, green, blue, c, lux, temp) {
					droneReading.light = {};
					droneReading.light.red = parseFloat(red.toFixed(1));
					droneReading.light.green = parseFloat(green.toFixed(1));
					droneReading.light.blue = parseFloat(blue.toFixed(1));
					droneReading.light.clear = parseFloat(c.toFixed(1));
					droneReading.light.lux = parseFloat(lux.toFixed(1));
					droneReading.light.temp = parseFloat(temp.toFixed(1));
					callback();
				});
			}, 1000);
		},
		function(callback) {
			sensordrone.disableRGBC(function() {
				callback();
			});						
		},
		function(callback){
			flashLEDs(callback);
		},

		function(callback) {
			sensordrone.enablePressure(function() {
				callback();
			});
		},
		function(callback) {
			setTimeout(function() {
				sensordrone.readPressure(function(pressure) {
					droneReading.pressure = pressure;
					callback();
				});
			}, 1000);
		},
		function(callback) {
			sensordrone.disablePressure(function() {
				callback();
			});
		},
		function(callback){
			flashLEDs(callback);
		},

		function(callback) {
			sensordrone.enableAltitude(function() {
				callback();
			});
		},
		function(callback) {
			setTimeout(function() {
				sensordrone.readAltitude(function(altitude) {
					droneReading.altitude = altitude;
					callback();
				});
			}, 1000);
		},
		function(callback) {
			sensordrone.disableAltitude(function() {
				callback();
			});
		},
		function(callback){
			flashLEDs(callback);
		},
		function(callback) {
			sensordrone.enableIrTemperature(function() {
				callback();
			});
		},
		function(callback) {
			setTimeout(function() {
				sensordrone.readIrTemperature(function(temperature) {
					droneReading.irTemperature = temperature;
					callback();
				});
			}, 1000);
		},
		function(callback) {
			sensordrone.disableIrTemperature(function() {
				callback();
			});
		},
		function(callback){
			flashLEDs(callback);
		},
		function(callback) {
			sensordrone.readADC(function(voltage) {
				droneReading.voltage = voltage
				callback();
			});
		},
		function(callback){
			flashLEDs(callback);
		},
		function(callback) {
			sensordrone.enableCapacitance(function() {
				callback();
			});
		},
		function(callback) {
			setTimeout(function() {
				sensordrone.readCapacitance(function(capacitance) {
					droneReading.capacitance = capacitance;
				callback();
				});
			}, 1000);
		},
		function(callback) {
			sensordrone.disableCapacitance(function() {
				callback();
			});
		},
		function(callback){
			flashLEDs(callback);
		},

		function(callback){
			finalCallback(droneReading);
			callback();
		}
	]);
};

function readDrone(){
	getReading(function(reading){
		console.log('\n-----------------------------------');
		console.log('Got a reading from the Sensordrone:');
		console.dir(reading);
		readDrone();
	});
}

function shutdownGracefully(callback){
	try{
		sensordrone.disconnect(function(){
			callback();
		})				
	}
	catch(error){
		callback(error);
	}
}

console.log('\x1B[1m\x1B[32mTo Stop this Test press ctrl-c anytime\x1B[39m\x1B[22m\n');
console.log('******************************************');
console.log('AmbientBOX Node.JS Sensordrone Test\n');
console.log('AmbientBOX (http://ambientbox.com) is in the process of creating an ambience analytics system for commercial spaces');
console.log('Contact: \x1B[34mPaul Ryan (paul@simplycomplex.co)\x1B[39m for more information\n');
console.log('If this test Fails please report to http://github.com/ambientBOX/node-sensordrone-bt/issues');
console.log('******************************************\n');
console.log('Connecting to the sensordrone at port \x1B[35m' + config.serialPort + '\x1B[39m');

sensordrone.initialize(config.serialPort, function(){
	readDrone();
});

process.on( 'SIGINT', function() {
	shutdownGracefully(function(error){
		if(error){
			throw error;
		}
		console.log('Disconnected from Sensordrone.');
		process.exit(0);
	});
});
