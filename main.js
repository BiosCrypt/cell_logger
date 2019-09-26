define([
    'base/js/namespace',
    'base/js/events'
    ], function(Jupyter, events) {

		function download(data, filename, type) {
			var file = new Blob([data], {type: type});
			if (window.navigator.msSaveOrOpenBlob) // IE10+
				window.navigator.msSaveOrOpenBlob(file, filename);
			else { // Others
				var a = document.createElement("a"),
						url = URL.createObjectURL(file);
				a.href = url;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				setTimeout(function() {
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);  
				}, 0); 
			}
		}

		var code_cells_rendered_unselected = document.getElementsByClassName("cell code_cell rendered unselected");
		var code_cells_rendered_selected = document.getElementsByClassName("cell code_cell rendered selected");
		var code_cells_unrendered_unselected = document.getElementsByClassName("cell code_cell unrendered unselected");
		var code_cells_unrendered_selected = document.getElementsByClassName("cell code_cell unrendered selected");

		var text_cells_unrendered_unselected = document.getElementsByClassName("cell text_cell unrendered unselected");
		var text_cells_unrendered_selected = document.getElementsByClassName("cell text_cell unrendered selected");
		var text_cells_rendered_unselected = document.getElementsByClassName("cell text_cell rendered unselected");
		var text_cells_rendered_selected = document.getElementsByClassName("cell text_cell rendered selected");

		var data = "time\tid\ttype\tselected\trendered\tx\ty\twidth\theight\r\n";

		var id_counter = 1

		function track_cells() {
			data = data.concat(cells_to_string(code_cells_rendered_unselected, 'c', '0', '1'));
			data = data.concat(cells_to_string(code_cells_rendered_selected, 'c', '1', '1'));
			data = data.concat(cells_to_string(code_cells_unrendered_unselected, 'c', '0', '0'));
			data = data.concat(cells_to_string(code_cells_unrendered_selected, 'c', '1', '0'));
			
			data = data.concat(cells_to_string(text_cells_rendered_unselected, 't', '0', '1'));
			data = data.concat(cells_to_string(text_cells_rendered_selected, 't', '1', '1'));
			data = data.concat(cells_to_string(text_cells_unrendered_unselected, 't', '0', '0'));
			data = data.concat(cells_to_string(text_cells_unrendered_selected, 't', '1', '0'));
		}

		function cells_to_string(cells, type, selected, rendered) {
			if(cells.length==0) {
				return "";
			}
			var s = "";
			for (var index = 0; index < cells.length; ++index) {
				var cell = cells[index];
				var inner_cell = cell.getElementsByClassName("inner_cell")[0];
				
				if(!cell.id) {
					while(document.getElementById(id_counter)) {
						id_counter = id_counter + 1;
					}
					cell.id = id_counter;
					//id_counter = id_counter + 1;
				}
				var rect = inner_cell.getBoundingClientRect();
				s = s.concat(Date.now(), '\t', cell.id, '\t', type, '\t', selected, '\t', rendered, '\t', rect.left, '\t', rect.top, '\t', rect.width, '\t', rect.height, '\r\n');
			}
			return s;
		}

		var t;

        var start = function() {
			t = setInterval(track_cells, 1000); 
		};
		
		var stop = function() {
			clearInterval(t); 
			download(data, 'log_' + Date.now() + '.csv', 'text/plain');
		};

	var start_button = function () {
		Jupyter.toolbar.add_buttons_group([
			Jupyter.keyboard_manager.actions.register ({
				'help': 'Start logging',
				'icon' : 'fa-eye',
				'handler': start
			}, 'start-logging', 'Start logging')
		])
	};
	
	var stop_button = function () {
		Jupyter.toolbar.add_buttons_group([
			Jupyter.keyboard_manager.actions.register ({
				'help': 'Stop logging',
				'icon' : 'fa-eye-slash',
				'handler': stop
			}, 'stop-logging', 'Stop logging')
		])
	};
    // Run on start
    function load_ipython_extension() {
        start_button();
		stop_button();
    }
    return {
        load_ipython_extension: load_ipython_extension
    };
});