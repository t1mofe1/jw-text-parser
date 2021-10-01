const { get: getRequest } = require('axios').default;
const { validate: validateLanguage } = require('iso-639-1');
const { createURL } = require('./urlFormatter');

/**
 *
 * @param {string} [language=en] - language
 * @param {number} [year=new Date().getFullYear()] - a year from 2017
 * @param {number} [month=new Date().getMonth() + 1] - a month 1 - 12
 * @param {number} [day=new Date().getDate()] - a day 1 - 28/30/31
 * @param {boolean} [references=false] - should urls be in text
 * @returns {object} - jw text with date, header, text and original link
 */
async function getJWText(language = 'en', year = new Date().getFullYear(), month = new Date().getMonth() + 1, day = new Date().getDate(), references = false) {
	if (!year || year < 2017) throw Error('Invalid year');
	if (!month || month > 12 || month < 1) throw Error('Invalid month');
	if (!day || day < 1 || day > new Date(year, month, 0).getDate()) throw Error('Invalid day');
	if (!validateLanguage(language)) throw new Error('Invalid language');

	const code = await getRequest(`https://wol.jw.org/${language}/wol/h/`).then(({ request }) => {
		if (language !== request.path.substring(1, request.path.substring(1).search('/') + 1)) throw Error('Wrong language');
		return request.path.substring(10);
	});

	const link = `https://wol.jw.org/${language}/wol/h/${code}/${year}/${month}/${day}`;
	const html = await getRequest(link)
		.then((res) => res.data)
		.catch(({ res }) => {
			if (res.status >= 500) throw Error('wol.jw.org server is not available');
			else if (res.status === 404) throw Error('Text not found');
			else throw Error('Unknown error occured');
		});

	let $ = require('cheerio').load(html);
	$ = $.load($(`#dailyText > .articlePositioner > .tabContent[data-date="${new Date(Date.UTC(year, month - 1, day)).toISOString()}"]`)[0]);

	const date = `${$($('header h2')[0]).text()} ${year}`;

	function getFullText(e) {
		let text = '';
		function allChildren(c) {
			c.children.forEach((child) => {
				if (child.children?.length > 0) {
					allChildren(child);
				} else {
					if (!child.data || (child.type === 'text' && child.data === '\n')) return;
					const href = child.parent.attribs.href || child.parent.parent.attribs.href;
					if (references && href) {
						text += createURL(child.data, new URL(href, 'https://wol.jw.org').toString());
					} else text += child.data;
				}
			});
		}
		allChildren(e);
		return text;
	}

	const header = getFullText($('p')[0]);

	const content = getFullText($('.bodyTxt')[0]);

	return { date, header, text: content, link };
}

module.exports = getJWText;
