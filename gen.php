<?
$_SERVER['YKS_FREE'] = true;


include "yks/cli.php";
include "yks/class/imgs/edge_detect.php";

$img = imgs::imagecreatefromfile("map.png");

//$edge = detect_zones($img, 0);
//print_r($edge);die;

//$grid = array($grid['cols'], $grid['lines']);

list($img_w , $img_h) = array(imagesx($img), imagesy($img));
$out = imgs::imagecreatetruealpha($img_w*2, $img_h*2);

$lines = detect_edge_coords($img);

$height = 1;
//make vertices
$vertices   = array();
$triangles  = array();
$normals    = array();
$textures   = array();



foreach($lines as $line) {

  list($x0, $z0, $x1, $z1, $normal) = $line;
  list($normal_x, $normal_z) = $normal;

  $i = count($vertices); //first vertice id

  $vertices = array_merge($vertices, array(
    $x0, 0, $z0,
    $x1, 0, $z1,
    $x1, $height, $z1,
    $x0, $height, $z0,
  ));

  $ti = $i/3; //triangle index
  $triangles = array_merge($triangles, array(
    $ti, $ti+1, $ti+2,
    $ti, $ti+2, $ti+3,
  ));

  $normals = array_merge($normals, array(
    $normal_x, 0, $normal_z,
    $normal_x, 0, $normal_z,
    $normal_x, 0, $normal_z,
    $normal_x, 0, $normal_z,
  ));

  $textures = array_merge($textures, array(
    0,1,
    1,1,
    1,0,
    0,0,
  ));


}

$data = compact('vertices', 'triangles', 'normals', 'textures');
foreach($data as &$n) $n = array_values($n);

if(PHP_SAPI == "cli")
  print_r($data);
else echo json_encode($data);
