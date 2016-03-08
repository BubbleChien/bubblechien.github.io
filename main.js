
document.createElement('main');

//

var Chien = {};

//

Chien.FADE_DURATION = 300;

//

Chien.LOOKUP_TABLE = {
	'ç': 'j',
	'è': 'e',
	';': 'r',
	'ù': 'm',
	'^': 'y',
	'$': '.',
	'?': 'v',
	'%': 'a',
	'!': 's',
	'=': 'u',
	'*': 'w',
	'+': 'k',
	'/': '@',
	'(': 'g',
	'_': 'i',
	'à': 'l',
	'-': 'c',
	'#': 'o'
};

//

Chien.PAGE_ABOUT = 0;
Chien.PAGE_PROJECTS = 1;
Chien.PAGE_MUSIC = 2;

//

Chien.pages = [];

Chien.pages[Chien.PAGE_ABOUT] = {
	url: './pages/about.html',
	back: './images/blue.png'
};

Chien.pages[Chien.PAGE_PROJECTS] = {
	url: './pages/projects.html',
	back: './images/green.png'
};

Chien.pages[Chien.PAGE_MUSIC] = {
	url: './pages/music.html',
	back: './images/orange.png'
};

//

Chien.nodes = {};

//

Chien.Initialize = function()
{
	Chien.nodes.content = $('#main-content');
	Chien.nodes.overlay = $('#overlay');
	
	$('#btn-about').click(function()
	{
		Chien.LoadPage(Chien.pages[Chien.PAGE_ABOUT]);
	});
	
	$('#btn-projects').click(function()
	{
		Chien.LoadPage(Chien.pages[Chien.PAGE_PROJECTS]);
	});
	
	$('#btn-music').click(function()
	{
		Chien.LoadPage(Chien.pages[Chien.PAGE_MUSIC]);
	});
	
	Chien.PreloadImages();
	
	Chien.LoadPage(Chien.pages[Chien.PAGE_ABOUT]);
};

//

Chien.LoadPage = function(page)
{
	Chien.nodes.overlay.fadeIn(Chien.FADE_DURATION,function()
	{
		$.get(page.url,function(data)
		{
			$('body').css('background-image','url(\''+page.back+'\')');
			Chien.nodes.content.html(data);
			Chien.ApplyLookup($('.toastie'));
			$('body').scrollTop(0);
			
			Chien.nodes.overlay.fadeOut(Chien.FADE_DURATION);
		});
	});
};

//

Chien.PreloadImages = function(callback)
{
	var img = new Image();
	
	for(var i=0;i<Chien.pages.length;i++)
	{
		img.src = Chien.pages[i].back;
	}
};

//

Chien.ApplyLookup = function(el)
{
	var str = '';
	var content = el.text().trim();
	
	for(var i=0;i<content.length;i++)
	{
		str += Chien.LOOKUP_TABLE[content[i]];
	}
	
	el.text(str);
};

//

$(document).ready(function()
{
	Chien.Initialize();
});
