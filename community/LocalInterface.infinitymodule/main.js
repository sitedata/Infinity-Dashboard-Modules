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
var padd = ""
Object.keys(ifaces).forEach(function(ifname) {
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if(ifname === interface) {
      address = iface.address;
    } else if(padd === "") {
      padd = ifname;
    }
  });
});
let returnOptions = {
    'onclick': 'http://'+ address
};

if (address == "") {
  let notification = {
    id: 'localAddressMessage',
    message: "The '" + interface + "' interface wasn't found. Maybe '" + padd +"'?"
  };
  fiplab.notify(notification);
  fiplab.exit('Interface not found.', false);
} else {
  fiplab.exit(address, true, returnOptions);
}

