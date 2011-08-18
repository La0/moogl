Camera = new Class({
  coords : null,

  matrix : null,
  webgl : null,

  initialize:function(webgl){
    this.webgl = webgl;
    this.matrix = mat4.create();
    this.resetPosition();
  },

  resetPosition:function(){
    this.coords = {
      X:0,
      Y:0,
      Z:0,
      xRot:0,
      yRot:0,
      zRot:0,
    };
    this.updateMatrix();
  },

  position:function(vector){
    this.coords.X = vector[0];
    this.coords.Y = vector[1];
    this.coords.Z = vector[2];

    this.updateMatrix();
  },

  orient:function(angle, vector){
    if(vector[0] == 1 && vector[1] == 0 && vector[2] == 0)
      this.coords.xRot = angle;
    else if(vector[0] == 0 && vector[1] == 1 && vector[2] == 0)
      this.coords.yRot = angle;
    else if(vector[0] == 0 && vector[1] == 0 && vector[2] == 1)
      this.coords.zRot = angle;
    else throw "Unsupported rotation";

    this.updateMatrix();
  },

  translate:function(vector){
    this.position([
      vector[0] + this.coords.X,
      vector[1] + this.coords.Y,
      vector[2] + this.coords.Z
    ]);

  },

  rotate:function(angle, vector){

    if(vector[0] == 1 && vector[1] == 0 && vector[2] == 0){
      this.coords.xRot += angle;
    } else if(vector[0] == 0 && vector[1] == 1 && vector[2] == 0) {
      this.coords.yRot += angle;
    } else if(vector[0] == 0 && vector[1] == 0 && vector[2] == 1) {
      this.coords.zRot += angle;
    } else throw "Unsupported rotation";

    this.updateMatrix();
  },

  updateMatrix:function(){
    mat4.identity(this.matrix);
    if(this.coords.xRot) mat4.rotate(this.matrix, -degToRad(this.coords.xRot), [1,0,0]);
    if(this.coords.yRot) mat4.rotate(this.matrix, -degToRad(this.coords.yRot), [0,1,0]);
    if(this.coords.zRot) mat4.rotate(this.matrix, -degToRad(this.coords.zRot), [0,0,1]);

    //vector transformation need only rotation
    this.rotation = mat4.create(this.matrix);

    mat4.translate(this.matrix, [ -this.coords.X, -this.coords.Y, -this.coords.Z]);

//    console.log(mat4.str(this.matrix));
//    console.log("["+this.coords.X+","+this.coords.Y+","+this.coords.Z+"] ["+this.coords.xRot+","+this.coords.yRot+","+this.coords.zRot+"]");
  },


  setControlStyle:function(style){
    style.initialize.call(this);
    this.animate = style.animate.bind(this);
  },

  animate: function(elapsed){}
});

Camera.controlStyle = {};

Camera.controlStyle.fixed = {
  initialize : function() {
    Camera.currentlyPressedKeys = {};
    this.yawRate = 0;
    this.yaw = 0;
    this.speed   = 0;

    document.addEvent('keydown', function(event) {
      Camera.currentlyPressedKeys[event.code] = true;
      Event.stop(event);
    });

    document.addEvent('keyup', function(event) {
     Camera.currentlyPressedKeys[event.code] = false;
     Event.stop(event);
    });
  },

  animate : function(elapsed){

    if (Camera.currentlyPressedKeys[37]) // Left
        this.yawRate = 0.1;
    else if (Camera.currentlyPressedKeys[39]) // Right
        this.yawRate = -0.1;
    else
        this.yawRate = 0;

    if (Camera.currentlyPressedKeys[38]) // Up
        this.speed = 0.03;
    else if (Camera.currentlyPressedKeys[40]) // Down
        this.speed = -0.03;
    else
        this.speed = 0;


    if (this.speed != 0) {
      this.translate([
        -Math.sin(degToRad(this.yaw)) * this.speed * elapsed,
        0,
        -Math.cos(degToRad(this.yaw)) * this.speed * elapsed
      ]);
      //yPos = Math.sin(degToRad(joggingAngle)) / 20 + 0.4
    }

    if(this.yawRate) {
      this.yaw += this.yawRate * elapsed;
      this.orient(this.yaw, [0,1,0]);
    }

  }

};



Camera.controlStyle.mouselook = {
  initialize : function() {
    Camera.currentlyPressedKeys = {};
    this.yawRate = 0;
    this.yaw = 0;
    this.speed   = 0;

    document.addEvent('keydown', function(event) {
      Camera.currentlyPressedKeys[event.code] = true;
      Event.stop(event);
    });

    document.addEvent('keyup', function(event) {
     Camera.currentlyPressedKeys[event.code] = false;
     Event.stop(event);
    });

    this.mouseDownPos = null;

    var that = this;

    document.addEvent('mousedown',    function(event){
      that.mouseDownPos = event.client;
      that.mouseDownPitch = that.coords.xRot;
      that.mouseDownYaw = that.coords.yRot;
    });

    document.addEvent('mousemove',    function(event){
      if (that.mouseDownPos === null) 
        return;

      var sensitivity = 40;
      // update pitch
      var yDiff = event.client.y - that.mouseDownPos.y;
      var pitch = that.mouseDownPitch + yDiff / that.webgl.viewportHeight  * sensitivity;

      // update yaw
      var xDiff = event.client.x - that.mouseDownPos.x;
      var yaw = that.mouseDownYaw + xDiff / that.webgl.viewportWidth * sensitivity;

      that.orient(pitch, [1,0,0]);
      that.orient(yaw, [0,1,0]);
    });

    document.addEvent('mouseup',    function(){
      that.mouseDownPos = null;
    });
    document.addEvent('mouseout',    function(){
      //that.mouseDownPos = null;
    });

  },

  animate : function(elapsed){
    var yaw = 0, speed = 0, walkstep = 8/1000;

    var FORWARD = Camera.currentlyPressedKeys[38],
        BACKWARD = Camera.currentlyPressedKeys[40],
        LEFT     = Camera.currentlyPressedKeys[37],
        RIGHT    = Camera.currentlyPressedKeys[39],
        STRAIGHT = (FORWARD || BACKWARD),
        SIDE     = (LEFT || RIGHT);

    if( STRAIGHT || SIDE )
        speed = walkstep;

    if (FORWARD  && LEFT) yaw = 45;
    else if (BACKWARD && LEFT) yaw = 135;
    else if (!STRAIGHT && LEFT) yaw = 90;
    else if (FORWARD  && RIGHT) yaw = -45;
    else if (BACKWARD && RIGHT) yaw = -135;
    else if (!STRAIGHT && RIGHT) yaw = -90;
    else if (FORWARD && !SIDE) yaw = 0; //yeah
    else if (BACKWARD && !SIDE) yaw = 180;

    yaw = this.coords.yRot + yaw;


    if (speed != 0) {
      this.translate([
        -Math.sin(degToRad(yaw)) * speed * elapsed,
        0,
        -Math.cos(degToRad(yaw)) * speed * elapsed
      ]);
      //yPos = Math.sin(degToRad(joggingAngle)) / 20 + 0.4
    }

    if(this.yawRate) {
      this.yaw += this.yawRate * elapsed;
      this.orient(this.yaw, [0,1,0]);
    }

  }

};