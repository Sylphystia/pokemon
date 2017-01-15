var pokemons = []
var moves = []
var filters = {}
var searchFilter

var onload

function getFilteredPokemons(){
	var pokes = pokemons
	if(selectedTab == "mine"){
		pokes = []
		for(var i in pokemonInventories)
			pokes = pokes.concat(pokemonInventories[i].pokemons)
	} else if(selectedTab == "breedables"){
		pokes = []
		for(var i in pokemonInventories)
			pokes = pokes.concat(pokemonInventories[i].pokemons)
	} else if(selectedTab)
		pokes = selectedTab.pokemons
	for(var i in filters)
		pokes = pokes.filter(filters[i])
	if(searchFilter)
		pokes = pokes.filter(searchFilter)
	return pokes
}

function getSearchFilter(query) {
	return function(pokemon) {
		query = query.trim().toLowerCase()
		return pokemonFormName(pokemon).toLowerCase().indexOf(query) > -1
	}
}

function pokemonFormName(pokemon){
	switch(pokemon.form){
	case "Base":
		return pokemon.name
	case "Mega X":
		return "Mega " + pokemon.name + " X"
	case "Mega Y":
		return "Mega " + pokemon.name + " Y"
	default:
		return pokemon.form + " " + pokemon.name
	}
}

function textContains(text, substring){
	return text.toLowerCase().indexOf(substring.toLowerCase()) > -1
}

function getPokemonSpriteName(pokemon){
	var name = pokemon.name.toLowerCase().replace(" ", "-").replace("♀","-f").replace("♂","-m").replace("'","").replace(".","").replace("ébé","ebe").replace(":","")
	if(pokemon.forms && pokemon.form && !textContains(pokemon.form, pokemon.forms[0])){
		var formname
		if(textContains(pokemon.form, "alola"))
			formname = "alola"
		else if(textContains(pokemon.form, "10%"))
			formname = "10-percent"
		else if(pokemon.form.toLowerCase() == "core form")
			formname = "core-yellow"
		else if(pokemon.form.toLowerCase() == "female")
			formname = false
		else if(textContains(pokemon.form, "size"))
			formname = false
		else if(textContains(pokemon.form, "mega"))
			formname = pokemon.form.replace(" ", "-")
		else if(textContains(pokemon.form, "core"))
			formname = pokemon.form.replace(" ", "-")
		else if(pokemon.form == "Ash-Greninja")
			formname = "ash"
		else if(!textContains(pokemon.form, "base"))
			formname = pokemon.form
		if(formname)
			name += "-" + formname.split(" ")[0].toLowerCase().replace(" ", "-").replace("'", "-")
	}
	if(!formname && pokemon.forms && pokemon.forms[0] == "Male" && (pokemon.form.toLowerCase() == "female" || pokemon.gender == "♀"))
		name = "female/" + name
	return "https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/" +
	 (pokemon.shiny ? "shiny":"regular") +
	  "/" + name + ".png"
}

function getPokemonImageName(pokemon){
	var zeroes = ""
	if(pokemon.id < 10)
		zeroes = "00"
	else if(pokemon.id < 100)
		zeroes = "0"
	var form = ""
	if(pokemon.form && pokemon.form != "Base" && pokemon.forms && !textContains(pokemon.form, pokemon.forms[0])){
		for(var i in pokemon.forms){
			if(textContains(pokemon.form, pokemon.forms[i])){
				form = "_f" + (+i + (pokemon.name == "Zygarde" ? 2 : 1) )
				break
			}
		}
	}
	if(pokemon.form == "Core Form")
		form = "_f2"
	return "http://assets.pokemon.com/assets/cms2/img/pokedex/full/" + zeroes + pokemon.id + form + ".png"
}

function hasItemInFilter(listKey) {
	return function (...items){
		return function(pokemon) {
			for(var i in items){
				if(!pokemon[listKey]) {
					console.log("Pokemon missing " + listKey + ": " + pokemonFormName(pokemon))
					return false
				}
				if(pokemon[listKey].filter(e => e ? (e.toLowerCase ? e.toLowerCase() : e.name.toLowerCase()) == items[i].toLowerCase() : false).length)
					return true
			}
			return false
		}
	}
}

function requestJSON(url, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(JSON.parse(xmlHttp.responseText))
	}
	xmlHttp.open("GET", url, true)
	xmlHttp.send()
}

function getMoves(response){
	moves = response
	tryLoad()
}

function getPokemons(response){
	pokemons = response
	tryLoad()
}

function isEverythingLoaded(){
	return moves && Object.keys(moves).length &&
		pokemons && pokemons.length &&
		(spreadsheetId ? pokemonInventories.length : true)
}

requestJSON("https://armienn.github.io/pokemon/static/moves.json", getMoves)
requestJSON("https://armienn.github.io/pokemon/static/pokemons-small.json", getPokemons)