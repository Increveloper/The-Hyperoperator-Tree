function hasUpgrade(layer, id) {
	return ((player[layer].upgrades.includes(toNumber(id)) || player[layer].upgrades.includes(id.toString())) && !tmp[layer].deactivated)
}

function hasMilestone(layer, id) {
	return ((player[layer].milestones.includes(toNumber(id)) || player[layer].milestones.includes(id.toString())) && !tmp[layer].deactivated)
}

function hasAchievement(layer, id) {
	return ((player[layer].achievements.includes(toNumber(id)) || player[layer].achievements.includes(id.toString())) && !tmp[layer].deactivated)
}

function hasChallenge(layer, id) {
	return ((player[layer].challenges[id]) && !tmp[layer].deactivated)
}

function maxedChallenge(layer, id) {
	return ((player[layer].challenges[id] >= tmp[layer].challenges[id].completionLimit) && !tmp[layer].deactivated)
}

function challengeCompletions(layer, id) {
	return (player[layer].challenges[id])
}

function getBuyableAmount(layer, id) {
	return (player[layer].buyables[id])
}

function setBuyableAmount(layer, id, amt) {
	player[layer].buyables[id] = amt
}

function getClickableState(layer, id) {
	return (player[layer].clickables[id])
}

function setClickableState(layer, id, state) {
	player[layer].clickables[id] = state
}

function getGridData(layer, id) {
	return (player[layer].grid[id])
}

function setGridData(layer, id, data) {
	player[layer].grid[id] = data
}

function upgradeEffect(layer, id) {
	return (tmp[layer].upgrades[id].effect)
}

function challengeEffect(layer, id) {
	return (tmp[layer].challenges[id].rewardEffect)
}

function buyableEffect(layer, id) {
	return (tmp[layer].buyables[id].effect)
}

function clickableEffect(layer, id) {
	return (tmp[layer].clickables[id].effect)
}

function achievementEffect(layer, id) {
	return (tmp[layer].achievements[id].effect)
}

function gridEffect(layer, id) {
	return (gridRun(layer, 'getEffect', player[layer].grid[id], id))
}

function colorText(layer, customPath = false, layerPoints = true){
	let validCustom = ["layer", "name", "whole", "precision"]
	for(const key in customPath){
		if(!(validCustom.includes(key)))throw new Error(`Invalid key found: ${key}`)
	}
	let target = new ExpantaNum(0)
	let whole = false
	let precision = 2
	if(!isPlainObject(customPath)){
		target = layerPoints? player[layer].points : player.points
	}
	else{
		const targetLayer = customPath.layer ? customPath.layer : layer
		const name = customPath.name ? customPath.name : "points"
		whole = customPath.whole ? true : false
		precision = customPath.precision ?? 2
		target = player[targetLayer][name]
	}
    const input = whole ? formatWhole(target) : format(target, precision)
	return `<h2 style="color:${layers[layer].color}">${input}</h2>`
}

function applyEffect(type, vars, layer, id, op, arrNum = -1){
	if(!Array.isArray(id))throw new Error(`Expected array, got ${typeof id}: ${id}`)
	let funcs = {
		"add": (a, b) => a.add(b),
		"mul": (a, b) => a.mul(b),
		"sub": (a, b) => a.sub(b)
	}
	if(!funcs[op]){
		throw new Error(`Invalid operator! ${op}`)
	}

	if(arrNum === -1){
		for(let i = 0; i < id.length; i++){
			if(Array.isArray(tmp[layer][type][id[i]].effect)){
				throw new Error(`Expected ${type} ${layer}-${id[i]}'s effect to be a number, got ${typeof tmp[layer][type][id[i]].effect}: ${tmp[layer][type][id[i]].effect}`)
			}
			if(type === "buyables"){
				vars = funcs[op](vars, tmp[layer][type][id[i]].effect)
			} else if(type === "milestones" || type === "upgrades"){
				if(player[layer][type].includes(id[i]))vars = funcs[op](vars, tmp[layer][type][id[i]].effect)
			}
			else{
				throw new Error(`Invalid type! ${type}`)
			}
		}
	}
	else if(arrNum >= 0){
		for(let i = 0; i < id.length; i++){
			if(!Array.isArray(layers[layer][type][id[i]].effect())){
				throw new Error(`Expected ${type} ${layer}-${id[i]}'s effect to be an array, got ${typeof tmp[layer][type][id[i]].effect}: ${tmp[layer][type][id[i]].effect}`)
			}
			if(type === "buyables"){
				vars = funcs[op](vars, tmp[layer][type][id[i]].effect[arrNum])
			} else if(type === "milestones" || type === "upgrades"){
				if(player[layer][type].includes(id[i]))vars = funcs[op](vars, tmp[layer][type][id[i]].effect[arrNum])
			}
			else{
				throw new Error(`Invalid type! ${type}`)
			}
		}
	}
	else{
		throw new Error(`Invalid array value! ${arrNum}`)
	}
	return vars
}

function addDimension(layer, id){
	let dim = player[layer].dimensions[`dim${id}`]

	let form = [
		"row", [[
			"column", [
				["display-text", `<h3>${layers[layer].name} Dimension ${id}</h3>`],
				["display-text", `<span style="text-align:left;">${format(dim.multiplier)}x (+${format(dim.multOnBuy)} on buy)</span>`],
			]],
			["display-text", `<span style="width:250px;text-align:center;">${format(dim.total)} (${format(dim.purchased)})</span>`],
			["buyable", `Dim${id}`]
		]
	]
	//console.log(form)
	return form
}

function generateComponent(type, rows, config = {}){
	if(!isPlainObject(config))throw new Error(`Expected config object, got ${typeof config}`)
	const validConfig = ["prefix", "lastRow", "layer", "cols"]
	for(const key in config){
		if(!(validConfig.includes(key)))throw new Error(`Invalid config key found: ${key}`)
	}

	let format = []
	const singulars = {
		"milestones": "milestone",
		"upgrades": "upgrade",
		"buyables": "buyable",
		"dimensions": "dimension"
	}
	if(!Object.keys(singulars).includes(type))throw new Error(`Invalid type! ${type}`)
	const defaultCols = {
		"upgrades": 5,
		"buyables": 3,
		"milestones": 1,
		"dimensions": 1,
	}
	let prefix = config.prefix ?? ``
	let lastRow = config.lastRow??0
	let cols = config.cols??defaultCols[type]

	if(type === "milestones"){
		let colFormat = []
		for(let i = 0; i < rows; i++){
			let id = i
			if(prefix){
				id = prefix + id
			}
			colFormat.push([singulars[type], id])
		}
		format.push(["col", colFormat])
	} else if(type === "dimensions"){
		let targetLayer = config.layer
		if(!targetLayer)throw new Error(`Failed to generate dimension (Unspecified layer)`)
		for(let i = 1; i <= rows; i++){
			format.push(addDimension(targetLayer, i))
		}
	} else {
		let itemFormat = []
		for(let i = 1; i <= rows; i++){
			let rowFormat = []
			for(let j = 1; j <= cols; j++){
				let id = i*10+j
				if(prefix)id = prefix+id
				if(i < rows || !(i === rows && (j <= lastRow && lastRow > 0))){
					rowFormat.push([singulars[type], id])
				}
			}
			itemFormat.push(["row", rowFormat])
		}
		format.push(...itemFormat)
	}
	return format
}