const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch'); // If you're using Node.js

async function getHTMLFromURL(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch HTML');
        }
        const htmlString = await response.text();
        return htmlString;
    } catch (error) {
        console.error('Error fetching HTML:', error);
        return null;
    }
}


// Example usage
const url = 'https://www.blockchaincenter.net/en/bitcoin-rainbow-chart/';
getHTMLFromURL(url)
    .then(html => {
        // Load HTML content using Cheerio
        const $ = cheerio.load(html);

        // Select all <script> tags
        const elements = $('.legend.mt-2').children();

        // Extract JavaScript code from <script> tags
        elements.each((index, element) => {
            // get element which has class active
            if ($(element).hasClass('active')) {
                console.log(index);
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });

