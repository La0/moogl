Point = new Class({
  X:null,
  Y:null,
  Z:null,
  initialize:function(x,y,z){
    this.X = x;
    this.Y = Y;
    this.Z = Z;
  },
  
  substract:function(b){
    var v;
    vec3.create(v);
    v.set(v,[this.X - b.X, this.Y - b.Y, this.Z - b.Z]);
    return v;
  },
});
