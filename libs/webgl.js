

WebGL = new Class({
  Implements:[Events],

  canvas:false,

  shader :false,


  initialize:function(canvas) {
    this.canvas = document.id(canvas);
    this.gl     = this.canvas.getContext("experimental-webgl");


    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);

    this.setViewPort();

    this.pMatrix = mat4.create();

    this.camera = new Camera(this);
    this.lastTime = new Date().getTime();
  },

  setViewPort:function(){
    var size = this.canvas.getSize();
    this.gl.viewportWidth  = size.x;
    this.viewportWidth  = size.x;
    this.gl.viewportHeight = size.y;
    this.viewportHeight = size.y;

    this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
    this.clear();
  },

  createTexture:function(src, vertices){
    var texture = this.gl.createTexture();
    texture.image = new Image();
    texture.image.onload = this.bindTexture.bind(this, texture);
    texture.image.src = src;

    texture.buffer = this.createTextureBuffer(vertices);
    return texture;
  },

  bindTexture:function(texture){
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    //this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.image);
    
    //this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    //this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);

    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);

    this.gl.bindTexture(this.gl.TEXTURE_2D, null);

    this.fireEvent('textureReady');

  },

  clear:function(){
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  },

  mvMatrixStack: [],
  initMVMatrix:function(src){
    this.mvMatrixStack = [];
    this.mvMatrix = this.storeMVMatrix(src);
  },

  storeMVMatrix:function(src) {
    var copy = mat4.create();
    mat4.set(src || this.mvMatrix, copy);
    this.mvMatrixStack.push(copy);
    return copy;
  },

  restoreMVMatrix:function() {
    if (this.mvMatrixStack.length == 0)
        throw "Invalid popMatrix!";
    this.mvMatrix = this.mvMatrixStack.pop();
  },

  sendMVMatrix:function(matrix){

    var normalMatrix = mat3.create();
    mat4.toInverseMat3(this.mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);

    this.shader.bindVar("uMVMatrix", this.mvMatrix);
    this.shader.bindVar("uNMatrix", normalMatrix);
  },

  setPerspective:function(angle, min, max){
    var ratio = this.viewportWidth / this.viewportHeight;
    mat4.perspective(angle, ratio, min,  max, this.pMatrix);
    this.shader.bindVar("uPMatrix", this.pMatrix);
  },

  elements:[],
  stackElement:function(form){
    this.elements.push(form);
  },

  draw:function(cube){
    this.initMVMatrix(this.camera.matrix);

      //apply camera matrix to lighting vector
    var ld = vec3.create(this.lightingDirection);
    mat4.multiplyVec3(this.camera.rotation, ld);

    this.shader.bindVar("uUseLighting", true);
    this.shader.bindVar("uAmbientColor", this.ambiantColor);
    this.shader.bindVar("uLightingDirection", ld);
    this.shader.bindVar("uDirectionalColor", this.directionalColor);


    Array.each(this.elements, function(form){
      this.storeMVMatrix();
      mat4.multiply(this.mvMatrix, form.coordinates);
      this.sendMVMatrix();
      this.restoreMVMatrix();

      form.draw();
    }.bind(this));


  },


  drawElement:function(form){

    this.shader.bindBuffer('aVertexPosition', form.vertices);
    this.shader.bindBuffer('aVertexNormal', form.normals);

    if(false)
      this.shader.bindBuffer('vertexColorAttribute', form.colors);

    if(true){ //texture
      this.shader.bindBuffer('aTextureCoord', form.texture.buffer);

      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, form.texture);
      this.shader.bindVar('uSampler', 0);
    }


    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, form.triangles);
    this.gl.drawElements(this.gl.TRIANGLES, form.triangles.numItems, this.gl.UNSIGNED_SHORT, 0);
  },


  createPositionBuffer:function(vertices){
    return this.createArrayBuffer(vertices, 3); //3d object
  },

  createTriangleBuffer:function(vertices){
    return this.createElementBuffer(vertices, 1); //3d object
  },

  createTextureBuffer:function(vertices){
    return this.createArrayBuffer(vertices, 2); //x,y texture
  },

  createNormalBuffer:function(vertices){
    return this.createArrayBuffer(vertices, 3); //3d vector
  },

  createRGBABuffer:function(vertices){
    return this.createArrayBuffer(vertices, 4); //rgba
  },

  createLinearRGBABuffer : function(nbVertices, r,g,b,a){
    var colors = [];
    for (var i=0; i < nbVertices; i++) {
        colors = colors.concat([r, g, b, a]);
    } return this.createRGBABuffer(colors);
  },

  createArrayBuffer:function(vertices, itemSize){
    var buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    buffer.itemSize = itemSize;
    buffer.numItems = vertices.length / itemSize;
    return buffer;
  },

  createElementBuffer:function(vertices, itemSize){
    var buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertices), this.gl.STATIC_DRAW);
    buffer.itemSize = itemSize;
    buffer.numItems = vertices.length / itemSize;
    return buffer;
  },

  registerShader:function(shader_def){
    this.shader = new Shader(this.gl, shader_def);
  },


  lastTime :0,
  animate:function () {
    var timeNow = new Date().getTime();
    var elapsed = timeNow - this.lastTime;
    this.fireEvent('animate', elapsed);
    this.lastTime = timeNow;
  },

});
