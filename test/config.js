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

 module.exports = (function(){
	"use strict";
	var config = {};

	config.serialPort = process.env.SENSORDRONE_PORT || "/dev/rfcomm0";

	return config;
})();