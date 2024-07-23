<?php

function mb_strrev($string) {
  preg_match_all('/./us', $string, $arr);
  return join('', array_reverse($arr[0]));
}

function mb_ctype_punct_or_space($string) {
  return preg_match("/[\p{P}\p{Z}]/u", $string) ? true: false;
}

function mb_ctype_upper($string) {
  return preg_match('/\p{Lu}/u', $string) ? true: false;
}

function fast_rev($str) {
  $new_str = "";
  $upper_chars = array();
  $ws = 0;//word start
  $wl = 0;//word length
  for($i = 0; $i<mb_strlen($str); ++$i) {
    $c = mb_substr($str, $i, 1);//$str[i]

    if (mb_ctype_upper($c)) array_push($upper_chars, $i);

    if (mb_ctype_punct_or_space($c)) {
      $new_str .= mb_strtolower(mb_strrev(mb_substr($str, $ws, $wl))) . $c;
      $ws = $i+1;
      $wl = 0;
      continue;
    } elseif($i+1 == mb_strlen($str)) {
      $new_str .= mb_strtolower(mb_strrev(mb_substr($str, $ws, $wl+1)));
    }

    ++$wl;
  }

  foreach($upper_chars as $c) {
    $p1 = mb_substr($new_str, 0, $c);
    $p2 = mb_substr($new_str, $c+1);
    $char = mb_strtoupper(mb_substr($new_str, $c, 1));
    $new_str = $p1 . $char .$p2;
  }
  unset($c);

  //echo $str . "\n";
  //echo $new_str . "\n";
  return $new_str;
}


fast_rev("foR-now-gooD");
fast_rev('Привет, как деЛа? «Ёлочки» игОлочки и-тире');


?>
