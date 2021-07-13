/* Utilities create by Tran Quoc Binh
for the application on research facility management (thietbikhoahoc)
(C) 2013 */


/* Format a money field, to add digit groupping symbol (as ',') */
function format(input)
{
    var nStr = input.value + ''; 
    nStr = nStr.replace( /\,/g, "");
    var x = nStr.split( '.' );
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while ( rgx.test(x1) ) {
        x1 = x1.replace( rgx, '$1' + "," + '$2' );
    }
    input.value = x1 + x2;
}

/* Export data table to Excel spreadsheet, does not work with Internet Explorer */
var tableToExcel = (function() {
  var uri = 'data:application/vnd.ms-excel;base64,'
    , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
    , base64x = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
    , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
  return function(table, name) {
    if (!table.nodeType) table = document.getElementById(table)
    var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
    window.location.href = uri + base64x(format(template, ctx))
  }
});

/* function to check if the user enter a valid character in a numeric field. 
 * Use with onKeyPress event, e.g.: <input type="text" onkeypress="checkNumberOnKeyPress(event)"/>  */
var checkNumberOnKeyPress = (function(event) {
    var code = (event.keyCode ? event.keyCode : event.which);
    if (!(code >= 44 && code <= 57) && (event.keyCode == 0)) //numbers and (.,-/): 44-57, function key: keyCode !=0
   {
        event.preventDefault();  
		alert('Lỗi: bạn chỉ có thể nhập số 1..9 và các ký tự .,- vào ô này');
	}
});