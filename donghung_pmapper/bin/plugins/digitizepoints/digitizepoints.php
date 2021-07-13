<?php
//-------------------------------------------------------------------------
// This file is part o digitizepoints, a plugin for p.mapper.
// It allow to digitize points into a PostgreSQL/PostGIS table.
// See http://www.pmapper.net/
//
// Copyright (C) 2009 Niccolo Rigacci, Thomas Raffin, Modded by TQ Binh for digitizing polygon
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// Authors:      Niccolo Rigacci <niccolo@rigacci.org>
//               Thomas Raffin
//-------------------------------------------------------------------------

// prevent XSS
if (isset($_REQUEST['_SESSION'])) exit();
session_start();

// If plugin is not activated, do not execute.
if (!isset($_SESSION['digitizepoints_activated']) or !$_SESSION['digitizepoints_activated']) {
    exit();
}


require_once($_SESSION['PM_INCPHP'] . '/common.php');
require_once($_SESSION['PM_INCPHP'] . '/globals.php');
require_once('../common/easyincludes.php');
require_once('DB.php');
require_once('include.php');
require_once('include_conf.php');

// TODO:
// * Now the pkey must be numeric, add proper escaping if needed.
// * Trap errors on fetchRow, when getting lon/lat of existing point.

$distance  = 'st_distance';     // Name for 'SELECT ... AS', must not conflict with other table fields.
$prefix    = '__db';            // Prefix for database fields used into the html form.

print "<html>\n";
print "<head>\n";
print '<script type="text/javascript"> $(document).ready(function(){$(".SyncX").keyup(function(){$(".SyncX").val($(this).val());});$(".SyncY").keyup(function(){$(".SyncY").val($(this).val());});});</script>';
print "</head>\n";
print "<body>\n";

$action = isset($_REQUEST['__action']) ? $_REQUEST['__action'] : false; 

$mode = 'point';

if(isset($_REQUEST['mode']) && $_REQUEST['mode']=='polygon'){  //polygon mode
        if($action == 'insert' || $action == 'update') {
            $lon_array = $_REQUEST['lon'];
            $lat_array = $_REQUEST['lat'];
        } else {
            $lon_array = explode('|', $_REQUEST['lon']);
            $lat_array =  explode('|', $_REQUEST['lat']);
        }
        $db_table = $polygon_db_table;
        $pkey = $polygon_pkey;
        $the_geom = $polygon_the_geom;
        $hide_fields = $polygon_hide_fields;
        $mode = 'polygon'; 
}
else { //point mode or others, mode may not set
        if($action == 'insert' || $action == 'update') {
            $lon_array = $_REQUEST['lon'];
            $lat_array = $_REQUEST['lat']; 
        } else {            
            $lon_array[0] = (float)$_REQUEST['lon'];
            $lat_array[0] = (float)$_REQUEST['lat']; 
        }
        $db_table = $point_db_table;
        $pkey = $point_pkey;
        $the_geom = $point_the_geom;
        $hide_fields = $point_hide_fields;                    
}

//------------------------------------------------------------------------
// Connect to the database.
//------------------------------------------------------------------------
$db = DB::connect($dsn, true);
if (DB::isError($db)) die ($db->getMessage() );


//------------------------------------------------------------------------
// What to do?
//------------------------------------------------------------------------

switch($action) {

    //--------------------------------------------------------------------
    // Do insert.
    //--------------------------------------------------------------------
    case 'insert':
        // Get all the fields from the web form.
        list($columns, $values) = get_columns_and_values($_REQUEST, $prefix, $db);
        // Add the geometry. use the first point in case of point (e.g. $lon_array[0])
        if($mode=='point'){
            $val = sprintf('ST_SetSRID(ST_MakePoint(%f, %f), %d)', $lon_array[0], $lat_array[0], $srid_map);
        } else {  //mode=polygon
            $val = "ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(";
            for($j=0; $j < count($lon_array); $j++){
              if($j > 0) $val .=',';  
              $val .=sprintf('%f  %f',$lon_array[$j], $lat_array[$j]);
            }
            $val .=sprintf(")')), %d)", $srid_map);
        }
        if ($srid_geom != $srid_map) $val = "ST_Transform($val, $srid_geom)"; //transform to SRID if necessary
        array_push($columns, $the_geom);
        array_push($values,  $val);
        // Make the SQL statement.
        $sql  = 'INSERT INTO ' . $db_table . ' (' . implode(', ', $columns) . ')';
        $sql .= ' VALUES (' . implode(', ', $values) . ')';
        $result = $db->query($sql);
        if (DB::isError($result)) {
            print "<b>" . _p("Error executing statement:") . "</b> ";// . my_html($sql) ."<p>\n"; //comment out for safety reason
            die ($result->getMessage());
        } else {
            msg_and_close(_p('Insert successful.'));
        }
        break;

    //--------------------------------------------------------------------
    // Do update.
    //--------------------------------------------------------------------
    case 'update':
        // Get the record ID.
        $id = (int)$_REQUEST['__id'];
        // Get all the fields from the web form.
        list($columns, $values) = get_columns_and_values($_REQUEST, $prefix, $db);
        // Add the geometry. use the first point in case of point (e.g. $lon_array[0])
        if($mode=='point'){
            $val = sprintf('ST_SetSRID(ST_MakePoint(%f, %f), %d)', $lon_array[0], $lat_array[0], $srid_map);
        } else {  //mode=polygon
            $val = "ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(";
            for($j=0; $j < count($lon_array); $j++){
              if($j > 0) $val .=',';  
              $val .=sprintf('%f  %f',$lon_array[$j], $lat_array[$j]);
            }
            $val .=sprintf(")')), %d)", $srid_map);
        }        
        if ($srid_geom != $srid_map) $val = "ST_Transform($val, $srid_geom)";
        array_push($columns, $the_geom);
        array_push($values,  $val);
        // Make the SQL statement.
        $sql  = 'UPDATE ' . $db_table . ' SET (' . implode(', ', $columns) . ')';
        $sql .= ' = (' . implode(', ', $values) . ')';
        $sql .= ' WHERE ' . $pkey . ' = ' . $id;
        $result = $db->query($sql);
        if (DB::isError($result)) {
            print "<b>" . _p("Error executing statement:") . "</b> ";// . my_html($sql) ."<p>\n";  //comment out for safety reason
            die ($result->getMessage());
        } else {
            msg_and_close(_p('Update successful.'));
        }
        break;

    //--------------------------------------------------------------------
    // Do delete.
    //--------------------------------------------------------------------
    case 'delete':
        // Get the record ID.
        $id = (int)$_REQUEST['__id'];
        // Make the SQL statement.
        $sql  = 'DELETE FROM ' . $db_table . ' WHERE ' . $pkey . ' = ' . $id;
        $result = $db->query($sql);
        if (DB::isError($result)) {
            print "<b>" . _p("Error executing statement:") . "</b> ";// . my_html($sql) ."<p>\n";  //comment out for safety reason
            die ($result->getMessage());
        } else {
            msg_and_close(_p('Delete successful.'));
        }
        break;

    //--------------------------------------------------------------------
    // Get points near the clik and get table info.
    //--------------------------------------------------------------------
    default:  
        $point = sprintf("ST_PointFromText('POINT(%f %f)', %d)", $lon_array[0], $lat_array[0], $srid_map);
        $geom_ll = $the_geom;

        // Function ST_Distance_Sphere() requires EPSG:4326 lon/lat points.
        if ($srid_map  != 4326) $point   = "ST_Transform($point, 4326)";
        if ($srid_geom != 4326) $geom_ll = "ST_Transform($the_geom, 4326)";

        $sql  = 'SELECT *, ST_Distance_Sphere(%s, %s) AS %s';
        $sql .= ' FROM %s WHERE ST_Distance_Sphere(%s, %s) < %f';
        $sql .= ' ORDER BY %s';
        $sql = sprintf($sql, $geom_ll, $point, $distance, $db_table, $geom_ll, $point, $tolerance, $distance);
        print '<!-- ' . my_html($sql) . " -->\n";
        $result = $db->query($sql);
        if (DB::isError($result)) {echo('-------+-+--'); die ($result->getMessage()); }
        $tableinfo = $result->tableInfo();
        // If there is a near point or polygon, we will do an update.
        if (! isset($_REQUEST['addnew']) and $result->numRows() > 0) {
            $record = $result->fetchRow(DB_FETCHMODE_ASSOC);
            if(! isset($_REQUEST['update_geometry'])) { //if no request on update geometry (coordinates of object)
                $point = $the_geom;
                if ($srid_geom != $srid_map) $point = "ST_Transform($point, $srid_map)";
                if($mode == 'polygon') { //if polygon mode then first dump it into array of vertices
                    $sql = "SELECT ST_X(%s), ST_Y(%s) FROM (SELECT (ST_DumpPoints(the_geom)).geom AS the_geom FROM %s WHERE %s = %s) AS b";
                } else { //point mode
                    $sql = 'SELECT ST_X(%s), ST_Y(%s) FROM %s WHERE %s = %s';
                }
                $sql = sprintf($sql, $point, $point, $db_table, $pkey, $record[$pkey]); //populate query parameters 
                if($mode == 'point') $qdata[0] = $db->query($sql)->fetchRow(DB_FETCHMODE_ORDERED); //point mode, single lat/lon coordinates, qdata[0][0] is lon and qdata[0][1] is lat
                else $qdata = $db->getAll($sql); //polygon mode, we have an array of coordinates, not single lat/lon pair. i.e. qdata[i][0] and qdata[i][1]
            } else {  //if request on update geometry (user clicked on update_geometry button)
                $qdata = transpose(array($lon_array, $lat_array));                
            }
            $new_record = false;
            $action = 'update';
            $id = $record[$pkey];
        } else {
            //transfer lat_array and long_array into 2-dimensional qdata array in the case of add new feature
            $qdata = transpose(array($lon_array, $lat_array));
            $new_record = true;
            $action = 'insert';
            $id = '';
        }

        //------------------------------------------------------------------------
        // Display the insert/update form. 
        // $lon_array, $lat_array is the clicked point(s), while qdata is coordinates of existing database object.
        //------------------------------------------------------------------------
        $html = '';
        $heading = ($new_record) ? _p('Insert new '. $mode) : _p('Update '. $mode);
        $html .= '<h2>' . $heading . "</h2>\n";
        $html .= '<form id="digitizepoints_form" name="inputform" method="post" action="' . $_SERVER['SCRIPT_NAME'] . '">' . "\n";
        $html .= '<input type="hidden" name="__action" value="' . $action . "\">\n";
        $html .= '<input type="hidden" name="__id"        id="point_id"  value="' . my_html($id) . "\">\n";
       $html .= '<input type="hidden" name="__click_lon" id="click_lon" value="' . my_html(implode('|', $lon_array)) . "\">\n"; //data for create new URL
       $html .= '<input type="hidden" name="__click_lat" id="click_lat" value="' . my_html(implode('|', $lat_array)) . "\">\n"; 
       $html .= '<input type="hidden" name="__mode" id="mode" value="' . $mode . "\">\n";

        // Display the form for record insert/update.
        $html .= "<table>\n";
        foreach ($tableinfo as $f) {
            if (in_array($f['name'], $hide_fields)) continue;
            if ($f['name'] == $the_geom) continue;
            if ($f['name'] == $distance) continue;
            $align = numeric_type($f['type']) ? 'right' : 'left';
            $type = numeric_type($f['type']) ? 'n': 'c';
            $html .= '<tr><th>' . my_html(_p($f['name'])) . "</th><td colspan=\"2\" align=\"${align}\">";
            if ($new_record) {
                $value = '';
            } else {
                $value = $record[$f['name']];
            }
            $html_name = $prefix . '_' . $type . '_' . $f['name'];
            $html .= sprintf('<input type="text" size="30" name="%s" value="%s">', my_html($html_name), my_html($value));
            $html .= "</td></tr>\n";
        }
        // Input fields for longitude and latitude.
        $i = 0;
        foreach($qdata as $latLon) {
            $i++;
            if($i==1 || $i == count($qdata)) $class ='Sync'; //make the first and the last input box having syncronized (equal) value with the help of jQuery
            else $class='';
            $html .= '<tr><th>' . _p('X').$i . '</th><td align="right">';
            $html .= sprintf('<input type="text" size="10" name="lon[]" class="%sX" value="%s">', $class, my_html($latLon[0]));
            $html .= '&emsp;&emsp;<b>' . _p('Y').$i . '</b>&emsp;';
            $html .= sprintf('<input type="text" size="10" name="lat[]" class="%sY" value="%s">', $class, my_html($latLon[1]));
            $html .= "</td></tr>\n";
        }

        $addnew_url = sprintf('?addnew=yes&lon=%s&lat=%s', implode('|', $lon_array), implode('|', $lat_array));  //?????????
        $delete_url = sprintf('?__action=delete&__id=%d', my_html($id));
        $disabled = $new_record ? 'disabled' : '';

        $html .= "<tr><th>&nbsp;</th><td>\n";
        $html .= '<input type="button" value="' . _p('Save')   . "\" onClick=\"javascript: PM.Plugin.Digitizepoints.pntSave();\" title=\"" . _p("Update current values") ."\"/>\n";
        $html .= '<input type="button" value="' . _p('Cancel') . "\" onClick=\"javascript: PM.Plugin.Digitizepoints.closeDlg();\" />\n";
        $html .= "<p>\n";
        $html .= '<input type="button" value="' . _p('Delete') . "\" onClick=\"javascript: if (!confirm(_p('Do you want to delete object?'))) return false; PM.Plugin.Digitizepoints.pntDelete();\""  . $disabled .  " title=\"" . _p("Delete current object") ."\"/>\n";
        $html .= '<input type="button" value="' . _p('Do not edit, add new') . '" onClick="javascript: PM.Plugin.Digitizepoints.pntAddNew();"' . $disabled . " title=\"" . _p("Do not update, instead create new object based on digitized coordinates") . "\"/>\n";
        $html .= '<input type="button" value="' . _p('Also update geometry') . '" onClick="javascript: PM.Plugin.Digitizepoints.pntAlsoUpdateGeometry();"' . $disabled . " title=\"" . _p("Update geometry of object based on digitized coordinates") . "\"/>\n";
        $html .= "</td>\n";
        $html .= "</table>\n";
        $html .= "</form>\n";
        $html .= "</body>\n";
        $html .= "</html>\n";

        echo $html;
        break;
}

$db->disconnect();
