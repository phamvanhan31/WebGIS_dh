<?php
require_once("../../incphp/pmsession.php");
require_once("../../incphp/globals.php");
require_once("fb_config.php");
if(isset($_GET['x_coord'])){
    // Connecting, selecting database
	$dbconn = pg_connect($connection_string)
    or die('Could not connect: ' . pg_last_error());

	// Performing SQL query
	//First get the ID (gid) of LUP object
	$qh_query = "SELECT gid FROM quy_hoach_sdd WHERE ST_Intersects(the_geom,ST_GeometryFromText('POINT(".$_GET['x_coord']." ".$_GET['y_coord'].")',". $map_srid. "))";
	//echo $qh_query;
	$qh_result = pg_query($qh_query) or die('Query failed: ' . pg_last_error());
	//Find all feedbacks related to the current gid
	$qh_line = pg_fetch_array($qh_result, null, PGSQL_ASSOC);
	$qh_gid = $qh_line['gid'];
	if ($qh_gid == null) {
		echo(_p('can_not_find_LUP_object_under_cursor'));
	}
	else {
		//query spatial feedback table
		$fb_query = 'SELECT phan_hoi_kg.gid as ID, nsd_id, ngay_phan_hoi, noi_dung,' . "'không gian' AS fb_type," . ' da_xu_ly, noi_dung_tra_loi, ngay_tra_loi FROM phan_hoi_kg, quy_hoach_sdd WHERE ST_Intersects(phan_hoi_kg.the_geom, quy_hoach_sdd.the_geom) AND (quy_hoach_sdd.gid =' . $qh_gid . ')';
		//and then union with query from attributive feedback table
		$fb_query .=' union ';
		$fb_query .='SELECT phan_hoi_tt.id AS ID, nsd_id, ngay_phan_hoi, noi_dung,' . "'thuộc tính' AS fb_type," . ' da_xu_ly, noi_dung_tra_loi, ngay_tra_loi FROM phan_hoi_tt, quy_hoach_sdd WHERE (qhsdd_id =' . $qh_gid . ')';
		$fb_result = pg_query($fb_query) or die('Query failed: ' . pg_last_error());
		// Printing column header in HTML
		echo '<table border="1">';
		echo "<thead>\n<tr>\n";
            $i = 0;
            for($i=0;$i<pg_num_fields($fb_result);$i++){
				echo('<th scope="col">'. _p(pg_field_name($fb_result,$i)) . '</th>');
			}
		echo "</thead>\n";
		// Printing results in HTML
		while ($fb_line = pg_fetch_array($fb_result, null, PGSQL_ASSOC)) {
			echo "\t<tr>\n";
			foreach ($fb_line as $col_value) {
				echo "\t\t<td>$col_value</td>\n";
			}
			echo "\t</tr>\n";
		}
		echo "</table>\n";
	}
	// Free resultset
	pg_free_result($qh_result);
	pg_free_result($fb_result);

	// Closing connection
	pg_close($dbconn);
	}
?>
