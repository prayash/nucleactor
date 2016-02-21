<?php
//mini proxy
header('Access-Control-Allow-Origin: *');
//$urltoget = urldecode($_GET['url']);
$urltoget = substr($_SERVER['REQUEST_URI'], 20);
//echo $urltoget;

if(substr($urltoget,0,4) == 'http')
{
  echo file_get_contents($urltoget);
}else{
  echo '{"error": "only http, https are allowed"}';
}
?>
