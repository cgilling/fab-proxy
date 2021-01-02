import React from 'react'
import lunr from 'lunr';
import './App.css';
import cards from './cards.js'


function Card(props) {
  const { card, watermarkOptions, defaultWatermark, addCardToPrint, removeCardToPrint } = props
  const [watermark, setWatermark] = React.useState(defaultWatermark);
  const imgUrl = "https://images.thepitchzone.com/cards/" + card.id + ".png";
  return (
    <div className="card">
      <img src={imgUrl} />
      <div className="watermark">{watermark}</div>
      <div className="card-info">
        <div>{card.n}</div>
        <div>{"(" + card.ed + ")"}</div>
        {addCardToPrint && (
          <button onClick={() => addCardToPrint(card)}>Add</button>
        )}
        {removeCardToPrint && (
          <button onClick={() => removeCardToPrint(card)}>Remove</button>
        )}
      </div>
    </div>
  );
}

function SearchResult(props) {
  const { cardMap, result, addCardToPrint } = props
  const card = cardMap[result.ref]
  const defaultWatermark = 'Proxy'
  const watermarkOptions = ['Proxy', 'Missing', 'In Box']
  return (
    <li key={card.id} className="card-result">
      <Card card={card} watermarkOptions={watermarkOptions} defaultWatermark={defaultWatermark} addCardToPrint={addCardToPrint} />
    </li>
  );
}

function CardSearch(props) {
  const { cardIdx, cardMap, addCardToPrint } = props
  const [searchTerm, setSearchTerm] = React.useState("fyen");
  const handleChange = event => {
    setSearchTerm(event.target.value);
  };

  const queryString = "*" + searchTerm.trim().split(" ").join("* *") + "*";
  const results = searchTerm === "" ? [] : cardIdx.search(queryString).slice(0, 20).map((res) =>
    <SearchResult key={cardMap[res.ref].id} cardMap={cardMap} result={res} addCardToPrint={addCardToPrint} />
  );
  return (
    <div className="card-search">
      <label>Search For Cards: </label>
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleChange}
      />
      <ul className="card-results">
        {results}
      </ul>
    </div>
  );
}

function App() {
  const cardIdx = lunr(function () {
    // NOTE: we turn of stemming so things work as we would expect, without this if we search for
    //       "twinn", "twinning blade" will not show up due to it presumably be stemmed as "twin".
    this.pipeline.remove(lunr.stemmer)
    this.searchPipeline.remove(lunr.stemmer)
    this.ref('id')
    this.field('n')
    this.field('ed')

    cards.forEach(function (card) {
      this.add(card)
    }, this)
  })
  var cardMap = cards.reduce((obj, item) => {
    return {
      ...obj,
      [item['id']]: item,
    };
  }, {});
  var _ = require('lodash');
  const [cardsToPrint, setCardsToPrint] = React.useState([cards[0]])
  const addCardToPrint = card => {
    setCardsToPrint(_.sortBy([...cardsToPrint, card], [card => card.n]))
  };
  const removeCardToPrint = index => {
    return card => {
      var cardsCopy = [...cardsToPrint];
      cardsCopy.splice(index, 1);
      setCardsToPrint(cardsCopy);
    }
  };

  // TODO: I'm afraid once we allow changing watermark the key stuff might break it since the state for that
  //       is currently stored in Card (I speak from a lot of ignorance).
  const cardElems = cardsToPrint.map((card, i) =>
    <li key={card.id + '-' + i}>
      <Card card={card}
        watermarkOptions={['Proxy', 'Missing', 'In Box']}
        defaultWatermark={'Proxy'}
        addCardToPrint={addCardToPrint}
        removeCardToPrint={removeCardToPrint(i)} />
    </li>
  );
  return (
    <div className="App">
      <header className="App-header">
        <CardSearch cardIdx={cardIdx} cardMap={cardMap} addCardToPrint={addCardToPrint} />
      </header>
      <div>
        <h1 className="title">Cards To Print</h1>
        <ul className="card-list">
          {cardElems}
        </ul>
      </div>
    </div>

  );
}

export default App;
