/**
 *
 * @param {string} text - the text to parse
 * @returns {Array} - urls array
 */
function parseURL(text) {
	const urls = [...text?.matchAll(/URL\((?<text>[^|]{1,})\|(?<link>[^|)]{1,})\)/g)].map((match) => {
		return { ...match.groups, full: match[0], startIndex: match.index, endIndex: match.index + match[0].length };
	});
	return urls;
}

/**
 *
 * @param {string} text - link text
 * @param {string} link - link url
 * @returns {string} -  formatted url string
 */
function createURL(text, link) {
	return `URL(${text}|${link})`;
}

module.exports = { parseURL, createURL };
