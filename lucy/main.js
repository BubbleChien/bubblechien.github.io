
BCard = {};

//

BCard.width = 0;
BCard.height = 0;
BCard.current = 0;
BCard.limit = 0;

//

BCard.ScrollTo = function(offset)
{
	$('html, body').animate({
		scrollTop: offset
	}, 500);
};

//

BCard.ScrollNext = function()
{
	if(BCard.current >= BCard.limit) return;

	BCard.current++;

	BCard.ScrollTo(BCard.current * BCard.height);
};

//

BCard.ScrollPrevious = function()
{
	if(BCard.current <= 0) return;

	BCard.current--;

	BCard.ScrollTo(BCard.current * BCard.height);
};

//

BCard.OnResize = function()
{
	BCard.width = $(window).width();
	BCard.height = $(window).height();

	$('.centered').each(function()
	{
		let el = $(this);

		el.css('left', ((BCard.width * 0.5) - (el.width() * 0.5)) + 'px');
		el.css('top', ((BCard.height * 0.4) - (el.height() * 0.5)) + 'px');
	});

	BCard.ScrollTo(BCard.current * BCard.height);
};

//

$(document).ready(function()
{
	BCard.limit = $('.screen').length - 1;

	BCard.OnResize();

	BCard.ScrollTo(0);

	$(document).keydown(function(e)
	{
		switch(e.keyCode)
		{
			case 38: BCard.ScrollPrevious(); break;
			case 40: BCard.ScrollNext(); break;
		}
	});
	
	$(document).click(BCard.ScrollNext);

	$(window).resize(BCard.OnResize);
});
