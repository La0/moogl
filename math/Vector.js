Vector = new Class({
  X:null,
  Y:null,
  Z:null,

  initialize:function(x, y, z){
    this.X = x;
    this.Y = y;
    this.Z = z;
  },


  isZero:function(){
    return this.X ==0 && this.Y == 0 && this.Z == 0;
  },


Vector = new Class({
  intersect_RayTriangle:function(R, T, I) {
    var u, v, n;             // triangle vectors
    var    dir, w0, w;          // ray vectors
    vec3.create(u);   vec3.create(v);  vec3.create(n);
    vec3.create(dir); vec3.create(w0); vec3.create(w);
    var r, a, b;             // params to calc ray-plane intersect

    // get triangle edge vectors and plane normal
    vec3.subtract(T.V1, T.V0, u);
    vec3.subtract(T.V2, T.V0, v);
    vec3.cross(u,v, n);
    if (vec3.zero(n))            // triangle is degenerate
        return -1;                 // do not deal with this case

    dir = R.P1 - R.P0;             // ray direction vector
    w0 = R.P0 - T.V0;
    a = -dot(n,w0);
    b = dot(n,dir);
    if (fabs(b) < SMALL_NUM) {     // ray is parallel to triangle plane
        if (a == 0)                // ray lies in triangle plane
            return 2;
        else return 0;             // ray disjoint from plane
    }

    // get intersect point of ray with triangle plane
    r = a / b;
    if (r < 0.0)                   // ray goes away from triangle
        return 0;                  // => no intersect
    // for a segment, also test if (r > 1.0) => no intersect

    *I = R.P0 + r * dir;           // intersect point of ray and plane

    // is I inside T?
    float    uu, uv, vv, wu, wv, D;
    uu = dot(u,u);
    uv = dot(u,v);
    vv = dot(v,v);
    w = *I - T.V0;
    wu = dot(w,u);
    wv = dot(w,v);
    D = uv * uv - uu * vv;

    // get and test parametric coords
    float s, t;
    s = (uv * wv - vv * wu) / D;
    if (s < 0.0 || s > 1.0)        // I is outside T
        return 0;
    t = (uv * wu - uu * wv) / D;
    if (t < 0.0 || (s + t) > 1.0)  // I is outside T
        return 0;

    return 1;                      // I is in T
}
});


});
