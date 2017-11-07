
const Card = (function()
{
	const WIDTH = 400;
	const HEIGHT = 400;

	const STEP_COLOR = 10;
	const STEP_STAMP = 20;
	const STEP_GLUE = 30;
	const STEP_SPARK = 40;
	const STEP_DRAW = 50;

	const HEART_WIDTH = 250;
	const HEART_HEIGHT = 250;

	const PAINT_STEP = 10;

	const STAMP_LIMIT = 25;
	const GLUE_LIMIT = 30;
	const SPARK_LIMIT = 70;

	//

	let _canvas = null;
	let _context = null;

	let _step = 0;

	let _mouse_down = false;

	let _crayon = null;
	let _stamps = [];
	let _stamp_count = 0;
	let _glue = null;
	let _glue_count = 0;
	let _spark = null;
	let _spark_count = 0;
	let _text = null;

	let _offset = { x: 0, y: 0 };

	//

	const _Initialize = function()
	{
		_canvas = document.getElementById('card');

		_canvas.width = WIDTH;
		_canvas.height = HEIGHT;

		_canvas.addEventListener('mousedown', _OnMouseDown);
		document.addEventListener('mouseup', _OnMouseUp);
		_canvas.addEventListener('mousemove', _OnMouseMove);

		_context = _canvas.getContext('2d');

		_crayon = new Image();
		_crayon.src = 'Crayon.png';

		_stamps.push(new Image());
		_stamps[0].src = 'Bear.png';

		_stamps.push(new Image());
		_stamps[1].src = 'Berry.png';

		_stamps.push(new Image());
		_stamps[2].src = 'Cookie.png';

		_stamps.push(new Image());
		_stamps[3].src = 'Flower.png';

		_glue = new Image();
		_glue.src = 'Glue.png';

		_spark = new Image();
		_spark.src = 'Spark.png';

		_text = new Image();
		_text.src = 'Text.png';

		window.addEventListener('resize', _OnResize);
		_OnResize();

		_StepColor();
	};

	//

	const _OnMouseDown = function(e)
	{
		_mouse_down = true;

		switch(_step)
		{
			case STEP_STAMP: _RandomStamp(e); break;
			case STEP_GLUE: _PlaceGlue(e); break;
			case STEP_SPARK: _PlaceSpark(e); break;
		}
	};

	//

	const _OnMouseUp = function(e)
	{
		_mouse_down = false;

		if(_step == STEP_COLOR)
		{
			if(_IsCanvasPainted())
			{
				_StepStamp();
			}
		}
	};

	//

	const _OnMouseMove = function(e)
	{
		if(_step != STEP_COLOR) return;
		if(!_mouse_down) return;

		_context.drawImage(
			_crayon,
			e.clientX - _offset.x - 21,
			e.clientY - _offset.y - 21
		);
	};

	//

	const _OnResize = function()
	{
		const box = _canvas.getBoundingClientRect();

		_offset.x = box.left;
		_offset.y = box.top;
	};

	//

	const _StepColor = function()
	{
		_step = STEP_COLOR;

		_ToolHelp('Peindre toute la feuille.');
		_ToolStatus('Il y a assez de peinture pour tout remplir !');
	};

	//

	const _StepStamp = function()
	{
		_step = STEP_STAMP;

		document.getElementById('step-1').classList.add('done');

		_ToolHelp('Appliquer les tampons sur la feuille.');
		_ToolStatus('Il me reste ' + STAMP_LIMIT + ' tampon(s) !');
	};

	//

	const _StepGlue = function()
	{
		_step = STEP_GLUE;

		document.getElementById('step-2').classList.add('done');

		_ToolHelp('Remplir le coeur avec la colle.');
		_ToolStatus('Il me reste ' + GLUE_LIMIT + ' mL de colle !');

		_CreateMask();
	};

	//

	const _StepSpark = function()
	{
		_step = STEP_SPARK;

		document.getElementById('step-3').classList.add('done');

		_ToolHelp('Mettre les paillettes par dessus la colle.');
		_ToolStatus('Il me reste ' + SPARK_LIMIT + ' pincée(s) de paillettes !');
	};

	//

	const _StepDraw = function()
	{
		_step = STEP_DRAW;

		document.getElementById('step-4').classList.add('done');

		_ToolHelp('Amor de mi vida.');
		_ToolStatus('Felices 5 meses juntos, j\'espère que cette petite chose te fera plaisir :-)');

		_context.restore();
		_context.drawImage(_text, 0, 0);
	};

	//

	const _PlaceGlue = function(e)
	{
		_context.drawImage(
			_glue,
			e.clientX - _offset.x - 21,
			e.clientY - _offset.y - 21
		);

		_glue_count++;

		_ToolStatus('Il me reste ' + (GLUE_LIMIT - _glue_count) + ' mL de colle !');

		if(_glue_count >= GLUE_LIMIT) _StepSpark();
	};

	//

	const _PlaceSpark = function(e)
	{
		_context.drawImage(
			_spark,
			e.clientX - _offset.x - 21,
			e.clientY - _offset.y - 21
		);

		_spark_count++;

		_ToolStatus('Il me reste ' + (SPARK_LIMIT - _spark_count) + ' pincée(s) de paillettes !');

		if(_spark_count >= SPARK_LIMIT) _StepDraw();
	};

	//

	const _RandomStamp = function(e)
	{
		const x = e.clientX - _offset.x;
		const y = e.clientY - _offset.y;
		const r = _Radians(_RandomInt(0, 360));

		_context.translate(x, y);
		_context.rotate(r);

		_context.drawImage(_stamps[_RandomInt(0, _stamps.length)], -21, -21);

		_context.rotate(-r);
		_context.translate(-x, -y);

		_stamp_count++;

		_ToolStatus('Il me reste ' + (STAMP_LIMIT - _stamp_count) + ' tampon(s) !');

		if(_stamp_count >= STAMP_LIMIT) _StepGlue();
	};

	//

	const _RandomInt = function(min, max)
	{
		return (Math.floor(Math.random() * (max - min)) + min);
	};

	//

	const _Radians = function(deg)
	{
		return ((Math.PI / 180) * deg);
	};

	//

	const _CreateMask = function()
	{
		const x = (WIDTH - HEART_WIDTH) * 0.5;
		const y = (HEIGHT - HEART_HEIGHT) * 0.5;

		_context.save();

		_context.strokeStyle = 'rgba(10, 10, 10, 0.2)';

		_context.translate(x, y);
		_context.beginPath();

		_context.moveTo(HEART_WIDTH * 0.5, HEART_HEIGHT * 0.2);

		_context.bezierCurveTo(
			5 * HEART_WIDTH / 14, 0,
			0, HEART_HEIGHT / 15,
			HEART_WIDTH / 28, 2 * HEART_HEIGHT / 5
		);

		_context.bezierCurveTo(
			HEART_WIDTH / 14, 2 * HEART_HEIGHT / 3,
			3 * HEART_WIDTH / 7, 5 * HEART_HEIGHT / 6,
			HEART_WIDTH / 2, HEART_HEIGHT
		);

		_context.bezierCurveTo(
			4 * HEART_WIDTH / 7, 5 * HEART_HEIGHT / 6,
			13 * HEART_WIDTH / 14, 2 * HEART_HEIGHT / 3,
			27 * HEART_WIDTH / 28, 2 * HEART_HEIGHT / 5
		);

		_context.bezierCurveTo(
			HEART_WIDTH, HEART_HEIGHT / 15,
			9 * HEART_WIDTH / 14, 0,
			HEART_WIDTH / 2, HEART_HEIGHT / 5
		);

		_context.stroke();
		_context.clip();
		
		_context.translate(-x, -y);
	};

	//

	const _IsCanvasPainted = function()
	{
		const data = _context.getImageData(0, 0, WIDTH, HEIGHT).data;

		const mx = WIDTH - PAINT_STEP;
		const my = HEIGHT - PAINT_STEP;

		for(let y = PAINT_STEP; y < my; y += PAINT_STEP)
		{
			for(let x = PAINT_STEP; x < mx; x += PAINT_STEP)
			{
				if(data[((y * WIDTH + x) * 4) + 3] == 0)
				{
					return false;
				}
			}
		}

		return true;
	};

	//

	const _ToolHelp = function(str)
	{
		document.getElementById('tool-help').innerText = str;
	};

	//

	const _ToolStatus = function(str)
	{
		document.getElementById('tool-status').innerText = str;
	};

	//

	return {
		Initialize: _Initialize
	};
})();

//

Card.Initialize();
