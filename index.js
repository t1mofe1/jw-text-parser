const axios = require('axios').default;

async function getText(language = 'en', year = new Date().getFullYear().toString(), month = (new Date().getMonth() + 1).toString(), day = new Date().getDate().toString()) {
	// GET CODE
	let code = await axios.get(`https://wol.jw.org/${language}/wol/h/`).then((res) => {
		return res.request.path.substring(10);
	});

	// GET HTML
	let html = await axios.get(`https://wol.jw.org/wol/dt/${code}/${year}/${month}/${day}`).then((res) => {
		return res.data.items[0].content;
	});

	// DATE
	let date = html.substring(html.search('<h2 id=\\"p'), html.search('</h2>')).substring(html.substring(html.search('<h2 id=\\"p'), html.search('</h2>')).search('>') + 1);

	// HEADER
	let header = `${html.substring(html.search('<em>') + 4, html.search('</em>') - 2)} (${html.substring(html.search('class="b"><em>') + 14, html.search('</em></a>'))}).`;

	// TEXT
	let text = html.substring(html.search('class="sb">') + 11, html.search(' <a href="/wol'));
	text = text.replaceAll(
		/<a href="\/wol\/bc\/r[1-9][0-9]?[0-9]?\/lp-[a-z][a-z]?\/11020200[0-9][0-9]\/[1-9][0-9]?[0-9]?\/[0-9][0-9]?[0-9]?" data-bid="[1-9][0-9]?[0-9]?-[1-9][0-9]?[0-9]?" class="[a-z]">/gi,
		'',
	);
	text = text.replaceAll('</a>', '');
	text = text.replaceAll(/<span id="page[1-9][0-9]?[0-9]?[0-9]?" class="pageNum" data-no="[1-9][0-9]?[0-9]?[0-9]?" data-before-text="[1-9][0-9]?[0-9]?[0-9]?"><\/span>/gi, '');

	return { date, header, text };
}

module.exports = getText;
