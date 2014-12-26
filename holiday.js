$.getJSON("lib/holiday.json", function(data) {
	holiday = {};
	$.each(data, function(i, field){
      holiday[field['date']] = field['name'];
    });
});