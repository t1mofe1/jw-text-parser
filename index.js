const axios = require('axios').default;

async function getJWText(language = 'en', year = new Date().getFullYear(), month = new Date().getMonth() + 1, day = new Date().getDate(), references = true) {
	if (!year || !month || !day) {
		const date = new Date();
		if (!year) year = date.getFullYear();
		if (!month) month = date.getMonth() + 1;
		if (!day) day = date.getDate();
	}

	if (month > 12 || month < 1 || day > new Date(year, month, 0).getDate()) {
		return Error('Wrong time');
	}

	const link = `https://wol.jw.org/${language}/wol/h/`;

	let code = await axios.get(link);
	if (language !== code.request.path.substring(1, code.request.path.substring(1).search('/') + 1)) return Error('Wrong language');
	code = code.request.path.substring(10);

	let html = await axios.get(`https://wol.jw.org/wol/dt/${code}/${year}/${month}/${day}`);
	if (html?.data?.items && html.data.items[0] && html.data.items[0].content) {
		html = html.data.items[0].content.replaceAll('\r\n', '').replaceAll('\\', '');
	} else {
		return Error('Text not found');
	}

	const $ = require('cheerio').load(html);

	let date = $('header')[0].children[0].children[0].data + ` ${year}`;

	let header = $('p')[0].children[0].children[0].data + $('p')[0].children[1].children[0].children[0].data + ')';

	let content = '';
	$('.bodyTxt')[0].children[0].children[0].children[0].children.forEach((child) => {
		if (child.data) {
			content += child.data;
		} else if (references) {
			if (!child.children[0].data) {
				content += `[${child.children[0].children[0].data}${child.children[1].data}](${new URL(child.attribs.href, 'https://wol.jw.org').toString()})`;
			} else {
				content += `[${child.children[0].data}](${new URL(child.attribs.href, 'https://wol.jw.org').toString()})`;
			}
		} else {
			content += child.children[0].data ? child.children[0].data : child.children[0].children[0].data + child.children[1].data;
		}
	});
	return { date, header, text: content, link };
}

module.exports = getJWText;
