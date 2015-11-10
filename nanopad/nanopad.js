
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
		if(!LS.getItem('test'))
		{
			LS.setItem('test','jjj');
		}
		else
		{
			$('#content').text('KEY EXISTS');
		}
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
