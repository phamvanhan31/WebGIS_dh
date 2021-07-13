<?php
  //Binh test file, not participated in project
  
  include "/incphp/extlib/json.php";
  $val1 = '{"mode":"nquery", "queryResult":[ [{"name": "qn_diemquantrac", "description": "Điểm quan trắc môi trường", "numresults": 3, "header": ["@","gid","Tên điểm QT","Thông số 1","Thông số 2","Thời điểm quan trắc"], "stdheader": ["@","gid","ten","thongso1","thongso2","thoidiem"], "values": [ [{"shplink": ["qn_diemquantrac","2","417097+2308760+437097+2328760",1]}, "2", {"hyperlink": ["qn_diemquantrac","ten","D1","D1"]}, "100", "102", "2012-12-01"], [{"shplink": ["qn_diemquantrac","3","417334+2309079+437334+2329079",1]}, "3", {"hyperlink": ["qn_diemquantrac","ten","D2","D2"]}, "100", "102", "2012-12-01"], [{"shplink": ["qn_diemquantrac","4","417608+2308373+437608+2328373",1]}, "4", {"hyperlink": ["qn_diemquantrac","ten","D3","D3"]}, "150", "82", "2011-10-09"]]} ], {"allextent": "416071.45+2307337.7+438633.55+2330114.3", "zoomall": true, "autozoom": "auto", "infoWin": "dynwin"} ]}';
  
  $val = '[ [{"name": "qn_diemquantrac", "description": "─Éiß╗âm quan trß║»c m├┤i tr╞░ß╗¥ng", "numresults": 3, "header": ["@","gid","T├¬n ─æiß╗âm QT","Th├┤ng sß╗æ 1","Th├┤ng sß╗æ 2","Thß╗¥i ─æiß╗âm quan trß║»c"], "stdheader": ["@","gid","ten","thongso1","thongso2","thoidiem"], "values": [ [{"shplink": ["qn_diemquantrac","2","417097+2308760+437097+2328760",1]}, "2", {"hyperlink": ["qn_diemquantrac","ten","D1","D1"]}, "100", "102", "2012-12-01"], [{"shplink": ["qn_diemquantrac","3","417334+2309079+437334+2329079",1]}, "3", {"hyperlink": ["qn_diemquantrac","ten","D2","D2"]}, "100", "102", "2012-12-01"], [{"shplink": ["qn_diemquantrac","4","417608+2308373+437608+2328373",1]}, "4", {"hyperlink": ["qn_diemquantrac","ten","D3","D3"]}, "150", "82", "2011-10-09"]]} ], {"allextent": "416071.45+2307337.7+438633.55+2330114.3", "zoomall": true, "autozoom": "auto", "infoWin": "dynwin"} ]';
  //echo($val);
  $json_svr = new Services_JSON();
  $decoded = $json_svr->decode($val);
  //$myval = $decoded->queryResult[0][0];
  $myval = $decoded[0][0];
  print_r("numresults =". $myval->numresults . '<br />');
  print_r("values[0] =". $myval->values[0] .'<br />');
  print_r("values[0][0] ="); print_r($myval->values[0][0]); print_r('<br />');
  print_r("values[0][1] ="); print_r($myval->values[0][1]); print_r('<br />');  
  print_r("values[0][2] ="); print_r($myval->values[0][2]); print_r('<br />');  
  print_r("values[0][3] ="); print_r($myval->values[0][3]); print_r('<br />');  
  print_r("values[0][4] ="); print_r($myval->values[0][4]); print_r('<br />');
  print_r("values[0][5] ="); print_r($myval->values[0][5]); print_r('<br />');	
  print_r("values[0][6] ="); print_r(isset($myval->values[0][6])); print_r('<br />');  
echo "<br />";
  print_r("values[1][0] ="); print_r($myval->values[1][0]); print_r('<br />');
  print_r("values[1][1] ="); print_r($myval->values[1][1]); print_r('<br />');  
  print_r("values[1][2] ="); print_r($myval->values[1][2]); print_r('<br />');  
  print_r("values[1][3] ="); print_r($myval->values[1][3]); print_r('<br />');  
  print_r("values[1][4] ="); print_r($myval->values[1][4]); print_r('<br />');
  print_r("values[1][5] ="); print_r($myval->values[1][5]); print_r('<br />');	

  //print_r($decoded->queryResult[0][0]->values[0][1]);
  $decoded->queryResult[0][0]->values[$numresults][0]="aaa";
  $decoded->queryResult[0][0]->numresults +=1;
  
  $encoded = $json_svr->encode($decoded);
  print_r($encoded);
    
  
?>
<br />
<?php
$tests = array(
    "-42",
    "4a",
    "19-05-2012", 
    1337, 
    "1e4", 
    "not numeric", 
    array(), 
    9.1
);

foreach ($tests as $element) {
    if (is_numeric($element)) {
        echo "'{$element}' is numeric", PHP_EOL;
    } else {
        echo "'{$element}' is NOT numeric", PHP_EOL;
    }
}
?>

