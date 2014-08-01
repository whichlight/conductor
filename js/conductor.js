var socket = io.connect('http://'+window.location.hostname);
var $fun;
var touching= false;
var hammertime;
var emitter;

window.onload = function(){
  containerNode = document.getElementById('canvas');
  myp5 = new p5(s, containerNode);
}

var setup = function(){
  $fun = $("#fun");
  emitter = new SampleBatchEmitter();
  hammertime = Hammer($fun[0], {
    prevent_default: true,
    no_mouseevents: true
  })
  .on('touch', function(event){
    touchActivate(event);
  })
  .on('drag', function(event){
    touchActivate(event);
  })
  .on('release', function(event){
    touchDeactivate();
  });
}

$(document).ready(function(){
    setup();
});

var touchActivate = function(e){
  e.preventDefault();
  touching=true;
  emitter.pushd({state: 1 });
}

var touchDeactivate = function(e){
  if(touching){
    emitter.pushd({state: 0 });
  }
  touching = false;
}

var s = function( sketch ) {
  sketch.setup = function() {
    sketch.colorMode("hsb");
    sketch.createCanvas(window.innerWidth, window.innerHeight);
    sketch.background(0,0,0);
  };

  sketch.draw = function() {
    if(!touching){
      sketch.background(0,0,0);
    } else {
      sketch.background(0,0,1);
    }
  }
};

function SampleBatchEmitter(){
  this.sample_rate= 40;
  this.emit_rate;
  this.data = [];
  this.read = true;
  this.startTime;
}

SampleBatchEmitter.prototype.pushd = function(d){
  if(this.read===true){
    socket.emit('motion', d);
    console.log(d);
    this.read = false;
    var that = this;
    setTimeout(function(){that.read = true;}, that.sample_rate);
  };
}
