
var G_NameGen = null;

//

var NameGen = function()
{
	let m_vowels = 'AAAEEEEIIIOOUUY';
	let m_consonants = 'BCDFGHJKLMNPQRSTVWXZ';

	let m_vmax = m_vowels.length-1;
	let m_cmax = m_consonants.length-1;

	let m_ninput = null;
	let m_sinput = null;
	let m_bot = null;

	//

	let f_generate = function()
	{
		let ncount = parseInt(m_ninput.value);
		let scount = parseInt(m_sinput.value);
		let name = '';
		let names = '';

		if(ncount<0) ncount = 0;
		if(scount<0) scount = 0;

		m_bot.textContent = '';

		for(let i=0;i<ncount;++i)
		{
			name = '';

			if(f_random(0,1)===0)
			{
				for(let j=0;j<scount;++j)
				{
					name += m_vowels[f_random(0,m_vmax)];
					name += m_consonants[f_random(0,m_cmax)];
				}
			}
			else
			{
				for(let j=0;j<scount;++j)
				{
					name += m_consonants[f_random(0,m_cmax)];
					name += m_vowels[f_random(0,m_vmax)];
				}
			}

			names += name+' ';
		}

		m_bot.textContent = names;
	};

	//

	let f_random = function(min,max)
	{
		return (Math.floor(Math.random()*(max-min+1))+min);
	};

	//

	{
		m_ninput = document.getElementById('names_count');
		m_sinput = document.getElementById('syllables_count');
		m_bot = document.getElementById('bot');
	}

	//

	return {
		Generate: f_generate
	};
};

//

G_NameGen = new NameGen();
