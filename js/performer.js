var socket = io.connect('http://'+window.location.hostname);
var $fun;
var touching= false;

window.onload = function(){
  containerNode = document.getElementById('canvas');
  myp5 = new p5(s, containerNode);
}

var setup = function(){
  $fun = $("#fun");
}

$(document).ready(function(){
    setup();
});

var s = function( sketch ) {
  sketch.setup = function() {
    sketch.colorMode("hsb");
    sketch.createCanvas(window.innerWidth, window.innerHeight);
    sketch.background(0,0,1);
  };

  sketch.draw = function() {
    if(touching == 0){
      sketch.background(0,0,0);
    } else {
      sketch.background(1,0,1);
    }
  }
};

socket.on('connect', function(){
  socket.emit('identify', {data:'performer'});
  console.log('connected');
});

socket.on('motion', function(data){
  touching=data.state;
  console.log(data);
});
