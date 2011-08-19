


Cube = new Class({
  Extends:Polyhedron,

  initialize:function(webgl){
    this.parent(webgl);


    this.vertices = this.webgl.createPositionBuffer([
      //front
      -1, 1, 1,   //A
      1, 1, 1,    //B
      1, -1, 1,   //C
      -1, -1, 1,  //D

      //back
      -1, 1, -1,  //E
      1, 1, -1,   //F
      1, -1, -1,  //G
      -1, -1, -1, //H

      //left
      -1, 1, 1,   //A
      -1, 1, -1,  //E
      -1, -1, -1, //H
      -1, -1, 1,  //D

    //right
      1, 1, 1,    //B
      1, 1, -1,   //F
      1, -1, -1,  //G
      1, -1, 1,   //C

    //top
      -1, 1, 1,   //A
      -1, 1, -1,  //E
      1, 1, -1,   //F
      1, 1, 1,    //B

    //bottom
      -1, -1, 1,  //D
      -1, -1, -1, //H
      1, -1, -1,  //G
      1, -1, 1   //C
    ]);

    this.triangles = this.webgl.createTriangleBuffer([
      0,3,1,   1,3,2,        //front
      7,4,5,    7,5,6,       //back
      8,9,10,   8,10,11,     //left
      12,14,13,  12,15,14,   //right
      16,19,18,  16,18,17,   //top
      20,21,22,  20,22,23    //bottom
    ]);

    this.normals = this.webgl.createNormalBuffer([
      // Front face
       0, 0, 1,
       0, 0, 1,
       0, 0, 1,
       0, 0, 1,

      // Back face
       0, 0,-1,
       0, 0,-1,
       0, 0,-1,
       0, 0,-1,

      // Left face
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,

      // Right face
       1, 0, 0,
       1, 0, 0,
       1, 0, 0,
       1, 0, 0,

      // Top face
       0, 1, 0,
       0, 1, 0,
       0, 1, 0,
       0, 1, 0,

      // Bottom face
       0,-1, 0,
       0,-1, 0,
       0,-1, 0,
       0,-1, 0
    ]);

  },

  setTexture:function(src){
    this.texture = this.webgl.createTexture(src, [

0,0,
1,0,
1,1,
0,1,

1,0,
0,0,
0,1,
1,1,

1,0,
0,0,
0,1,
1,1,

0,0,
1,0,
1,1,
0,1,

0,1,
0,0,
1,0,
1,1,

1,0,
1,1,
0,1,
0,0

    ]);

  },

  setColors:function(front, back, left, right, top, bottom){
    var unpackedColors = [], colors = [front, back, left, right, top, bottom];
    Object.each(colors, function(color){
      for (var j=0; j < 4; j++)
        unpackedColors = unpackedColors.concat(color);
    });
    this.colors = this.webgl.createRGBABuffer(unpackedColors);
  },

});
