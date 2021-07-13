
/******************************************************************************
 *
 * Purpose: common JS util functions, setting defaults
 * Author:  Armin Burger
 *
 ******************************************************************************
 *
 * Copyright (c) 2003-2008 Armin Burger
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

/**
 * Locales function to get locale string
 */
function _p(str) {
    if (PM.Locales.list[str]) {
        return PM.Locales.list[str];
    } else {
        return str;
    }
}



/**
 * Global PMap object; 
 * stores main status variables set via incphp/js_init.php
 */
var PM = {
    scale: null,
    resize_timer: null,
    useCustomCursor: true,
    scaleSelectList: [100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000, 25000000],
    enableRightMousePan: true,
    queryResultLayout: 'table',
    queryTreeStyle: {treeview: {collapsed: true, unique: true}},
    zsliderVertical: true,
    autoIdentifyFollowMouse: false,
    useInternalCursors: false,
    suggestLaunchSearch: true,
    measureUnits: {distance:" [km]", area:" [km&sup2,]", factor:1000},
    measureObjects: {line: {color:"#FF0000", width:2}}, 
    contextMenuList: false,
    exportFormatList: ['XLS', 'CSV', 'PDF'],
    scaleBarOptions: {divisions:2, subdivisions:2 ,resolution:96, minWidth:120, maxWidth:160, abbreviateLabel:true},
    categoriesClosed: [],
    tocTreeviewStyle: {collapsed:true, persist:false},
    minx_geo: null,
    maxy_geo: null,
    xdelta_geo: null,
    ydelta_geo: null,
    Custom: {
        queryResultAddList: []
    },
    Draw: {},
    Form: {},
    Init: {},
    Layout: {},
    Locales: {list:[]},
    Map: {
        mode: 'map',
        zoom_type: 'zoomrect',
        zoom_factor: 1,
        maction: 'box',
        tool: 'zoomin',
        forceRefreshToc: false,
        zoomJitter: 10,
        bindOnMapRefresh: function(bindData, bindFunction) {
			var data, fct;
			
			if ($.isFunction(bindData) ) {
				fct = bindData;
				data = null;
			} else {
				fct = bindFunction;
				data = bindData;
			}
            //$("#mapUpdateForm").bind("reset", bindData, bindFunction);
            $("#pm_mapUpdateEvent").bind("change", data, fct);
        }
    },
    Plugin: {},
    Query: {},
    Toc: {},
    UI: {},
    ZoomBox: {},
    Util: {}
};




/*  Prototype JavaScript framework, version 1.4.0
 *  (c) 2005 Sam Stephenson <sam@conio.net>
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://prototype.conio.net/
/*--------------------------------------------------------------------------*/
function _$() {
    var elements = new Array();

    for (var i = 0; i < arguments.length; i++) {
        var element = arguments[i];
        if (typeof element == 'string')
            element = document.getElementById(element);

        if (arguments.length == 1)
            return element;

        elements.push(element);
    }

    return elements;
}


/**
 * Generic number functions
 */
Number.prototype.roundTo=function(precision){return parseFloat(parseFloat(this).toFixed(precision));};



/**
 * DOM generic functions
 */
function objL(obj) {	
    return parseInt(obj.style.left || obj.offsetLeft);
}

function objT(obj) {
    return parseInt(obj.style.top || obj.offsetTop);
}

function objW(obj) {
	return parseInt( obj.style.width || obj.clientWidth );
}

function objH(obj) {		
    return parseInt( obj.style.height || obj.clientHeight);    
}

function hideObj(obj) {
    obj.style.visibility = 'hidden';
}

function showObj(obj) {
    obj.style.visibility = 'visible';
}






/*****************************************************************************
 *
 * Purpose: Functions for forms and scale selection list
 * Author:  Armin Burger
 *
 *****************************************************************************
 *
 * Copyright (c) 2003-2006 Armin Burger
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

$.extend(PM.Form,
{
    scale_timeout: null,

    initScaleSelect: function() {
        try {
            this.writeScaleList(PM.scaleSelectList);
        } catch(e) {
            return false;
        }
    },

    writeScaleList: function(scaleList) {
        var scaleListLen = scaleList.length;
        
        // If no scales defined don't use select function
        if (scaleListLen < 1) {
            return false;
        } else {
            $('#scaleArea input').attr("autocomplete", "off");
        }
        var sobj = $('#scaleSuggest');
        sobj.show();
        sobj.html('');

        var suggest_all = '';
        for(var i=0; i < scaleListLen ; i++) {
            var sclink = i<1?'scale-link-over':'scale-link';
            var suggest = '<div onmouseover="javascript:PM.Form.scaleOver(this);" ';
            suggest += 'onmouseout="javascript:PM.Form.scaleOut(this);" ';
            suggest += 'onclick="PM.Form.insertScaleTxt(this.innerHTML);" ';
            suggest += 'class="' + sclink + '">' + scaleList[i] + '</div>';
            suggest_all += suggest;
        }
        sobj.html(suggest_all);
    },

    insertScaleTxt: function(value) {
        var newScale = value.replace(/,|'|\.|\s/g, '');
        $('#scaleinput').val(newScale);
        $('#scaleSuggest').html('');
        this.hideScaleSuggest();
        PM.Map.zoom2scale(newScale);
    },

    scaleOver: function(div_value) {
        div_value.className = 'scale-link-over';
    },


    scaleOut: function(div_value) {
        div_value.className = 'scale-link';
    },

    scaleMouseOut: function(force) {
        var sobj = _$('scaleSuggest');
        var scaleDivList = sobj.getElementsByTagName('DIV');
        var hlStyle = false;

        for (var i=0; i<scaleDivList.length; i++) {
            if (scaleDivList[i].className == 'scale-link-over') {
                hlStyle = true;
            }
        }
        
        if (force) {
            setTimeout("PM.Form.hideScaleSuggest()", 500);
            //return false;
        } else {
        
            clearTimeout(this.scale_timeout);
            if (hlStyle) {
                
            } else {
                this.scale_timeout = setTimeout("PM.Form.hideScaleSuggest()", 500);
            }
        }
    },

    hideScaleSuggest: function() { 
        $('#scaleSuggest').hide();
    },

    setScaleMO: function() {
        scale_mouseover = true;
    },
    
    
    
    /**
     * Return form values in key=value pair notation
     */
    getFormKVP: function(formid) {
        var htmlform = document.getElementById(formid);
        //alert(searchForm.elements);
        var el = htmlform.elements;
        var s = '';
        for (var i=0; i < el.length; i++) {
            var e = el[i]; 
            var ename = e.name;
            var evalue = e.value;
            var etype = e.type;
            var delim = (i>0 ? '&' : '');
            
            if (evalue.length > 0 && evalue != '#') {
                //alert(etype + ' - ' + evalue);
                switch (etype) {
                    //case 'text':
                    case 'select-one':
                        s += delim + ename + '=' + e.options[e.selectedIndex].value;
                        break;
                
                    case 'select-multiple':
                        var ol = e.options;
                        var opttxt = '';
                        for (var o=0; o < ol.length; o++) {
                            if (ol[o].selected) {
                                opttxt += ol[o].value + ',';
                            }
                        }
                        s += delim + ename + '=' + opttxt.substr(0, opttxt.length - 1); 
                        break;
                        
                    case 'checkbox':
                        if (e.checked) {
                            s += delim + ename  + '=' + evalue;
                        }
                        break;
                        
                    case 'radio':
                        if (e.checked) {
                            s += delim + ename  + '=' + evalue;
                        }
                        break;
                        
                    default:
                        s += delim + ename  + '=' + evalue;
                        break;
                }
            }
        }
        //alert(s);
        return s;
    },
    
    
    getFormKvpObjAll: function(formid) {
        var htmlform = document.getElementById(formid);
        //alert(searchForm.elements);
        var el = htmlform.elements;
        var q = {};
        for (var i=0; i < el.length; i++) {
            var e = el[i]; 
            var ename = e.name;
            var evalue = e.value;
            var etype = e.type;
            var eid = e.id;
            
            if (evalue.length > 0 && evalue != '#') {
                //alert(etype + ' - ' + evalue);
                switch (etype) {
                    //case 'text':
                    case 'select-one':
                        q[ename] = e.options[e.selectedIndex].value;
                        break;
                
                    case 'select-multiple':
                        var ol = e.options;
                        var opttxt = '';
                        for (var o=0; o < ol.length; o++) {
                            if (ol[o].selected) {
                                opttxt += ol[o].value + ',';
                            }
                        }
                        q[ename] = opttxt.substr(0, opttxt.length - 1); 
                        break;
                        
                    case 'checkbox':
                        if (e.checked) {
                            if (q[ename]) {
                                q[ename] += ',' + eid;
                            } else {
                                q[ename] = eid;
                            }
                        }
                        break;
                        
                    case 'radio':
                        if (e.checked) {
                            q[ename] = evalue;
                        }
                        break;
                        
                    default:
                        q[ename] = evalue;
                        break;
                }
            }
        }
        
        //alert(s);
        return q;
    },
    
    getFormKvpObj: function(el) {
        if (el.is("input[type='text']")) {
            //alert('text');
        } else if (el.is("input[type='select']")) {
            //alert('select-one');
        }
        //alert(el.id());

        
        //alert(s);
        return q;
    }
    

});
/******************************************************************************
 *
 * Purpose: Geometry library for measurements and digitizing
 * Author:  Federico Nieri, Commune di Prato
 *
 ******************************************************************************
 *
 * Copyright (c) 2006 Federico Nieri
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version. See the COPYING file.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 ******************************************************************************/



/**************************************/
/*************   POINT   **************/
/**************************************/

/**
 * Point constructor
 * @param x: x coordinate
 * @param y: y coordinate
 */
function Point(x,y){	
	this.x = parseFloat(x);
	this.y = parseFloat(y);
}

/**
 * Overriting of the standard toString Object method.
 * @param xySeparator: chars separating x coordinate from y coordinate of a point. Default " ".
 * @return a string that is the sequence of the point coordinates
 *
 * Example:
 * var p = new Point(1,2);
 * p.toString();    // return "1 2"
 * p.toString("|"); // return "1|2"
 */
Point.prototype.toString = function(xySeparator){
	xySeparator = !xySeparator ? " " : ("" + xySeparator);
	return (this.x + xySeparator + this.y);
}

/**
 * Return true if this point has the same coordinates of the passed point
 * @param otherPoint: Point object to compare
 */
Point.prototype.equals = function(otherPoint){
	return (this.x == otherPoint.x && this.y == otherPoint.y);
}

/**************************************/
/*************    LINE    *************/
/**************************************/

/**
 * Line constructor
 * @param firstPoint:  first Point objetc
 * @param secondPoint: second Point objetc
 */
function Line(firstPoint,secondPoint){

	this.firstPoint = firstPoint;
	this.secondPoint = secondPoint;	

	// y = a x + b;
	if(secondPoint.x == firstPoint.x){
	  // x = b;
    this.a = (secondPoint.y - firstPoint.y)<0 ? Number.NEGATIVE_INFINITE : Number.POSITIVE_INFINITE;
    this.b =  firstPoint.x;
    this.vertical = true;
  }else{
    this.a = (secondPoint.y - firstPoint.y)/(secondPoint.x-firstPoint.x);
    this.b = firstPoint.y - this.a * firstPoint.x;
    this.vertical = false;
  }  	
  
}

/**
 * Return true if this line has defining points with same coordinates of those
 * defining the passed line
 * @param otherPoint: Line object to compare
 */
Line.prototype.equals = function(otherLine){
	return (this.getFirstPoint().equals(otherLine.getFirstPoint()) && this.getSecondPoint().equals(otherLine.getSecondPoint()));
}

/**
 * Return the length of the line (distance from first point to second point)
 */
Line.prototype.getLength = function(){
	return Math.sqrt((Math.pow(this.secondPoint.x - this.firstPoint.x, 2)) + (Math.pow(this.secondPoint.y - this.firstPoint.y, 2)));
}

/**
 * Return the first Point object of the line
 */
Line.prototype.getFirstPoint = function(){
	return this.firstPoint;
}

/**
 * Return the second Point object of the line
 */
Line.prototype.getSecondPoint = function(){
	return this.secondPoint;
}

/*
 * Return true if the line is vertical
 */ 
Line.prototype.isVertical = function(){
  return this.vertical;
}

/*
 * Return true if the line is parallel to the line passed
 * @param otherLine: Line object to compare
 */ 
Line.prototype.isParallel = function(otherLine){
  return (otherLine.isVertical() && this.isVertical()) || (Math.abs(otherLine.a) == Math.abs(this.a)); 
}

/*
 * Return the Point object of intesection if found, null otherwise
 * @param otherLine: Line object to check for the intersection
 */
Line.prototype.intersection = function(otherLine){

  if(this.isParallel(otherLine)) return null;
  
  var xInt;
  var yInt;
  
  if(this.isVertical()){
    xInt = this.getFirstPoint().x;
    yInt = (otherLine.a * xInt) + otherLine.b;
  }else if(otherLine.isVertical()){
    xInt = otherLine.getFirstPoint().x;
    yInt = (this.a * xInt) + this.b;
  }else{
    xInt = (this.b - otherLine.b) / (otherLine.a - this.a);
    yInt = (this.a * xInt) + this.b;
  }
      
  if( ! (xInt >= Math.min(this.getFirstPoint().x,this.getSecondPoint().x) && xInt <= Math.max(this.getFirstPoint().x,this.getSecondPoint().x) && xInt >= Math.min(otherLine.getFirstPoint().x,otherLine.getSecondPoint().x) && xInt <= Math.max(otherLine.getFirstPoint().x,otherLine.getSecondPoint().x)))
    return null;
  
  if( ! (yInt >= Math.min(this.getFirstPoint().y,this.getSecondPoint().y) && yInt <= Math.max(this.getFirstPoint().y,this.getSecondPoint().y) && yInt >= Math.min(otherLine.getFirstPoint().y,otherLine.getSecondPoint().y) && yInt <= Math.max(otherLine.getFirstPoint().y,otherLine.getSecondPoint().y)))
    return null;
    
  return new Point(xInt,yInt);
}

/**
 * Overriting of the standard toString Object method.
 * @param xySeparator: chars separating x coordinate from y coordinate of a point. Default " ".
 * @param ptSeparator: chars separating first point coordinates from second point coordinates. Default ",".
 * @return a string that is the sequence of the first point coordinates and the second point coordinates
 *
 * Example:
 * var p1 = new Point(1,2);
 * var p2 = new Point(3,4);
 * var ln = new Line(p1,p2);
 * ln.toString();         // return "1 2,3 4"
 * ln.toString("|","-");  // return "1|2-3|4"
 * var s = "" + ln;       // s = "1 2,3 4"
 */
Line.prototype.toString = function(xySeparator, ptSeparator){

	if(!xySeparator) xySeparator=" ";
	if(!ptSeparator) ptSeparator=",";
	
	return (this.firstPoint.toString() + ptSeparator + this.secondPoint.toString());
}

/***************************************/
/******   POLYGON (POLYLINE)  **********/
/***************************************/

/**
 * Polygon constructor
 * @param points: array of Point objects (vertexes of polygon)
 */
function Polygon(points){
	this.setPoints(points);
}

/**
 * Return the area of the polyon. If the polyline is not closed or the number of
 * points is less than 4 (closed triangol) the returned value is 0.
 */
Polygon.prototype.getArea = function(){
	
	if(!this.isClosed()) return 0;
	
	var points = this.getPoints();
	
	if(points.length < 4) return 0;
		    
    var area = 0;
    for(var k=0; k < (points.length-1) ; k++) {        	
       area += (( points[k+1].x - points[k].x ) * ( points[k+1].y + points[k].y ));                     
    }
    area = area / 2;    
    return area;	
    
}

/**
 * Return the length of the polyline (perimeter of polygon).
 */
Polygon.prototype.getPerimeter = function(){
	
	var nSides = this.getSidesNumber();
	var perimeter = 0;
	
    for(var n = 1; n <= nSides ; n++) {        	
       perimeter += this.getSideLength(n);
    }
    
    return perimeter;	
}

/**
 * Return an array containing all the points of the polyline
 */
Polygon.prototype.getPoints = function(){
	var tmpPoints = new Array();
	for(var i = 0 ; i < this.points.length; i++){
		tmpPoints[i] = this.points[i];
	}
	return tmpPoints;
}

/**
 * Return the point specified. Indexes start from 0.
 * @param index: index of the point in the list
 */ 
Polygon.prototype.getPoint = function(index){
	return this.points[index];
}

/**
 * Set the array of points defining the polyline
 * @param points: array of Point objects
 */
Polygon.prototype.setPoints = function(points){
	if(points && points instanceof Array){
		this.points = points;
	}else{
		this.points = new Array();
	}
}

/**
 * Add a point a the end of the polyline
 * @param point: Point object
 */
Polygon.prototype.addPoint = function(point){
	this.points.push(point);
}

/**
 * Return the number of points of the polyline
 */
Polygon.prototype.getPointsNumber = function(){	
	return this.points.length;
}

/**
 * Return the number of sides
 */
Polygon.prototype.getSidesNumber = function(){	
  if(this.points.length == 0) return 0;
	return this.points.length-1;
}

/**
 * Return an array containing the list of the x coordinate of all points 
 */
Polygon.prototype.getXList = function(){	
	var xList = new Array();
	for(var i = 0 ; i < this.points.length; i++){
		xList[i] = this.points[i].x;
	}
	return xList;
}

/**
 * Return an array containing the list of the y coordinate of all points 
 */
Polygon.prototype.getYList = function(){	
	var yList = new Array();
	for(var i = 0 ; i < this.points.length; i++){
		yList[i] = this.points[i].y;
	}
	return yList;
}

/**
 * Delete the point specified by index
 * @param index: index of the point to delete
 */
Polygon.prototype.delPoint = function(index){
	this.points.splice(index,1);
}

/**
 * Close the polyline, to obtain a polygon, if this isn't closed yet.
 * A polyline is closed if the last point is equals to the first one.
 */
Polygon.prototype.close = function(){
	if(!this.isClosed()){
		this.addPoint(this.getPoint(0));
	}
}

/**
 * Return true if the last point is equals to the first one, 
 * false otherwise.
 */
Polygon.prototype.isClosed = function(){
	var points = this.getPoints();	
	return (points.length>2 && points[0].equals(points[points.length-1]));
}

/* resituisce la lunghezza del lato indicato.
   Il numero dei lati comincia dal lato 1 */
Polygon.prototype.getSideLength = function(sideNumber){
	return Math.sqrt((Math.pow(this.points[sideNumber].x - this.points[sideNumber-1].x, 2)) + (Math.pow(this.points[sideNumber].y - this.points[sideNumber-1].y, 2)));
}

/**
 * Return a Line object that is the last side of the polyline
 * Indexes start from 1
 * @param sideNumber: index of the sides
 */
Polygon.prototype.getSide = function(sideNumber){
	if(sideNumber==0) return null;
	if(sideNumber > this.getSidesNumber()) return null;
	
	return new Line(this.getPoint(sideNumber-1),this.getPoint(sideNumber));
}

/**
 * Return the last Line object of the polyline
 */
Polygon.prototype.getLastSide = function(){
	return this.getSide(this.getSidesNumber());
}

/**
 * Return the first Line object of the polyline
 */
Polygon.prototype.getFirstSide = function(){
	return this.getSide(1);
}

/**
 * Reset the array of points defining the polyline
 */
Polygon.prototype.reset = function(){
	this.points.length = 0;
}


/**
 * Overriting of the standard toString Object method.
 * @param xySeparator: chars separating x coordinate from y coordinate of a point. Default " ".
 * @param ptSeparator: chars separating points coordinates from one to another. Default ",".
 * @return a string that is the sequence of points coordinates of the polyline
 *
 * Example:
 * var p1 = new Point(1,2);
 * var p2 = new Point(3,4);
 * var p3 = new Point(5,6);
 * var points = new Array(p1,p2,p3);
 * var poly = new Polygon(points);
 *
 * poly.toString();       // return "1 2,3 4,5 6"
 * poly.toString("|","-");  // return "1|2-3|4-5|6"
 * var s = "" + poly;       // s = "1 2,3 4,5 6"
 */
Polygon.prototype.toString = function(xySeparator, ptSeparator){
	
	if(!xySeparator) xySeparator=" ";
	if(!ptSeparator) ptSeparator=",";
			
	var pointsString = "";
	var points = this.getPoints();
	
	for(var i = 0; i < points.length; i++){
		pointsString += points[i].toString(xySeparator);
		if(i < (points.length-1)){
			pointsString += ptSeparator;
		}
	}
	return pointsString;
}



/*
var p1 = new Point(1,1); // 1
var p2 = new Point(4,4); // 2
var p3 = new Point(3,6); // 1
var p4 = new Point(3,0); // 2
//var p5 = new Point(4,0); // 3

var l1 = new Line(p1,p2);
var l2 = new Line(p3,p4);
//var l3 = new Line(p4,p5);

//alert("l1 is vertical = " + l1.isVertical());
//alert("l2 is vertical = " + l2.isVertical());

//alert("l1 is parallel to l2 = " + l1.isParallel(l2));

alert("intersect = " + l1.intersection(l2));
*/
//var pol = new Polygon([p1,p2,p3]);
/*
alert(" p1 uguale a p2 ? "+p1.equals(p2));
alert(" p1 uguale a p3 ? "+p1.equals(p3));
alert(" l1 uguale a l2 ? "+l1.equals(l2));
alert(" l1 uguale a l3 ? "+l1.equals(l3));
alert(" l1.toString() = "+l1.toString());
alert(" pol.toString('_','|') = "+pol.toString("_","|"));
*/
/*
var points = new Array();

points[0] = p1;
points[1] = p2;
points[2] = p3;

var pol = new Polygon();

pol.addPoint(p1);
pol.addPoint(p2);
pol.addPoint(p3);

alert("1 - is closed : ("+pol+") " + pol.isClosed());

alert("1 - Area = " + pol.getArea());
pol.close();

alert("2 - is closed : ("+pol+") " + pol.isClosed());
alert("2 - Area  = " + pol.getArea());
alert("2 - Perim = " + pol.getPerimeter());

*/
/******************************************************************************
 *
 * Purpose: initialize various p.mapper settings 
 * Author:  Armin Burger
 *
 ******************************************************************************
 *
 * Copyright (c) 2003-2009 Armin Burger
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


$.extend(PM.Init,
{


     /**
     * Initialize function; called by 'onload' event of map.phtml
     * initializes several parameters by calling other JS function
     */
    main: function() {      
        // initialization of toolbar, menu, slider HOVER's (and others)
        this.toolbar();
        this.menu();
        this.slider();
        this.domElements();
        
        // Add properties to mapImg
        $("#mapImg").load(function(){PM.resetMapImgParams();}).mouseover(function(){PM.ZoomBox.startUp();});
        
        // Initialize TOC/legend
        this.tabs('#tocTabs', 'tab_toc');
        PM.Toc.init(false);

        createZSlider('zslider');
        PM.Query.setSearchOptions();
        PM.Map.domouseclick('zoomin');
        PM.setTbTDButton('zoomin');
        this.indicatorCont();
        
        // Add jQuery events
        $('#mapimgLayer').mouseout( function() { setTimeout('PM.Query.mapImgMouseOut()', 800); });  
        $('#refMapImg').mouseover( function() {PM.ZoomBox.startUpRef();} );
        
        // Enables actions for keyboard keys
        PM.ZoomBox.initKeyNavigation();
    },


    domElements: function() {
        $('<div>').id('mapToolArea').appendTo('.ui-layout-center');
    },

    /**
     * HOVER effect for slider
     * initialized in pm_init()
     */
    slider: function() {
        $('#sliderArea').hover(
            function(){ $(this).addClass("slider-area-over").removeClass("slider-area-out"); },
            function(){ $(this).addClass("slider-area-out").removeClass("slider-area-over"); }
        );
    },

    /**
     * DHTML jQuery menu
     * initialized in pm_init()
     */
    menu: function() {
        $('ul.pm-menu > li').each(function() {            
            $(this).hover(
                function() { $(this).addClass('pm-menu_hover'); },
                function() { $(this).removeClass('pm-menu-hover'); }
            );

            $(this).click(function() {
                this.menu_toggle($(this).parent().id());
                eval($(this).id().replace(/pmenu_/, '') + '()');
            });
        });
    },

    /**
     * Show/hide pm-menu
     */
    menu_toggle: function(menu)
    {
        var obj = $('#' + menu); 
        if (obj.css('display') == 'none') {
            obj.show('fast');
            $('#' + menu + '_start > img').src('images/menuup.gif');
        } else {
            obj.hide('fast');
            $('#' + menu + '_start > img').src('images/menudown.gif');
        }
    },

    /**
     * Initialize toolbar hover's
     */
    toolbar: function() {
        if (PM.tbImgSwap != 1) {
            $('td.pm-toolbar-td').each(function() {            
                $(this).hover(
                    function(){ if (! $(this).hasClass("pm-toolbar-td-on")) $(this).addClass("pm-toolbar-td-over"); },
                    function(){ $(this).removeClass("pm-toolbar-td-over"); }
                );
            });
        } else {
             $('td.pm-toolbar-td').each(function() {            
                $(this).hover(
                    function(){ if (!$(this).find('>img').src().match(/_on/)) $(this).find('>img').imgSwap('_off', '_over'); },
                    function(){ $(this).find('>img').imgSwap('_over', '_off'); }
                );
            });
        }
    },

    /**
     * Initialize buttons
     */
    cButton: function(but) {
        $("#" + but).hover(
            function(){ $(this).addClass("button_on").removeClass("button_off"); },
            function(){ $(this).addClass("button_off").removeClass("button_on"); }
        );
    },

    cButtonAll: function() {
        $("[name='custombutton']").each(function() {            
            $(this).hover(
                function(){ $(this).addClass("button_on").removeClass("button_off"); },
                function(){ $(this).addClass("button_off").removeClass("button_on"); }
            );
        });
    },


    /**
     * Initialize Tabs
     */
    tabs: function(tabdiv, activated) {   
        $(tabdiv + '>ul>li>a#'+activated).parent().addClass('tabs-selected');   
        var numTabs = $(tabdiv + '>ul>li').length;
        var tabW = parseInt(100 / numTabs) + '%';
        $(tabdiv + '>ul>li>a').each(function() {            
            $(this).click(function() {  
                $(tabdiv + '>ul>li').removeClass('tabs-selected');
                $(this).parent().addClass('tabs-selected');         
            });
            $(this).parent().css('width',tabW);
        });
    },

    /**
     * add div for wait indicator
     */
    indicatorCont: function() {
        $('body').append('<div id="pmIndicatorContainer" style="display:none; position:absolute; z-index:99"><img src="images/indicator.gif" alt="wait" /></div>');
    },


    /**
     * Initialize all context menus
     */
    contextMenus: function() {
        if (PM.contextMenuList) {
            $.each(PM.contextMenuList, function() {
                var cmdiv = '<div style="display:none" class="contextMenu" id="' + this.menuid + '">';
                var cmbindings = {};
                
                cmdiv += '<ul>';
                $.each(this.menulist, function() {
                    cmdiv += '<li id="' + this.id + '">';
                    var text = _p(this.text);
                    if (this.imgsrc) cmdiv += '<img src="images/menus/' + this.imgsrc + '" alt="' + text + '"/>';
                    cmdiv += text + '</li>';
                    
                    var run = this.run;
                    cmbindings[this.id] = function(t) {eval(run + '("' + t.id + '")');};
                });
                
                $('body').append(cmdiv);
                $(this.bindto).contextMenu(this.menuid, {
                    bindings: cmbindings, 
                    menuStyle: this.styles.menuStyle,
                    itemStyle: this.styles.itemStyle,
                    itemHoverStyle: this.styles.itemHoverStyle
                });
            });
        }
    },
    
    /**
     * Update s1 value for slider settings
     */
    updateSlider_s1: function(pixW, pixH) {
        var maxScale1 = ((PM.dgeo_x * PM.dgeo_c) / pixW) / (0.0254 / 96);
        var maxScale2 = ((PM.dgeo_y * PM.dgeo_c) / pixH) / (0.0254 / 96);
        PM.s1 = Math.max(maxScale1, maxScale2);
    }


});
/******************************************************************************
 *
 * Purpose: functions related to jquery-ui-layout 
 * Author:  Armin Burger
 *
 ******************************************************************************
 *
 * Copyright (c) 2003-2008 Armin Burger
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

$.extend(PM.Layout,
{
    
    resizeTimer: null,
    
    resizeTimeoutThreshold: 1000,
        
    /**
     * Resize the map zone in dependency to the parent element
     * called by 'onresize' event of ui element containing the map
     */
    resizeMapZone: function() {
        var mapParent = $('#map').parent();
        PM.mapW = mapParent.width();
        PM.mapH = mapParent.height();    
        $('#map, #mapimgLayer, #mapImg').width(PM.mapW).height(PM.mapH); 
        var loadimg = $('#loadingimg');
        $('#loading').left(PM.mapW/2 - loadimg.width()/2).top(PM.mapH/2 - loadimg.height()/2 ).showv();
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+ '&mapW=' + PM.mapW + '&mapH=' + PM.mapH + '&zoom_type=zoompoint';
        
        // avoid multiple resize events 
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout("PM.Map.updateMap('" + mapurl + "', '')", this.resizeTimeoutThreshold);     
        
        PM.Init.updateSlider_s1(PM.mapW, PM.mapH) ;        
    }
    
});
/******************************************************************************
 *
 * Purpose: main interaction with Mapserver specific requests 
 *          like zoom, pan, etc. 
 * Author:  Armin Burger
 *
 ******************************************************************************
 *
 * Copyright (c) 2003-2011 Armin Burger
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


$.extend(PM.Map,
{
    
    /**
     * FUNCTION IS CALLED BY ZOOMBOX -> FUNCTION chkMouseUp(e)
     * main function for zoom/pan interface
     * calls different zoom functions (see below)
     */
    zoombox_apply: function(minx, miny, maxx, maxy) {
        var imgbox = minx + "+" + miny + "+" + maxx + "+" + maxy;
        var imgxy  = minx + "+" + miny;
        //alert(imgbox);
        // NORMAL MOUSE ACTIONS IN MAIN MAP //
        if (PM.ZoomBox.refmapClick == false) {

            // ZOOM/PAN ACTIONS
            var vmode = PM.Map.mode;
            
            if (vmode == 'map' || PM.ZoomBox.rightMouseButton) {
                // Only click
                if ((minx + this.zoomJitter) > maxx && (miny + this.zoomJitter) > maxy) {
                    if (PM.Map.zoom_type == 'zoomrect') {
                        if (PM.ZoomBox.rightMouseButton) {
                            zoom_factor = 1; 
                        } else {
                            zoom_factor = 2;
                        }
                        this.zoompoint(zoom_factor, imgxy);
                        
                    } else {
                       // Pan
                       var zoom_factor = PM.Map.zoom_factor;
                       this.zoompoint(zoom_factor, imgxy);
                    }
                
                // Zoombox 
                } else {
                    this.zoomin(imgbox);
                }

            // QUERY/IDENTIFY ACTIONS
            // query on all visible groups
            } else if (vmode == 'query') {
                PM.Query.showQueryResult('query', imgxy);
            // query only on selected group with multiselect
            } else if (vmode == 'nquery') {
                var selform = _$("selform");
                if (!selform) return false;
                if (!selform.selgroup) return false;
                if (selform.selgroup.selectedIndex != -1) {
                    // only with single click
                    if ((minx + this.zoomJitter) > maxx && (miny + this.zoomJitter) > maxy) {     // x/y point
                        PM.Query.showQueryResult('nquery', imgxy);
                    // with zoom box
                    } else {
                        PM.Query.showQueryResult('nquery', imgbox);                      // rectangle
                    }
                }
            } else if (vmode == 'poi') {
                PM.Dlg.openPoi(imgxy);
            } else {
                try {
                    var fct = vmode + '_start';
                    if ($.isFunction(this[fct])) {
                        eval('this.' + fct + '(imgbox)');
                    }
                    return false;
                } catch(e) {
                	if (window.console) console.log(e);
                }
            }

        // ACTIONS IN REF MAP //
        } else {
            this.zoomref(imgxy);
        }
    },


    /**
     * Zoom to point
     */
    zoompoint: function(zoomfactor, imgxy) {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoompoint&zoom_factor='+zoomfactor+'&imgxy='+imgxy;
        this.updateMap(mapurl);
    },

    /**
     * Zoom to rectangle
     */
    zoomin: function(extent) {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomrect&imgbox='+extent  ;
        //alert(mapurl);
        this.updateMap(mapurl);
    },

    /**
     * Zoom to geo-extent (map units), applied from info page link
     */
    zoom2extent: function(layer,idx,geoextent,zoomfull) {
        // Check if resultlayers shall be passed
        if (zoomfull == 1) {                            // no
            var layerstring = '';
        } else {
            var layerstring = '&resultlayer='+layer+'+'+idx;     // yes
        }
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomextent&extent='+geoextent+layerstring;
        this.updateMap(mapurl);
    },

    /**
     * Zoom to full extent
     */
    zoomfullext: function() {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomfull';
        this.updateMap(mapurl);
    },

    /**
     * Go back to pevious extent
     */
    goback: function() {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomback';
        this.updateMap(mapurl);
    },

    /**
     * Go forward
     */
    gofwd: function() {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomfwd';
        this.updateMap(mapurl);
    },

    /**
     * Zoom to layer/group
     */
    zoom2group: function(gid) {
        var groupname = gid.replace(/ligrp_/, '');
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomgroup&groupname=' + groupname;
        this.updateMap(mapurl);
    },

    /**
     * Zoom to selection
     */
    zoom2selected: function() {
        if (typeof(PM.extentSelectedFeatures)!='undefined') {
            if (PM.extentSelectedFeatures) {
                var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomextent&extent='+PM.extentSelectedFeatures;
                this.updateMap(mapurl);
                //var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomselected';
                //updateMap(mapurl);
            }
        }
    },

    /**
     * Draw map with new layers/groups
     */
    changeLayersDraw: function() {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&zoom_type=zoompoint';
        this.updateMap(mapurl);
    },

    /**
     * Stop loading on click
     */
    clickStopLoading: function() {
        this.stoploading();
        if (document.all) { 
            document.execCommand('Stop');
        } else {
            window.stop();
        }
    },

    /**
     * Pan via arrow buttons or keyboard
     */
    pansize: 0.1,    
    arrowpan: function(direction) {
        var px, py;
        if (direction == 'n') {
            px = (PM.mapW - 1) / 2;
            py = (0 + this.pansize) * PM.mapH;
        } else if (direction == 's') {
            px = (PM.mapW - 1) / 2;
            py = (1 - this.pansize) * PM.mapH;
        } else if (direction == 'e') {
            px = (1 - this.pansize) * PM.mapW;
            py = (PM.mapH - 1) / 2;
        } else if (direction == 'w') {
            px = (0 + this.pansize) * PM.mapW;
            py = (PM.mapH - 1) / 2;
        } else {
        	px = (PM.mapW - 1) / 2;
        	py = (PM.mapH - 1) / 2;
        }
        this.zoompoint(1, px + "+" + py);
    },

    /**
     * Reference image zoom/pan
     */
    zoomref: function(imgxy) {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=ref&imgxy='+imgxy  ;
        this.updateMap(mapurl);
    },

    /**
     * Set overview image to new one
     */
    setRefImg: function(refimgsrc){
         var refimg = parent.refFrame.document.getElementById('refimg');
         refimg.src = refimgsrc;
    },

    /**
     * Zoom to scale
     */
    zoom2scale: function(scale) {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomscale&scale='+scale;
        this.updateMap(mapurl);
    },

    /**
     * Write scale to input field after map refresh
     */
    writescale: function(scale) {   
        if (_$("scaleform")) _$("scaleform").scale.value = scale;
    },

    /**
     * Mouse click button functions (for toolbar)
     */
    domouseclick: function(button) {
        this.resetFrames();
        
        // change tool --> execute quit function
        try {
        	if (typeof(PM.Map.mode) != 'undefined' && PM.Map.mode != button) {
	            var fct = PM.Map.mode + '_Quit';
	            if ($.isFunction(PM.Map[fct])) {
	                eval('PM.Map.' + fct + '()');
	            }
        	}
        } catch(e) {
        	if (window.console) console.log(e);
        }
                
        switch (button) {
            case 'home':
                this.zoomfullext();
                break;
            
            case 'zoomin':
                PM.Map.mode = 'map';
                PM.Map.zoom_type = 'zoomrect';
                PM.Map.maction = 'box';
                PM.Map.tool = 'zoomin';
                break;
            case 'zoomout':
                PM.Map.mode = 'map';
                PM.Map.zoom_type = 'zoompoint';
                PM.Map.zoom_factor = -2;
                PM.Map.maction = 'click';
                PM.Map.tool = 'zoomout';
                break;
            case 'identify':
                PM.Map.mode = 'query';
                PM.Map.maction = 'click';
                PM.Map.tool = 'identify';
                break;
            case 'pan':
                PM.Map.mode = 'map';
                PM.Map.zoom_type = 'zoompoint';
                PM.Map.zoom_factor = 1;
                PM.Map.maction = 'pan';
                PM.Map.tool = 'pan';
                break;
            case 'select':
                PM.Map.mode = 'nquery';
                PM.Map.maction = 'box';
                PM.Map.tool = 'select';
                var selurl = PM_XAJAX_LOCATION + 'x_select.php?'+SID;
                PM.Map.updateSelectTool(selurl);
                //_$('loadFrame').src = selurl;
                break;
            case 'auto_identify':
                PM.Map.mode = 'iquery';
                PM.Map.maction = 'move';
                PM.Map.tool = 'auto_identify';
                var selurl = PM_XAJAX_LOCATION + 'x_select.php?'+SID+'&autoidentify=1';
                PM.Map.updateSelectTool(selurl);
                break;
            case 'measure':
                PM.Map.maction = 'measure';
                PM.Map.mode = 'measure';
                PM.Map.tool = 'measure';
                PM.UI.createMeasureInput();
                break;
            case 'digitize':
                PM.Map.mode = 'digitize';
                PM.Map.maction = 'click';
                PM.Map.tool = 'digitize';
                break;
            case 'poi':   
                PM.Map.mode = 'poi';
                PM.Map.maction = 'click';
                PM.Map.tool = 'poi';
                break;
            default:
                // for anything else (new) apply function 'button_click()'
                try {
                    var fct = button + '_click';
                    if ($.isFunction(PM.Map[fct])) {
                        eval('PM.Map.' + fct + '()');
                    }
                    return false;
                } catch(e) {
                	if (window.console) console.log(e);
                }
        }
        
        // Set cursor appropriate to selected tool 
        if (PM.useCustomCursor) {
            PM.setCursor(false, false);
        }
    },

    /**
     * custom sample script for extending tool functions
     */
    poi_click: function() {
        PM.Map.mode = 'poi';
        PM.Map.maction = 'click';
        PM.Map.tool = 'poi'; 
        
        if (PM.useCustomCursor) {
            PM.setCursor(false, 'crosshair');
        }
    },

    /**
     * Called by various activated tools to disable certain displayed features for measure and select
     */
    resetFrames: function() {
        this.hideHelpMessage();
        $('#mapToolArea').hide().html('');
        if (PM.Map.mode == 'nquery' || PM.Map.mode == 'iquery' || PM.Map.maction == 'measure') {
            if (PM.Map.maction == 'measure') {
                PM.Draw.resetMeasure();
            }
            if (PM.Map.mode == 'iquery' || PM.Map.mode == 'nquery') hideObj(_$('iqueryContainer'));
            
        } else {
            $('#mapToolArea').hide().html('');
        }
    },

    /**
     * Reload application
     */
    reloadMap: function(remove) {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&zoom_type=zoompoint';
        if (remove) {
            mapurl += '&resultlayer=remove';
            PM.extentSelectedFeatures = null;
        }
        this.updateMap(mapurl);
    },

    /**
     * Show help message over map
     */
    showHelpMessage: function(hm) {
        $('#helpMessage').html(hm).show();
    },

    /**
     * Hide help message over map
     */
    hideHelpMessage: function() {
        $('#helpMessage').html('').hide();
    },

    /**
     * Close info win and unregister session var 'resultlayer'
     */
    clearInfo: function() {
        PM.Map.zoomselected = '0';
            this.reloadMap(true);
    },

    /**
     * Set slider image depending on scale
     * Values defined in 'config.ini'
     */
    setSlider: function(curscale) {
        if (myslider) {
            var sliderPos = getSliderPosition(curscale);
            myslider.setPosition(sliderPos);
            if (_$('refsliderbox')) hideObj(_$('refsliderbox'));
        }
        return false;
    },
    
    /**
     * For loading/updating the MAP
     */
    updateMap: function(murl) {
        $("#loading").showv();
        //if (window.console) console.log(murl);
        $.ajax({
            url: murl,
            dataType: "json",
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            },
            success: function(response){
                // Reload application when PHP session expired
                var sessionerror = response.sessionerror;
                if (sessionerror == 'true') {
                   errormsg = _p('Session expired - Reloading application'); 
                   window.location.reload();
                   return false;
                }
                
                var rBxL = response.refBoxStr.split(',');
                PM.minx_geo = parseFloat(response.minx_geo);
                PM.maxy_geo = parseFloat(response.maxy_geo);
                PM.xdelta_geo = parseFloat(response.xdelta_geo);
                PM.ydelta_geo = parseFloat(response.ydelta_geo);
                var geo_scale = response.geo_scale;
                var urlPntStr = response.urlPntStr;
                
                // Load new map image
                PM.Map.swapMapImg(response.mapURL);
                
                
                // Check if TOC and legend have to be updated
                var refreshLegend = eval(response.refreshLegend);
                var refreshToc = eval(response.refreshToc);
                if (PM.Map.forceRefreshToc) {
                    refreshToc = true;
                    PM.Map.forceRefreshToc = false;
                }
                if (refreshToc) {
                    var tocurl = PM_XAJAX_LOCATION + 'x_toc_update.php?' + SID;
                    PM.Toc.tocUpdateScale(tocurl);
                }
                
                if (refreshLegend) {
                    if ($('#' + PM.Toc.legendContainer).is(":visible") || PM.Toc.updateHiddenLegend) {
                        PM.Toc.updateLegend();
                    }
                }
                
                
                // Scale-related activities
                PM.Map.writescale(geo_scale);
                PM.Map.setSlider(geo_scale);
                PM.scale = geo_scale;

                // trigger event to lauch all functions bound to map update
                $("#pm_mapUpdateEvent").trigger("change");
               
                // Reference image: set DHTML objects
                PM.ZoomBox.setRefBox(rBxL[0], rBxL[1], rBxL[2], rBxL[3]);
                
                // Update SELECT tool OPTIONs in case of 'select' mode
                var vMode = PM.Map.mode;
                var autoidentify = '';
                if (vMode == 'nquery' || vMode == 'iquery') {
                    if (vMode == 'iquery'){
                        autoidentify = '&autoidentify=1';
                    }
                    var selurl = PM_XAJAX_LOCATION + 'x_select.php?'+ SID + '&activegroup=' + PM.Query.getSelectLayer() + autoidentify;
                    PM.Map.updateSelectTool(selurl);
                
                // If measure was active, delete all masure elements
                } else if (vMode == 'measure') {
                    PM.Draw.resetMeasure();

                // transmit 'afterUpdateMap' event
				} else {
					try {
                        var fct = vMode + '_afterUpdateMap';
                        if ($.isFunction(PM.Map[fct])) {
                            eval('PM.Map.' + fct + '()');
                        }
	                } catch(e) {
                    	if (window.console) console.log(e);
	                }
				}
            }
        });   
    },
    
    crossfadeMapImg: false,
    crossfadeMapImgSpeed: 500,
    _mapImgOpacity: false,
    _blendMapInt: false,
    
    swapMapImg: function(imgSrc) {
        if (this.crossfadeMapImg) {
            $('#fadeMapimgLayer').remove();
            var mapImgLayer = $('#mapimgLayer');
            var fadeMapImgLayer = mapImgLayer.clone().id('fadeMapimgLayer');
            fadeMapImgLayer.children('img').each(function (i) {
                $(this).id('fadeMapImg');
            });
            fadeMapImgLayer.appendTo($('#map'));
            
            mapImgLayer.css({opacity:0.0});
            $('#mapImg').src(imgSrc);
            this._mapImgOpacity = 0;
            this._blendMapInt = setInterval("PM.Map.blendMapImg()", 20);   
        } else {
            $('#mapImg').src(imgSrc);
        }
    },
    
    blendMapImg: function() {
        if (this._mapImgOpacity < 1) {
            var fop = 1 - this._mapImgOpacity;
            $('#fadeMapimgLayer').css({opacity: fop});
            $('#mapimgLayer').css({opacity: this._mapImgOpacity});
            this._mapImgOpacity += 50/this.crossfadeMapImgSpeed;
        } else {
            clearInterval(this._blendMapInt);
            $('#fadeMapimgLayer').remove();
        }
    },
    

    /** 
     * For SELECT tool 
     * called from 'updateMap()' and 'updateSelLayers()'
     */
    updateSelectTool: function(selurl) {
        $.ajax({
            url: selurl,
            dataType: "html",
            success: function(response){     
                var selStr = response;
                // change existing #selform element
				if ($('#selform').length) {
					$('#selform').replaceWith(selStr);
                // insert #selform element
				} else {
					$('#mapToolArea').append(selStr);
				}
                $('#mapToolArea').show();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            }
        });   
    },

    /**
     * Update layer options list for selection/iquery
     */
    updateSelLayers: function(selurl) {
        $.ajax({
            url: selurl,
            dataType: "json",
            success: function(response){
            
                // Update SELECT tool OPTIONs in case of 'select' mode
                var vMode = PM.Map.mode;
                if (vMode == 'nquery' || vMode == 'iquery') {
                    var selurl = PM_XAJAX_LOCATION + 'x_select.php?'+ SID + '&activegroup=' + PM.Query.getSelectLayer() ;
                    PM.Map.updateSelectTool(selurl);
				
				// transmit 'afterUpdateSelLayers' event
				} else if (vMode != 'measure') {
					try {
                        var fct = vMode + '_afterUpdateSelLayers';
                        if ($.isFunction(PM.Map[fct])) {
                            eval('PM.Map.' + fct + '()');
                        }
	                } catch(e) {
	                	if (window.console) console.log(e);
	                }
				}
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            }
        });
    },

    /**
     * quit iquery event
     */
    iquery_Quit: function() {
    	PM.Query.hideIQL();
    },
    
    /**
     * Add point of interest to map
     */
    addPOI: function(digitizeurl) {
        $.ajax({
            type: "POST",
            url: digitizeurl,
            success: function(response){
                PM.Map.changeLayersDraw();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            }
        });
    }

});


/******************************************************************************
 *
 * Purpose: drawing functions (measurements, digitizing)
 *          uses the geometry.js library
 * Authors: Armin Burger, Federico Nieri
 *
 ******************************************************************************
 *
 * Copyright (c) 2003-2006 Armin Burger
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
 
 
/**********************************************************************************
  USES THE JAVASCRIPT LIBRARIES JSGRAPHICS FROM WALTER ZORN
  SEE FILE /JAVASCRIPT/WZ_JSGRAPHICS.JS FOR DETAILS OF COPYRIGHT
 **********************************************************************************/  

$.extend(PM.Draw,
{
    numSize: null,
    polyline: new Polygon(),
    geoPolyline: new Polygon(),
        
    /** 
     * Return a Point object with geo coordinate instead of px coordinate
     * @param pxPoint: Point object with px coordinate
     */
    toGeoPoint: function(pxPoint){
        var x_geo = PM.minx_geo + (((pxPoint.x + 1)/PM.mapW)  * PM.xdelta_geo);
        var y_geo = PM.maxy_geo - (((pxPoint.y + 1)/PM.mapH) * PM.ydelta_geo);
        return new Point(x_geo,y_geo);
    },

    /** 
     * Return a Polygon object with geo coordinate instead of px coordinate
     * @param pxPolygon: Polygon object with px coordinate
     */
    toGeoPolygon: function(pxPolygon){
        var pxPoints = pxPolygon.getPoints();
        var geoPolygon = new Polygon();
        for(var i = 0; i < pxPoints.length; i++){
            geoPolygon.addPoint(this.toGeoPoint(pxPoints[i]));
        }
        return geoPolygon;
    },

    toPxPolygon: function(geoPolygon){
        var geoPoints = geoPolygon.getPoints();
        var pxPolygon = new Polygon();
        for(var i = 0; i < geoPoints.length; i++){
            pxPolygon.addPoint(this.toPxPoint(geoPoints[i]));
        }
        return pxPolygon;
    },

    toPxPoint: function(geoPoint){
      var x_px = ((geoPoint.x - PM.minx_geo) / PM.xdelta_geo) * PM.mapW - 1;
      var y_px = ((PM.maxy_geo - geoPoint.y) / PM.ydelta_geo) * PM.mapH - 1;	
        return new Point(x_px,y_px);
    },

    /**
     * Return a geography measure unit instead of px
     * @param pxLength: length in px
     */
    toGeoLength: function(pxLength){
        return (pxLength/PM.mapW) * PM.xdelta_geo;
    },

    /**
     * Main function, draws symbol points between mouseclicks
     * @return void
     */
    measureDrawSymbols: function(e, clickX, clickY, dblClick) {
        // Polyline points number before to add the current click point
        if(this.polyline.isClosed()){
          this.polyline.reset();
        }
        
        var nPoints = this.polyline.getPointsNumber();   
        var clickPoint = new Point(clickX, clickY); 
        // Reset everything when last measure ended with double click
        if (nPoints == 0) this.resetMeasure();        
        // Don't go outside map
        if ((clickX < PM.mapW) && (clickY < PM.mapH)) { 
            
            // SINGLE CLICK
            if (dblClick != 1) { 
                
                this.polyline.addPoint(new Point(clickX,clickY));
                            
                // First point for start click
                if (nPoints < 1) {

                    this.drawLineSegment(jg,new Line(clickPoint, clickPoint));         			

                // Fill distance between clicks with symbol points
                }else{
                
                  // USE wz_jsgraphics.js TO DRAW LINE. lastSegment is of Line type                 
                    var lastSegment = this.polyline.getLastSide();
                    var sidesNumber = this.polyline.getSidesNumber();                              		
                    
                      // check for the overlapping of the new side.
                    // it will never overlap with the previous side  	    	  
                    if (sidesNumber > 2){      		    
                        for (var s = 1 ; s < (sidesNumber-1); s++){                 
                            var intersectionPoint = this.polyline.getSide(s).intersection(lastSegment);
                            if (intersectionPoint != null){                  
                                alert(_p('digitize_over'));
                                this.polyline.delPoint(this.polyline.getPointsNumber()-1);
                                return;                  
                            }                
                        }
                    }
                                                                                                        
                    this.drawLineSegment(jg,lastSegment);
                    // calls the handler of the side (segment) digitation and pass it the polyline in px coords
                    this.onDigitizedSide(this.polyline);
                }      	        	        	        	                                  
                                
            // DOUBLE CLICK => CALCULATE AREA
            } else if (dblClick) {
                                                                    
                // Removes the last duplicated point because of the last 2 single click	    	
                this.polyline.delPoint(this.polyline.getPointsNumber()-1);
                                        
                // Closing the polyline to have a polygon  	    	
                this.polyline.close();
                
                // fix the last side
                var lastSegment = this.polyline.getLastSide();	   
                var sidesNumber = this.polyline.getSidesNumber();
                
                // check for the overlapping of the closing side
                // it will never overlap with the first and the last side
                for (var s = 2 ; s < (sidesNumber-1); s++){                 
                    var intersectionPoint = this.polyline.getSide(s).intersection(lastSegment);
                    if (intersectionPoint != null){                  
                        alert(_p('digitize_over'));
                        this.polyline.delPoint(this.polyline.getPointsNumber()-1);
                        return false;                  
                    }                
                }	    	
                                                            
                if(lastSegment != null){    	
                    this.drawLineSegment(jg,lastSegment);
                }
              
                // calls the handler of the polygon digitation before reset the polygon
                this.onDigitizedPolygon(this.polyline);
                
                // remove all points from the polygon          
                //polyline.reset();
                            
            }                   
        }        
        this.geoPolyline = this.toGeoPolygon(this.polyline);
    },


    /** 
     * Handler of the digitized polygon action. It is called when a double click
     * close tha drawing polygon
     * @param poly: Polygon object passed to the handler
     */
    onDigitizedPolygon: function(poly){
        
        var polyGEO = this.toGeoPolygon(poly);
        var perimGEO = polyGEO.getPerimeter()/PM.measureUnits.factor;	
        
        var cntPerLen = Math.round(perimGEO).toString().length;
        this.numSize = Math.max(0, (4 - cntPerLen));
        
        perimGEO = PM.roundN(perimGEO, this.numSize); 
        
        var areaGEO = Math.abs(PM.roundN (polyGEO.getArea() / (PM.measureUnits.factor * PM.measureUnits.factor), this.numSize-1)) ;
                    
        // Change input text box to 'Area'
        $('#measureFormSum').val(perimGEO);
        $("#mSegTxt").html(_p('Area') + PM.measureUnits.area); 
        $('#measureFormSeg').val(areaGEO);
        
        if(PM.Map.mode == 'digitizepolygon')  PM.Map.on_finishing_digitizepolygon(polyGEO);
    },

    /** 
     * Handler of the digitized line action. It is called when a new click cause draw a new line
     * @param poly: Polygon object passed to the handler
     */
    onDigitizedSide: function(poly){
        // Polygon in map coordinates
         var polyGEO = this.toGeoPolygon(poly);
            
        // Segment length in  map coordinates,  write values to input boxes
        var segLenGEO_0 = polyGEO.getSideLength(polyGEO.getSidesNumber()) / PM.measureUnits.factor ;
        var perimGEO_0  = polyGEO.getPerimeter() / PM.measureUnits.factor ;
        
        var cntSegLen = Math.round(segLenGEO_0).toString().length;
        this.numSize = Math.max(0, (4 - cntSegLen));
        var segLenGEO = PM.roundN(segLenGEO_0, this.numSize); 
        var perimGEO  = PM.roundN(perimGEO_0, this.numSize);     

        var measureSegment = false;
        if (measureSegment){
            $('#measureFormSeg').val(segLenGEO);
            if (polyGEO.getPointsNumber() >= 2){
                poly.reset();
            }
        } else {
            $('#measureFormSum').val(perimGEO);
            $('#measureFormSeg').val(segLenGEO);
        }        
    },

    /**
     * REDRAW THE LAST AND THE CLOSING SIDE OF THE POLYGON
     */
    redrawAll: function(currX, currY) {

        if(this.polyline.isClosed())
          return;

        if (this.polyline.getPointsNumber()>0) {    	

            var mousePoint = new Point(currX,currY);
            jg_tmp.clear();
            jg_tmp.setColor(PM.measureObjects.line.color); 
            jg_tmp.setStroke(PM.measureObjects.line.width);
            // Drawing last side	    
            var lastPoint = this.polyline.getPoint(this.polyline.getPointsNumber()-1);
                    
            this.drawLineSegment(jg_tmp,new Line(lastPoint,mousePoint));
                            
            jg_tmp.setStroke(Stroke.DOTTED); 
            var firstPoint = this.polyline.getPoint(0);
                  
            this.drawLineSegment(jg_tmp,new Line(firstPoint,mousePoint));
        }		    
    },

    drawPolyline: function(jg,poly) {  
        var n = poly.getSidesNumber();
        for (var i=1;i<=n;i++) {    
            this.drawLineSegment(jg,poly.getSide(i));
        }
    },

    /**
     * DRAW LINE USING JSGRAPHICS
     */
    drawLineSegment: function(jg,line) {

        var xfrom = line.getFirstPoint().x;
        var yfrom = line.getFirstPoint().y;
        var xto = line.getSecondPoint().x;
        var yto = line.getSecondPoint().y;
        
        var limitSides = this.getLimitSides();
        var xList = limitSides.getXList();
        var yList = limitSides.getYList();
        
        var xMin = Math.min.apply({},xList);
        var yMin = Math.min.apply({},yList);        
        var xMax = Math.max.apply({},xList);
        var yMax = Math.max.apply({},yList);    
        
        var points = new Array();
        
        if  (xfrom >= xMin && xfrom <= xMax && yfrom >= yMin && yfrom <= yMax) {
            points.push(line.getFirstPoint());       
        }
      
        if  (xto >= xMin && xto <= xMax && yto >= yMin && yto <= yMax) {
            points.push(line.getSecondPoint());      
        }
        
        var s = 1;
        
        while(points.length < 2 && s <= limitSides.getSidesNumber()){    
            var intersectionPoint = limitSides.getSide(s).intersection(line);
            if (intersectionPoint != null) {
                points.push(intersectionPoint);
            }
            s++;
        }
                              
        if(points.length == 2){    
            jg.drawLine(points[0].x, points[0].y, points[1].x,points[1].y);                 
            jg.paint();      
        }
    },

    /**
     * GET THE RECTANGLE OF THE DRAWING AREA
     */
    getLimitSides: function(){

        var mapimgLayer     = _$('mapimgLayer');
        var mapimgLayerL    = objL(mapimgLayer);
        var mapimgLayerH    = objT(mapimgLayer);
        var mapW = mapimgLayer.style.width;
        var mapH = mapimgLayer.style.height;
        
        var xMin = mapimgLayerL;
        var xMax = mapimgLayerL + parseInt(mapW);
        var yMin = mapimgLayerH;
        var yMax = mapimgLayerH + parseInt(mapH);        
        
        var limitSides = new Polygon();
        
        limitSides.addPoint( new Point(xMin,yMin) );
        limitSides.addPoint( new Point(xMax,yMin) );
        limitSides.addPoint( new Point(xMax,yMax) );
        limitSides.addPoint( new Point(xMin,yMax) );
        limitSides.close();
        
        return limitSides;
    },

    /**
     * Remove all measure settings
     */
    resetMeasure: function() {
        // remove lines
        this.polyline.reset();
        jg.clear();    
        jg_tmp.clear();
        
        this.reloadData();
    },

    clearMeasure: function(){
        this.resetMeasure();
        this.geoPolyline.reset();
    },

    reloadData: function(){
        if (this.polyline.getSidesNumber() == 0) {
            // Reset form fields 
            $('#measureFormSum').val('');
            $('#measureFormSeg').val('');
            $("#mSegTxt").html(_p('Segment') + PM.measureUnits.distance);  
        } else if(this.polyline.isClosed()) {
            this.onDigitizedPolygon(this.polyline);
        } else {
            this.onDigitizedSide(this.polyline);
        }
    },

    reloadDrawing: function(){
        if (PM.Map.mode == 'measure') {
            this.resetMeasure();
            this.polyline = this.toPxPolygon(this.geoPolyline);
            if (this.polyline.getPointsNumber()>0) {
                this.drawPolyline(jg,this.polyline);
            }
            this.reloadData();
        }
    },

    delLastPoint: function(){
        var nPoints = this.polyline.getPointsNumber();
        //alert(nPoints);
        if (nPoints > 0) {
            this.polyline.delPoint(nPoints - 1);
            this.geoPolyline.delPoint(nPoints - 1);
            this.reloadDrawing();
        }
        //alert(this.polyline.getPointsNumber());
    }
});
/******************************************************************************
 *
 * Purpose: core p.mapper functions (init, user interaction, open popups) 
 * Author:  Armin Burger
 *
 ******************************************************************************
 *
 * Copyright (c) 2003-2010 Armin Burger
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

$.extend(PM,
{
    /**
     * Reset parameters of some DIV's
     */
    resetMapImgParams: function() {
        $("#mapImg").width(PM.mapW).height(PM.mapH);
        $("#mapimgLayer").top(0).left(0).width(PM.mapW).height(PM.mapH).css({clip:'rect(auto auto auto auto)'});
        $('#zoombox, #loading').hidev();
        
        if (PM.Map.mode == 'measure') {
            PM.Draw.resetMeasure();
            PM.Draw.polyline = PM.Draw.toPxPolygon(PM.Draw.geoPolyline);
            if (PM.Draw.polyline.getPointsNumber()>0) {
                PM.Draw.drawPolyline(jg,PM.Draw.polyline);
            }
        }
    },


    //
    // SWAP FUNCTIONS FOR TOOLBAR TD -> USE ALTERNATIVELY TO IMAGE SWAP
    // Changes TD class (default.css -> .TOOLBARTD...) in toolbar
    // 
    
    /**
     * Function for state buttons (CLICKED TOOLS: zoomin, pan, identify, select, measure)
     * set class for active tool button
     */
    setTbTDButton: function(button) {
        if (PM.tbImgSwap != 1) {
            $("td.pm-toolbar-td").addClass('pm-toolbar-td-off').removeClass('pm-toolbar-td-on');
            $('#tb_' + button).removeClass('pm-toolbar-td-off').addClass('pm-toolbar-td-on').removeClass('pm-toolbar-td-over');
        } else {
            $("td.pm-toolbar-td").each(function() {
                //$(this).addClass('TOOLBARTD_OFF').removeClass('TOOLBARTD_ON');
                $(this).find('>img').imgSwap('_on', '_off');
            });
            $('#tb_' + button).find('>img').imgSwap('_off', '_on').imgSwap('_over', '_on');
        }
    },

    /**
     * MouseDown/Up, only set for stateless buttons
     */
    TbDownUp: function(elId, status){
        var but = $('#tb_' + elId);
        if (status == 'd') {
            if (PM.tbImgSwap != 1) {
                but.addClass('pm-toolbar-td-on').removeClass('pm-toolbar-td-off').removeClass('pm-toolbar-td-over');
            } else {
                but.find('>img').imgSwap('_off', '_on').imgSwap('_over', '_on');
            }
        } else {
            if (PM.tbImgSwap != 1) {
                but.addClass('pm-toolbar-td-off').removeClass('pm-toolbar-td-on').addClass('pm-toolbar-td-over');
            } else {
                if (PM.tbImgSwap == 1) but.find('>img').imgSwap('_on', '_off');
            }
        }
    },

    /**
     * Change the color of a button on<->off
     */
    changeButtonClr: function(myObj, myAction) {
        switch (myAction) {
            case 'over':
                myObj.className = 'button_on';
                break;
                
            case 'out':
                myObj.className = 'button_off';
                break;
        }
    },



    /**
     * return root path of application
     */
    getRootPath: function() {
        var theLoc = document.location.href;
        var theLastPos = theLoc.lastIndexOf('/');
        var RootPath = theLoc.substr(0,theLastPos) + '/';
        
        return RootPath;
    },

    /** 
     * set the cursor to standard internal cursors
     * or special *.cur url (IE6+ only)
     */
    setCursor: function(rmc, ctype) {	
        if (!rmc) {
            if (PM.Map) {
                var toolType = PM.Map.tool;
            } else {
                var toolType = 'zoomin';
            }
        } else {
            toolType = 'pan';
        }

        // take definition from js_config.php 
        var iC = PM.useInternalCursors;
        // don't use custom cursors for safari & chrome
        if ($.browser.webkit) iC = false;
        
        var rootPath = this.getRootPath();
        var usedCursor = (iC) ? toolType : 'url("' +rootPath + 'images/cursors/zoomin.cur"), default';
        
        switch (toolType) {
            case "zoomin" :
                var usedCursor = (iC) ? 'crosshair' : 'url("' +rootPath + 'images/cursors/zoomin.cur"), default';	
                break;
            
            case "zoomout" :
                var usedCursor = (iC) ? 'e-resize' : 'url(' +rootPath + 'images/cursors/zoomout.cur), default';	
                break;
            
            case "identify" :
                //var usedCursor = (iC) ? 'help' : 'url(' +rootPath + 'images/cursors/identify.cur), default';	
                var usedCursor = 'help';	
                break;
            
            case "auto_identify" :	
                var usedCursor = 'pointer';	
                break;

            case "pan" :
                //var usedCursor = (iC) ? 'move' : 'url(' +rootPath + 'images/cursors/pan.cur), default';	
                var usedCursor = 'move';
                break;
                
            case "select" :
                //var usedCursor = (iC) ? 'help' : 'url(' +rootPath + 'images/cursors/select.cur), default';
                var usedCursor = (iC) ? 'help' : 'help';	            
                break;
                
            case "measure" :
                var usedCursor = (iC) ? 'crosshair' : 'url(' +rootPath + 'images/cursors/measure.cur), default';	
                break;
                
            case "digitize" :
                var usedCursor =  'crosshair';	
                break;
                
            default:
                var usedCursor = 'default';
        }

        if (ctype) usedCursor = ctype;
        $('#mapimgLayer').css({'cursor': usedCursor});
        
    },

    /**
     * Round to a specified decimal
     */
    roundN: function(numin, rf) {
        return ( Math.round(numin * Math.pow(10, rf)) / Math.pow(10, rf) );
    },
    
    /**
     * Show Ajax indicator, 
     * if x/y coordinates provided displayed at mouse click x/y 
     */
    ajaxIndicatorShow: function(x, y) {
        if (x) {
            $('#pmIndicatorContainer').css({top: parseInt(y) + PM.ZoomBox.offsY - 35 +'px', left: parseInt(x) + PM.ZoomBox.offsX - 15 +'px'}).show();
        } else {
            $('#pmIndicatorContainer').css({top:'5px', right:'5px'}).show();
        }
    },

    /**
     * Hide Ajax indicator, 
     */
    ajaxIndicatorHide: function() {
        $('#pmIndicatorContainer').hide();
    },
    
    /**
     * Get the session variable as JSON string
     */
    getSessionVar: function(sessionvar, callfunction) {
        $.ajax({
            url: PM_XAJAX_LOCATION + '/x_getsessionvar.php?' + SID + '&sessionvar=' + sessionvar,
            dataType: "json",
            success: function(response){
                eval(callfunction);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            } 
        });  
    },
    
    /**
     * Set the session variable via JSON string
     */
    setSessionVar: function(sessionvar, val, callfunction) {
        $.ajax({
            url: PM_XAJAX_LOCATION + '/x_setsessionvar.php?' + SID + '&sessionvar=' + sessionvar + '&val=' + val,
            type: "POST",
            dataType: "json",
            success: function(response){
                eval(callfunction);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            } 
        });  
    },
    
    
    /**
     * DIALOGS
     */
    Dlg: {
        
        /** Define if dialog should be transparent on move/resize*/
        transparentOnMoveResize: true,
        /** Opacity if enabled for dialog move/resize */
        moveResizeOpacity: 0.9,
        /** default options for help dialog */
        helpDlgOptions: {width:350, height:500, left:100, top:50, resizeable:true, newsize:true, container:'pmDlgContainer', name:"help"},
        /** default options for download dialog */
        downloadDlgOptions: {width:270, height:250, left:200, top:200, resizeable:false, newsize:true, container:'pmDlgContainer', name:"download"},
        /** default options for print dialog */
        printDlgOptions: {width:350, height:290, left:200, top:200, resizeable:true, newsize:true, container:'pmDlgContainer', name:"print"},
        /** Enable dialog roll up by double click on window bar or using mousewheel*/
        enableRollup: true,
        /** Dlg properties used for rollup */
        dlgProperties: {},
        
        close: function(e, elem, container) {
        	$(elem).parent().parent().hide();
        	$('#' + container + '_MSG').html('');
        	if (!e) {
        		e = window.event;
        	}

        	// IE9 & Other Browsers
        	if (e.stopPropagation) {
        		e.stopPropagation();
           	// IE8 and Lower
        	} else {
        		e.cancelBubble = true;
        	}
        },
        
        /**
         * Create jqDnR Dialog (jquery.jqmodal_full.js)
         */
        createDnRDlg: function(options, title, url) {
            var setOldSize = false;
            if (this.dlgProperties[options.name]) {
                if (this.dlgProperties[options.name].up) {
                    setOldSize = true;
                    this.dlgProperties[options.name].up = false;
                }
            } 
            
            var container = options.container;
            var containerMsg = $('#' + container + '_MSG');
            var dlg = '<div style="height: 100%">';
            dlg += '<div id="' + container + '_TC" class="jqmdTC dragHandle">' + _p(title) + '</div>';
            dlg += '<div id="' + container + '_MSG" class="jqmdMSG"></div>';
            dlg += '<div id="' + container + '_BC" class="jqmdBC" ';
            if (options.resizeable) {
                dlg += '><img src="templates/dialog/resize.gif" alt="resize" class="resizeHandle" />';
            } else {
                dlg += 'style="height:0px; border:none">';
            }
            dlg += '</div>';
            dlg += '<input type="image" src="templates/dialog/close.gif" onclick="PM.Dlg.close(event, this, \'' + container + '\');" class="jqmdClose jqmClose" />';
            dlg += '</div>';

            var dynwin = $('#' + container);
            // Modified by Thomas RAFFIN (SIRAP)
            // dialog containers auto insertion
            // --> auto create dynwin if doesn't exist 
            // --> put in front of the others (auto calculate z-index)
            if (dynwin.length == 0) {
            	$('<div>').id(container).addClass('jqmDialog').appendTo('body').hide();
            	dynwin = $('#' + container);
            }
        	var maxzindex = 99;
        	$('.jqmDialog').each(function() {
        		if ( ($(this).css('display') != 'none') && ($(this).id() != container) ) {
        			var zindex = parseInt($(this).css('z-index'));
        			if (maxzindex <= zindex) {
        				maxzindex = zindex+1;
        			}
        		}
        	});
        	dynwin.css('z-index', '' + maxzindex); 
            
            var newsize = dynwin.is(':empty') || options.newsize;
            dynwin.html(dlg)
                .jqm({autofire: false, overlay: 0})
                .jqDrag('div.dragHandle');
            if (this.enableRollup) dynwin.find('div.dragHandle').bind("dblclick", function(){PM.Dlg.dlgWinRollup(options.name, $(this))}).mousewheel(function(e){ PM.Dlg.dlgWinRollup(options.name, $(this))});;
            
            if (newsize) dynwin.height(options.height).width(options.width);
            if (options.left) dynwin.css({left:options.left, top:options.top});
            if (setOldSize) dynwin.height(this.dlgProperties[options.name].height);
            if (options.resizeable) dynwin.jqResize('img.resizeHandle');
            //if (url) containerMsg.load(url);
            if (url) $('#' + container + '_MSG').load(url);

            dynwin.show();
            this.adaptDWin(dynwin);
            
            return containerMsg;
        },

        adaptDWin: function(container) {
            var cn = container.id();
            var newMSGh = parseInt($('#' + cn).css('height')) - parseInt($('#' + cn +'_TC').outerHeight()) - parseInt($('#' + cn + '_BC').outerHeight()) ; 
            $('#' + cn + '_MSG').css({height: newMSGh});
        },
        
        dlgWinRollup: function(dlgName, dlgHandle) {
            var dlgContainer = dlgHandle.parent().parent(); 
            if (dlgContainer.height() > dlgHandle.height()) {
                this.dlgProperties[dlgName] = {height:dlgContainer.height(), width:dlgContainer.width()};
                this.dlgProperties[dlgName].up = true;
                dlgContainer.height(dlgHandle.height());
            } else {
                dlgContainer.height(this.dlgProperties[dlgName].height);
                this.dlgProperties[dlgName].up = false;
            }
            
            dlgContainer.find('.jqmdMSG, .jqmdBC').each(function() {
                $(this).toggle();
            });
        },
        
        /**
         * Open help dialog 
         */
        openHelp: function() {
            this.createDnRDlg(this.helpDlgOptions, _p('Help'), 'help.phtml?'+SID);
        },

        /**
         * DOWNLOAD dialog
         * get image with higher resolution for paste in othet programs
         */
        openDownload: function() {
            this.createDnRDlg(this.downloadDlgOptions, _p('Download'), 'downloaddlg.phtml?'+SID );
        },

        /**
         * Open popup dialaog for adding POI 
         */
        openPoi: function(imgxy) {
            var coordsList = imgxy.split('+');
            var mpoint = PM.ZoomBox.getGeoCoords(coordsList[0], coordsList[1], false);
            
            // Round values (function 'roundN()' in 'measure.js')
            var rfactor = 5;
            var px = isNaN(mpoint.x) ? '' : PM.roundN(mpoint.x, rfactor);
            var py = isNaN(mpoint.y) ? '' : PM.roundN(mpoint.y, rfactor);
            
            var inserttxt = prompt(_p('Add location description'), '');
            if (inserttxt) {
                var digitizeurl = PM_XAJAX_LOCATION + 'x_poi.php?' +SID + '&up=' + px + '@@' + py + '@@' + inserttxt; //escape(inserttxt);
                //alert(digitizeurl);
                PM.Map.addPOI(digitizeurl);
            }
        },

        //
        // PRINT functions
        // 
        /**
         * Open the printing dialog
         */
        openPrint: function() {
           this.createDnRDlg(this.printDlgOptions, _p('Print Settings'), 'printdlg.phtml?'+SID);
        },

        /**
         * Show advanced settings in print dialog
         */
        printShowAdvanced: function() {
            $('#pmDlgContainer div.printdlg_advanced').show();
            $('#printdlg_button_advanced').hide();
            $('#printdlg_button_normal').show();
			var height = ($.browser.msie && (parseInt($.browser.version) <= 7.0)) ? $('#printdlg').height() : $('#printdlg').innerHeight();
			$('#pmDlgContainer').height(parseInt(height) + 60);
            this.adaptDWin($('#pmDlgContainer'));
        },

        /**
         * Show advanced settings in print dialog
         */
        printHideAdvanced: function() {
            $('#pmDlgContainer div.printdlg_advanced').hide();
            $('#printdlg_button_normal').hide();
            $('#printdlg_button_advanced').show();
			var height = ($.browser.msie && (parseInt($.browser.version) <= 7.0)) ? $('#printdlg').height() : $('#printdlg').innerHeight();
			$('#pmDlgContainer').height(parseInt(height) + 60);
            this.adaptDWin($('#pmDlgContainer'));
        }
    }

});



/*****************************************************************************
 *
 * Purpose: Functions for queries
 * Author:  Armin Burger
 *
 *****************************************************************************
 *
 * Copyright (c) 2003-2009 Armin Burger
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

$.extend(PM.Query,
{
    iquery_timer: null,
    timeW: -1,
    timeA: 2,
    timer_c: 0,
    timer_t: null,
    timer_to: null,

    
    /** default options for query result dialog */
    resultDlgOptions: {width:500, height:250, resizeable:true, newsize:false, container:'pmQueryContainer', name:"query"},
    
    /** Pre-rendering of query results */    
    preRenderedQResult: false,
    
    /** Automatically activate layers in TOC when search successful */
    searchAutoActivateLayers: false,
    
    /**
     * Default template for query
     */
    queryTpl: 
    { 
        "table":
           {"queryHeader": "<div>",
            "queryFooter": "</div>",
            "layers": 
                {"#default":
                   {"layerHeader":"<div class=\"pm-info-layerheader\">_p(Layer): ${description}</div><table class=\"sortable\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">",
                    "theaderTop": "<tr>",
                    "theader": "<th>@</th>",
                    "theaderBottom": "</tr>",
                    "tvaluesTop": "<tr>",
                    "tvalues":
                        {"shplink": "<td class=\"zoomlink\"><a href=\"javascript:PM.Map.zoom2extent('$[0]','$[1]','$[2]','$[3]')\"><img src=\"images/zoomto.gif\" alt=\"zoomto\"></a></td>",
                         "hyperlink": "<td><a href=\"javascript:PM.Custom.openHyperlink('$[0]','$[1]','$[2]')\">$[3]</a></td>",
                         "#default": "<td>$</td>"
                        },
                    "tvaluesBottom": "</tr>",
                    "layerFooter":"</table>"
                   }
                },
            "zoomall": 
                {"top": "<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"100%\"><tr>",
                 "center": "<td class=\"zoomlink\"><a href=\"javascript:PM.Map.zoom2extent(0,0,'${allextent}',1)\"><img src=\"images/zoomtoall.gif\"alt=\"za\"></a></td>",
                 "bottom": "<td class=\"TDAL\">_p(Zoom to Selected Features)</td></tr></table>"
                },

            "callbackfunction": false
                
           },
           
        "tree":
           {"queryHeader": "<div><ul>",
            "queryFooter": "</div></ul>",
            "layers": 
                {"#default":
                   {"layerHeader":"<li><span>${description}</span><ul>",
                    "theaderTop": false,
                    "theader": false,
                    "theaderBottom": false,
                    "tvaluesTop": '<li><span>$1</span><ul>',
                    "tvalues":
                        {"shplink": "<li><a href=\"javascript:PM.Map.zoom2extent('$[0]','$[1]','$[2]','$[3]')\"><img src=\"images/zoomtiny.gif\" alt=\"zoomto\"> _p(Zoom)</a></li>",
                         "hyperlink": "<li>@: <a href=\"javascript:PM.Custom.openHyperlink('$[0]','$[1]','$[2]')\">$[3]</a></li>",
                         "#default": "<li>@: $</li>"
                        },
                    "tvaluesBottom": '</ul></li>',
                    "layerFooter":"</ul></li>"
                   }
                },
            "zoomall": 
                {"top": "<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"100%\"><tr>",
                 "center": "<td class=\"zoomlink\"><a href=\"javascript:PM.Map.zoom2extent(0,0,'${allextent}',1)\"><img src=\"images/zoomtoall.gif\"alt=\"za\"></a></td>",
                 "bottom": "<td class=\"TDAL\">_p(Zoom to Selected Features)</td></tr></table>"
                },

            "callbackfunction": false
                
           },
           
        "iquery":
           {"queryHeader": "<div>",
            "queryFooter": "</div>",
            "layers": 
                {"#default":
                   {"layerHeader":"<table class=\"pm-iquery\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\"><tr><th colspan=\"2\" class=\"pm-iquery-header\">${description}</th></tr>",
                    "theaderTop": false,
                    "theader": false,
                    "theaderBottom": false,
                    "tvaluesTop": false,
                    "tvalues":
                        {"shplink": false,
                         "hyperlink": "<tr><th>@</th><td>$[3]</td></tr>",
                         "#default": "<tr><th>@</th><td>$</td></tr>"
                        },
                    "tvaluesBottom": false,
                    "layerFooter":"</table>"
                   }
                },
            "nozoomparams": true
           }
    },
    
    
    /**
     * Start identify (query) or select (nquery) 
     */
    showQueryResult: function(type, xy) {
        var pos = xy.split('+');
        if (type=='query') {
            var mx = pos[0]; 
            var my = pos[1];
        } else {
            var mx = pos[2]; 
            var my = pos[3];
        }
        PM.ajaxIndicatorShow(mx, my);
        
        var queryurl = PM.Query.xInfoPHP ? PM.Query.xInfoPHP : PM_XAJAX_LOCATION + 'x_info.php';
        
        if (type == 'query') {
            var qparams = SID + '&mode='+type + '&imgxy='+xy; // + layerstring;
        } else {
            var qparams = SID + '&mode='+type + '&imgxy='+xy + '&groups=' + this.getSelectLayer();
            PM.Map.zoomselected = '1';
        }
        
        this.getQueryResult(queryurl, qparams);
    },

    /**
     * Get query results and display them by parsing the JSON result string 
     */
    getQueryResult: function(qurl, params) {
        $.ajax({
            type: "POST",
            url: qurl,
            data: params,
            dataType: "json",
            success: function(response){
                var mode = response.mode;
                var queryResult = response.queryResult;
            
                if (mode != 'iquery') {
                    $('#infoFrame').showv();
                    PM.Query.writeQResult(queryResult, PM.infoWin);
                    PM.ajaxIndicatorHide();
                    // Automatically activate layers in TOC when search successful and activation set
                    if (mode == 'search' && PM.Query.searchAutoActivateLayers) {
                        var grpName = queryResult[0][0]['name'];
                        var grpCheckBox = $('#ginput_' + grpName); 
                        grpCheckBox.attr('checked', true);
                        
                        var catCheckBox = grpCheckBox.parents('li.toccat').find('input');
                        if (catCheckBox.length > 0) {
                            catName = catCheckBox.val();
                            catCheckBox.attr('checked', true); 
                            PM.Toc.setcategories(catName, true);
                        } else {
                            PM.Toc.setlayers(grpName, true);
                        }
                    }
                } else {
                    // Display result in DIV and postion it correctly
                    PM.Query.showIQueryResults(queryResult);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            }
        });
    },
    
    
    /**
     * Collect HTML string for result output
     */     
    html: {
        h: "",
        append: function(t) {
            if (t) {
                this.h += t;
            } else {
                this.h;
            }
        },
        
        text: function() {
            return this.h;
        },
        
        reset: function() {
            this.h = "";
        }
    },
    
    /**
     * Parse query result JSON string with selected template
     * add result to container and return callbackfunction
     */
    parseResult: function(jsonRes, tplName, container) {
        
        var queryLayers = jsonRes[0]; 
        var zoomParams = jsonRes[1]; 
        var tpl = this.queryTpl[tplName];
        
        var h = this.html;
        h.reset();
        h.append(PM.Query.parseLocale(tpl.queryHeader));

        // Query layers: modify query results in js
        $.each(PM.modifyQueryResultsFunctions, function(key, val) {
        	var fct = 0;
        	eval('fct = ' + val);
        	if ($.isFunction(fct)) {
        		queryLayers = eval(val + '(queryLayers, tplName)');
        	}
        });
   
        // Parse each layer from result set
        $.each(queryLayers, function() {
            var layTpl = tpl.layers['#default'];
            
            if (tpl.layers[this.name]) {
                $.extend(true, layTpl, tpl.layers[this.name]);
            }
            
            var rHeader = this.header;
            var customFields = [];
            var skipShpLink = false;
            var noShpLink = false;
            h.append(PM.Query.parseVal(layTpl.layerHeader, this));
            
            h.append(layTpl.theaderTop);
            // Parse result header 
            $.each(this.stdheader, function(i) {
                if (this == '#') noShpLink = true;  // RASTER data
                var fld = this;
                $.each(layTpl.tvalues, function(k,v) {
                    if (k == fld) {
                        customFields[i] = k;
                    }
                    if (k == "shplink" && v == false) {
                        skipShpLink = true;
                    }
                });
            });
            
            $.each(rHeader, function(i) {
                if (!(skipShpLink && this == '@') && this != "#" && layTpl.theader) { 
                    h.append(layTpl.theader.replace(/\@/, this));
                } 
            });
            h.append(layTpl.theaderBottom);
            
            // Parse field values
            $.each(this.values, function() {
                h.append(PM.Query.parseValTop(layTpl.tvaluesTop, this));
                
                $.each(this, function(i) {
                    //alert(this);
                    if (customFields[i]) {
                        if (this.shplink) {
                            h.append(PM.Query.parseLink(layTpl.tvalues[customFields[i]], this.shplink).replace(/@/, rHeader[i]));
                        } else if (this.hyperlink) {
                            h.append(PM.Query.parseLink(layTpl.tvalues[customFields[i]], this.hyperlink).replace(/@/, rHeader[i]));
                        } else {
                            if (!(noShpLink && i == 0))
                                h.append(layTpl.tvalues[customFields[i]].replace(/\$/, this)
                                                                        .replace(/@/, rHeader[i])
                                );
                        }
                    } else if (this.shplink) {
                        if (layTpl.tvalues.shplink) {
                            h.append(PM.Query.parseLink(layTpl.tvalues.shplink, this.shplink).replace(/@/, rHeader[i]));
                        }
                    } else if (this.hyperlink) {
                       h.append(PM.Query.parseLink(layTpl.tvalues.hyperlink, this.hyperlink).replace(/@/, rHeader[i]));
                    } else {
                        if (!(noShpLink && i == 0)) 
                            h.append(layTpl.tvalues['#default'].replace(/\$/, this)
                                                               .replace(/@/, rHeader[i])
                            );
                    }
                    
                });
                h.append(layTpl.tvaluesBottom);
            });

            h.append(PM.Query.parseVal(layTpl.layerFooter, this));
        });
        
        h.append(tpl.queryFooter);
        if (!tpl.nozoomparams) h.append(this.returnZoomParamsHtml(zoomParams, tpl.zoomall));

        if (container) {
            $('#' + container).html(h.text());
            return tpl.callbackfunction;
        } else {
            return h.text();
        }
    },
    
    /**
     * Parse value of result header
     * parse _p(...) and ${...} 
     */
    parseVal: function(v, list) {        
        if (!v) return false;
        var v = this.parseLocale(v);
        var m = v.match(/\$\{(\w+)\}/g);
        if (m) {
            $.each(m, function() {
                var key = this.slice(2,-1);
                var rVal = list[key];
                var reg2 = new RegExp('\\$\\{' + key + '\\}', 'g');
                v = v.replace(reg2, rVal);
            });
            return v;
        } else {
            return v;
        }
    },
    
    /**
     * Parse shapelink and hyperlink fields 
     * search for _p() and $[]
     */
    parseLink: function(t, linkList) {
        var t = this.parseLocale(t);
        var m = t.match(/\$\[\d\]/g);
        $.each(m, function(i) {
            var j = this.substr(2,1);
            var p = new RegExp('\\$\\[' + j + '\\]', 'g');

            t = t.replace(p, linkList[j]);
            mm = t.match(p);
        });
        return t;
    },
    
    /**
     * Replace $1..10 with value of result index 
     */
    parseValTop: function(vt, vlist) {        
        if (!vt) return false;
        var m = vt.match(/\$[0-9]/g);
        if (m) {
            
            //$.each(m, function(i) {
                //alert(m[i].substr(1,1));
                var val = vlist[m[0].substr(1,1)];
                //alert(val);
                if (typeof val == 'object') val = val.hyperlink[2];
            //});
        }
        
        return vt.replace(/\$[0-9]/, val);
    },
    
    /**
     * Search for locale string and return translated string
     */
    parseLocale: function(v) {
        var p = v.match(/_p\([^\(]*\)/);
        if (p) {
            var locStr = _p(p[0].slice(3, -1));
            v = v.replace(/_p\([^\(]*\)/, locStr);
        }
        
        return v;
    },
    
    /**
     * Create the HTML/JS for 'zoomall' and 'autozoom' settings
     */
    returnZoomParamsHtml: function(zp, tpl) {
        var allextent = zp.allextent;
        var autozoom = zp.autozoom;
        var zoomall = zp.zoomall;

        if (allextent) PM.extentSelectedFeatures = allextent;
        
        var html = '';
        if (zoomall && tpl.zoomall != false) {
            $.each(tpl, function(k, v) {
                html += PM.Query.parseVal(v, zp)
            });
        }
        
        // Add image for onload event
        html += '<img id=\"pmQueryResultLoadImg\" src=\"images/blank.gif\" style=\"display:none;\"  onload=\"';  
        if (autozoom) {
            if (autozoom == 'auto') {
                html += 'PM.Map.zoom2extent(0,0,\'' + allextent + '\', 1);';
            } else if (autozoom == 'highlight') {
                html += 'PM.Map.updateMap(PM_XAJAX_LOCATION + \'x_load.php?' + SID +  '&mode=map&zoom_type=zoompoint\', \'\')';
            }
        } else {
            html += '$(\'#zoombox\').hidev();';
        }
        
        html += '\" />';
        
        var qrlLen = PM.Custom.queryResultAddList.length;
        for (var i=0; i<qrlLen ; i++) {
            html += eval(PM.Custom.queryResultAddList[i]);
        }

        return html;
    },


    /**
     * Parse JSON result string with parseJSON()
     * and insert resulting HTML into queryresult DIV
     * run post-processing scripts
     */
    writeQResult: function(resultSet, infoWin) {
        var queryResultContainer = infoWin;
        
        if (infoWin == 'dynwin') {
            PM.Dlg.createDnRDlg(this.resultDlgOptions, _p('Result'), false);
            $('#pmQueryContainer_MSG').addClass('pm-info').addClass('jqmdQueryMSG');
            queryResultContainer = 'pmQueryContainer_MSG';
        } 
        if (!this.preRenderedQResult) {
            if (!resultSet) {
                $('#' + queryResultContainer).html(this.returnNoResultHtml());
            } else {
                // call main result parser
                var callbackfn = PM.Query.parseResult(resultSet, PM.queryResultLayout, queryResultContainer);
                
                if (PM.queryResultLayout == 'table') {
                    sortables_init();
                } else if (PM.queryResultLayout == 'tree') {
                    $('#' + queryResultContainer).treeview(PM.queryTreeStyle.treeview);
                }
                
                eval(callbackfn);
            }
        } else {
            $('#' + queryResultContainer).html(resultSet);
        }
    },

    /**
     * Return HTML for no results found in query
     */
    returnNoResultHtml: function(infoWin) {
        var h = '<table class="restable" cellspacing="0" cellpadding="0">';
        h += '<td>' + _p('No records found') + '</td>'; 
        h += '</tr></table>';
        return h;
    },
    

    /**
     * Return layer/group for selection
     */
    getSelectLayer: function() {
        var selform = _$("selform");
        if (selform) {
            if (selform.selgroup) {
                var sellayer = selform.selgroup.options[selform.selgroup.selectedIndex].value;
                //alert(sellayer);
                return sellayer;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },

    /**
     * Start auto-identify (iquery)
     */
    applyIquery: function(mx, my) {
        var imgxy  = mx + "+" + my;
        var queryurl = PM_XAJAX_LOCATION + 'x_info.php?' +SID+ '&mode=iquery' + '&imgxy='+imgxy + '&groups=' + this.getSelectLayer();
        this.getQueryResult(queryurl, '');
    },

    /**
     * TIMER FOR OAUTO_IDENTIFY ACTION 
     * indicates for how much time the cursor remains firm on the map [by Natalia]
     */
    timedCount: function(moveX, moveY) {  
        if (this.timer_c == 0){
            X = moveX;
            Y = moveY;
        }
        if (this.timer_c == 1){
            this.iquery_timer = setTimeout("applyIquery(" + X + "," + Y + ")", 200);
        }
        this.timer_c += 1;
        this.timer_t = setTimeout("timedCount()",this.timeA);
    },

    /**
     * Display result in DIV and postion it correctly
     */
    showIQueryResults: function(queryResult) {
    	// do not display iquery result if tool has changed
    	if (PM.Map.mode == 'iquery') {
    		var iQL = $('#iqueryContainer');
    		// alert(iQL.height());
    		if (queryResult) {
    			var IQueryResult = PM.Query.parseResult(queryResult, 'iquery', false);
    		} else {
    			return false;
    		}
    		var map = $('#mapImg');

    		if (PM.autoIdentifyFollowMouse){
    			// border limits
    			var limitRG = map.iwidth() - iQL.iwidth() - 4; // Right
    			var limitDN = map.iheight() - iQL.iheight() - 4;    // Down
    			var moveX = PM.ZoomBox.moveX;
    			var moveY = PM.ZoomBox.moveY;

    			//gap between mouse pointer and iqueryLayer:
    			var gap = 10;

    			// right:
    			if (moveX >= limitRG){
    				iQL.left(moveX - iQL.iwidth() - gap + 'px');
    			} else {
    				iQL.left(moveX + gap +'px');
    			}

    			// down:
    			if (moveY >= limitDN){
    				iQL.top(moveY - iQL.iheight() - gap + 'px');
    			} else {
    				iQL.top(moveY + gap +'px');          
    			}

    			if (IQueryResult) {
    				//iQL.css({height:0});
    				iQL.html(IQueryResult).showv().show();
    				if (this.timeW != -1) this.timer_to = setTimeout("hideIQL()",this.timeW);
    			} else {
    				iQL.html('').height(0).hidev().hide();
    				clearTimeout(this.timer_t);
    				clearTimeout(this.iquery_timer);
    			}
    			// no follow, display on fixed position
    		} else {
    			if (IQueryResult) {
    				iQL.html(IQueryResult).showv();
    			} else {
    				iQL.html('').hidev();
    			}
    		}
    	}
    },

    hideIQL: function() {
        clearTimeout(this.iquery_timer);
        $('#iqueryContainer').hidev();
    },

    mapImgMouseOut: function() {
        //alert('out');
        var vMode = PM.Map.mode;
        if (vMode == 'iquery' || vMode == 'nquery') {
            $('#iqueryContainer').hidev();
        }
    }
    
});
/******************************************************************************
 *
 * Purpose: JS functions for XML based search definition
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

$.extend(PM.Query,
{
    /** Keep selected value in search box */
    seachBoxKeepSelectedValue: false,
    
    /** Default options for suggest/autocomplete box */
    suggestOptions: { 
        delay:300, 
        cacheLength: 20,
        matchSubset: true,
        selectFirst: false,
        max: 0,
        scrollHeight: 250
    },
    
    /**
     * Disable ENTER input for search form
     * Patch provided by Walter Lorenzetti
     */
    disableEnterKey: function(e)
    {
        var key;
        if (window.event) {
            key = window.event.keyCode;     //IE
        } else {
            key = e.which;     //firefox
        }
        if (key == 13) {
            this.submitSearch();
            return false;
        } else {
            return true;
        }
    },
    
    /**
     * Start attribute search
     */
    submitSearch: function() {
        PM.ajaxIndicatorShow(false, false);
        
        var searchForm = _$('searchForm');
        var skvp = PM.Form.getFormKVP('searchForm');
        //alert(skvp);
        
        if (PM.infoWin != 'window') {
            searchForm.target='infoZone';
        } else {
            var resultwin = openResultwin('blank.html');
            searchForm.target='resultwin';
        }
        
        var queryurl = PM_XAJAX_LOCATION + 'x_info.php';
        var params = SID + '&' + skvp + '&mode=search';
        //alert(queryurl);
        this.getQueryResult(queryurl, params);
    },
    

    /**
     * Attribute search: create items for search definitions 
     */
    createSearchItems: function(url) {
        $.ajax({
            url: url,
            dataType: "json",
            success: function(response){
                var searchJson = response.searchJson;
                var action = response.action;
                
                if (action == 'searchitem') {
                    PM.Query.createSearchInput(searchJson);
                } else {
                    var searchHtml = PM.Query.json2Select(searchJson, "0");
                    $('#searchoptions').html(searchHtml);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            }
        });
    },


    /**
     * Launch AJAX request to parse search.xml and get optionlist for serach
     */
    setSearchOptions: function() {
        var url = PM_XAJAX_LOCATION + 'x_search.php?' + SID +'&action=optionlist';
        this.createSearchItems(url);
    },

    /**
     * Launch AJAX request to parse search.xml and get params for chosen searchitem
     */
    setSearchInput: function() {
        var searchForm = _$('searchForm');
        // normal searchbox behaviour (reset the fields)
        if (!this.seachBoxKeepSelectedValue) {
	        var searchitem = searchForm.findlist.options[searchForm.findlist.selectedIndex].value;
	        var url = PM_XAJAX_LOCATION + 'x_search.php?' + SID +'&action=searchitem&searchitem=' + searchitem;
	        _$('searchForm').findlist.options[0].selected = true;  // reset parent select box to "Search for..."
	        this.createSearchItems(url);
	    // new searchbox behaviour (reset the fields)
        } else {
	    	if (searchForm.findlist.selectedIndex == 0) {
	    		$('#searchitems').html('');
	    		_$('searchForm').findlist.options[0].selected = true;  // reset parent select box to "Search for..."
	    	} else {
	            var searchitem = searchForm.findlist.options[searchForm.findlist.selectedIndex].value;
	            var url = PM_XAJAX_LOCATION + 'x_search.php?' + SID +'&action=searchitem&searchitem=' + searchitem;
	            this.createSearchItems(url);
	    	}
        }
    },

    /**
     * Convert a JSON string to HTML <select><option> list
     */
    json2Select: function(jsonObj, fo) {
        var html = '<select name="' + jsonObj.selectname + '" id="pmsfld_' + jsonObj.selectname + '"' ;
        var events = jsonObj.events;
        var size = jsonObj.size;
        
        if (size > 0) html += ' size="' + size +'" multiple="multiple" ';
        
        if (events) {
        	if (typeof(events) == 'object') {
	            for (var e in events) {
	                html += e + '="' + events[e] + '" '; 
	            }
        	// if "events" is a string, the HTML is bad written:
        	} else {
        		html += events;
        	}
        }

        html += '>';
        
        var options = jsonObj.options;
        var htmlOptions = '';
        var numOptions = 0;
        for (var o in options) {
        	htmlOptions += '<option value=\"' + o + '\">' + options[o] + '</option>';
        	numOptions++;
        }
        if (fo != "0" && numOptions > 1) html += '<option value=\"#\">' + fo + '</option>';
        html += htmlOptions;
        html += '</select>';
        
        return html;
    },


    /**
     * Create the input tag for every field of the attribute search
     */
    createSearchInput: function(jsonObj) {

        var searchitemsElem = $('#searchitems');
        var itemLayout = searchitemsElem.attr('class').replace(/pm_search_/, '');
        
        var searchitem = jsonObj.searchitem;
        var fields     = jsonObj.fields;

        var hc = '<table id="searchitems_container1" class="pm-searchitem" border="0" cellspacing="0" cellpadding="0">';
        var itemsAppendTo = 'searchitems_container1';
        if (itemLayout == 'inline') {
            hc += '<tr id="searchitems_container2"></tr>';
            itemsAppendTo = 'searchitems_container2';
        }
        hc += '</table>';
        
        searchitemsElem.html('');
        $(hc).appendTo(searchitemsElem);
        
        var html = '';
        var htmlend = '';
        for (var i=0; i<fields.length; i++) {
            var description = fields[i].description;
            var fldname     = fields[i].fldname;
            var fldsize     = fields[i].fldsize;
            var fldsizedesc = fields[i].fldsizedesc;
            var fldinline   = fields[i].fldinline;
            var definition  = fields[i].definition;
            
            var inputsize = fldsize ? ' size="' + fldsize + '" ' : '';
            var sizedesc = fldsizedesc ? ' style="position:absolute; left:' + fldsizedesc + 'em"' : '';
            
            if (!definition) {
                var hi = ' <td class="pm-searchdesc">' + description + '</td>';
                hi += ' <td' + sizedesc + '>' + '<input type="text" class="pm-search-textinput" id="pmsfld_' + fldname + '" name="' + fldname + '"' + inputsize + '></td>';
                if (itemLayout != "inline") hi = '<tr>' + hi + '</tr>';
                $(hi).appendTo('#'+itemsAppendTo);
                
            } else {
                if (definition.type == 'options') {
                    var ho = ' <td class="pm-searchdesc">' + description + '</td>';
                    ho += ' <td>' + this.json2Select(definition, definition.firstoption) + '</td>';
                    if (itemLayout != "inline") ho = '<tr>' + ho + '</tr>';
                    $(ho).appendTo('#'+itemsAppendTo);
                    
                } else if (definition.type == 'suggest') {
                    var hs = '<td class="pm-searchdesc">' + description + '</td>';
                    hs += '<td><input type="text" id="pmsfld_' + fldname + '" name="' + fldname + '" alt="Search Criteria"' + inputsize + ' ' + definition.events + ' /></td>';
                    if (itemLayout != "inline") hs = '<tr>' + hs + '</tr>';
                    $(hs).appendTo('#'+itemsAppendTo);
                    
                    var searchitem  = definition.searchitem;
                    var minlength   = definition.minlength;
                    var suggesturl = PM_XAJAX_LOCATION + 'x_suggest.php?' + SID + '&searchitem=' + searchitem + '&fldname=' + fldname;

                    // many dependfields
                    var dependFields = definition.dependfld;
                    var xParamsParts = {};
                    if (dependFields) {
	                    dependFields = dependFields.split(',');
	                    $.each(dependFields, function() {
	                    	var dependfld = this;
	                    	xParamsParts['dependfldval_' + dependfld] = function() {
		                    	var fldName = eval('dependfld');
		                    	return $('#pmsfld_' + fldName + ':checkbox').is(':not(:checked)') ? '' : $('#pmsfld_' + fldName).val();
		                    };
	                    });
                    }
                    var xParams = xParamsParts ? xParamsParts : false;
                    
                    //var xParams = dependfld ? PM.Form.getFormKvpObj('searchForm') : false;
                    $('#pmsfld_' + fldname)
                        .autocomplete(suggesturl, PM.Query.suggestOptions)
                        .setOptions({ minChars: minlength, extraParams: xParams });
                    if (definition.nosubmit != 1 && PM.suggestLaunchSearch)
                        $('#pmsfld_' + fldname).result(function(event, data, formatted) {
                            if (data) PM.Query.submitSearch();
                        });
                
                } else if (definition.type == 'checkbox') {
                    var value      = definition.value;
                    var defchecked = ''; //(definition.checked == 1) ? ' checked ' : '' ; //" checked="checked" ' : '' ;                
                    var hcb = '<td class="pm-searchdesc">' + description + '</td>';
                    hcb += '<td><input type="checkbox" id="pmsfld_' + fldname + '" name="' + fldname + '" ' + '" value="' + value + '" ' + defchecked + ' /></td>';
                    if (itemLayout != "inline") hcb = '<tr>' + hcb + '</tr>';
                    $(hcb).appendTo('#'+itemsAppendTo);
                    
                // Radio Button
                } else if (definition.type == 'radio') {
                    var inputlist  = definition.inputlist;
                    var hra = "";
                    for (var ipt in inputlist) {
                        //alert(definition.checked);
                        var defchecked = (definition.checked == ipt) ? ' checked="checked" ' : '' ; //" checked="checked" ' : '' ;                
                        hra += '<td><input type="radio" id="pmsfld_' + fldname + '" name="' + fldname + '" ' + '" value="' + ipt + '" ' + defchecked + ' /></td>';
                        hra += '<td>' + inputlist[ipt]+ '</td>';
                    }
                    if (itemLayout != "inline") hra = '<tr>' + hra + '</tr>';
                    $(hra).appendTo('#'+itemsAppendTo);
                
                } else if (definition.type == 'operator') {
                    //if (fldinline) html += '<div class="search_inline">';
                    var hop = '<td class="pm-searchdesc">' + description + '</td>';
                    hop += ' <td' + sizedesc +'>' + this.json2Select(definition, false);
                    hop += ' <input type="text" class="pm-search-textinput-compare" id="pmsfld_' + fldname + '" name="' + fldname + '" ' + inputsize + '></td>';
                    if (itemLayout != "inline") hop = '<tr>' + hop + '</tr>';
                    $(hop).appendTo('#'+itemsAppendTo);
                
                } else if (definition.type == 'hidden') {
                    htmlend += '<input type="hidden" id="pmsfld_' + fldname + '" name="' + fldname + '" value="' + definition.value + '">';
                }
            }
            
        }
        /*
        html += '<td colspan="2" class="pm-searchitem">';
        html += '<div><input type="button" value="' + _p('Search') + '" size="20" ';
        html += 'onclick="PM.Query.submitSearch()" onmouseover="PM.changeButtonClr(this, \'over\')" onmouseout="PM.changeButtonClr (this, \'out\')"></div>';
        html += '<div><img src="images/close.gif" alt="" onclick="$(\'#searchitems\').html(\'\')" /></div>';
        html += '</td>';
        */
        html += '<td colspan="2" class="pm-searchitem">';
        html += '<table><tr><td><input type="button" value="' + _p('Search') + '" size="20" ';
        html += 'onclick="PM.Query.submitSearch()" onmouseover="PM.changeButtonClr(this, \'over\')" onmouseout="PM.changeButtonClr (this, \'out\')"></td>';
        if (!this.seachBoxKeepSelectedValue) {
        	html += '<td><img src="images/close.gif" alt="" onclick="$(\'#searchitems\').html(\'\')" /></td>';
	    } else {
	    	html += '<td><img src="images/close.gif" alt="" onclick="$(\'#searchitems\').html(\'\');_$(\'searchForm\').findlist.options[0].selected	= true;" /></td>';
	    }
        html += '</tr></table></td>';
        
        htmlend += '<input type="hidden" name="searchitem" value="' + searchitem + '" />';
        if (itemLayout != "inline") html = '<tr>' + html + '</tr>';
        $(html).appendTo('#'+itemsAppendTo);
		$(htmlend).appendTo(searchitemsElem);
    }


    /***
    // sample function for executing attribute searches with external search parameter definitions
    submitSearchExt: function() {
        var searchForm = _$('searchForm');
        if (PM.infoWin != 'window') {
            searchForm.target='infoZone';
        } else {
            var resultwin = openResultwin('blank.html');
            searchForm.target='resultwin';
        }
        //var qStr = '(([POPULATION]<12000))';
        var qStr = '(  ( "[NAME]" =~ /(B|b)(E|e)(R|r)(L|l)(I|i)/ ) )';
        var queryurl = PM_XAJAX_LOCATION + 'x_info.php';
        var params = SID + '&externalSearchDefinition=y&mode=search&layerName=cities10000eu&layerType=shape&fldName=POPULATION&qStr=' + qStr ; 
        getQueryResult(queryurl, params);
    }
    ***/

});
/******************************************************************************
 *
 * Purpose: functions for formatting TOC and legend output
 * Author:  Armin Burger
 *
 ******************************************************************************
 *
 * Copyright (c) 2003-2011 Armin Burger
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



$.extend(PM.Toc,
{
    legendContainer: 'toclegend',
    
    updateHiddenLegend: false,
    
    /**
     * initialize and write TOC by calling XMLHttp function 'updateToc()' 
     * 
     */
    init: function(callfunction) {
        var legurl = PM_XAJAX_LOCATION + 'x_toc.php?'+SID;
        $.ajax({
            url: legurl,
            dataType: "html",
            success: function(response){   
                $('#toc').html(response);
                
                //if (response.grpStyle == 'tree') {
                if (PM.ini.ui.tocStyle == 'tree') {
                    // Open category tree
                    $('#toc').find('li.toccat').each(function() { 
                        if ($.inArray($(this).id().replace(/licat_/, ''), PM.categoriesClosed) < 0) $(this).addClass('open');
                    });
                    // Open group tree for defGroups
                    $.each(PM.defGroupList, function() { 
                        $('#ginput_' + this).check(); 
                        $('#ligrp_' + this).each(function() { $(this).addClass('open') });
                    });
                    $('#toc').treeview(PM.tocTreeviewStyle);
                } else {   
                    $('#toc').addClass('treeview treeview-blank');
                    $.each(PM.defGroupList, function() { 
                        $('#ginput_' + this).check(); 
                    });
                }
                    
                // Bind click function to groups and categories checkboxes
                $("#layerform :input[name='groupscbx']")
                    .click(function () { 
                        PM.Toc.setlayers(this.value,false); 
                    });
                $("#layerform :input[name='catscbx']")
                    .click(function () { 
                        PM.Toc.setcategories(this.value, false); 
                    })
                    .check();
                
                // run all scripts after init of toc
                PM.Toc.tocPostLoading();
                
                // check if there is a function to execute
                eval(callfunction);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            }
        });
    },
    
    /**
     * Run scripts after TOC has been loaded
     */
    tocPostLoading: function() {
        // enable all context menus
        PM.Init.contextMenus();
        
        // execute all init scripts after TOC full loading
        for (var i=0; i<PM.pluginTocInit.length; i++) {
            eval(PM.pluginTocInit[i]);
        }
    },


    /**
     * Update toc applying different styles to visible/not-visible layers
     * called from 'updateMap()'
     */
    tocUpdateScale: function(tocurl) {
        $.ajax({
            url: tocurl,
            dataType: "json",
            success: function(response){
                var legendStyle = response.legendStyle;
                var layers = response.layers;
                
                $.each(layers, function(l, cl) {
                    $('#toc #spxg_' + l).each(function() {
                        $(this).removeClass('unvis vis').addClass(cl)
                               .parent().find('span').each(function() {
                                    $(this).removeClass('unvis vis').addClass(cl);
                        });
                    });
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            }
        });  
    },
    
    /** Options for show/hide of legend indicator  */
    optionsLegendIndicator: {
        show:{css:{position:'absolute', top:'0px', right:'0px'}},
        hide:{fadeOutSpeed:300}
    },
    
    /**
     * Update legend 
     * called from 'updateTocScale()'
     */
    updateLegend: function(callfunction) {
        var legurl = PM_XAJAX_LOCATION + 'x_legend.php?' + SID;
        var legendContainer = $('#' + PM.Toc.legendContainer);
        legendContainer.parent().pmShowIndicator({options:this.optionsLegendIndicator.show});
        $.ajax({
            url: legurl,
            dataType: "html",
            success: function(response){
                legendContainer.html(response).addClass('treeview treeview-blank');
                // check if there is a function to execute
                eval(callfunction);
            },
            error: function(a,b,c) {
                if (window.console) console.log(c);
            },
            complete: function() {
            	legendContainer.parent().pmHideIndicator({options:PM.Toc.optionsLegendIndicator.hide});
            }
        });   
    },
    

    /**
     * for legendStyle 'swap': swap from LAYER view to LEGEND view
     * attached as onClick script to button
     */
    swapToLegendView: function() {
        this.updateLegend();
        $('#toc').hide();
        $('#' + this.legendContainer).show(); 

    },

    /**
     * for legendStyle 'swap': swap from LEGEND view to LAYER view
     * attached as onClick script to button
     */
    swapToLayerView: function() {
        $('#toclegend').hide();
        $('#toc').show();
        // update TOC CSS depending on scale
        var tocurl = PM_XAJAX_LOCATION + 'x_toc_update.php?' + SID;
        this.tocUpdateScale(tocurl);
    },

    /**
     * Change layers, called from
     * - onclick event of group checkbox)
     * - and setcategories()
     */
    setlayers: function(selelem, noreload) {
        // if request comes from group checkbox
        if (selelem) {
            // Check if layer is not visible at current scale
            if (($('#spxg_' + selelem).hasClass('unvis')) && (!noreload)) {
                noreload = true;
            }
            
            // Check if layers should be mutually disabled
            if (PM.mutualDisableList) {
                if ($.inArray(selelem, PM.mutualDisableList) > -1) {
                    $.each(PM.mutualDisableList, function() { 
                        if (this != selelem)  $('#ginput_' + this).attr('checked', false); 
                    });
                }
            }
        }
        
        var layerstring = '&groups=' + this.getLayers();    
        
        // reload whole map
        if ((PM.layerAutoRefresh == '1') && (!noreload)) {     
            var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&zoom_type=zoompoint'+ layerstring;
            PM.Map.updateMap(mapurl);
        // just update 'groups' array of session, no map reload
        } else {
            var passurl = PM_XAJAX_LOCATION + 'x_layer_update.php?'+SID+layerstring;
            PM.Map.updateSelLayers(passurl);
        }
    },

    /**
     * Return layers/groups
     */
    getLayers: function() {
        var laystr = '';
        $("#layerform :input[name='groupscbx'][checked]").not(':disabled').each(function() { 
            laystr += $(this).val() + ','; 
        });
        laystr = laystr.substr(0, laystr.length - 1);
        return laystr;
    },

    /**
     * Set categories and child groups
     * (called from onclick event of categories checkbox)
     */
    setcategories: function(cat, noreload) {
        var checkedLayers = false;
        var visLayers = false;
        $('#licat_' + cat).find('input[name="groupscbx"]').each(function() {
            //(dis|en)able groups below category
            if ($('#cinput_' + cat).is(':checked')) {
                $(this).attr('disabled', false);
            } else {
                $(this).attr('disabled', true);
            }
            
            if ($(this).is(':checked')) {
                checkedLayers = true;
                if ($('#spxg_' + ($(this).id().replace(/ginput_/, ''))).hasClass('vis')) {
                    visLayers = true;
                }
            }
        });
        
        if (checkedLayers && visLayers) {
            this.setlayers(false, noreload);
        } else {    
            this.setlayers(false, true);
        }
    },

    /**
     * Functions to switch on/off all layers of a category
     * typically added to context menu of a category
     */
    catLayersSwitchOn: function(cat) {
        this.catLayersSwitch(cat, 'on');
    },

    catLayersSwitchOff: function(cat) {
        this.catLayersSwitch(cat, 'off');
    },

    catLayersSwitch: function(cat, action) {
        $('#' + cat).find('input[name="groupscbx"]').each( function() {
            $(this).check(action);
        });
        // set active layers and reload map
        this.setlayers(false, false);
    },
    
    
    toggleLegendContainer: function() {
        var layoutPane = $('#' + PM.Toc.legendContainer).parents('[pane]').attr('pane');
        myLayout.toggle(layoutPane);
    }
    
    
});/******************************************************************************
 *
 * Purpose: functions for UI elements
 * Author:  Armin Burger
 *
 ******************************************************************************
 *
 * Copyright (c) 2003-2009 Armin Burger
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



/**
 * UI elements
 * Configuration via js_config.php 
 */
;(function($){ 
    $.fn.extend({  
        /** Toolbar   */
        pmToolBar: function(tb) {
            var container  = $(this);          
            var defaults = {
                    orientation:'v',
                    css:{},
                    theme:'default',
                    imagetype:'gif'    
            };
            var options = $.extend(defaults, tb.options);
            
            var tbtab = $('<table />').addClass('pm-toolbar');
            var trh = (options.orientation == "v") ? false : $('<tr/>');
            
            $.each(tb.buttons, function() {
                var tool = this.tool;
                var run = this.run; 
                
                if (tool.match(/^space/i)) {
                    var tdb = $('<td/>').addClass('pm-tsepspace').css({height:this.dimension, width:this.dimension});
                } else if (tool.match(/^separator/i)) {
                    var tdb = $('<td/>').addClass('pm-tsep' + options.orientation).css({height:this.dimension, width:this.dimension});
                    if ($.browser.msie && parseInt($.browser.version) < 8) tdb.append($('<img />').src('images/blank.gif').attr('alt', 'separator'));
                } else {
                    var tdb = $('<td/>').id('tb_' + tool).addClass('pm-toolbar-td');
                    if (run) {
                        tdb.mousedown(function(){PM.TbDownUp(tool,'d');})
                           .mouseup(function(){PM.TbDownUp(tool,'u');})
                           .bind('click', function(e){eval(run + '()');});
                    } else {
                        tdb.mousedown(function(){PM.setTbTDButton(tool);})
                           .click(function(){PM.Map.domouseclick(tool);});
                    }
                    var toolTitle = _p(this.name);
                    
                    $('<img />').id('img_' + tool)
                                .src('images/buttons/'+ options.theme + '/' + tool + '_off.' + options.imagetype)
                                .attr('alt', toolTitle)
                                .attr('title', toolTitle)
                                .appendTo(tdb)
                    ;
                }
                if (trh) {
                    trh.append(tdb);
                } else {
                    $('<tr />').append(tdb).appendTo(tbtab);
                }
            });
            if (trh) trh.appendTo(tbtab);
            
            $("<div />").id(tb.toolbarid).addClass('pm-toolframe').css(options.css).append(tbtab).appendTo(container);
        },
        
        /** Tool links   */
        pmToolLinks: function(tl) {
            var container = $(this);     
            var ul = $('<ul/>').addClass('pm-tool-links');
            $.each(tl.links, function() {
                var linkName = _p(this.name); //;
                var target = this.target ? 'onclick="this.target = \'' + this.target + '\';"' : '';
                var a = '<a href="' + (this.run.substr(0,4) == 'http' ? this.run : 'javascript:' + this.run + '()') + '"' + target + '>';
                a += '<img style="background:transparent url(images/menus/' + this.imgsrc + ')' + ' no-repeat;height:16px;width:16px" src="images/transparent.png" alt="' + linkName +'" />';
                a += '<span>' + linkName + '</span></a>';
                $('<li/>').html(a).appendTo(ul);
            });
            
            $("<div />").id(tl.containerid).append(ul).appendTo(container);  
        },
        
        /** Tabs */ 
        pmTabs: function(tb) {
            var container = $(this);
            var options = tb.options;
            var ul = $('<ul/>').addClass(options.mainClass);
            var tabW = parseInt(100 / tb.tabs.length) -1 ;
            $.each(tb.tabs, function() {
                var tabName = _p(this.name); 
                var run = this.run; 
                var tab = $('<div>').html(tabName);
                if (this.active) tab.addClass('pm-tabs-selected');
                tab.bind('click', function() {  
                        tab.parent().parent().find('>li>div').each(function() {$(this).removeClass('pm-tabs-selected');});
                        tab.addClass('pm-tabs-selected');
                        eval(run + '()');
                });
                $('<li>').css({width:tabW+'%'}).append(tab).appendTo(ul);
            });
            ul.appendTo(container);
        },
        
        /** Append a new element to another */
        appendElement: function(el) {
            var dom = $('<'+el+'/>');
            $(this).append(dom); 
            return dom;
        },
        
        /** Indicator   */
        pmShowIndicator: function(ind) {
            var container = $(this);   
            var defaults = {
                    imgSrc:'images/indicator.gif',
                    css:{position:'absolute', top:'0px', left:'0px'}
            };
            var options = $.extend(defaults, ind.options);
            //console.log(ind.options);
            
            var img = $('<img>').src(options.imgSrc);
            $('<div>').addClass('pm-indicator').css(options.css).append(img).appendTo(container);
        },
        
        pmHideIndicator: function(ind) {
            var container = $(this);  
            var defaults = {
                    fadeOutSpeed: 500
            };
            var options = $.extend(defaults, ind.options);
            container.find('div.pm-indicator').each(function (i) {
                $(this).fadeOut(options.fadeOutSpeed, function () {
                    $(this).remove();
                });
            });
        }
            
    });
    
})(jQuery); 


$.extend(PM.UI,
{
    /**
     * Show div with link to current map
     */
    //function showMapLink() {
    showMapLink: function() {
        $.ajax({
            type: "POST",
            url: PM_XAJAX_LOCATION + 'x_maplink.php?'+ SID,
            dataType: "json",
            success: function(response){
                var urlPntStr = response.urlPntStr;
                var dg = PM.Toc.getLayers();
                var maxx_geo = PM.xdelta_geo + PM.minx_geo;
                var miny_geo = PM.maxy_geo - PM.ydelta_geo;
                var me = PM.minx_geo + ',' + miny_geo + ',' + maxx_geo + ',' + PM.maxy_geo;
                var confpar = PM.config.length > 0 ? '&config=' + PM.config : '';
                var urlPntStrPar = urlPntStr.length > 1 ? '&up=' + urlPntStr.replace(/\%5C\%27/g, '%27') : '';
                var loc = window.location;
                var reqList = loc.search.substr(1).split('&');
                var defReqStr = "";
                $.each(reqList, function(index, value) {
                    if (value.search(/(dg|me|language|config|up)=/) < 0) {
                        defReqStr += '&' + value;
                    }
                });
                //console.log(defReqStr);
                var port = loc.port > 0 ? ':' + loc.port : '';
                var linkhref = loc.protocol + '/' + '/' + loc.hostname + port + loc.pathname + '?dg=' + dg + '&me=' + me + '&language=' + PM.gLanguage + confpar + urlPntStrPar + defReqStr; 
                $('<div>').id('mapLink')
                          .addClass('pm-map-link')
                          //.append($('<div>').text(_p('Press [CTRL-C] to copy link')))
                          .append($('<div>').text(_p('Link to current map')))
                          .append($('<input type="text" class="pm-map-link-url" />').val(linkhref).click(function() {$(this).select();})) 
                          .append($('<img src="images/close.gif" alt="close" />').click(function () {$(this).parent().remove();}))
                          .append($('<br /><a href="' + linkhref + '">' + _p('Load link in current window') + '</a>').click(function() {$(this).parent().remove();}))
                          .appendTo('.ui-layout-center')
                          //.find('input').each(function() {this.select()})
                          .show();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            }
        });
    },

    /**
     * Create the measure input elements
     */
    createMeasureInput: function() {
        var mStr =  '<form id="measureForm"><div class="pm-measure-form"><table class="pm-toolframe"><tr><td NOWRAP>' + _p('Total') + PM.measureUnits.distance + '</td><td><input type=text size=9 id="measureFormSum"></td>';
        mStr += '<td id="mSegTxt" value="&nbsp;&nbsp;' + _p('Segment') + '" NOWRAP>&nbsp;&nbsp;' + _p('Segment') + PM.measureUnits.distance + '</td><td><input type=text size=9 id="measureFormSeg"></td>';
        mStr += '<td width=130 class="TDAR"><input type="button" id="cbut_measure" value="' + _p('Clear');
        mStr += '"  class="button_off"  name="custombutton" onClick="javascript:PM.Draw.clearMeasure()" >';
        mStr += '</td></tr></table></form>';
        
        $('#helpMessage').html(_p('digitize_help')).show();
        $('#mapToolArea').html(mStr).show();
        PM.Init.cButton('cbut_measure');    
    }
});





/******************************************************************************
 *
 * Purpose: functions related to map navigation and mouse events  
 * Author:  Armin Burger
 *
 ******************************************************************************
 *
 * Copyright (c) 2003-2010 Armin Burger
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

$.extend(PM.ZoomBox,
{
    mouseDrag: false,
    maction: null,
    rightMouseButton: false,
    downX: 0, 
    downY: 0,
    upX: 0,
    upY: 0,
    moveX: 0, 
    moveY: 0,
    refmapClick: false,
    mapcL: 0,
    mapcT: 0, 
    mapcL: 0, 
    mapcR: 0,
    isIE: (document.all) ? true : false,
    m_offsX: 0,
    m_offsY: 0,
    theMapImg: null,
    theMapImgLay: null,
    mapElem: null, 
    refElem: null,
    oMap: null,
    rMap: null,
    rBox: null,
    sBox: null,
    rCross: null,
    zb: null, 
    xCoordCont: null,
    yCoordCont: null,
    rBoxMinW: 8,  // Minimal width until to show refBox; below threshold switches to refCross
    rOffs: 13,    // offset for reference map cross, depends on image size
    showCoordinates: true,
    coordsDisplayRfactor: 0,
    coordsDisplayReproject: false,
    coordsDisplayUnits: '',
    enableWheelZoom: true,
    wheelZoomGoogleStyle: false,
    wheelZoomPointerPosition: true,
    enableKeyNavigation: true,
    combinedSelectIquery: false,
    
    
    /**
     * Start-up function added to mouseover event for map 
     */
    startUp: function() {
        this.theMapImg = $('#mapImg');
        this.theMapImgLay = $('#mapimgLayer');
        this.zb = $('#zoombox');
        this.mapElem = document.getElementById('map');
        this.refElem = document.getElementById('refmap');
        this.oMap = $('#map');
        this.rMap = $('#refmap');
        this.rBox = $("#refbox");
        this.sBox = $("#refsliderbox");
        this.rCross = $("#refcross");
        this.xCoordCont = $('#xcoord');
        this.yCoordCont = $('#ycoord');
        this.refmapClick = false;

        // Events
        this.mapElem.onmousedown = PM.ZoomBox.doMouseDown; 
        this.mapElem.onmouseup   = PM.ZoomBox.doMouseUp;
        this.mapElem.onmousemove = PM.ZoomBox.doMouseMove; 
        this.mapElem.ondblclick  = PM.ZoomBox.doMouseDblClick;
        
        // Enables actions for mouse wheel
        if (this.enableWheelZoom) {
            this.oMap.mousewheel(function(e){ PM.ZoomBox.omw(e); });
        }
        
        this.mapElem.oncontextmenu = PM.ZoomBox.disableContextMenu;

        this.setCursorMinMax('map');

    },
    
    /**
     * For mouse over reference map
     */
    startUpRef: function() {
        this.refElem = document.getElementById('refmap');
        this.rMap = $('#refmap');
        this.rBox = $("#refbox");
        this.sBox = $("#refsliderbox");
        this.rCross = $("#refcross");
        
        clearTimeout(PM.Query.iquery_timer);  // necessary for iquery mode
        this.refmapClick = true;

        this.refElem.onmousedown = this.doMouseDown; 
        this.refElem.onmouseup   = this.doMouseUp;
        this.refElem.onmousemove = this.doMouseMove;   
    
        // Enables actions for mouse wheel
        if (this.enableWheelZoom) {
            this.rMap.mousewheel(function(e){ PM.ZoomBox.omw(e); });
        }
        
        this.setCursorMinMax('refmap');
    },
    
    /**
     * Initialize keyboard navigation
     */
    initKeyNavigation: function() {
        if (this.enableKeyNavigation) {
			// keypress event doesn't work in safari & chrome
        	if ($.browser.webkit) {
        		document.onkeydown = PM.ZoomBox.kp;
        	} else {
            	if (document.all) document.onkeydown = PM.ZoomBox.kp;
                document.onkeypress = PM.ZoomBox.kp;
        	}
        }
    },
        
    /** 
     * Min and max values for mouse
     */
    setCursorMinMax: function (elem) {
        // MAP
        if (elem == 'map') {
            //var oMap = $('#map');
            this.mapcL = this.oMap.offset()['left'] + 1;
            this.mapcT = this.oMap.offset()['top'] + 1;
            this.mapcR = this.mapcL + PM.mapW;
            this.mapcB = this.mapcT + PM.mapH;
            var curelem = this.oMap;
        // REFERENCE MAP
        } else {
            //var rMap = $('#refmap');
            this.mapcL = this.rMap.offset()['left'] ; 
            this.mapcT = this.rMap.offset()['top'];
            this.mapcR = this.mapcL + PM.refW ;
            this.mapcB = this.mapcT + PM.refH ;
            var curelem = this.rMap;
        }
        
        this.offsX = curelem.offset()['left'] + 1;
        this.offsY = curelem.offset()['top'] + 1;
        
    },
    
    /**
     * Check position of mouse
     */
    checkCursorPosition: function(cX, cY) {
        if (cX >= this.mapcL && cX <= this.mapcR && cY >= this.mapcT && cY <= this.mapcB) {
            return true;
        } else {
            return false;
        }
    },
    
    /**
     * Mouse down
     */
    doMouseDown: function(e) {
        e = (e)?e:((event)?event:null);
        
        try {
            if (PM.enableRightMousePan) {
                if (e.button == 2) {
                    PM.ZoomBox.rightMouseButton = true;
                    PM.setCursor(true, false);
                } else {
                    PM.ZoomBox.rightMouseButton = false;
                }
            }
        } catch(err) {
        	if (window.console) console.log(err);
        }
        
        PM.ZoomBox.mouseDrag = true;
        PM.ZoomBox.getDownXY(e);
        
        var downX = PM.ZoomBox.downX;
        var downY = PM.ZoomBox.downY;
        
        if (PM.ZoomBox.refmapClick) {
            if (downX < 1 || downY < 1 || downX > PM.refW || downY > PM.refH) {        // Don't go ouside of map
                return false;
            } else {
                PM.ZoomBox.moveRefBox('shift');
            }
        }

        return false;
    },
    
    
    /**
     * Mouse UP
     */
    doMouseUp: function(e) {
        e = (e)?e:((event)?event:null);
        
        PM.ZoomBox.mouseDrag = false;
        PM.ZoomBox.getUpXY(e);
        
        var upX = PM.ZoomBox.upX;
        var upY = PM.ZoomBox.upY;
        var downX = PM.ZoomBox.downX;
        var downY = PM.ZoomBox.downY;

        // Click in main map
        if (!PM.ZoomBox.refmapClick) {

            maction = PM.Map.maction;

            if (PM.ZoomBox.rightMouseButton) {
                maction = 'pan';
                //PM.Map.zoom_type = 'zoompoint';
            }
            
            if (maction == 'measure') {
                PM.Draw.measureDrawSymbols(e, upX, upY, 0);

            } else if (maction == 'pan'){
                var diffX = upX - downX;
                var diffY = upY - downY;
                // pan with click
                if (diffX == 0 && diffY == 0) {
                    var newX = upX;
                    var newY = upY;
                // pan with drag
                } else {
                    var newX = (PM.mapW / 2) - diffX ;
                    var newY = (PM.mapH / 2) - diffY;
                }
                
                PM.Map.zoombox_apply(newX, newY, newX, newY);
                
                //Reset after right-mouse pan
                PM.ZoomBox.maction = PM.Map.maction;
                PM.ZoomBox.rightMouseButton = false;
                PM.setCursor(false, false);
            
            } else if (maction == 'click'){
                PM.Map.zoombox_apply(downX, downY, downX, downY);
                    
            } else if (maction == 'move'){
                // do nothing
                return false;

            } else {
                //alert(downX +', '+ downY +', '+ upX +', '+ upY);
                PM.Map.zoombox_apply(Math.min(downX,upX), Math.min(downY,upY), Math.max(downX,upX), Math.max(downY,upY));
            }

        // Click in reference map
        } else {
            
            if (upX < 1 || upY < 1 || upX > PM.refW || upY > PM.refH) {   // Don't go ouside of map
                //alert(upX + ' ref out');
                return false;
            } else {
                //alert(upX +', '+ upY +', '+ upX +', '+ upY);
                PM.Map.zoombox_apply(upX, upY, upX, upY);
            }
        }
        
        return false;    
 
    },
    
    /**
     * Mouse MOVE
     */
    doMouseMove: function(e) {
        e = (e)?e:((event)?event:null);
        
        PM.ZoomBox.getMoveXY(e);
        /* * Draw a zoombox when mouse is pressed and zoom-in or select function are active
           * move map layer when pan function is active
           * do nothing for all others    
           */

        var moveX = PM.ZoomBox.moveX;
        var moveY = PM.ZoomBox.moveY;
        
        // Actions in MAIN MAP
        if (!PM.ZoomBox.refmapClick) {
            maction = PM.Map.maction;
            
            if (PM.ZoomBox.rightMouseButton) {
                maction = 'pan';
            }
            
            // Display coordinates of current cursor position
            if (PM.ZoomBox.showCoordinates) PM.ZoomBox.displayCoordinates();        
                
            switch (maction) {
                //# zoom-in, select
                case 'box':
                    if (PM.ZoomBox.mouseDrag == true) { 
                        PM.ZoomBox.startZoomBox(e, moveX, moveY);
                    } else if (PM.Map.mode == 'nquery') {
                        try {
                            if (PM.ZoomBox.combinedSelectIquery) {
                                clearTimeout(PM.Query.iquery_timer);
                                PM.Query.iquery_timer = setTimeout("PM.Query.applyIquery(" + moveX + "," + moveY + ")", 300);
                            }
                        } catch(e) {
                            return false;
                        }
                    }
                    break;
        
                //# zoom-out, identify
                case 'click':
                    hideObj(_$('zoombox'));
                    break;
        
                //# pan with drag
                case 'pan':
                    hideObj(_$('zoombox'));
                    PM.ZoomBox.startPan(e, moveX, moveY);
                    break;
        
                //# measure & digitize
                case 'measure':
                case 'digitize':
                    showObj(_$('measureLayer'));
                    showObj(_$('measureLayerTmp'));
                    PM.Draw.redrawAll(moveX , moveY);                
                    break;
                    
                //# move
                case 'move':
                    if (PM.Map.mode == 'iquery') {    //# iquery
                        if(PM.Query.follow){
                            PM.Query.timer_c = 0;
                            clearTimeout(PM.Query.timer_t); // 
                            clearTimeout(PM.Query.iquery_timer);
                            $('#iqueryContainer').hidev();
                            timedCount(moveX, moveY);
                        } else{
                            clearTimeout(PM.Query.iquery_timer);
                            PM.Query.iquery_timer = setTimeout("PM.Query.applyIquery(" + moveX + "," + moveY + ")", 300);
                        }
                    }    
                    break;
                    
                default:
                    try {
                        var fct = maction + '_mmove';
                        if ($.isFunction(PM.Map[fct])) {
                            eval('PM.Map.' + fct + '(e, moveX, moveY)');
                        }
                    } catch(err) {
	                	if (window.console) console.log(err);
                    }
                    break;
            }
            
        // Actions in REFERENCE MAP
        } else {
            hideObj(_$('zoombox'));
            if (PM.ZoomBox.mouseDrag) {
                PM.ZoomBox.moveRefBox('move');
            }
        }
        
        return false;    
    },
    
    /**
     * For DOUBLE CLICK 
     * currently only used for measure function: end measure, calculate polygon area
     */
    doMouseDblClick: function(e) {
        PM.ZoomBox.getUpXY(e);
        maction = PM.Map.maction;
        if (maction == 'measure' || maction == 'digitize') {
            PM.Draw.measureDrawSymbols(e, PM.ZoomBox.upX, PM.ZoomBox.upY, 1);
        } else {
            try {
                var fct = maction + '_mdblclick';
                if ($.isFunction(PM.Map[fct])) {
                    eval('PM.Map.' + fct + '(e)');
                }
                return false;
            } catch(e) {
            	if (window.console) console.log(e);
            } 
        }
    },  
    
    

    /**
     * For MouseDown
     */
    getDownXY: function(e) {
        if (document.all) {
            eX = event.clientX;
            eY = event.clientY;
        } else {
            eX = e.pageX;
            eY = e.pageY;
        }
        // subtract offsets    
        this.downX = eX - this.offsX;
        this.downY = eY - this.offsY;

        return false;	
    },
    
    /**
     * For MouseUp
     */
    getUpXY: function(e) {
        if (document.all) {
            eX = event.clientX;
            eY = event.clientY;
        } else {
            eX = e.pageX;
            eY = e.pageY;
        }

        if (!this.refmapClick) {
            this.upX = Math.min(eX - this.offsX, PM.mapW);
            this.upY = Math.min(eY - this.offsY, PM.mapH);
        } else {
            this.upX = eX - this.offsX;
            this.upY = eY - this.offsY;
        }

        return false;
    },
    
    /**
     * For MouseMove
     */
    getMoveXY: function(e) {
        if (document.all) {
            moveX = event.clientX;
            moveY = event.clientY;
        } else {
            moveX = e.pageX;
            moveY = e.pageY;
        }
        // subtract offsets from left and top
        this.moveX = moveX - this.offsX;
        this.moveY = moveY - this.offsY;             
    },
    
    /**
     * DRAG ZOOM BOX (ZOOM IN, SELECT)
     */
    startZoomBox: function(e, moveX, moveY) {
        if (this.mouseDrag == true) {
            if (this.checkCursorPosition(moveX + this.offsX, moveY + this.offsY)) {
                var boxL = Math.min(moveX, this.downX);
                var boxT = Math.min(moveY, this.downY);
                var boxW = Math.abs(moveX - this.downX);
                var boxH = Math.abs(moveY - this.downY);

                this.zb.css('visibility', 'visible').left(boxL+"px").top(boxT+"px").width(boxW+"px").height(boxH+"px");  
            }
        }
        return false;
    },

    /**
     * PAN
     */
    startPan: function (e, moveX, moveY) {
        if (this.mouseDrag == true) {  
            if (this.checkCursorPosition(moveX + this.offsX, moveY + this.offsY)) {
                var mapL = moveX - this.downX;
                var mapT = moveY - this.downY;
                
                var clipT = 0;
                var clipR = PM.mapW;
                var clipB = PM.mapH;
                var clipL = 0;
                
                this.theMapImgLay.top(mapT+"px").left(mapL+"px");
            }
        }
        return false;
    },
    
    /**
     * FUNCTIONS FOR REFERENCE MAP RECTANGLE
     */
    setRefBox: function(boxL, boxT, boxW, boxH) {
        var rBox = PM.ZoomBox.rBox ? PM.ZoomBox.rBox : $("#refbox");
        var sBox = PM.ZoomBox.sBox ? PM.ZoomBox.sBox : $('#refsliderbox');
        var rCross = PM.ZoomBox.rCross ? PM.ZoomBox.rCross : $("#refcross");
        
        rBox.left(boxL + "px")
            .top(boxT + "px")
            .width(boxW + "px") //Math.max(4, boxW);
            .height(boxH + "px"); //Math.max(4, boxH);

        if (boxW < this.rBoxMinW) {
            rBox.hidev();
            rCross.showv();
            this.setRefCross(rCross, boxL, boxT, boxW, boxH);
        } else {
            rCross.hidev();
            rBox.showv();
        }

        sBox.hidev();

    },
    
    /**
     * MOVE RECTANGLE WITH MOUSE PAN
     */
    moveRefBox: function(moveAction) {
        var boxL = this.rBox.ileft();
        var boxT = this.rBox.itop();
        var boxW = this.rBox.iwidth();
        var boxH = this.rBox.iheight();
        
        if (moveAction == 'shift') {
            var newX = this.downX; 
            var newY = this.downY;        
        } else {
            var newX = this.moveX; 
            var newY = this.moveY; 
        }
        
        boxLnew = newX - (boxW / 2) - 1; 
        boxTnew = newY - (boxH / 2) - 1;
        
        if (boxLnew < 0 || boxTnew < 0 || (boxLnew + boxW) > PM.refW || (boxTnew + boxH) > PM.refH) {
            return false;
        } else {
            this.rBox.left(boxLnew+"px");
            this.rBox.top(boxTnew+"px");
            //window.status = (boxLnew + boxW + ' - ' + PM.refW);
            
            if (boxW < this.rBoxMinW) {
                this.setRefCross(this.rCross, boxLnew, boxTnew, boxW, boxH);
            }
        }
    },


    /**
     * Change position of reference cross
     * => symbol used when refbox below threshold
     */
    setRefCross: function(rCross, boxL, boxT, boxW, boxH) {	
        boxcX = parseInt(boxL) + parseInt((boxW / 2));
        boxcY = parseInt(boxT) + parseInt((boxH / 2));
        rCross.left(Math.round((boxcX - this.rOffs))+"px");
        rCross.top(Math.round((boxcY - this.rOffs))+"px");    
    },
    

    /**
     * Avoid pan etc.. via keyboard arrows in input type text etc...
     */

    doKP: function(e) {
        var doKP = true;
        var target = null;
        // all browsers:
        if (typeof(e.target) != 'undefined') {
            target = e.target;
        // IE only:
        } else if (typeof(e.srcElement) != 'undefined') {
            target = e.srcElement;
        }
        if (target) {
            if (target.type == 'text' || target.type == 'textarea') {
                doKP = false;
            }
        }
        return doKP;
    },
    
    /**
     * KEYBOARD FUNCTIONS
     * original script taken from http://ka-map.maptools.org/
     */
    kp: function(e) {
        try {
            e = (e)? e : ((event) ? event : null);
        } catch(e) {};
        if(e) {
            // Avoid pan etc.. via keyboard arrows in input type text etc...
            if (PM.ZoomBox.doKP(e)) {
            //var charCode = (e.keyCode) ? e.keyCode : e.charCode;
            //var charCode = (e.keyCode) ? e.keyCode : e.charCode;
            //console.log(e.keyCode);
				var nStep = 16;
				switch(e.keyCode){        
					case 63232://safari up arrow
					case 38://up arrow
						PM.Map.arrowpan('n');
						break;
					case 63233://safari down arrow
					case 40://down arrow
						PM.Map.arrowpan('s');
						break;
					case 63234://safari left arrow
					case 37:// left arrow
						PM.Map.arrowpan('w');
						break;
					case 63235://safari right arrow
					case 39://right arrow
						PM.Map.arrowpan('e');
						break;
					case 63276://safari pageup
					case 33://pageup
						PM.Map.gofwd();
						break;
					case 63277://safari pagedown
					case 34://pagedown
						PM.Map.goback();
						break;
					case 63273://safari home (left)
					case 36://home
						PM.Map.zoomfullext();
						break;
					case 63275://safari end (right)
					case 35://end
						break;
					case 43: // +
					//if (!navigator.userAgent.match(/Opera|Konqueror/i))  
						PM.Map.zoompoint(2, '');
						break;
					case 45: // -
						PM.Map.zoompoint(-2, '');
						break;
					case 46:// DEL: delete last point in editing mode
						if (PM.Map.maction == 'measure') {
							PM.Draw.delLastPoint();  
						} else { 	
							try {
								var fct = maction + '_delKeyPress';
								if ($.isFunction(PM.Map[fct])) {
									eval('PM.Map.' + fct + '()');
								}
							} catch(e) {
								if (window.console) console.log(e);
							}
						}
						break;
					case 27:// ESC: clear measure/digitize
						if (PM.Map.maction == 'measure') {
							PM.Draw.resetMeasure();
						} else { 	
							try {
								var fct = maction + '_EscKeyPress';
								if ($.isFunction(PM.Map[fct])) {
									eval('PM.Map.' + fct + '()');
								}
							} catch(e) {
								if (window.console) console.log(e);
							}
						}
						break;
					default:
						b=false;
				}
            }
        }
    },


    /**
     * MOUSEWHEEL FUNCTIONS (zoom in/out)
     * only works with IE
     */
    omw: function (e) {
        e = (e)?e:((event)?event:null);
        if(e) {
            try { 
                var imgxy = (PM.ZoomBox.refmapClick ? '' : (PM.ZoomBox.wheelZoomPointerPosition ? PM.ZoomBox.moveX + "+" + PM.ZoomBox.moveY : ''));
                var wInv = PM.ZoomBox.wheelZoomGoogleStyle ? -1 : 1;
            } catch(e) {
                var imgxy = '';
                var wInv = 1;
            }
            var wD = (e.wheelDelta ? e.wheelDelta : e.detail*-1) * wInv;
            
            clearTimeout(PM.resize_timer);
            if (wD < 0) {
                PM.resize_timer = setTimeout("PM.Map.zoompoint(2,'" + imgxy + "')",300);  
                return false;
            } else if (wD > 0) {
                PM.resize_timer = setTimeout("PM.Map.zoompoint(-2,'" + imgxy + "')",300);  
                return false;
            }
        }
    },
    
    /**
     * Disable right mouse context menu
     */
    disableContextMenu: function(e) {
        e = (e)?e:((event)?event:null);
        return false;
    },
    
    //
    // Resize map image while zooming with slider
    // called from sliderMove() in slider.js
    //
    /**
     * resize MAP
     */
    resizeMap: function(sizeFactor) {
        //alert(sizeFactor);
        var theMapImg = PM.ZoomBox.theMapImg;
        var theMapImgLay = PM.ZoomBox.theMapImgLay;
        var oldW = PM.mapW;
        var oldH = PM.mapH;
        var newW = oldW * sizeFactor;
        var newH = oldH * sizeFactor;
        
        var newLeft = (oldW - newW) / 2;
        var newTop  = (oldH - newH) / 2;
        
        theMapImg.width(newW+"px").height(newH+"px");
        theMapImgLay.left(newLeft+"px").top(newTop+"px");
        
        if (sizeFactor > 1) {
            var diffW = parseInt((newW - oldW) / 2);
            var diffH = parseInt((newH - oldH) / 2);
            clipT = diffH;
            clipR = diffW + oldW;
            clipB = diffH + oldH;
            clipL = diffW;

            var clipRect = 'rect(' + clipT + 'px ' 
                                   + clipR + 'px '
                                   + clipB + 'px ' 
                                   + clipL + 'px)'; 
            //window.status = clipRect;
            theMapImgLay.css('clip', clipRect).width(newW+"px").height(newH+"px");
        } 
    },

    /**
     * resize REFBOX
     */
    resizeRefBox: function(sizeFactor) {         
        var rBox = PM.ZoomBox.rBox ? PM.ZoomBox.rBox : $("#refbox");
        var sBox = PM.ZoomBox.sBox ? PM.ZoomBox.sBox : $("#refsliderbox");
        
        sBox.showv();
        //if (rBox.ileft() > 0) {
            var refBoxBorderW = 1; //refZoomBox.css('border-width');  // adapt to border width in CSS

            var oldRefW    = rBox.iwidth();
            var oldRefH    = rBox.iheight();
            var oldRefLeft = rBox.ileft();
            var oldRefTop  = rBox.itop();
            
            var newRefW = Math.round(oldRefW / sizeFactor);
            var newRefH = Math.round(oldRefH / sizeFactor);
            
            var newRefLeft = parseInt(oldRefLeft + ((oldRefW - newRefW) / 2) + refBoxBorderW);
            var newRefTop  = parseInt(oldRefTop + ((oldRefH - newRefH) / 2) + refBoxBorderW);
            
            sBox.left(newRefLeft+"px")
                .top(newRefTop+"px")
                .width(newRefW+"px")
                .height(newRefH+"px");
                
            window.status = newRefLeft + ',' + newRefTop + ',' + newRefW  + ',' + newRefH ;
        //}
    },
    
    // 
    // Functions for coodinates diplay 
    //
    /**
     * Get map coordinates for mouse move
     */
    getGeoCoords: function(mouseX, mouseY) {
        // if mouseX or mouseY are strings --> convert to integer
        mouseX = parseInt(mouseX);
        mouseY = parseInt(mouseY);
        var x_geo = PM.minx_geo + (((mouseX + 1)/PM.mapW) * PM.xdelta_geo);
        var y_geo = PM.maxy_geo - (((mouseY + 1)/PM.mapH) * PM.ydelta_geo);

        // Get mouse position in MAP coordinates 
        var mpoint = new Object();
        mpoint.x = x_geo;
        mpoint.y = y_geo;
        
        return  mpoint;
    },


    /**
     * Display map coordinates for mouse move
     */
    displayCoordinates: function() {
        var mpoint = this.getGeoCoords(this.moveX, this.moveY);
        
        // reproject coords if defined
        if (this.coordsDisplayReproject) {
            mpoint = this.transformCoordinates(this.coordsDisplaySrcPrj, this.coordsDisplayDstPrj, mpoint);
        } 
        
        // Round values (function 'roundN()' in 'measure.js')
        var px = isNaN(mpoint.x) ? '' : mpoint.x.roundTo(this.coordsDisplayRfactor);
        var py = isNaN(mpoint.y) ? '' : mpoint.y.roundTo(this.coordsDisplayRfactor);
        
        // Display in DIV  
        PM.ZoomBox.xCoordCont.html('X: ' + px + this.coordsDisplayUnits);
        PM.ZoomBox.yCoordCont.html('Y: ' + py + this.coordsDisplayUnits);
    },
    
    
    /**
     * transform map coordinates from src projection to destination projection
     */
    transformCoordinates: function(srcPrjStr, dstPrjStr, pnt) {
        var p4pnt = new Proj4js.Point(pnt.x, pnt.y);
        var srcPrj = new Proj4js.Proj(srcPrjStr);
        var dstPrj   = new Proj4js.Proj(dstPrjStr);
    
        return Proj4js.transform(srcPrj, dstPrj, p4pnt);
    }
    
    


});
