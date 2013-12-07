#!/usr/bin/env node

var program = require('commander');
var ip = require('../lib/whatismyip.js');

function list(val) {
  return val.split(',');
}

program
  .version('0.0.1')
  .option('-a, --all', 'Hit all servers')
  .option('-u, --urls <list>', 'A comma separated list of urls of servers to lookup', list)
  .option('-v, --verbose', 'Be verbose')
  .parse(process.argv);

var hosts = [];

if (program.urls) {
  program.urls.forEach(function(u) {
    hosts.push({'url' : u, 'truncate' : '', 'matchIndex' : 0});
  });
} else {
  hosts = [
    {url:'http://checkip.amazonaws.com/', truncate:''},
    {url:'http://checkip.dyndns.org/', truncate:[/^.*Current IP Address: /, /<.*$/]},
    {url:'http://ifconfig.me/ip', truncate:''},
    {url:'http://whatismyip.herokuapp.com/', truncate:''},
    {url:'http://whatismyip.oceanus.ro/myip.php', truncate:'', matchIndex:1},
    {url:'https://www.statdns.net/', truncate:'', matchIndex:0},
    {url:'http://corz.org/ip', truncate:''}
  ];
}

var start = Date.now();

for (var hostId in hosts) {
  var host = hosts[hostId]
  var options = {
        url: host['url'],
        truncate: host['truncate'],
        matchIndex: host['matchIndex']
      };

  ip.whatismyip(options, function(err, data){
    if (!err) { 
      if (program.verbose) {
        console.log('From '+data.url+' : '+((data.ip) ? data.ip : 'not resolved,')+' time taken : ', data.time - start);
      } else {
        if (data.ip) {
          console.log(data.ip);
        } else {
          console.warn('Could not resolve ip from the specified host(s).')
        }
      }
      if ((! program.all) || (program.all && ! program.verbose)) {
        process.exit();
      }
    }
  });
}

process.on('SIGINT', function () {
    console.log('\nBye!\n');
    process.exit(0);
});
