import lunr from 'lunr';
import React from 'react';
import {
  Alert,
  Button,
  Card, Col, Container, Dropdown,
  DropdownButton, InputGroup, Modal, Nav, Navbar, Row
} from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import cards from './cards.js';


function FABCard(props) {
  const { card, watermarkOptions, defaultWatermark, addCardToPrint, removeCardToPrint } = props
  const [watermark, setWatermark] = React.useState(defaultWatermark);
  const imgUrl = "https://cdn.thepitchzone.com/cards/" + card.id + "_200.png";
  return (
    <Card className="fab-card">
      <Card.Img src={imgUrl} />
      <div className="watermark">{watermark}</div>
      <Card.Body className="card-info no-print">
        <Card.Title>{card.n}</Card.Title>
        <Card.Text>
          {"(" + card.ed + ")"}
        </Card.Text>

      </Card.Body>
      <Card.Footer className="no-print">
        {addCardToPrint && (
          <Button variant="outline-primary" size="sm" onClick={() => addCardToPrint(card)}>Add</Button>
        )}
        {removeCardToPrint && (
          <Button variant="outline-danger" size="sm" onClick={() => removeCardToPrint(card)}>Remove</Button>
        )}
        {watermarkOptions && (
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm" id="dropdown-basic">
              Watermark
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {watermarkOptions.map((option) => (
                <Dropdown.Item key={option} as="button" onClick={() => { setWatermark(option) }}>{option}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
      </Card.Footer>
    </Card>
  );
}

function CardSearch(props) {
  const { cardIdx, cardMap, addCardToPrint, defaultWatermark, setDefaultWatermark, watermarkOptions } = props
  const [searchTerm, setSearchTerm] = React.useState("fyen");
  const handleChange = event => {
    setSearchTerm(event.target.value);
  };
  const updateWatermark = watermark => {
    setDefaultWatermark(watermark)
  }

  const queryString = "*" + searchTerm.trim().split(" ").join("* *") + "*";
  const results = searchTerm === "" ? [] : cardIdx.search(queryString).slice(0, 20).map((res) =>
    <FABCard
      key={cardMap[res.ref].id + defaultWatermark}
      card={cardMap[res.ref]}
      addCardToPrint={addCardToPrint}
      defaultWatermark={defaultWatermark}
    />
  );
  return (
    <div className="card-search">
      <div className="card-search-header">
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>Search For Cards:</InputGroup.Text>
          </InputGroup.Prepend>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleChange}
          />
          <InputGroup.Prepend>
            <InputGroup.Text>Watermark</InputGroup.Text>
          </InputGroup.Prepend>
          <DropdownButton
            as={InputGroup.Append}
            variant="outline-secondary"
            title={defaultWatermark}
            id="search-watermark-dropdown"
          >
            {watermarkOptions.map((option) => (
              <Dropdown.Item key={option} as="button" onClick={() => { updateWatermark(option) }}>{option}</Dropdown.Item>
            ))}
          </DropdownButton>
        </InputGroup>
      </div>
      <div className="card-results">
        {results}
      </div>
    </div>
  );
}

function App() {
  const cardIdx = lunr(function () {
    // NOTE: we turn of stemming so things work as we would expect, without this if we search for
    //       "twinn", "twinning blade" will not show up due to it presumably be stemmed as "twin".
    this.pipeline.remove(lunr.stemmer)
    this.pipeline.remove(lunr.stopWordFilter)
    this.searchPipeline.remove(lunr.stemmer)
    this.searchPipeline.remove(lunr.stopWordFilter)
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
  const watermarkOptions = ['Proxy', 'Missing', 'In Box']
  const [defaultWatermark, setDefaultWatermark] = React.useState(watermarkOptions[0])
  const [cardsToPrint, setCardsToPrint] = React.useState([])
  const addCardToPrint = card => {
    card = { ...card, uuid: uuidv4() }
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
    <FABCard key={card.uuid} card={card}
      watermarkOptions={watermarkOptions}
      defaultWatermark={defaultWatermark}
      addCardToPrint={addCardToPrint}
      removeCardToPrint={removeCardToPrint(i)} />
  );

  const [showSearchModal, setShowSearchModal] = React.useState(true);
  const [showHelpModal, setShowHelpModal] = React.useState(false);
  return (
    <Container className="App">
      <Navbar bg="dark" variant="dark" expand="sm" fixed="top" className="no-print">
        <Navbar.Brand>FAB Proxy</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link onClick={() => setShowSearchModal(true)}>Add New Cards</Nav.Link>
            <Nav.Link onClick={() => window.print()}>Print</Nav.Link>
            <Nav.Link onClick={() => setShowHelpModal(true)}>Help</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Modal
        show={showSearchModal}
        onHide={() => setShowSearchModal(false)}
        dialogClassName="search-modal"
        aria-labelledby="search-modal-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="search-modal-title">
            Search For Cards
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CardSearch
            cardIdx={cardIdx}
            cardMap={cardMap}
            addCardToPrint={addCardToPrint}
            defaultWatermark={defaultWatermark}
            setDefaultWatermark={setDefaultWatermark}
            watermarkOptions={watermarkOptions}
          />
        </Modal.Body>
      </Modal>
      <Modal
        show={showHelpModal}
        onHide={() => setShowHelpModal(false)}
        aria-labelledby="help-modal-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="help-modal-title">
            How to use FAB Proxy
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Usage</h3>
          <p>
            Creating a set of proxy cards to print only takes a few steps:
          </p>
          <ol>
            <li>Click "Add New Cards"</li>
            <li>Start entering card names in the search field</li>
            <li>Click "Add" on the cards you wish to print</li>
            <li>Exit the "Add New Cards" modal and make any last changes to your watermarks</li>
            <li>Print using your browsers print fuctionality (landscape works best)</li>
            <li>Cut out proxy cards</li>
            <li>Put proxies on top of other sleeved cards or as filler for missing cards in your binder</li>
          </ol>
          <Alert variant="warning">
            Please make sure to turn on 'print background colors/images/grapics' for better watermark printing.
            Different browsers give it slightly different names.
          </Alert>
          <h3>Feedback</h3>
          <p>
            If you have any feedback, please create a <a href="https://github.com/cgilling/fab-proxy/issues">github issue</a>,
            and I will try to respond within a reasonable time.
          </p>
        </Modal.Body>
      </Modal>
      <Row className="main">
        <Col>
          <Alert variant="warning" className="no-print">
            For <strong>US Letter</strong> printing in <strong>Landscape</strong> is recommended (8 cards per page).
            <br />For <strong>A4</strong> printing in <strong>Portrait</strong> with reduced margins is recommended (9 cards per page).
          </Alert>
          <div className="card-list">
            {cardElems}
          </div>
          {cardElems.length === 0 && (
            <Button onClick={() => setShowSearchModal(true)}>Add New Cards</Button>
          )}
        </Col>
      </Row>
      <Navbar bg="light" variant="light" className="no-print">
        <Navbar.Text>A special thanks to <a href="https://thepitchzone.com">The Pitch Zone</a> for card lists and images.</Navbar.Text>
      </Navbar>
    </Container>

  );
}

export default App;
