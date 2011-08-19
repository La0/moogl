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






});