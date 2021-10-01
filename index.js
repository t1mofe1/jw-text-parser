const { get } = require('axios').default;

async function getText(language = 'en', year = new Date().getFullYear(), month = new Date().getMonth() + 1, day = new Date().getDate(), withoutReferences = false) {
	if (month > 12 || month < 1) {
		return new Error('Wrong month');
	} else if (day > new Date(year, month, 0).getDate()) {
		return new Error('Wrong day');
	}

	// GET CODE
	let code = await get(`https://wol.jw.org/${language}/wol/h/`);
	if (language !== code.request.path.substring(1, code.request.path.substring(1).search('/') + 1)) return new Error('Wrong language');
	code = code.request.path.substring(10);

	// GET HTML
	let html = await get(`https://wol.jw.org/wol/dt/${code}/${year}/${month}/${day}`);
	if (html && html.data && html.data.items && html.data.items[0] && html.data.items[0].content) {
		html = html.data.items[0].content;
	} else {
		return new Error("We're sorry, but there's no text for that day... Try different year or language");
	}

	// DATE
	let date = html
		.substring(html.search('<h2 id=\\"p'), html.search('</h2>'))
		.substring(html.substring(html.search('<h2 id=\\"p'), html.search('</h2>')).search('>') + 1)
		.replace(/\<span id\=\"page[0-9][0-9]?\" class\=\"pageNum\" data\-no\=\"[0-9][0-9]?\" data\-before\-text\=\"[0-9][0-9]?\"\>\<\/span\>/gi, '');

	// HEADER
	let header = `${html.substring(html.search('<em>') + 4, html.search('</em>') - 2)} (${html.substring(html.search('class="b"><em>') + 14, html.search('</em></a>'))})`;
	if (withoutReferences) {
		header = header.replace(/ \([\s\S]{1,}\)/gi, '');
	}

	// TEXT
	let text = html.substring(html.search('class="sb">') + 11, html.search(' <a href="/wol'));
	text = text.replace(
		/<a href="\/wol\/bc\/r[1-9][0-9]?[0-9]?\/lp-[a-z][a-z]?\/[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]\/[1-9][0-9]?[0-9]?\/[0-9][0-9]?[0-9]?" data-bid="[1-9][0-9]?[0-9]?-[1-9][0-9]?[0-9]?" class="[a-z]">/gi,
		'',
	);
	text = text.replace(/<\/a>/gi, '');
	text = text.replace(/<span id="page[1-9][0-9]?[0-9]?[0-9]?" class="pageNum" data-no="[1-9][0-9]?[0-9]?[0-9]?" data-before-text="[1-9][0-9]?[0-9]?[0-9]?"><\/span>/gi, '');
	if (withoutReferences) {
		text = text.replace(/\([\s\S]{1,}\) /gi, '');
	}
	return { date, header, text };
}

module.exports = getText;
