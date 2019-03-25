const symbols = ['bicycle','car-side','fighter-jet','helicopter','snowplow','tractor','truck','truck-monster'];
/** Take the set of symbols, make pairs, and shuffle the order into the cards array. */
const cards = shuffle([...symbols,...symbols]);

const deck = document.querySelector('.deck');
const scorePanel = document.querySelector('.score__panel');
const highScore = document.querySelector('.highscore');
const highScoreContent = document.querySelector('.highscore__content');
const currentStars = document.querySelectorAll('.currentscore .stars .fa-star');
const winPanel = document.querySelector('.win__panel');
const winContent = document.querySelector('.win__content');
const newHighScore = document.querySelector('.newhighscore');
const restartButtons = document.querySelectorAll('.restart');

let openCards = [], matchedCards = [];
let moveCount = 0, elapsedTime = 0;
let gameStarted = false;
let timer;

let hiscoreMoves = localStorage.getItem('moveCount');
let hiscoreTime = localStorage.getItem('elapsedTime');

if (hiscoreMoves !== null) {
    highScore.classList.add('highscore-show');
    highScoreContent.innerHTML = `${hiscoreMoves} moves | ${formatSeconds(hiscoreTime)}`;
}

/** Shuffle function from http://stackoverflow.com/a/2450976 */
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

/**
 * @description Iterate through the array of cards, and for each card:
 *  -- create a <li> element with the 'card' class and appropriate FontAwesome icon
 *  -- add the card to the 'deck' element
 */
for (const card of cards) {
    const newCard = document.createElement('li');
    newCard.classList.add('card');
    newCard.innerHTML = `<i class="fas fa-${card}"></i>`;
    deck.appendChild(newCard);
}

/**
 * @description Listen for when the user clicks the card, but prevent the user from
 * clicking the deck, clicking an already open or matched card, clicking the symbol
 * icon on the card, or clicking a card when there is already 2 open cards. If those
 * conditions are met, then start the game if not already, which also starts the timer.
 */
deck.addEventListener('click', function (e) {
    let clickedCard = e.target;
    let openedCards = document.getElementsByClassName('card open');

    if (clickedCard !== deck &&
        !clickedCard.className.includes('open') &&
        !clickedCard.className.includes('match') &&
        !clickedCard.className.includes('fa-') &&
        openedCards.length < 2) {
        if(gameStarted == false) {
            gameStarted = true;
            startTimer();
        }
        flipCard(clickedCard);
        checkForMatch(clickedCard);
    }
});

/** Start the timer and output the formatted time string to html. */
function startTimer() {
    timer = setInterval(function() {
        document.querySelector('.currentscore .timer').innerHTML = formatSeconds(elapsedTime);
        elapsedTime++;
    },1000);
}

/**
 * @description Helper funtion to format seconds into HH:mm:ss format
 * @param {number} seconds
 * @returns {string} seconds in HH:mm:ss
 */
function formatSeconds(seconds) {
    return moment().startOf('day').seconds(seconds).format('HH:mm:ss');
}

/**
 * @description Toggles card classes to animate the flipping of cards
 * @param {element} card - the HTML element representing the card
 */
function flipCard(card) {
    card.classList.toggle('open');
    card.classList.toggle('show');
    card.classList.remove('incorrect');
}

/**
 * @description Checked the clicked card for a match with any open cards
 * that have not yet been matched. A 750ms delay is included if no match is found
 * to allow the user to see what cards were selected before they're flipped over.
 * Once the check is done, update the score and clear the stack of open cards.
 * @param {element} card - the HTML element representing the card
 */
function checkForMatch(card) {
    openCards.push(card);
    if (openCards.length > 1) {
        let check = setTimeout(function() {
            openCards[0].innerHTML == openCards[1].innerHTML ? foundMatch() : noMatch();
            updateScore();
            openCards = [];
            clearTimeout(check);
        },750);
    }
}

/**
 * Checked the clicked card for a match with any open cards that have
 * not yet been matched.
 */
function foundMatch() {
    for (const card of openCards){
        card.classList.remove('open','show');
        card.classList.add('match');
        matchedCards.push(card);
    }
}

/**
 * Called when no match is found, then temporarily show an incorrect
 * warning, flip the cards back over and await the next mouse click.
 */
function noMatch() {
    for (const card of openCards){
        card.classList.add('incorrect');
        let reset = setTimeout(function() {
           flipCard(card);
           clearTimeout(reset);
        },750);
    }
}

/**
 * Update both the move counter and the star rating once a turn is complete.
 * If all matches are found, end the game.
 */
function updateScore() {
    moveCount++;
    document.querySelector('.currentscore .moves').innerHTML = moveCount;

    if (moveCount > 12 && moveCount <=15) removeStar(currentStars[0]);
    else if (moveCount > 15 && moveCount <=18) removeStar(currentStars[1]);
    else if (moveCount > 18 && moveCount <=21) removeStar(currentStars[2]);
    else if (moveCount > 21 && moveCount <=24) removeStar(currentStars[3]);
    else if (moveCount == 25) removeStar(currentStars[4]);

    if (matchedCards.length == symbols.length * 2) { // found all pairs
        endOfGame();
    }
}

/**
 * @description Replace a filled in star with an outlined version
 * @param {element} star - the HTML element representing the star
 */
function removeStar(star) {
    star.classList.remove('fa-star');
    star.classList.add('fa-star-o');
}

/**
 * End of game is reached once all pairs have been found. Displays
 * a message to the user with the final move count, time taken and
 * star rating.
 */
function endOfGame() {
    clearInterval(timer);
    scorePanel.classList.add('blurred');
    deck.classList.add('blurred');
    winPanel.classList.add('win__panel-open');

    const resultsStars = document.querySelector('.results .stars');
    const finalStartCount = document.querySelectorAll('.currentscore .stars .fa-star');
    for (let i = 0; i < finalStartCount.length; i++) {
        const star = document.createElement('li');
        star.innerHTML = `<i class="fa fa-star"></i>`;
        resultsStars.appendChild(star);
    }
    document.querySelector('.results .moves').innerHTML = moveCount;
    document.querySelector('.results .timer').innerHTML = formatSeconds(elapsedTime);

    // add the new high score to local storage
    if (moveCount < hiscoreMoves || hiscoreMoves == null) {
        localStorage.setItem('moveCount', moveCount);
        localStorage.setItem('elapsedTime', elapsedTime);
        newHighScore.classList.add('newhighscore-show');
    }
}

/** Reload the page when either of the restart buttons are clicked. */
for (const button of restartButtons) {
    button.addEventListener('click', function () {
        location.reload();
    });
}