//load canvas
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth-22;
canvas.height = window.innerHeight-22;
const ctx = canvas.getContext("2d");
const canvasElem = document.querySelector("canvas");

//settings for text size, pos, etc
const textSettings = {
	font: "40px Verdana",	
	color: "blue",
	x: 150,
	y: canvas.height/3,
};

//load audio, src here https://opengameart.org/content/54-casino-sound-effects-cards-dice-chips
const audio = {
	start1: document.getElementById("start1"),
	start2: document.getElementById("start2"),
	shuffle1: document.getElementById("shuffle1"),
	shuffle2: document.getElementById("shuffle2"),
	pick1: document.getElementById("pick1"),
	pick2: document.getElementById("pick2"),
	pick3: document.getElementById("pick3"),
	pick4: document.getElementById("pick4"),
};

console.log(document.getElementById("numCards").value);

//setting for card size, pos, etc
const cardSettings = {
	num: 5,
	width: 125,
	height: 181,
	playerY: canvas.height-181,
	enemyY: 0,
	pileDistance: 50,
	clicked: false,
	xPos: function() {
		var cardXPos = [((canvas.width - this.width - (this.num-1)*this.width)/2)];
		for(var i = 1; i < this.num; i++){
			cardXPos.push(1*cardXPos[0] + i*this.width);
		}
		return cardXPos;
	},
	pileX: function(direction) {
		if(direction == -1){
			return this.xPos()[0]-this.width-this.pileDistance;
		}
		if(direction == 1){
			return this.xPos()[this.num-1]+this.width+this.pileDistance;
		}
	}
};

const deckSettings = {
	suits: ["S", "C", "D", "H"],
	values: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"], 
	background: document.getElementById("Back"),
};

var cards = shuffle(newDeck(deckSettings.suits, deckSettings.values));
var playerHand = cards.slice(0, cards.length/2);
var enemyHand = cards.slice(cards.length/2, cards.length);

var war = {
	atWar: false,
	afterWar: false,
	warCards: [],
};

//player object and functions, cards holds actual cards and functions interpret values
var player = {
	cards: deal(cardSettings.num, playerHand),
	count: playerHand.length,
	pile: [],
	lowCards: false,
	imgs: function() {
		if(!this.lowCards){
			for(var i = 0; i < this.cards.length; i++){
				ctx.drawImage(cardImage(this.cards[i]), cardSettings.xPos()[i], cardSettings.playerY, cardSettings.width, cardSettings.height);
			}
		}
		if(this.lowCards){
			for(var i = 0; i < this.count; i++){
				ctx.drawImage(cardImage(this.cards[i]), cardSettings.xPos()[i], cardSettings.playerY, cardSettings.width, cardSettings.height);
			}			
		}
		ctx.drawImage(deckSettings.background, cardSettings.pileX(1), cardSettings.playerY, cardSettings.width, cardSettings.height);
	},
	values: function() {
		var cardValues = [];
		if(!this.lowCards){
			for(var i = 0; i < this.cards.length; i++){
				cardValues.push(cardValue(this.cards[i]));
			}
		}
		if(this.lowCards){
			for(var i = 0; i < this.count; i++){
				cardValues.push(cardValue(this.cards[i]));
			}			
		}
		return cardValues;
	},
	chosenCard: -1,
	newCard: function() {
		if(this.chosenCard >= 0 && !this.lowCards){
			if((playerHand.length <= cardSettings.num+1) || (war.afterWar && playerHand.length <= cardSettings.num+cardSettings.num+1)){
				shuffle(this.pile);
				for(var i = 0; i < this.pile.length; i++){
					playerHand.push(this.pile[i]);
				}
				this.pile = [];
			}
			if(!war.afterWar){
				this.cards[this.chosenCard] = playerHand[cardSettings.num];
				playerHand[this.chosenCard] = playerHand[cardSettings.num];
				playerHand.splice(cardSettings.num, 1);
			}
			if(war.afterWar){
				for(var i = 0; i < cardSettings.num; i++){
					this.cards[i] = playerHand[cardSettings.num];
					playerHand.splice(i, 1);
					playerHand[i] = this.cards[i];
				}
			}
		}
	},
	refresh: function() {
		this.newCard();
		this.imgs();
		this.values();
		this.chosenCard = -1;
	},
};

//enemy object and functions, same as player
var enemy = {
	cards: deal(cardSettings.num, enemyHand),
	count: enemyHand.length,
	pile: [],
	lowCards: false,
	imgs: function() { 
		if(!this.lowCards){
			for(var i = 0; i < this.cards.length; i++){
				ctx.drawImage(cardImage(this.cards[i]), cardSettings.xPos()[i], cardSettings.enemyY, cardSettings.width, cardSettings.height);
			}
		}
		if(this.lowCards){
			for(var i = 0; i < this.count; i++){
				ctx.drawImage(cardImage(this.cards[i]), cardSettings.xPos()[i], cardSettings.enemyY, cardSettings.width, cardSettings.height);
			}			
		}
		ctx.drawImage(deckSettings.background, cardSettings.pileX(-1), cardSettings.enemyY, cardSettings.width, cardSettings.height);
	},
	values: function() {
		var cardValues = [];
		if(!this.lowCards){
			for(var i = 0; i < this.cards.length; i++){
				cardValues.push(cardValue(this.cards[i]));
			}
		}
		if(this.lowCards){
			for(var i = 0; i < this.count; i++){
				cardValues.push(cardValue(this.cards[i]));
			}			
		}
		return cardValues;
	},
	chosenCard: -1,
	newCard: function() {
		if(this.chosenCard >= 0 && !this.lowCards){
			if((enemyHand.length <= cardSettings.num+1) || (war.afterWar && enemyHand.length <= cardSettings.num+cardSettings.num+1)){
				shuffle(this.pile);
				for(var i = 0; i < this.pile.length; i++){
					enemyHand.push(this.pile[i]);
				}
				this.pile = [];
			}
			if(!war.afterWar){
				this.cards[this.chosenCard] = enemyHand[cardSettings.num];
				enemyHand[this.chosenCard] = enemyHand[cardSettings.num];
				enemyHand.splice(cardSettings.num, 1);
			}
			if(war.afterWar){
				for(var i = 0; i < cardSettings.num; i++){
					this.cards[i] = enemyHand[cardSettings.num];
					enemyHand.splice(i, 1);
					enemyHand[i] = this.cards[i];
				}
				war.afterWar = false;
			}
		}
	},
	refresh: function() {
		this.newCard();
		this.imgs();
		this.values();
		this.chosenCard = -1;
	},
};

//loads card images from html file (https://opengameart.org/content/playing-cards-vector-png)
function cardImage(card){
	var toHtml = card.substring(0, 1);
	if(toHtml == "1")
		toHtml += "0";
	toHtml += card.substring(card.length-1).toLowerCase();
	return document.getElementById(toHtml);
}

//converts card ids to human language
function humanLanguage(card){
	var text = "0 of Errors"
	if(card.length < 2 || card.length > 3)
		return text;
	text = card.substring(0, 1);
	if(text == "1")
		text += "0"
	text += " of "
	switch(card.substring(card.length-1)){
		case "S": text += "Spades"; break;
		case "C": text += "Clubs"; break;
		case "D": text += "Diamonds"; break;
		case "H": text += "Hearts"; break;
	}
	return text;
}

//gives each card a numerical strength value
function cardValue(card){
	var value = -1;
	switch(card.substring(0, 1)){
		case "2": value = 0; break;
		case "3": value = 1; break;
		case "4": value = 2; break;
		case "5": value = 3; break;
		case "6": value = 4; break;
		case "7": value = 5; break;
		case "8": value = 6; break;
		case "9": value = 7; break;
		case "1": value = 8; break;
		case "J": value = 9; break;
		case "Q": value = 10; break;
		case "K": value = 11; break;
		case "A": value = 12; break;
	}
	return value;
}

function newDeck(suits, values){
	var newDeck = [];
	for(var i = 0; i < suits.length; i++){
		for(var j = 0; j < values.length; j++){
			newDeck.push(values[j] + suits[i]);
		}
	}
	return newDeck;
}

function shuffle(deck) {
	//fisher-yates shuffle from here https://bost.ocks.org/mike/shuffle/
	var shuffleDeck = deck;
	var measure = shuffleDeck.length;
	var temp = 0;
	var counter = 0;
	while (measure) {
		counter = Math.floor(Math.random() * measure--);
		temp = shuffleDeck[measure];
		shuffleDeck[measure] = shuffleDeck[counter];
		shuffleDeck[counter] = temp;
	}
	return shuffleDeck;
}

//picks random cards for player and enemy, 
function deal(num, array){
	var cardArray = [];
	for(var i = 0; i < num; i++){
		cardArray.push(array[i]);
	}
	return cardArray;
}

//picks the enemys card choice
function chooseEnemyCard(numberOfCards){
	var card = -1;
	var playerOrdered = player.values().sort(function(a, b){return a-b}).reverse();
	var enemyOrdered = enemy.values().sort(function(a, b){return a-b}).reverse();
	if(war.atWar){
		var highCard = "2S";
		for(var i = 0; i < numberOfCards; i++){
			if(enemy.values()[i] > cardValue(highCard)){
				highCard = enemy.cards[i];
				card = i;
			}
		}
	}
	else if(enemy.lowCards){
		card = Math.floor(Math.random()*enemy.count);
	}
	else if(enemyOrdered[1] > playerOrdered[0] && Math.random() > 0.1 && numberOfCards > 1){
		for(var i = 0; i < numberOfCards; i++){
			if(enemyOrdered[i] > playerOrdered[0]){
				card = i;
			}
		}
	}
	else if(playerOrdered[1] > enemyOrdered[0] && Math.random() > 0.1 && numberOfCards > 1){
		card = enemyOrdered[numberOfCards-1];
	}
	else if(playerOrdered[numberOfCards-1] > enemyOrdered[1] && Math.random > 0.2){
		card = enemyOrdered[numberOfCards-1];
	}
	else{
		card = Math.floor(Math.random()*numberOfCards);
	}
	enemy.chosenCard = card;
	drawChoice(enemy.chosenCard, "enemy");
	return enemy.cards[card];
}

//REORGANIZE WINNER AND LOSER LATER when playerHand and enemyHand in object
function win(){
	if(!war.atWar){
		player.pile.push(playerHand[player.chosenCard], enemyHand[enemy.chosenCard]);
		player.count++; enemy.count--;
	}
	if(war.atWar && !war.afterWar){
		player.pile.push(war.warCards[0], war.warCards[1]);
		war.warCards = [];
		for(var i = 0; i < cardSettings.num; i++){
			player.pile.push(playerHand[i], enemyHand[i]);
			player.count++; enemy.count--;
		}
		war.atWar = false;
		war.afterWar = true;
	}
	if(enemy.count < cardSettings.num){
		enemy.lowCards = true;
	}
	else{
		player.lowCards = false;
	}
}

function lose(){
	if(!war.atWar){
		enemy.pile.push(enemyHand[enemy.chosenCard], playerHand[player.chosenCard]);
		player.count--; enemy.count++;
	}
	if(war.atWar && !war.afterWar){
		enemy.pile.push(war.warCards[0], war.warCards[1]);
		war.warCards = [];
		for(var i = 0; i < cardSettings.num; i++){
			enemy.pile.push(enemyHand[i], playerHand[i]);
			enemy.count++; player.count--;
		}
		war.atWar = false;
		war.afterWar = true;
	}
	if(player.count < cardSettings.num){
		player.lowCards = true;
	}
	else{
		enemy.lowCards = false;
	}
}

function tie1(){
	war.atWar = true;
	war.warCards.unshift(playerHand[player.chosenCard], enemyHand[enemy.chosenCard]);
}

function tie2(){
	player.pile.push(war.warCards[0], playerHand[player.chosenCard]);
	enemy.pile.push(war.warCards[1], enemyHand[enemy.chosenCard]);
	war.warCards = [];
	war.atWar = false;
	war.afterWar = false;
}

function drawCount(){
	ctx.font = textSettings.font;
	ctx.fillStyle = textSettings.color;
	ctx.fillText("Cards: " + player.count, 40, canvas.height-100);
	ctx.fillText("Cards: " + enemy.count, canvas.width-300, 40);
	ctx.fillText("Pile: " + player.pile.length, canvas.width-300, canvas.height-100);
	ctx.fillText("Pile: " + enemy.pile.length, 40, 40);
}

function drawChoice(card, side){
	ctx.beginPath();
	ctx.lineWidth = cardSettings.width/25;
	ctx.strokeStyle = "red";
	if(side == "player"){
		ctx.rect(cardSettings.xPos()[card], cardSettings.playerY, cardSettings.width, cardSettings.height);
	}
	if(side == "enemy"){
		ctx.rect(cardSettings.xPos()[card], cardSettings.enemyY, cardSettings.width, cardSettings.height);
	}
	ctx.stroke();
}

//determines game winner based on card strengths
function result(player, enemy, enemyCard){	
	var winnerMessage = "";
	if(cardValue(player) > cardValue(enemy)){
		winnerMessage = ". You win!"
		win();
	}
	else if(cardValue(player) == cardValue(enemy) && !war.atWar){
		winnerMessage = ". To war!"
		tie1();
	}
	else if(cardValue(player) == cardValue(enemy) && war.atWar){
		winnerMessage = ". The war is a draw!"
		tie2();
	}
	else if(cardValue(player) < cardValue(enemy)){
		winnerMessage = ". You lose!"
		lose();
	}
	ctx.fillText("You picked " + humanLanguage(player) + " and the computer picked " + humanLanguage(enemy) + winnerMessage, textSettings.x, textSettings.y);
}

//click code start
function getMousePosition(canvas, event) {
	let rect = canvas.getBoundingClientRect();
	let x = event.clientX - rect.left;
	let y = event.clientY - rect.top;
	
	//click on card
	if(y <= canvas.height && y >= canvas.height-cardSettings.height && (x <= cardSettings.xPos()[cardSettings.num-1]+cardSettings.width) && x >= cardSettings.xPos()[0]){
		switch(Math.floor(Math.random()*4)){
			case 0: audio.pick1.play(); break;
			case 1: audio.pick2.play(); break;
			case 2: audio.pick3.play(); break;
			case 3: audio.pick4.play(); break;
		}
		if(!cardSettings.clicked){
			for(var i = 0; i <= player.cards.length; i++){
				if(x <= cardSettings.xPos()[i]+cardSettings.width && x >= cardSettings.xPos()[i]){
					player.chosenCard = i;
					result(player.cards[player.chosenCard], chooseEnemyCard(enemy.cards.length));
				}
			}
			drawChoice(player.chosenCard, "player");
			cardSettings.clicked = true;
			return player.chosenCard;
		}
	}
}
  
canvasElem.addEventListener("mouseup", function(e)
{
	getMousePosition(canvasElem, e);
});
//click code end

function start(){
	//cardSettings.num = document.getElementById("numCards").value;
	player.imgs();
	enemy.imgs();
	drawCount();
	document.getElementById("start").style.visibility = "hidden";
	document.getElementById("settings").style.visibility = "hidden";
	switch(Math.floor(Math.random()*2)){
		case 0: audio.start1.play(); break
		case 1: audio.start2.play(); break;
	}
}

//called when clicking html button
function refresh(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	player.refresh();
	enemy.refresh();
	drawCount();
	switch(Math.floor(Math.random()*2)){
		case 0: audio.shuffle1.play(); break
		case 1: audio.shuffle2.play(); break;
	}
	cardSettings.clicked = false;
}