var socket = io.connect('http://'+window.location.hostname);
var $fun;
var touching= false;
var xRatio;
var yRatio;
var base_color = Math.random();
var rgb_base_color = HSVtoRGB(base_color,1,1);
var cx, cy;
var hammertime;
var emitter;

var runners = {};
var id;


window.onload = function(){
    containerNode = document.getElementById('canvas');
    myp5 = new p5(s, containerNode);
}

socket.on('id', function(data){
  console.log(data);
  id = data;
  runners[id] = new Runner(rgb_base_color);
});


function Runner(rgb){
  this.x;
  this.rgb  = rgb;
  this.r = this.rgb.r;
  this.g = this.rgb.g;
  this.b = this.rgb.b;
}


socket.on('motion', function(data){
  var d = data;
  if(!(d.id in runners)){
    runners[d.id] = new Runner(d.rgb);
    console.log("added cell " + d.id);
  }
  runners[d.id].x = data.x;
});


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
  var c = e.gesture.center;
  cy = $(window).height()-c.pageY;
  if(cy<0){cy=0;}
  if(cy>$(window).height()){cy=$(window).height();}
  yRatio = this.cy/$(window).height();
  runners[id].x = yRatio;
  emitter.pushd({x:yRatio, rgb: rgb_base_color, type: 0, id:id });

}

var touchDeactivate = function(e){
  cy=0;
  yRatio = 0;
  runners[id].x = yRatio;
  if(touching){
    socket.emit('motion',{x:0, rgb: rgb_base_color, type: 0, id:id});
  }
  touching = false;
}

var s = function( sketch ) {
  sketch.setup = function() {
    sketch.createCanvas(window.innerWidth, window.innerHeight);
    sketch.background(0.75,1,0.32);
  };

  sketch.draw = function() {
    sketch.background(0,0,0);

    rects = []
    for(var id in runners){
      rects.push(runners[id])
    }

    rects.sort(function(a,b){return b.x - a.x});

    rects.forEach(function(r){
      sketch.noStroke();
      sketch.fill(r.r, r.g, r.b);
      sketch.rect(0,$(window).height(),$(window).width(),-1*r.x*$(window).height());
    })
  }
};
//sample + batch acceleration values. only submit if nonzero
//rewrite this to take in a sample and emit rate

function SampleBatchEmitter(){
  this.sample_rate= 40;
  this.emit_rate = 10;
  this.data = [];
  this.read = true;
  this.startTime;
}

SampleBatchEmitter.prototype.pushd = function(d){
  if(this.read===true  && touching){
    socket.emit('motion', d);
    this.read = false;
    var that = this;
    setTimeout(function(){that.read = true;}, that.sample_rate);
  };
}




/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR
 * h, s, v
*/
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (h && s === undefined && v === undefined) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.floor(r * 255),
        g: Math.floor(g * 255),
        b: Math.floor(b * 255)
    };
}

