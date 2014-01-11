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
 ************************************************************************************/

var SerialPort = new require("serialport").SerialPort

var SensordroneBluetooth = function(){
	this._callbackQueue = [];
	this._isConnected = false;
	this._callAndResponse = function(bytes, callback){
		this._callbackQueue.push(callback);
		this._serialPort.write(new Buffer(bytes), function(error){
			if(error) {
				throw error;
			}
		});
	}
	this.ledColorRange = function(colorValue) {
	    if (colorValue > 255) {
	        return 255;
	    } else if (colorValue < 0) {
	        return 0;
	    }
	    return colorValue;
	}
}

SensordroneBluetooth.prototype.initialize = function(port, callback, rate){
	if(!rate){
		rate = 115200;
	}
	this._serialPort = new SerialPort(port, {
		baudrate: rate
	});

	var isConnected = false;
	this._serialPort.on('open', function(){
		this.connect(function(connected){
			if(connected){
				isConnected = true;
				this.readPrecisionGasCalibration(callback);
			}
		}.bind(this));
	}.bind(this));

	this._serialPort.on('data', function(data){
		var buffer = new Buffer(data);
		if (data[0] === 0x51) {
			var len = buffer[1];

			var queuedCallback = this._callbackQueue.shift();

			if(queuedCallback){
				queuedCallback(buffer.slice(2));
			}
		}
	}.bind(this));
}

SensordroneBluetooth.prototype._callAndResponse = function(bytes, callback){
	this_callbackQueue.push(callback);
	this._serialPort.write(new Buffer(bytes), function(error){
		if(error) {
			throw error;
		}
	});
}

SensordroneBluetooth.prototype.getHardwareAndFirmware = function(callback){
	var bytes = [0x50, 0x02, 0x33, 0x00];
	this._callAndResponse(bytes, function(data){
		callback(data);
	})
}


SensordroneBluetooth.prototype.initializeHardware = function(hwFw){
	if(hwFw.hwVersion === 1) {

	}
}

SensordroneBluetooth.prototype.connect = function(callback){
	this.getHardwareAndFirmware(function(hwFw){
		if(hwFw) {
			var hwCheck = this.initializeHardware(hwFw);
			callback(true);
		}
		callback(false);
	}.bind(this));	
}

SensordroneBluetooth.prototype.disconnect = function(callback){
	this._serialPort.close(function(error){
		if(error){
			throw error;
		}
		callback();
	});
}

SensordroneBluetooth.prototype.readBatteryVoltage = function(callback) {
  this._callAndResponse([0x50, 0x02, 0x22, 0x00], function(data) {
    var adc = data.readUInt16LE(1);
    var voltage = (adc / 4095.0) * 6.0;

    callback(voltage);
  });
};

SensordroneBluetooth.prototype.setLeds = function(leftRed, leftGreen, leftBlue, rightRed, rightGreen, rightBlue, callback) {
	leftRed = this.ledColorRange(leftRed);
	rightRed = this.ledColorRange(rightRed);
	leftGreen = this.ledColorRange(leftGreen);
	rightGreen = this.ledColorRange(rightGreen);
	leftBlue = this.ledColorRange(leftBlue);
	rightBlue = this.ledColorRange(rightBlue);

	this._callAndResponse([0x50, 0x08, 0x15, leftRed, leftGreen, leftBlue, rightRed, rightGreen, rightBlue, 0x00], function(){
		callback();
	});
};

SensordroneBluetooth.prototype.readAmbientTemperature = function(callback) {
  this._callAndResponse([0x50, 0x06, 0x10, 0x00, 0x40, 0xe3, 0x02, 0x00], function(data) {
	var adc = data.readUInt16BE(1) & 0xfffc;
	var celsius = -46.85 + 175.72 * (adc / Math.pow(2, 16));
	var temperature = {
		celsius: celsius,
		kelvin: celsius + 273.15,
		farenheit: (celsius * (9/5)) + 32
	}
	callback(temperature);
  });
};

SensordroneBluetooth.prototype.readHumidity = function(callback) {
  this._callAndResponse([0x50, 0x06, 0x10, 0x00, 0x40, 0xe5, 0x02, 0x00], function(data) {
	var adc = data.readUInt16BE(1) & 0xfffc;
	var humidity = -6.0 + 125.0 * (adc / 65536.0);
	callback(humidity);
  });
};

SensordroneBluetooth.prototype.enableRGBC = function(callback) {
	this._callAndResponse([0x50, 0x03, 0x35, 0x01, 0x00], function(data) {
		this._callAndResponse([0x50, 0x07, 0x11, 0x00, 0x39, 0x01, 0x80, 0x01, 0x00], function(data) {
			this._callAndResponse([0x50, 0x07, 0x11, 0x00, 0x39, 0x01, 0x81, 0x01, 0x00], function(data) {
				this._callAndResponse([0x50, 0x07, 0x11, 0x00, 0x39, 0x01, 0x80, 0x03, 0x00], function(data) {
					callback();
				});
			}.bind(this));
		}.bind(this));
	}.bind(this));
};

SensordroneBluetooth.prototype.disableRGBC = function(callback) {
	this._callAndResponse([0x50, 0x03, 0x35, 0x00, 0x00], function(data) {
		this._callAndResponse([0x50, 0x07, 0x11, 0x00, 0x39, 0x01, 0x80, 0x00, 0x00], function(data) {
			callback();
		});
	}.bind(this));
};

SensordroneBluetooth.prototype.checkRGBCStatus = function(callback) {
	this._callAndResponse([0x50, 0x03, 0x60, 0x01, 0x00], function(data){
		callback(data.readUInt16LE(0));
	});
}

SensordroneBluetooth.prototype.readRGBC = function(callback) {
	this._callAndResponse([0x50, 0x06, 0x10, 0x00, 0x39, 0x90, 0x08, 0x00], function(data) {
		var R = data.readUInt16LE(3);
		var G = data.readUInt16LE(1);
		var B = data.readUInt16LE(5);
		var C = data.readUInt16LE(7);

		var Rcal = 0.2639626007;
		var Gcal = 0.2935368922;
		var Bcal = 0.379682891;
		var Ccal = 0.2053011829;

		R += R * Rcal;
		G += G * Gcal;
		B += B * Bcal;
		C += C * Ccal;

		var X = -0.14282 * R + 1.54924 * G + -0.95641 * B;
		var Y = -0.32466 * R + 1.57837 * G + -0.73191 * B;
		var Z = -0.68202 * R + 0.77073 * G + 0.56332 * B;

		var x = X / (X + Y + Z);
		var y = Y / (X + Y + Z);

		var n = (x - 0.3320) / (0.1858 - y);

		var CCT = 449.0 * Math.pow(n, 3) + 3525.0 * Math.pow(n, 2) + 6823.3 * n + 5520.33;

		if (Y < 0) {
			Y = 0;
		}

		callback(R, G, B, C, Y, CCT);
	});
};

SensordroneBluetooth.prototype.enablePressure = function(callback) {
  this._callAndResponse([0x50, 0x07, 0x11, 0x00, 0x60, 0x01, 0x26, 0x3f, 0x00], function(data) {
    this._callAndResponse([0x50, 0x07, 0x11, 0x00, 0x60, 0x01, 0x26, 0x38, 0x00], function(data) {
      this._callAndResponse([0x50, 0x07, 0x11, 0x00, 0x60, 0x01, 0x13, 0x07, 0x00], function(data) {
        this._callAndResponse([0x50, 0x07, 0x11, 0x00, 0x60, 0x01, 0x26, 0x39, 0x00], function(data) {
          callback();
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

SensordroneBluetooth.prototype.disablePressure = function(callback) {
  this._callAndResponse([0x50, 0x07, 0x11, 0x00, 0x60, 0x01, 0x26, 0x3f, 0x00], function(data) {
    callback();
  }.bind(this));
};

SensordroneBluetooth.prototype.readPressure = function(callback) {
  this._callAndResponse([0x50, 0x05, 0x10, 0x00, 0x60, 0x01, 0x05], function(data) {
    var pressureIntValue = data.readUInt16BE(1);
    var pressureIntBits = (data.readUInt8(3) & 0x0c);
    var pressureDecBits = (data.readUInt8(3) & 0x03);
    
    var pascals = (pressureIntValue * 4.0) + pressureIntBits + (pressureDecBits / 4.0);

    callback(pascals);
  }.bind(this));
};

SensordroneBluetooth.prototype.enableAltitude = SensordroneBluetooth.prototype.enablePressure;

SensordroneBluetooth.prototype.disableAltitude = SensordroneBluetooth.prototype.disablePressure;

SensordroneBluetooth.prototype.readAltitude = function(callback) {
  this.readPressure(function(pressure) {
    var pRatio = pressure / 101326.0;
    var altitudeMeters = ((1 - Math.pow(pRatio, 0.1902632)) * 44330.77);

    callback(altitudeMeters);
  }.bind(this));
};

SensordroneBluetooth.prototype.enableIrTemperature = function(callback) {
	this._callAndResponse([0x50, 0x07, 0x11, 0x00, 0x41, 0x01, 0x02, 0x75, 0x00], function(data) {
		callback();
	});
};

SensordroneBluetooth.prototype.disableIrTemperature = function(callback) {
	this._callAndResponse([0x50, 0x07, 0x11, 0x00, 0x41, 0x01, 0x02, 0x00, 0x00], function(data) {
		callback();
	});
};

SensordroneBluetooth.prototype.readIrTemperature = function(callback) {
	this._callAndResponse([0x50, 0x06, 0x10, 0x00, 0x41, 0x00, 0x02, 0x00], function(data) {

		var V_OBJ = data.readInt16BE(1) * 1.0;

		this._callAndResponse([0x50, 0x06, 0x10, 0x00, 0x41, 0x01, 0x02, 0x00], function(data) {
			// Terms used for calculating the objects Temperature
			var a1 = 1.75 * Math.pow(10, -3);
			var a2 = -1.678 * Math.pow(10, -5);
			var T_REF = 298.15;
			var b0 = -2.94 * Math.pow(10, -5);
			var b1 = -5.7 * Math.pow(10, -7);
			var b2 = 4.63 * Math.pow(10, -9);
			var c2 = 13.4;

			var s0 = 2.51 * Math.pow(10, -14);
				
			var T_DIE = data.readInt16BE(1) * 1.0;

			var dT_DIE = ((T_DIE / (32.0 * 4.0)) + 273.15); // Should be Kelvin. The *4 was reversed engineered.
			var dV_OBJ = (V_OBJ * 156.25 * Math.pow(10, -9)); // Should be in Volts

			var Vos = b0 + b1 * (dT_DIE - T_REF) + b2 * Math.pow((dT_DIE - T_REF), 2);
			var sensitivity = s0 * (1 + a1 * (dT_DIE - T_REF) + a2 * Math.pow((dT_DIE - T_REF), 2));
			var fVobj = (dV_OBJ - Vos) + c2 * Math.pow((dV_OBJ - Vos), 2);
			var TMP = Math.pow(dT_DIE, 4) + (fVobj / sensitivity);

			var kelvin = Math.sqrt(Math.sqrt(TMP));
			var celsius = kelvin - 273.15;
			var temperature = {
				celsius: celsius,
				kelvin: kelvin,
				farenheit: (celsius * (9/5)) + 32 
			}

			callback(temperature);
		});
	}.bind(this));
};

SensordroneBluetooth.prototype.readPrecisionGasCalibration = function(callback) {

	this._callAndResponse([0x50, 0x02, 0x40, 0x00], function(data) {
		this._precisionGasSensitivity = data.readUInt16LE(1) / 1000.0;
		this._precisionGasBaseline = data.readUInt16LE(3);

		callback();
	}.bind(this));
};

SensordroneBluetooth.prototype.readPrecisionGas = function(callback) {
	this._callAndResponse([0x50, 0x02, 0x20, 0x00], function(data) {
		var gaintStage = data[3];

		var gainRes = [
			2200000,
			301961,
			113793,
			34452,
			13911,
			6978,
			3494,
			2747
		];

		var ADC = data.readUInt16LE(1);
		var deltaADC = ADC - this._precisionGasBaseline;
		var gasResponse = (deltaADC * 3.0 * Math.pow(10, 9)) / 4096.0;
		if (deltaADC < 0.0) {
			gasResponse = 0.0;
		}
		var gain = gainRes[gaintStage];
		var ppmCO = gasResponse / (this._precisionGasSensitivity * gain);

		callback(ppmCO);
	}.bind(this));
};

SensordroneBluetooth.prototype.enableOxidizingGas = function(callback) {
	this._callAndResponse([0x50, 0x03, 0x18, 0x84, 0x00], function(data) {
		callback();
	});
};

SensordroneBluetooth.prototype.disableOxidizingGas = function(callback) {
	this._callAndResponse([0x50, 0x03, 0x18, 0x00, 0x00], function(data) {
		callback();
	});
};

SensordroneBluetooth.prototype.readOxidizingGas = function(callback) {
	this._callAndResponse([0x50, 0x02, 0x1c, 0x00], function(data) {
		var ADC = data.readUInt16LE(1);
		var voltage = (ADC / 4095.0) * 3.3;

		var resistance = (18000.0 * 3.3 / voltage) - 18000.0;

		callback(resistance);
	});
};

SensordroneBluetooth.prototype.enableReducingGas = function(callback) {
	this._callAndResponse([0x50, 0x03, 0x19, 0xba, 0x00], function(data) {
		callback();
	});
};

SensordroneBluetooth.prototype.disableReducingGas = function(callback) {
	this._callAndResponse([0x50, 0x03, 0x19, 0x00, 0x00], function(data) {
		callback();
	});
};

SensordroneBluetooth.prototype.readReducingGas = function(callback) {
	this._callAndResponse([0x50, 0x02, 0x1d, 0x00], function(data) {
		var ADC = data.readUInt16LE(1);
		var voltage = (ADC / 4095.0) * 3.3;

		var resistance = (270000.0 * 3.3 / voltage) - 270000.0;

		callback(resistance);
	});
};

SensordroneBluetooth.prototype.readADC = function(callback) {
  this._callAndResponse([0x50 , 0x02, 0x21, 0x00], function(data) {
    var ADC = data.readUInt16LE(1);
    var voltage = (ADC / 4095.0) * 3.3;

    callback(voltage);
  }.bind(this));
};

SensordroneBluetooth.prototype.enableCapacitance = function(callback) {
  this._callAndResponse([0x50, 0x07, 0x11, 0x01, 0x48, 0x01, 0x0f, 0x11, 0x00], function(data) {
    this._callAndResponse([0x50, 0x08, 0x11, 0x01, 0x48, 0x01, 0x05, 0x30, 0x00, 0x00], function(data) {
      this._callAndResponse([0x50, 0x07, 0x11, 0x01, 0x48, 0x01, 0x0b, 0xc0, 0x00], function(data) {
        callback();
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

SensordroneBluetooth.prototype.disableCapacitance = function(callback) {
  this._callAndResponse([0x50, 0x07, 0x11, 0x01, 0x48, 0x01, 0x0f, 0x00, 0x00], function(data) {
    callback();
  }.bind(this));
};

SensordroneBluetooth.prototype.readCapacitance = function(callback) {
  this._callAndResponse([0x50, 0x06, 0x10, 0x01, 0x48, 0x00, 0x03, 0x00], function(data) {
    var ADC = data.readUInt16BE(2);

    var capacitance = (ADC / 65520.0) * 4000;

    callback(capacitance);
  }.bind(this));
};

SensordroneBluetooth.prototype.writeUart = function(data, callback) {
  var command = [];
  command[0] = 0x50;
  command[1] = 0x02 + data.length;
  command[2] = 0x24;

  for (var i = 0; i < data.length; i++) {
    command[i + 3] = data[i];
  }
  command[3 + data.length] = 0x00;

  this._callAndResponse(command, function(data) {
    callback()
  }.bind(this));
};

SensordroneBluetooth.prototype.readUart = function(callback) {
  this._callAndResponse([0x50, 0x02, 0x25, 0x00], function(data) {
    var readData = data.slice(3, data.length - 1);

    callback(readData);
  }.bind(this));
};

SensordroneBluetooth.prototype.setupExternalCO2 = function(callback) {
  this.writeUart(new Buffer('K 1\r\n'), function() {
    callback();
  }.bind(this));
};

SensordroneBluetooth.prototype.readExternalCO2 = function(callback) {
  this.writeUart(new Buffer('Z\r\n'), function() {
    var s = '';

    var parseUartData = function(data) {
      s += data.toString().replace(/\s+/g, ' ').replace(/\0/g, '');

      var found = s.match(/ z (\d{5}) (\d{5}) /);
      if (found) {
        var measurement1 = parseInt(found[1]);
        var measurement2 = parseInt(found[2]);

        var measurementAverage = (measurement1 + measurement2) / 2.0;

        callback(measurementAverage);
      } else {
        this.readUart(parseUartData);
      }
    }.bind(this);

    this.readUart(parseUartData);
  }.bind(this));
};


module.exports = new SensordroneBluetooth();

