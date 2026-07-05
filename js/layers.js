addLayer("c", {
    name: "Constants",
    symbol: "C",
    position: 0,
    startData(){ return {
        unlocked: true,
        points: new ExpantaNum(0)
    }},
    update(){
        amt = new ExpantaNum(0)

        amt = applyEffect("upgrades", amt, "s", [13], "add")
        amt = applyEffect("upgrades", amt, "a", [14, 15, 25, "d-25"], "add")
        amt = applyEffect("upgrades", amt, "m", ["r-24"], "add")
        amt = applyEffect("upgrades", amt, "m", [21], "mul", 0)
        amt = applyEffect("upgrades", amt, "m", ["p-15", "r-15"], "mul", 1)
        amt = applyEffect("upgrades", amt, "m", [25, "p-25", "r-25"], "mul")

        player.c.points = amt

        getPointsPerClick()
    },
    color: "#dddddd",
    resource: "Constant Points",
    type: "none",
    row: "side",
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Unlock I",
            description: "Unlock the first layer.",
            cost: new ExpantaNum(0),
            canAfford(){return player.c.points.gte(this.cost)}
        },
        12: {
            title: "Unlock II",
            description: "Unlock the second layer.",
            cost: new ExpantaNum(1),
            canAfford(){return player.c.points.gte(this.cost)},
            unlocked(){return hasUpgrade("c", 11)}
        },
        13: {
            title: "Unlock III",
            description: "Unlock Addition Dimensions.",
            cost: new ExpantaNum(2.71828),
            canAfford(){return player.c.points.gte(this.cost)},
            unlocked(){return hasUpgrade("c", 12)}
        },
        14: {
            title: "Unlock IV",
            description: "Unlock the third layer.",
            cost: new ExpantaNum(3.44949),
            canAfford(){return player.c.points.gte(this.cost)},
            unlocked(){return hasUpgrade("c", 13)}
        },
        15: {
            title: "Unlock V",
            description: "Unlock Replication (In the M layer)",
            cost: new ExpantaNum(4.89897),
            unlocked(){return hasUpgrade("c", 14)}
        },
    },
    tabFormat: [
        ["display-text", () => `You have ${colorText("c", {precision:5})} Constant Points.`],
        "blank",
        "upgrades"
    ]
})
addLayer("st", {
    symbol: "ST",
    color: "#444444",
    layerShown(){return true},
    row: "side",
    name: "statistics",
    startData(){ return {
        unlocked: true,
        bestVal: {
            "Points": new ExpantaNum(0),
            "Constant Points": new ExpantaNum(0),
            "Successors": new ExpantaNum(0),
            "Addition Points": new ExpantaNum(0),
            "Addition Power": new ExpantaNum(0),
            "Multiplication Points": new ExpantaNum(0),
            "Multiplication Power": new ExpantaNum(0),
            "Replication Points": new ExpantaNum(0)
        }
    }},
    getBestResources(){
        let best = player.st.bestVal
        if(player.points.gte(best.Points))best.Points = player.points
        if(player.c.points.gte(best["Constant Points"]))best["Constant Points"] = player.c.points
        if(player.s.successors.gte(best.Successors))best.Successors = player.s.successors
        if(player.a.points.gte(best["Addition Points"]))best['Addition Points'] = player.a.points
        if(player.a.power.gte(best["Addition Power"]))best["Addition Power"] = player.a.power
        if(player.m.points.gte(best["Multiplication Points"]))best["Multiplication Points"] = player.m.points
        if(player.m.power.gte(best["Multiplication Power"]))best["Multiplication Power"] = player.m.power
        if(player.m.replicators.gte(best["Replication Points"]))best["Replication Points"] = player.m.replicators
    },
    tooltip(){return "Statistics"},
    tabFormat(){
        let best = player.st.bestVal
        let dim = player.a.dimensions
        let rep = player.m.replication
        let currAmnt = [ // Determines what gets displayed in strings.current
            {val:player.efficiency.points, name:"Point efficiency", type:"nonZero"}, 
            {val:player.s.power, name:"Successor power", type:"neq", unlocked:new ExpantaNum(1)}, {val:player.s.effectiveness, name:"Successor effectiveness", type:"always"}, {val:player.s.amount, name:"Successor amount", type:"always"}, {val:player.efficiency.successor, name:"Successor efficiency", type:"nonZero"}, 
            {val:player.efficiency.addition, name:"Addition efficiency", type:"nonZero"}, {val:player.a.upgEffectiveness, name:"Addition Upgrade Effectiveness", type:"neq", unlocked:new ExpantaNum(100)},
            {val:dim.multiplierPerBuy, name:"Base Multiplier Per Buy", type:"itemUnlock", unlocked:hasUpgrade("c", 13)},
            {val:rep.multiplier, name: "Replication Multiplier", type:"itemUnlock", unlocked:hasUpgrade("c", 15)}, {val:rep.interval, name:"Replication Interval", type:"itemUnlock", unlocked:hasUpgrade("c", 15), formatter:formatTime}, {val:rep.amount, name:"Replication Amount", type:"itemUnlock", unlocked:hasUpgrade("c", 15), formatter:formatWhole}

            //val: stores the value
            //name: stores the resource name
            //formatter: Determines the format. (Default: format())
            //unlocked: stores a number or boolean to determine the display (Read type for more information)
            /*type: Determines the unlock requirement
                * nonZero: Display the value when it's not 0
                * always: Always display the value
                * neq: Display the value when it is not equal to the value stored in unlocked (Requires unlocked to be an ExpantaNum)
                * itemUnlock: Display the value when unlocked is true (Requires unlocked to be a boolean)
            */
        ]
        let strings = {
            best: {

            },
            current: {},
            passive: {},
        }
        for(let item in best){ // Displays best values
            if(best[item].gt(0)){
                strings.best[item] = `Your highest ${item} ever was ${formatWhole(best[item])}.`

                if(item === "Constant Points"){
                    strings.best[item] = `Your highest ${item} ever was ${format(best[item])}.`
                }
            }
            if(item === "Replication Points"){
                if(best[item].lte(1)){
                    strings.best[item] = ``
                }
            }
        }
        let percentages = ["Point efficiency", 'Successor efficiency', "Addition efficiency", "Addition Upgrade Effectiveness"]
        for(let i = 0; i < currAmnt.length; i++){ // Displays current values
            strings.current[currAmnt[i].name] = ``
            let objItem = ""
            let obj = currAmnt[i]
            let formatter = obj.formatter || format
            let defaultString = `Your ${obj.name} is ${formatter(obj.val)}`
            if(percentages.includes(obj.name)){
                defaultString = defaultString + `%`
            }
            switch(obj.type){
                case "itemUnlock":
                    if(obj.unlocked){
                        objItem = defaultString
                    }
                    break;
                
                case "nonZero":
                    if(obj.val.gt(0)){
                        objItem = defaultString
                    }
                    break;

                case "neq":
                    if(!obj.val.eq(obj.unlocked)){
                        objItem = defaultString
                    }
                    break;

                case "always":
                    objItem = defaultString
                    break;
                
                
                default:
                    throw new Error(`Invalid object type at index ${i} for ${obj.name}`)
                    break;
            }
            strings.current[currAmnt[i].name] = objItem
        }
        let resourceNames = ["Points", "Successors", "Additions"] // Stores resource names
        let funcs = { // Stores passive gains
            "Points": layers.s.getPassivePoints(),
            "Successors": layers.s.getPassiveSuccessors(),
            "Additions": layers.a.getPassiveAdditions()
        }
        for(let i = 0; i < resourceNames.length; i++){ // Displays passive resources
            let r = resourceNames[i]
            if(funcs[r].gt(0)){
                strings.passive[r] = `You are gaining ${format(funcs[r])} ${r} per second.`
            }
        }
        let layerFormat = []
        for(let item in strings){ // Generates TabFormat (DO NOT CHANGE)
            for(let str in strings[item]){
                let s = strings[item][str]
                if(s){
                    layerFormat.push(["display-text", s])
                }
            }
            layerFormat.push("blank")
            layerFormat.push("blank")
        }
        return layerFormat
    }
})
addLayer("s", {
    name: "Successor",
    symbol: "S",
    position: 0,
    row: 0,
    resource: "Points",
    startData(){ return {
        unlocked: true,
        points: new ExpantaNum(0),
        successors: new ExpantaNum(0),
        effectiveness: new ExpantaNum(1),
        amount: new ExpantaNum(1),
        power: new ExpantaNum(0)
    }},
    update(diff){
        player.s.points = player.points
        if(!player.resetting){
            player.points = player.points.add(layers.s.getPassivePoints().mul(diff))
            player.s.successors = player.s.successors.add(layers.s.getPassiveSuccessors().mul(diff))
        }
    },
    color: "#ffffff",
    layerShown(){ return hasUpgrade("c", 11)},
    tabFormat(){ return [
        ["display-text", `You have ${colorText("s", false, false)} Points`],
        ["display-text", `You have successed ${format(player.s.successors)} times.`],
        "blank",
        ["display-text", `Your Successor effectiveness is ${format(player.s.effectiveness)}, which increases Points per succession.`],
        ["display-text", `Your Successor amount is ${format(player.s.amount)}, which increases successions per click.`],
        "clickables",
        "blank",
        "upgrades"
    ]},
    getSuccessorPower(){
        let p = new ExpantaNum(1)

        p = applyEffect("upgrades", p, "m", [11, 15, 23, "p-13"], "mul")
        p = applyEffect("upgrades", p, 'm', ["p-22", "p-23"], "mul", 1)

        player.s.power = p
    },
    getSuccessorEffectiveness(){
        let e = new ExpantaNum(1)

        e = applyEffect("upgrades", e, "s", [11], "add")
        e = applyEffect("upgrades", e, "a", [11, 13, 21, "d-11"], "add")
        e = applyEffect("upgrades", e, "a", [23, "d-24"], "add", 0)
        //console.log(e)
        e = e.mul(player.s.power)
        //console.log(e)

        player.s.effectiveness = e
    },
    getSuccessorAmount(){
        let a = new ExpantaNum(1)

        a = applyEffect("upgrades", a, "s", [12], "add")
        a = applyEffect("upgrades", a, "a", [12, 13, 21, "d-12"], "add")
        a = applyEffect("upgrades", a, "a", [23, "d-24"], "add", 1)
        a = a.mul(player.s.power)
        a = applyEffect("upgrades", a, "m", [12], "mul")

        player.s.amount = a
    },
    getPassiveSuccessors(){
        let gain = new ExpantaNum(0)
        if(hasMilestone("a", 1))gain = new ExpantaNum(100)
        gain = applyEffect("upgrades", gain, "a", [22, "d-22"], "add")
        gain = applyEffect("upgrades", gain, "a", [24, "d-24"], "add", 1)
        gain = applyEffect("upgrades", gain, "m", [22], "mul")

        player.efficiency.successor = gain

        return player.s.amount.mul(player.efficiency.successor).div(100)
    },
    getPassivePoints(){
        gain = new ExpantaNum(0)
        if(hasMilestone("a", 0))gain = new ExpantaNum(100)
        gain = applyEffect("upgrades", gain, "a", [22, "d-21"], "add")
        gain = applyEffect("upgrades", gain, "a", [24, "d-24"], "add", 0)
        gain = applyEffect("upgrades", gain, "m", [22], "mul")

        player.efficiency.points = gain

        return player.perClick.mul(player.efficiency.points).div(100)
    },
    clickables: {
        11: {
            title: `Gain points`,
            onClick(){
                player.points = player.points.add(player.perClick)
                player.s.successors = player.s.successors.add(player.s.amount)
            },
            canClick(){return true}
        }
    },
    upgrades: {
        11: {
            title: "Successor I",
            description: "Successor effectiveness is increased by +1.",
            cost: new ExpantaNum(10),
            canAfford(){ return player.points.gte(this.cost)},
            onPurchase(){ player.points = player.points.sub(this.cost)},
            effect(){
                let eff = new ExpantaNum(1)

                return eff
            },
            effectDisplay(){ return `+${this.effect()} to Successor effectiveness.`},
        },
        12: {
            title: "Successor II",
            description: "Successor amount is increased by +1.",
            cost: new ExpantaNum(30),
            canAfford(){ return player.points.gte(this.cost)},
            onPurchase(){ player.points = player.points.sub(this.cost)},
            effect(){
                let eff = new ExpantaNum(1)

                return eff
            },
            effectDisplay(){ return `+${this.effect()} to Successor amount.`},
        },
        13: {
            title: "Constant I",
            description: "Add 1 to you Constant Points amount.",
            cost: new ExpantaNum(100),
            canAfford(){ return player.points.gte(this.cost)},
            onPurchase(){ player.points = player.points.sub(this.cost)},
            effect(){
                let eff = new ExpantaNum(1)

                return eff
            },
            effectDisplay(){ return `+${this.effect()} Constant Points.`},
        },
    },
    doReset(resettingLayer){
        if(layers[resettingLayer].row > layers.s.row){
            keeps = []
            if((hasMilestone("a", 1) && resettingLayer === "a") || (hasMilestone("m", 1) && resettingLayer === "m"))keeps.push("upgrades")
            layerDataReset("s", keeps)
            
            if(player.points.gt(0))player.points = new ExpantaNum(0)
        }
    }
})
addLayer("a", {
    name: "Addition",
    symbol: "A",
    row: 1,
    position: 0,
    color: "#00FF00",
    branches: ["s"],
    layerShown(){return hasUpgrade("c", 12)},
    startData(){ return {
        unlocked: false,
        points: new ExpantaNum(0),
        power: new ExpantaNum(0),
        dimensions: {
            "dim1": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim2": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim3": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim4": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim5": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim6": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim7": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            "dim8": {
                "purchased": new ExpantaNum(0),
                "produced": new ExpantaNum(0),
                "total": new ExpantaNum(0),
                "multiplier": new ExpantaNum(1),
                "multOnBuy": new ExpantaNum(1)
            },
            multiplierPerBuy: new ExpantaNum(1),
            amount: 8,
            unlocked: 1,
        },
        upgEffectiveness: new ExpantaNum(100),
    }},
    update(diff){
        //console.log(player.subtabs.a)
        if(player.subtabs.a.mainTabs === undefined){player.subtabs["a"].mainTabs = "Main"}
        if(!player.resetting){
            player.a.points = player.a.points.add(layers.a.getPassiveAdditions().mul(diff))
            player.a.total = player.a.total.add(layers.a.getPassiveAdditions().mul(diff))
        }
    },
    getResetGain(){
        let gain = layers.a.baseAmount().div(layers.a.requires).pow(layers.a.exponent)
        gain = applyEffect("upgrades", gain, "a", ["d-14"], "add")
        
        return gain.mul(layers.a.gainMult()).floor()
    },
    getNextAt(){
        let next = layers.a.getResetGain().add(1)
        if(hasUpgrade("a", "d-14"))next = next.sub(upgradeEffect("a", "d-14"))
        next = next.div(layers.a.gainMult()).pow(2).mul(layers.a.requires)
        if(next.lt(layers.a.requires))next = layers.a.requires

        return next
    },
    gainMult(){
        let mul = new ExpantaNum(1)

        mul = applyEffect("upgrades", mul, "m", [11, 15, "p-12"], "mul")
        //console.log(mul.toString())

        return mul
    },
    type: "normal",
    baseResource: "Successors",
    baseAmount(){return player.s.successors},
    requires: new ExpantaNum(100),
    exponent: new ExpantaNum(0.5),
    resource: "Addition Points",
    getPassiveAdditions(){
        let gain = new ExpantaNum(0)
        if(hasMilestone("m", 1))gain = new ExpantaNum(25)
        gain = applyEffect("upgrades", gain, "m", [23], "mul")
        gain = applyEffect("upgrades", gain, "m", ["p-22"], "mul", 0)

        player.efficiency.addition = gain
        return layers.a.getResetGain().mul(player.efficiency.addition.div(100))
    },
    getMultiplierPerBuy(){
        let dim = player.a.dimensions
        let mult = new ExpantaNum(1)
        mult = applyEffect("upgrades", mult, "a", ["d-13", "d-15", "d-23"], "add")
        mult = applyEffect("upgrades", mult, "m", [13], "mul")

        dim.multiplierPerBuy = mult
    },
    getDimMultOnBuy(){
        let dim = player.a.dimensions
        for(let i = 1; i <= dim.amount; i++){
            let d = dim[`dim${i}`]
            d.multOnBuy = dim.multiplierPerBuy
            if(hasUpgrade("m", "p-21"))dim[`dim${i}`].multOnBuy = dim[`dim${i}`].multOnBuy.mul(upgradeEffect("m", "p-21").mul(i).add(1))
        }
    },
    autobuyDims(){
        let dim = player.a.dimensions
        let buyb = layers.a.buyables
        let automated = {
            "dim1": hasMilestone("m", 2),
            "dim2": hasMilestone("m", 2),
            "dim3": hasMilestone("m", 2),
            "dim4": hasMilestone("m", 2),
            "dim5": hasMilestone("m", 3),
            "dim6": hasMilestone("m", 3),
            "dim7": hasMilestone("m", 3),
            "dim8": hasMilestone("m", 3),
        }
        for(let i = 1; i <= dim.amount; i++){
            if(automated[`dim${i}`]){
                if(buyb[`Dim${i}`].canAfford()){
                    dim[`dim${i}`].purchased = dim[`dim${i}`].purchased.add(1)
                }
            }
        }
    },
    getDimensionMultipliers(){
        let dim = player.a.dimensions
        for(let i = 1; i <= dim.amount; i++){
            dim[`dim${i}`].multiplier = dim[`dim${i}`].multOnBuy.mul(dim[`dim${i}`].purchased).add(1)

        }
        //player.a.dimensions.dim1.multiplier = player.a.dimensions.multiplierPerBuy.mul(player.a.dimensions.dim1.purchased).add(1)
    },
    generateFromDimensions(diff){
        let dim = player.a.dimensions
        if(!player.resetting){
            player.a.power = player.a.power.add(player.a.dimensions.dim1.total.mul(player.a.dimensions.dim1.multiplier).div(20))
            for(let i = 2; i <= dim.amount; i++){
                dim[`dim${i-1}`].produced = dim[`dim${i-1}`].produced.add(dim[`dim${i}`].total.mul(dim[`dim${i}`].multiplier).mul(diff))
            }
        }
    },
    getDimensionTotal(){
        let dim = player.a.dimensions
        for(let i = 1; i <= dim.amount; i++){
            //console.log(dim, i, dim[`dim${i}`])
            dim[`dim${i}`].total = dim[`dim${i}`].purchased.add(dim[`dim${i}`].produced)
        }
        //dim.dim1.total = dim.dim1.purchased.add(dim.dim1.produced)
    },
    getUnlockedDimensions(){
        let dim = player.a.dimensions
        dim.unlocked = 1
        for(let i = 1; i < dim.amount; i++){
            if(dim[`dim${i}`].purchased.gte(1)){
                dim.unlocked += 1
            }
        }
    },
    getUpgradeEffectiveness(){
        let e = new ExpantaNum(100)

        e = applyEffect("upgrades", e, "m", [24], "mul")

        player.a.upgEffectiveness = e
    },
    milestones: {
        0: {
            requirementDescription: "5 total Addition Points",
            effectDescription: "Passively generate 100% of Points per second",
            done(){ return player.a.total.gte(5)}
        },
        1: {
            requirementDescription: "15 total Addition Points",
            effectDescription: "Passively generate 100% of Successors per second. Keep all S upgrades.",
            done(){ return player.a.total.gte(15)},
            unlocked(){return hasMilestone("a", 0)}
        },
        2: {
            requirementDescription: `30 total Addition points`,
            effectDescription: `You can now success in the Addition layer.`,
            done(){return player.a.total.gte(30)},
            unlocked(){return hasMilestone("a", 1)}
        }
    },
    clickables: {
        11: {
            title: `Gain points`,
            onClick(){
                player.points = player.points.add(player.perClick)
                player.s.successors = player.s.successors.add(player.s.amount)
            },
            canClick(){return true},
            style(){return {"background-color":"#ffffff"}},
            unlocked(){return hasMilestone("a", 2)}
        }
    },
    upgrades: {
        11: {
            title: "Addition I",
            description: "Addition upgrades bought add to Successor effectiveness.",
            cost: new ExpantaNum(1),
            effect(){
                let eff = new ExpantaNum(player.a.upgrades.length)
                eff = applyEffect("upgrades", eff, "m", [14], "mul")

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){ return `+${format(this.effect())} to Successor effectiveness.`}
        },
        12: {
            title: "Addition II",
            description: "Addition upgrades bought add to Successor amount.",
            cost: new ExpantaNum(2),
            effect(){
                let eff = new ExpantaNum(player.a.upgrades.length)
                eff = applyEffect("upgrades", eff, "m", [14], "mul")

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){ return `+${format(this.effect())} to Successor amount.`},
            unlocked(){return hasUpgrade("a", 11)}
        },
        13: {
            title: "Addition III",
            description: "Constant Points add to Successor effectiveness and Successor amount.",
            cost: new ExpantaNum(3),
            effect(){
                let eff = player.c.points

                eff = applyEffect("upgrades", eff, "m", [21], "mul", 1)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){ return `+${format(this.effect())} to Successor effectiveness and amount.`},
            unlocked(){return hasUpgrade("a", 12)}
        },
        14: {
            title: "Constant II",
            description: "Points add to Constant Points, up to a maximum of 1.",
            cost: new ExpantaNum(5),
            effect(){
                let limit = new ExpantaNum(1)

                let eff = player.points.max(1).log10().max(1).log10().min(limit)

                return eff
            },
            effectDisplay(){ return `+${format(this.effect())} Constant Points.`},
            unlocked(){return hasUpgrade("a", 13)}
        },
        15: {
            title: "Constant III",
            description: `Successors add to Constant Points, up to a maximum of 5.`,
            cost: new ExpantaNum(10),
            effect(){
                let hardcap = new ExpantaNum(1)
                let eff = player.s.successors.max(1).log10().max(1).log10().min(hardcap)

                return eff
            },
            effectDisplay(){ return `+${format(this.effect())} to Constant Points.`},
            unlocked(){return hasUpgrade("a", 14)}
        },
        21: {
            title: "Addition IV",
            description: `Addition Points increase Successor amount and effectiveness.`,
            cost: new ExpantaNum(15),
            effect(){
                let eff = player.a.points.pow(0.33)
                if(eff.gte(1.00e10))eff = eff.log10().pow(10)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Successor amount and effectiveness.`},
            unlocked(){return hasUpgrade("a", 15)}
        },
        22: {
            title: `Addition V`,
            description: `Add 50% to Point and Successor gain efficiency.`,
            cost: new ExpantaNum(20),
            effect(){
                let eff = new ExpantaNum(50)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())}% to Point and Successor gain efficiency.`},
            unlocked(){return hasUpgrade("a", 21)}
        },
        23: {
            title: "Addition VI",
            description: "Points and Successions add to Successor effectiveness and amount respectively.",
            cost: new ExpantaNum(25),
            effect(){
                let eff1 = player.points.max(1).log10()
                let eff2 = player.s.successors.max(1).log10()

                eff1 = eff1.mul(player.a.upgEffectiveness.div(100))
                eff2 = eff2.mul(player.a.upgEffectiveness.div(100))
                return [eff1, eff2]
            },
            effectDisplay(){return `+${format(this.effect()[0])} to Successor effectiveness, +${format(this.effect()[1])} to Successor amount.`},
            unlocked(){return hasUpgrade("a", 22)}
        },
        24: {
            title: "Addition VII",
            description: "The previous upgrade applies to generation effeciciency at an increased rate.",
            cost: new ExpantaNum(30),
            effect(){
                if(Array.isArray(upgradeEffect("a", 23))){
                    let eff1 = upgradeEffect("a", 23)[0].mul(1.2)
                    let eff2 = upgradeEffect("a", 23)[1].mul(1.5)
                    eff1 = eff1.pow(2.5).mul(2)
                    eff2 = eff2.pow(2.5).mul(2)
                    if(eff1.gte(100))eff1 = eff1.div(100).pow(0.5).mul(100)
                    if(eff2.gte(100))eff2 = eff2.div(100).pow(0.5).mul(100)

                    eff1 = eff1.mul(player.a.upgEffectiveness.div(100))
                    eff2 = eff2.mul(player.a.upgEffectiveness.div(100))
                    return [eff1, eff2]
                } else {
                    return [1, 1]
                }
            },
            effectDisplay(){return `+${format(this.effect()[0])}% to Point generation efficiency, +${format(this.effect()[1])}% to Successor generation efficiency.`},
            unlocked(){return hasUpgrade("a", 23)}
        },
        25: {
            title: "Constant IV",
            description: `Add 0.65 to Constant Points.`,
            cost: new ExpantaNum(40),
            effect(){
                let eff = new ExpantaNum(0.65)

                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Constant Points`},
            unlocked(){return hasUpgrade("a", 24)}
        },
        "d-11": {
            title: "AD I",
            description: `Addition Power adds to Successor effectiveness.`,
            cost: new ExpantaNum(100),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.power.max(1).log10().pow(2)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Successor effectiveness.`}
        },
        "d-12": {
            title: "AD II",
            description: `Addition Power adds to Successor amount.`,
            cost: new ExpantaNum(200),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.power.max(1).log10().pow(2)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Successor amount.`},
            unlocked(){return hasUpgrade("a", "d-11")}
        },
        "d-13": {
            title: "AD III",
            description: "Increase Multiplier Per Buy by +1",
            cost: new ExpantaNum(5000),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = new ExpantaNum(1)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Multiplier Per Buy.`},
            unlocked(){return hasUpgrade("a", "d-12")}
        },
        "d-14": {
            title: "AD IV",
            description: "Increase Addition Point gain based on Addition Power",
            cost: new ExpantaNum(1e6),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.power.max(1).log10().pow(0.5)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Addition Points gained.`},
            unlocked(){return hasUpgrade("a", "d-13")}
        },
        "d-15": {
            title: "AD V",
            description: "Increase Multiplier Per Buy based on Addition Power",
            cost: new ExpantaNum(2e7),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.power.max(1).log10().div(10)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Multiplier Per Buy.`},
            unlocked(){return hasUpgrade("a", "d-14")}
        },
        "d-21": {
            title: "AD VI",
            description: "Increase Point gain efficiency based on Addition Power",
            cost: new ExpantaNum(2.00001e10),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.power.max(1).log10().pow(2)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())}% to Point gain efficiency.`},
            unlocked(){return hasUpgrade("a", "d-15")}
        },
        "d-22": {
            title: "AD VII",
            description: "Increase Sucessor gain efficiency based on Addition Power",
            cost: new ExpantaNum(5.00001e13),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.power.max(1).log10().pow(2)

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())}% to Successor gain efficiency.`},
            unlocked(){return hasUpgrade("a", "d-21")}
        },
        "d-23": {
            title: "AD VIII",
            description: "Increase Multiplier Per Buy based on Addition Points",
            cost: new ExpantaNum(5.00001e15),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = player.a.points.max(1).log10()

                eff = eff.mul(player.a.upgEffectiveness.div(100))
                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to Multiplier Per Buy.`},
            unlocked(){return hasUpgrade("a", "d-22")}
        },
        "d-24": {
            title: "AD IX",
            description: "Add 200 to Successor effectiveness and 100 to Successor amount.",
            cost: new ExpantaNum(1.00001e18),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff1 = new ExpantaNum(200)
                let eff2 = new ExpantaNum(100)

                eff1 = eff1.mul(player.a.upgEffectiveness.div(100))
                eff2 = eff2.mul(player.a.upgEffectiveness.div(100))
                return [eff1, eff2]
            },
            effectDisplay(){return `+${format(this.effect()[0])} to Successor efficiency, +${format(this.effect()[1])} to Successor amount.`},
            unlocked(){return hasUpgrade("a", "d-23")}
        },
        "d-25": {
            title: "Constant V",
            description: "Add 0.15 Constant Points.",
            cost: new ExpantaNum(2.00001e20),
            currencyLayer: "a",
            currencyInternalName: "power",
            currencyDisplayName: "Addition Power",
            effect(){
                let eff = new ExpantaNum(0.15)

                return eff
            },
            effectDisplay(){return `+${format(this.effect())} Constant Points`},
            unlocked(){return hasUpgrade("a", "d-24")}
        },
    },
    buyables: {
        "Dim1": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim1.purchased = player.a.dimensions.dim1.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(1.5)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(10)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim1.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim2": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim2.purchased = player.a.dimensions.dim2.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(1.7)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(20)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim2.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim3": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim3.purchased = player.a.dimensions.dim3.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(1.8)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(40)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim3.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim4": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim4.purchased = player.a.dimensions.dim4.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(2)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(100)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim4.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim5": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim5.purchased = player.a.dimensions.dim5.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(2.1)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(150)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim5.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim6": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim6.purchased = player.a.dimensions.dim6.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(2.2)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(200)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim6.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim7": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim7.purchased = player.a.dimensions.dim7.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(2.4)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(300)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim7.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
        "Dim8": {
            style(){ return {"max-height":"40px", "max-width":"100px"}},
            display(){return `Cost: ${format(this.cost())} Addition Points`},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                player.a.dimensions.dim8.purchased = player.a.dimensions.dim8.purchased.add(1)
            },
            cost(){
                let costScale = new ExpantaNum(2.6)
                let costExp = new ExpantaNum(1.2)
                let baseCost = new ExpantaNum(500)

                return baseCost.mul(costScale.pow(player.a.dimensions.dim8.purchased).pow(costExp))
            },
            canAfford(){return player.a.points.gte(this.cost())}
        },
    },
    tabFormat(){
        let dim = player.a.dimensions
        let stringa = ``
        let stringb = ``
        if(player.efficiency.points.gt(0))stringa = `You are gaining points at ${format(player.efficiency.points)}% efficiency (+${format(layers.s.getPassivePoints())}/s)`
        if(player.efficiency.successor.gt(0))stringb = `You are gaining successors at ${format(player.efficiency.successor)}% efficiency (+${format(layers.s.getPassiveSuccessors())}/s)`
        return {
            "Main": {
                content: [
                    ["display-text", `You have ${colorText("a", {"whole": true})} Addition Points`],
                    "prestige-button",
                    ["display-text", `You have ${format(player.s.successors)} Successors.`],
                    ["display-text", `You have made a total of ${format(player.a.total)} Addition points.`],
                    "blank",
                    ["clickable", 11],
                    "blank",
                    ["display-text", stringa],
                    ["display-text", stringb],
                    "milestones",
                    "blank",
                    //"upgrades",
                    ...generateComponent("upgrades", 2)
                ]
            },
            "Dimensions": {
                unlocked: hasUpgrade("c", 13),
                content: [
                    ["display-text", `You have ${colorText("a", {"whole": true})} Addition Points`],
                    "prestige-button",
                    ["display-text", `You have ${format(player.s.successors)} Successors.`],
                    ["display-text", `You have made a total of ${format(player.a.total)} Addition points.`],
                    "blank",
                    ["clickable", 11],
                    "blank",
                    ["display-text", `You have ${colorText("a", {"name": "power"})} Addition Power.`],
                    ...generateComponent("dimensions", dim.unlocked, {"layer":"a"}),
                    "blank",
                    ...generateComponent("upgrades", 2, {"prefix":"d-"})
                ]
            }
        }
    },
    hotkeys: [{key: "a", description: "a: Reset for Addition", onPress(){if(player.a.unlocked){doReset("a")}}, unlocked(){return player.a.unlocked}}],
    doReset(resettingLayer){
        if(layers[resettingLayer].row > this.row){
            let keepa = []
            let keptUpg = []
            if(resettingLayer === "m" && hasMilestone("m", 0))keepa.push("milestones")
            if((resettingLayer === "m" && hasMilestone("m", 2)))keptUpg = player.a.upgrades.slice(0, player.m.resets.min(player.a.upgrades.length).toNumber())
            lastPow = player.a.power
            layerDataReset("a", keepa)

            player.a.upgrades = keptUpg
            if(hasMilestone("m", 4))player.a.power = lastPow.min(new ExpantaNum(2.0000001e20))
        }
    }
})
addLayer("m", {
    name: "Multiplication",
    symbol: "M",
    row: 2,
    position: 0,
    color: "#FF0000",
    branches: ["a"],
    layerShown(){return hasUpgrade("c", 14)},
    startData(){ return {
        unlocked: false,
        points: new ExpantaNum(0),
        resets: new ExpantaNum(0),
        power: new ExpantaNum(0),
        replication: {
            "multiplier": new ExpantaNum(1),
            "interval": new ExpantaNum(10),
            "time": new ExpantaNum(0),
            "amount": new ExpantaNum(0),
            "softcap": {
                "cap1": {
                    "start": new ExpantaNum(1000),
                    "effect": new ExpantaNum(1),
                },
            }
        },
        replicators: new ExpantaNum(1),
        highestReplicators: new ExpantaNum(1),
        best: new ExpantaNum(0),
    }},
    type: "normal",
    baseResource: "Successors",
    baseAmount(){return player.s.successors},
    requires: new ExpantaNum(5e5),
    exponent: new ExpantaNum(0.1),
    resource: "Multiplication Points",
    gainMult(){
        let mult = new ExpantaNum(1)
        mult = applyEffect("upgrades", mult, "m", ["r-23"], "mul", 1)

        return mult
    },
    onPrestige(){
        player.points = new ExpantaNum(0)
        player.s.successors = new ExpantaNum(0)
        player.a.points = new ExpantaNum(0)
        if(!hasMilestone("m", 4))player.a.power = new ExpantaNum(0)
        player.m.resets = player.m.resets.add(1)
    },
    update(){
        if(player.subtabs.m.mainTabs === undefined)player.subtabs.m.mainTabs = "Main"
        if(player.m.replication.time.isNaN())player.m.replication.time = new ExpantaNum(0)
        if(player.m.points.gte(player.m.best))player.m.best = player.m.points
        if(!hasUpgrade("c", 15)){
            player.m.replicators = new ExpantaNum(1)
            player.m.power = new ExpantaNum(0)
        }
        if(player.m.replicators.gte(player.m.highestReplicators))player.m.highestReplicators = player.m.replicators
    },
    getSoftcaps(){
        let cap = player.m.replication.softcap
        if(player.m.replicators.gte(cap.cap1.start)){
            cap.cap1.effect = player.m.replicators.div(cap.cap1.start).mul(10).log10().pow(0.5).max(1)
        }
    },
    getReplicantInterval(){
        let i = new ExpantaNum(10)
        i = applyEffect("upgrades", i, "m", ["r-12"], "sub")
        i = applyEffect("upgrades", i, "m", ["r-23"], "sub", 0)
        i = applyEffect("upgrades", i, "m", ["r-14"], 'mul')
        i = applyEffect("buyables", i, "m", ["r-12"], "mul")

        let cap = player.m.replication.softcap
        i = i.mul(cap.cap1.effect)
        

        player.m.replication.interval = i
        //console.log(player.m.replication.interval.toString())
    },
    getTimeSinceReplicant(diff){
        player.m.replication.time = player.m.replication.time.add(diff)
    },
    getReplicantMult(){
        let m = new ExpantaNum(1)

        m = applyEffect("upgrades", m, "m", ["p-11", "p-14", "r-11", "r-22"], "add")
        m = applyEffect("upgrades", m, "m", ["p-15"], "add", 0)
        m = applyEffect("buyables", m, "m", ["r-11"], "add")

        player.m.replication.multiplier = m
    },
    getReplicantAmount(){
        let a = new ExpantaNum(1)

        if(hasUpgrade("m", "r-21")){a = new ExpantaNum(2)}

        player.m.replication.amount = a.floor()
    },
    getNetMultiplier(){
        let rep = player.m.replication
        return rep.multiplier.pow(rep.amount.div(rep.interval))
    },
    replicate(diff){
        let rep = player.m.replication
        if(rep.interval.lt(30)){
            if(rep.time.gte(rep.interval)){
                rep.time = rep.time.sub(rep.interval)
                player.m.replicators = player.m.replicators.mul(rep.multiplier.pow(rep.amount))
            }
        } else {
            player.m.replicators = player.m.replicators.mul(layers.m.getNetMultiplier().pow(diff))
        }
    },
    getMultPowerGain(){
        let gain = player.m.highestReplicators.log10()

        gain = applyEffect("upgrades", gain, "m", ["r-15", "p-23"], "mul", 0)
        gain = applyEffect("buyables", gain, "m", ["r-13"], "mul")

        return gain
    },
    gainMultPower(diff){
        player.m.power = player.m.power.add(layers.m.getMultPowerGain().mul(diff))
    },
    upgrades: {
        11: {
            title: "Multiplication I",
            description: "Multiply Successor power and Addition points by 2",
            cost: new ExpantaNum(0),
            effect(){
                let eff = new ExpantaNum(2)

                return eff
            },
            effectDisplay(){return `${this.effect()}x to Successor power and Addition points.`}
        },
        12: {
            title: "Multiplication II",
            description: "Best Multiplication Points boost Successor amount.",
            cost: new ExpantaNum(1),
            effect(){
                let eff = player.m.best.pow(0.3).add(1)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Successor amount.`},
            unlocked(){return hasUpgrade("m", 11)}
        },
        13: {
            title: "Multiplication III",
            description: "Multiply Multiplier Per Buy by 1.5.",
            cost: new ExpantaNum(1),
            effect(){
                let eff = new ExpantaNum(1.5)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Multiplier Per Buy.`},
            unlocked(){return hasUpgrade("m", 12)}
        },
        14: {
            title: "Multiplication IV",
            description: "Triple the effects of Addition I and Addition II",
            cost: new ExpantaNum(2),
            effect(){
                let eff = new ExpantaNum(3)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Addition I and II.`},
            unlocked(){return hasUpgrade("m", 13)}
        },
        15: {
            title: "Multiplication V",
            description: `Boost Successor power and Addition Points based on Constant Points.`,
            cost: new ExpantaNum(2),
            effect(){
                let eff = player.c.points.max(1).pow(0.5)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Successor power and Addition points.`},
            unlocked(){return hasUpgrade("m", 14)}
        },
        21: {
            title: `Constant VI`,
            description: `Multiply Constant Points by 1.2. Triple <h3>Addition III</h3>'s effect.`,
            cost: new ExpantaNum(3),
            effect(){
                let eff1 = new ExpantaNum(1.2)
                let eff2 = new ExpantaNum(3)

                return [eff1, eff2]
            },
            effectDisplay(){return `${this.effect()[0]}x to Constant Points, ${this.effect()[1]}x to <h3>Addition III</h3>.`},
            unlocked(){return hasUpgrade("m", 15)}
        },
        22: {
            title: "Multiplication VI",
            description: "Boost Successor and Point gain efficiency by 2.",
            cost: new ExpantaNum(5),
            effect(){
                let eff = new ExpantaNum(2)

                return eff
            },
            effectDisplay(){return `${this.effect()}x to Successor and Point gain efficiencies.`},
            unlocked(){return hasUpgrade("m", 21)}
        },
        23: {
            title: "Multiplication VII",
            description: "Constant Points boost Successor Power again, and boosts Addition Efficiency.",
            cost: new ExpantaNum(10),
            effect(){
                let eff = player.c.points.pow(0.5)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Successor Power and Addition Efficiency.`},
            unlocked(){return hasUpgrade("m", 22)}
        },
        24: {
            title: "Multiplication VIII",
            description: `Boost Addition Upgrade Effectiveness by 2.`,
            cost: new ExpantaNum(20),
            effect(){
                let eff = new ExpantaNum(2)

                return eff
            },
            effectDisplay(){return `${this.effect()}x to Addition Upgrade Effectiveness.`},
            unlocked(){return hasUpgrade("m", 23)}
        },
        25: {
            title: "Constant VII",
            description: "Multiply Constant Points by 1.1.",
            cost: new ExpantaNum(50),
            effect(){
                let eff = new ExpantaNum(1.1)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Constant Points.`},
            unlocked(){return hasUpgrade("m", 24)}
        },
        "p-11": {
            title: "MP I",
            description: "Add 0.01 to the Replication multiplier.",
            cost: new ExpantaNum(0),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff = new ExpantaNum(0.01)

                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to the Replication multiplier.`},
            unlocked(){return hasUpgrade("c", 15)}
        },
        "p-12": {
            title: "MP II",
            description: "Gain more Addition points based on Multiplication power.",
            cost: new ExpantaNum(1),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff = player.m.power.add(1).log10().add(1)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Addition Points.`},
            unlocked(){return hasUpgrade("m", "p-11")}
        },
        "p-13": {
            title: "MP III",
            description: "Successor Power is boosted by 1.5.",
            cost: new ExpantaNum(1.5),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff = new ExpantaNum(1.5)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Successor Power.`},
            unlocked(){return hasUpgrade("m", "p-12")}
        },
        "p-14": {
            title: "MP IV",
            description: "Multiplier Points increase Replication Multiplier.",
            cost: new ExpantaNum(2),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff = player.m.points.max(1).log10().mul(0.005)

                return eff
            },
            effectDisplay(){return `+${format(this.effect(), 3)} to Replication Multiplier`},
            unlocked(){return hasUpgrade("m", "p-13")}
        },
        "p-15": {
            title: "Constant VIII",
            description: "Constant Points increase Replication multiplier. Multiply CP by 1.1.",
            cost: new ExpantaNum(4),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff1 = player.c.points.mul(0.001)
                let eff2 = new ExpantaNum(1.1)

                return [eff1, eff2]
            },
            effectDisplay(){return `+${format(this.effect()[0], 3)} to Replication Multiplier, ${format(this.effect()[1])}x to CP.`},
            unlocked(){return hasUpgrade("m", "p-14")}
        },
        "p-21": {
            title: "MP V",
            description: "Each Addition Dimension boosts it's own multiplier by a base that increases with Multiplier Power.",
            cost: new ExpantaNum(50),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(num){
                let eff = player.m.power.max(1).log10().div(10)

                return eff
            },
            effectDisplay(){return `Addition Dimensions boost their own multiplier by 1 + ${format(this.effect(), 2, true)} * id`},
            unlocked(){return hasUpgrade("m", "p-15") && hasUpgrade('m', "r-15")}
        },
        "p-22": {
            title: "MP VI",
            description: "Addition Efficiency is boosted by 1.5. MP boosts Successor Power.",
            cost: new ExpantaNum(150),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff1 = new ExpantaNum(1.5)
                let eff2 = player.m.power.add(1).log10().div(5).add(1)

                return [eff1, eff2]
            },
            effectDisplay(){return `${format(this.effect()[0])}x to Addition Efficiency, ${format(this.effect()[1])}x to Successor Power.`},
            unlocked(){return hasUpgrade("m", "p-21")}
        },
        "p-23": {
            title: "MP VII",
            description: "Multiplication Power boosts itself. The net Multiplier boosts Successor Power.",
            cost: new ExpantaNum(500),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff1 = player.m.power.max(1).log10().add(1)
                let eff2 = layers.m.getNetMultiplier().pow(10)
                if(eff2.gte(10))eff2 = eff2.pow(0.4)

                return [eff1, eff2]
            },
            effectDisplay(){return `${format(this.effect()[0])}x to Multiplication Power, ${format(this.effect()[1])}x to Successor Power.`},
            unlocked(){return hasUpgrade("m", "p-22")}
        },
        "p-24": {
            title: "MP VIII",
            description: "Unlock the third buyable.",
            cost: new ExpantaNum(2000),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            unlocked(){return hasUpgrade("m", "p-23")},
        },
        "p-25": {
            title: "Constant X",
            description: "Multiply Constant Points by 1.1.",
            cost: new ExpantaNum(5000),
            currencyLayer: "m",
            currencyInternalName: "power",
            currencyDisplayName: "Multiplication Power",
            effect(){
                let eff = new ExpantaNum(1.1)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Constant Points.`},
            unlocked(){return hasUpgrade("m", "p-24")}
        },
        "r-11": {
            title: "Replication I",
            description: "Increase Replication multiplier by 0.005",
            cost: new ExpantaNum(1.1),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let eff = new ExpantaNum(0.005)

                return eff
            },
            effectDisplay(){return `+${format(this.effect(), 3)} to Replication multiplier.`},
            unlocked(){return hasUpgrade("c", 15)}
        },
        "r-12": {
            title: "Replication II",
            description: "Decrease the replication interval by 1 second",
            cost: new ExpantaNum(1.15),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let eff = new ExpantaNum(1)

                return eff
            },
            effectDisplay(){return `-${formatTime(this.effect())} to the Replication interval.`},
            unlocked(){return hasUpgrade("m", "r-11")}
        },
        "r-13": {
            title: "Replication III",
            description: "Unlock a buyable.",
            cost: new ExpantaNum(1.25),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            unlocked(){return hasUpgrade("m", "r-12")}
        },
        "r-14": {
            title: "Replication IV",
            description: "Multiply the replicant interval by 0.9.",
            cost: new ExpantaNum(2),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let eff = new ExpantaNum(0.9)

                return eff
            },
            effectDescription(){return `${format(this.effect())}x to the Replicant interval.`},
            unlocked(){return hasUpgrade("m", "r-13")}
        },
        "r-15": {
            title: "Constant IX",
            description: "CP boosts Multiplication Power gain. RP boosts CP up to 2x.",
            cost: new ExpantaNum(2.5),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let limit = new ExpantaNum(2)
                let eff1 = player.c.points.pow(0.3).add(1)
                let eff2 = player.m.replicators.mul(10).max(1).log10().max(1).log10().add(1).min(limit)

                return [eff1, eff2]
            },
            effectDisplay(){return `${format(this.effect()[0])}x to Multiplication Power, ${format(this.effect()[1])}x to Constant Points`}
        },
        "r-21": {
            title: 'Replication V',
            description: "Unlock a second buyable. Replications occur twice.",
            cost: new ExpantaNum(3.5),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            unlocked(){return hasUpgrade("m", "p-15") && hasUpgrade('m', "r-15")}
        },
        "r-22": {
            title: 'Replication VI',
            description: "Increase the Replication multiplier based on Replication upgrades bought.",
            cost: new ExpantaNum(5),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let effUpg = Object.keys(layers.m.upgrades).filter(upg => upg.startsWith("r-") && hasUpgrade("m", upg)).length
                let eff = new ExpantaNum(0.002).mul(effUpg)

                return eff
            },
            effectDisplay(){return `+${format(this.effect(), 3)} to Replication multiplier.`},
        },
        "r-23": {
            title: "Replication VII",
            description: "The base Replication Interval is reduced by 0.5 seconds. Replicator Points boost Multiplication Points gain.",
            cost: new ExpantaNum(15),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let eff1 = new ExpantaNum(0.5)
                let eff2 = player.m.replicators.mul(10).log10().pow(0.5)

                return [eff1, eff2]
            },
            effectDisplay(){return `-${format(this.effect()[0])} to the base Replication Interval, ${format(this.effect()[1])}x to Multiplication Points gain.`},
            unlocked(){return hasUpgrade("m", "r-22")}
        },
        "r-24": {
            title: "Constant XI",
            description: "Base constant points are increased by 0.3.",
            cost: new ExpantaNum(40),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let eff = new ExpantaNum(0.3)

                return eff
            },
            effectDisplay(){return `+${format(this.effect())} to base Constant Points.`},
            unlocked(){return hasUpgrade("m", "r-23")}
        },
        "r-25": {
            title: "Constant XII",
            description: "Multiplication Power increases Constant Points, up to 2x.",
            cost: new ExpantaNum(100),
            currencyLayer: "m",
            currencyInternalName: "replicators",
            currencyDisplayName: "Replicator Points",
            pay(){
                player.m.replicators = player.m.replicators.div(this.cost)
            },
            effect(){
                let limit = new ExpantaNum(2)
                let eff = player.m.power.max(1).log10().pow(0.5).div(20).add(1).min(limit)

                return eff
            },
            effectDisplay(){return `${format(this.effect())}x to Constant Points.`},
            unlocked(){return hasUpgrade("m", "r-24")}
        }
    },
    buyables: {
        "r-11": {
            title: "Replication Multiplier",
            display(){return `Increase the Replication Multiplier by +${format(this.base(), 3)}. <br> Cost: ${format(this.cost())} Multiplication Power <br> Currently: +${format(this.effect(), 2, true)} to Replication Multiplier <br> Amount: ${format(getBuyableAmount("m", "r-11"))}`},
            base(){
                let base = new ExpantaNum(0.005)

                return base
            },
            costBase(){
                let base = new ExpantaNum(1.4)

                return base
            },
            baseCost(){
                let cost = new ExpantaNum(5)

                return cost
            },
            costExp(){
                let exp = new ExpantaNum(1.2)

                return exp
            },
            cost(x){
                return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))
            },
            effect(x){
                let eff = this.base().mul(x)

                return eff
            },
            buyMax(){
                canMax = false

                if(player.m.power.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.m.power.div(this.baseCost()).logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id))
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.m.power = player.m.power.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("m", "r-13")},
            canAfford(){return player.m.power.gte(this.cost())}
        },
        "r-12": {
            title: "Replication interval",
            display(){return `Multiply the Replication Interval by ${format(this.base(), 3)}. <br> Cost: ${format(this.cost(), 3)} Multiplication power <br> Currently: ${format(this.effect(), 2, true)}x to Replication Interval <br> Amount: ${format(getBuyableAmount("m", "r-12"))}`},
            base(){
                let base = new ExpantaNum(0.975)

                return base
            },
            costBase(){
                let base = new ExpantaNum(1.4)

                return base
            },
            baseCost(){
                let cost = new ExpantaNum(50)

                return cost
            },
            costExp(){
                let exp = new ExpantaNum(1.3)

                return exp
            },
            cost(x){
                return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))
            },
            effect(x){
                let eff = this.base().pow(x)

                return eff
            },
            buyMax(){
                canMax = false

                if(player.m.power.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.m.power.div(this.baseCost()).logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id))
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.m.power = player.m.power.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("m", "r-21")},
            canAfford(){return player.m.power.gte(this.cost())}
        },
        "r-13": {
            title: "Power Boost",
            display(){return `Multiply Multiplication Power gain by ${format(this.base())}. <br> Cost: ${format(this.cost())} Multiplication power <br> Currently: ${format(this.effect())}x to Multiplication Power gain <br> Amount: ${format(getBuyableAmount("m", "r-13"))}`},
            base(){
                let base = new ExpantaNum(1.5)

                return base
            },
            costBase(){
                let base = new ExpantaNum(2)

                return base
            },
            baseCost(){
                let cost = new ExpantaNum(1000)

                return cost
            },
            costExp(){
                let exp = new ExpantaNum(1.5)

                return exp
            },
            cost(x){
                return this.baseCost().mul(this.costBase().pow(x.pow(this.costExp())))
            },
            effect(x){
                let eff = this.base().pow(x)

                return eff
            },
            buyMax(){
                canMax = false

                if(player.m.power.lt(this.baseCost())){
                    return new ExpantaNum(0)
                }
                if(canMax){
                    return player.m.power.div(this.baseCost()).logBase(this.costBase()).pow(new ExpantaNum(1).div(this.costExp())).sub(getBuyableAmount(this.layer, this.id))
                } else{
                    return new ExpantaNum(1)
                }
            },
            buy(){
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax()))
                player.m.power = player.m.power.sub(this.cost(getBuyableAmount(this.layer, this.id).sub(1)))
            },
            unlocked(){return hasUpgrade("m", "p-24")},
            canAfford(){return player.m.power.gte(this.cost())}
        }
    },
    milestones: {
        0: {
            requirementDescription: "4 total Multiplication Points",
            effectDescription: "Keep A milestones on M reset.",
            done(){return player.m.total.gte(4)}
        },
        1: {
            requirementDescription: `7 total Multiplication Points`,
            effectDescription: `Gain 25% of Addition points each second. Keep S upgrades on M reset.`,
            done(){return player.m.total.gte(7)},
            unlocked(){return hasMilestone("m", 0)},
        },
        2: {
            requirementDescription: `10 total Multiplier Points`,
            effectDescription: `Keep 1 A upgrade per M reset, automate the first 4 A dimensions. Automated dimensions cost nothing.`,
            done(){return player.m.total.gte(10)},
            unlocked(){return hasMilestone("m", 1)},
        },
        3: {
            requirementDescription: "15 Total Multiplication Points",
            effectDescription: "Autobuy the final 4 Addition Dimensions.",
            done(){return player.m.total.gte(15)},
            unlocked(){return hasMilestone("m", 2)},
        },
        4: {
            requirementDescription: "20 M resets",
            effectDescription: "Keep up to 2.00e20 Addition Power on M reset.",
            done(){return player.m.resets.gte(20)},
            unlocked(){return hasMilestone("m", 3)},
        }
    },
    tabFormat(){
        let stringa = ``
        if(player.efficiency.addition.gt(0))stringa = `You are gaining Addition points at ${format(player.efficiency.addition)}% efficiency. (+${format(layers.a.getPassiveAdditions())}/s)`
        let stringb = ``
        if(!player.a.upgEffectiveness.eq(100))stringb = `Your Addition Upgrade Effectiveness is ${player.a.upgEffectiveness}%. (Doesn't affect <h3>Constant</h3> upgrades)`
        let rep = player.m.replication
        let cap = rep.softcap
        let stringc = ``
        if(hasUpgrade("m", "r-13"))stringc = `<h2>Buyables</h2>`
        let stringd = ``
        if(player.m.replicators.gte(1000))stringd = `Beyond ${format(cap.cap1.start)} Replicator Points, the Replication Interval gets multiplied by ${format(cap.cap1.effect)}.`
        let stringe = ``
        if(rep.interval.gte(30))stringe = `Due to the Replication interval being too large, your Replication Points are multiplied by the net multiplier per second.`
        let stringf = ``
        if(rep.interval.lt(30))stringf = `Time since last replication: ${formatTime(rep.time)}`
        //for(item in rep){
        //    console.log(rep[item].toString(), item)
        //}
        return {
            "Main": {
                content: [
                    ["display-text", `You have ${colorText("m", {"whole": true})} Multiplication Points.`],
                    "prestige-button",
                    ["display-text", `You have ${format(player.s.successors)} Successors.`],
                    ["display-text", `You have made a total of ${format(player.m.total)} Multiplication Points.`],
                    ["display-text", `Your best Multiplication Points was ${format(player.m.best)} Multiplication Points.`],
                    ["display-text", `You have done ${format(player.m.resets)} Multiplication Resets.`],
                    "blank",
                    ["display-text", `Your Successor power is ${format(player.s.power)}, which multiplies Successor effectiveness and amount.`],
                    ["display-text", stringa],
                    ["display-text", stringb],
                    "blank",
                    "milestones",
                    "blank",
                    ...generateComponent("upgrades", 2),
                ]
            },
            "Replication": {
                unlocked: hasUpgrade("c", 15),
                content: [
                    ["display-text", `You have ${colorText("m", {"whole": true})} Multiplication Points.`],
                    "prestige-button",
                    ["display-text", `You have ${format(player.s.successors)} Successors.`],
                    ["display-text", `You have made a total of ${format(player.m.total)} Multiplication Points.`],
                    ["display-text", `Your best Multiplication Points was ${format(player.m.best)} Multiplication Points.`],
                    ["display-text", `You have done ${formatWhole(player.m.resets)} Multiplication Resets.`],
                    "blank",
                    ["display-text", `You have ${colorText("m", {name:"power"})} Multiplication Power. (+${format(layers.m.getMultPowerGain())}/s, based on highest Replication Points.)`],
                    ["display-text", `You have ${colorText("m", {name:"replicators"})} Replicator Points.`],
                    "blank",
                    ["display-text", `Your Replicator Points are getting multiplied by ${format(rep.multiplier, 3)} each replication.`],
                    ["display-text", `The next replication occurs ${formatWhole(rep.amount)} times.`],
                    ["display-text", `The replication interval is ${formatTime(rep.interval)}`],
                    ["display-text", stringd],
                    ["display-text", stringe],
                    ["display-text", stringf],
                    ["display-text", `Your net multiplier per second is: x${format(layers.m.getNetMultiplier(), 3)}/s`],
                    "blank",
                    ["display-text", stringc],
                    ...generateComponent("buyables", 1, {"prefix":"r-"}),
                    "blank",
                    ["display-text", "<h2>Power upgrades</h2>"],
                    ...generateComponent("upgrades", 2, {"prefix":"p-"}),
                    "blank",
                    ["display-text", "<h2>Replication upgrades</h2>"],
                    ...generateComponent("upgrades", 2, {"prefix":"r-"})
                ]
            }
        }
    },
    hotkeys: [{key: "m", description: "m: Reset for Multiplication", onPress(){if(player.m.unlocked)doReset("m")}, unlocked(){return player.m.unlocked}}]
})
