<?php
/******************************************************************************
 *
 * Purpose: execute query
 * Author:  Armin Burger
 *
 ******************************************************************************
 *
 * Copyright (c) 2003-2007 Armin Burger
 *
 * This file is part of p.mapper.
 *
 * p.mapper is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version. See the COPYING file.
 *
 * p.mapper is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with p.mapper; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 ******************************************************************************/

require_once("../group.php");
require_once("../pmsession.php");
require_once("../globals.php");
require_once("../common.php");
require_once("../query/squery.php");
require_once("../query/search.php");

header("Content-type: text/plain; charset=$defCharset");

$mode = $_REQUEST['mode'];

//pm_logDebug(3, $_REQUEST, "REQUEST array in x_info.php");

// Run QUERY
$mapQuery = new Query($map);
$mapQuery->q_processQuery();
$queryResult = $mapQuery->q_returnQueryResult();
//$numResultsTotal = $mapQuery->q_returnNumResultsTotal();

//-------MODYFYING FOR DISPLAYING SUM AND AVG OF IDENTIFY TABLE-----------
require_once("../extlib/json.php");  //json library supplied with pMapper
$json = new Services_JSON();
$decoded = $json->decode($queryResult);  //decode JSON query result into an array of object
$fp = fopen("binh_log2.txt", "w"); fputs($fp, count($decoded[0]) . "------\r\n"); fclose($fp);
for($k=0; $k < count($decoded[0]); $k++) {  //in case of identify 2 or more layers, e.g. identify by a point
    $numResult = $decoded[0][$k]->numresults;
    if($numResult > 1){  // only execute if the result is not empty and contains at least 2 rows
        $myVal = & $decoded[0][$k]->values;  //& - pass by reference, not by value
        $myVal[$numResult][0] = "<b>Tổng</b>";  //header columns
        $myVal[$numResult+1][0] = "<b>TB</b>(SL)";
        for($j = 1; $j < count($myVal[0]); $j++){  //for each column (field), except for the first one
            $subSum = 0; $subCount = 0;
            for($i=0; $i < $numResult; $i++) { //for each row
                if(is_numeric($myVal[$i][$j])){ //calculate only for numeric and not null cells
                    $subSum +=$myVal[$i][$j];
                    $subCount++;
                }
            }
            if($subCount > 0){
                $myVal[$numResult][$j] ='<b>' . number_format($subSum,2,'.',' ') . '</b>'; //highlight by bold  
                $myVal[$numResult+1][$j] = '<b>' . number_format($subSum/$subCount,2,'.',' ') . '</b> (' . $subCount . ')';
            }
            else{       //put empty statistics for not numeric columns
                $myVal[$numResult][$j] = ''; 
                $myVal[$numResult+1][$j] = '';
            }
        }
        $decoded[0][$k]->numresults += 2;
        $queryResult = $json->encode($decoded);  //encode JSON back to query result
    } //if $numResult
} //for $k
//---------END OF MODYFYING FOR DISPLAYING SUM AND AVG--------------


echo "{\"mode\":\"$mode\", \"queryResult\":$queryResult}";
?>