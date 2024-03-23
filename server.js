const legoData = require("./modules/legoSets");
const express = require('express');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Function to fetch random quote
async function getRandomQuote() {
  try {
    const fetch = await import('node-fetch').then(module => module.default);
    const response = await fetch('https://api.quotable.io/random');
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error fetching quote:', error);
    return 'An error occurred while fetching the quote.';
  }
}

// Routes
app.get('/', async (req, res) => {
  try {
    const quote = await getRandomQuote();
    res.render('home', { quote });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).send('An error occurred while fetching the quote.');
  }
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/quote', async (req, res) => {
  try {
    const quote = await getRandomQuote();
    res.render('quote', { quote });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).send('An error occurred while fetching the quote.');
  }
});

app.get("/lego/sets", async (req, res) => {
  try {
    let sets;
    if (req.query.theme) {
      sets = await legoData.getSetsByTheme(req.query.theme);
    } else {
      sets = await legoData.getAllSets();
    }
    res.render('sets', { sets, page: '/lego/sets' });
  } catch (err) {
    res.status(500).send('Internal server error');
  }
});

app.get("/lego/sets/:num", async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.num);
    if (set) {
      res.render('legoSetDetail', { set, page: '/lego/sets' });
    } else {
      res.status(404).render('404', { message: 'LEGO set not found' });
    }
  } catch (err) {
    res.status(500).send('Internal server error');
  }
});

app.use((req, res, next) => {
  res.status(404).render('404');
});

// Initialize lego data and start server
legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log(`Server listening on: http://localhost:${HTTP_PORT}`);
  });
});
