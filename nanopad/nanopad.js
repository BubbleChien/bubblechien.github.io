
var LS = window.localStorage;

//

var G_Application = null;

//

var NanoPad = {};

//

NanoPad.Application = function()
{
	var _initialize = function()
	{
		$(document).resize(_onResize);
		_onResize();
		
		$('#btn-load').click(_loadNote);
		$('#btn-save').click(_saveNote);
	};
	
	//
	
	var _onResize = function()
	{
		$('#content').height($(document).innerHeight()-32);
	};
	
	//
	
	var _loadNote = function()
	{
		var name = $('#note-name').val();
		var data = LS.getItem(name);
		
		if(data!==null)
		{
			$('#note').val(data);
			$('#status').text('Note loaded.');
		}
		else
		{
			$('#status').text('Unknown note.');
		}
	};
	
	//
	
	var _saveNote = function()
	{
		var name = $('#note-name').val();
		
		if(name==='') return;
		
		LS.setItem(name,$('#note').val());
		$('#status').text('Note saved.');
	};
	
	//
	
	return {
		
		Initialize: _initialize
		
	};
};

//

$(document).ready(function()
{
	G_Application = new NanoPad.Application();
	G_Application.Initialize();
});
