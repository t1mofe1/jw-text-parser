const express = require('express');
const app = express();

const getJWText = require('./index');

const { parseURL, createURL } = require('./urlFormatter');

app.use(require('helmet')());
app.use(express.json());
app.set('json spaces', 2);

app.get('/', (_, res) => res.redirect('/en'));

app.get('/:lang', async (req, res) => {
	const { lang } = req.params;
	const { y, m, d, references } = req.query;

	const JWText = await getJWText(lang, y, m, d, references).catch((err) => res.status(400).send(err.message));

	res.send({ ...JWText });
});

app.get('/url/create', (req, res) => {
	const { text, link } = req.query;

	const url = createURL(text, link);

	res.send({ url });
});

app.get('/url/parse', (req, res) => {
	const { text } = req.query;

	const urls = parseURL(text);

	res.send({ urls });
});

app.use((_, res) => {
	res.status(404).send({
		success: false,
		code: 'not_found',
	});
});

app.use((err, _, res) => {
	console.log(err);
	const obj = {
		success: false,
		code: 'server_error',
	};
	if (process.env.NODE_ENV !== 'production') obj.error = err;
	res.status(503).send(obj);
});

app.listen(process.env.PORT || 3000, () => console.log(`Server started!`));
