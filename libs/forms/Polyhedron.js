Polyhedron  = new Class({
  webgl:false,
  coordinates : null,
  vertices :null,
  triangles:null,
  colors:null,
  texture:null,
  normals:null,


  initialize:function(webgl){
    this.webgl = webgl;
 
    this.coordinates = mat4.create();
    this.resetPosition();
  },


  resetPosition:function(){
    mat4.identity(this.coordinates);
  },

  position:function(coord){
    this.resetPosition();
    this.translate(coord);
  },

  translate:function(vector){
    mat4.translate(this.coordinates, vector);
  },

  rotate:function(angle, vector){
    mat4.rotate(this.coordinates, degToRad(angle), vector);
  },



  draw:function(){

    this.webgl.drawElement(this);
  },


  setVertices:function(vertices){
    this.vertices = this.webgl.createPositionBuffer(vertices);
  },

  setTriangles:function(triangles){
    this.triangles = this.webgl.createTriangleBuffer(triangles);
  },

  setNormals:function(normals){
    this.normals = this.webgl.createNormalBuffer(normals);
  },


  setTexture:function(src, coords){
 
    this.texture = this.webgl.createTexture(src, coords);
  },



});