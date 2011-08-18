Shader = new Class({
  gl:null, //gl context
  shaderProgram:null,

  exports: {'attribute':{}, 'uniform':{}},

  bindVar:function(name, value, transpose){
    var a =this.exports.uniform[name];
    if(a.isMatrix)
      this.gl[a.callBackName](a.location, Boolean(transpose), value); 
    else this.gl[a.callBackName](a.location, value); 
  },

  bindBuffer:function(attributeName, buffer){
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.vertexAttribPointer(this.exports.attribute[attributeName].location, buffer.itemSize, this.gl.FLOAT, false, 0, 0);
  },


  initialize:function(gl, shader_def){
    this.gl = gl;

    this.shaderProgram = this.gl.createProgram();

    Object.each(shader_def, function(k){
      this.gl.attachShader(this.shaderProgram, this.createShader(k));
    }.bind(this));
    this.gl.linkProgram(this.shaderProgram);

    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS))
      throw "Could not initialise shaders program";

    this.gl.useProgram(this.shaderProgram);

    Object.each(this.exports.attribute, function(attribute, name){
      attribute.location = this.gl.getAttribLocation(this.shaderProgram, name);
      this.gl.enableVertexAttribArray(attribute.location);
    }.bind(this));

    Object.each(this.exports.uniform, function(uniform, name){
      var callbackName = Shader.input_types[uniform.type];
      if(!callbackName)
            throw "Unknow uniform type for " + name;

      uniform.location = this.gl.getUniformLocation(this.shaderProgram, name);
      uniform.isMatrix = callbackName.startsWith('uniformMatrix');
      uniform.callBackName = callbackName;
      uniform.callback = this.gl[callbackName];
    }.bind(this));

  },

  createShader:function(key, type, code) {
    var shader;

    var shader_types = {
      "x-shader/x-fragment" :this.gl.FRAGMENT_SHADER,
      "x-shader/x-vertex"   :this.gl.VERTEX_SHADER,
    };

    if(!type) type = document.id(key).type;
    if(!code) code = document.id(key).innerHTML;

    var shader_type = shader_types[type], shader;
    if(!shader_type)
        throw "Unsupported shader type";

    shader = this.gl.createShader(shader_type);

    var out, reg = new RegExp("^\\s*(attribute|uniform)\\s+([a-z0-9]+)\\s+([a-z0-9]+);", "gim");
    while( out = reg.exec(code))
      this.exports[out[1]][out[3]] = {type:out[2]};

    this.gl.shaderSource(shader, code);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
        throw "Could not compile shader " + this.gl.getShaderInfoLog(shader);

    return shader;
  },

});


Shader.input_types = {
  'bool'    : 'uniform1i',
  'int'     : 'uniform1i',

  'matrix'  : 'uniformMatrix4fv',
  'matrix4' : 'uniformMatrix4fv',
  'mat4'    : 'uniformMatrix4fv',
  'matrix3' : 'uniformMatrix3fv',
  'mat3'    : 'uniformMatrix3fv',
  'sampler2D' : 'uniform1i',
  '3dtuple' : 'uniform3f',
  'vector'  : 'uniform3fv',
  'vec3'    : 'uniform3fv',
};