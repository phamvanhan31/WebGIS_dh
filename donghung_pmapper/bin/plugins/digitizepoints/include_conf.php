<?php

//-------------------------------------------------------------------------
// Digitizepoint plugin configuration.
//-------------------------------------------------------------------------
$dsn        = 'pgsql://postgres:123456@tcp(localhost:5432)/dong_hung';
$point_db_table   = '';       // Table name. Binh added prefix point_
$polygon_db_table ='phan_hoi_kg';    //Binh added. Binh added prefix point_
$point_pkey       = 'gid';              // Table's primary key.
$polygon_pkey ='gid';               //Binh added
$point_the_geom   = 'the_geom';        // Table's geometry field, type POINT.
$polygon_the_geom ='the_geom';  // Table's geometry field, type POLYGON.
$srid_geom  = 3405;              // SRID of the geometry.
$srid_map   = 3405;              // SRID of the map (clicked screen point).
$tolerance  = 20;               // Distance in meteres to pick existing point for editing.
$point_hide_fields = array('gid');      // Table fields not displayed in the edit form. Added prefix point_
$polygon_hide_fields = array('gid');      //Polygon Table fields not displayed in the edit form. Binh added

?>
