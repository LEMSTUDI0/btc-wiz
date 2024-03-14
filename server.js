// server.js
const express = require('express');
const cors = require('cors'); // Import cors module
const cheerio = require('cheerio');


const httpPort = 3000;

const app = express();
app.use(cors());

const rainbowUrl = 'https://www.blockchaincenter.net/en/bitcoin-rainbow-chart/';


app.get('/data', async (req, res) => {

    try {
        const response = await fetch(rainbowUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch HTML');
        }
        const htmlString = await response.text();
        const $ = cheerio.load(htmlString);

        const elements = $('.legend.mt-2').children();

        elements.each((index, element) => {
            // get element which has class active
            if ($(element).hasClass('active')) {
                rainbowStatus = index;
            }
        });
        res.json({ rainbowStatus });

    } catch (error) {
        console.error('Error fetching HTML:', error);
        return null;
    }

});

app.listen(httpPort, () => {
    console.log(`Server is running at http://localhost:${httpPort}`);
});
