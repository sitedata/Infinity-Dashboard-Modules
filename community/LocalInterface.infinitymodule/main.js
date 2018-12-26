//
// Program:     Interface Number
//
// Description: This is a Infinity Dashboard module for showing
//              the IP address of a given interface.
//

const fiplab = require('fiplab');
var os = require('os');

let interface = fiplab.arguments.interface;
var ifaces = os.networkInterfaces();
var address = ""

Object.keys(ifaces).forEach(function(ifname) {
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if(ifname === interface) {
      address = iface.address;
    }
  });
});
let returnOptions = {
    'onclick': 'http://'+ address
};
fiplab.exit(address, true, returnOptions);