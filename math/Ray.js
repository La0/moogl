
//a Ray is a segment between two point
Ray = new Class({
  A:null,
  B:null, 

  initialize:function(a, b){
    this.A = a;
    this.B = b;
  },

  getDirection:function(){
    return this.A.substract(this.B);
  },

});

