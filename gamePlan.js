var roomGeo = require('roomGeo');
var util = require('util');

var gamePlan = {
    
    tasks: function(r) {
        var version = 11;
        if (r.memory.version != version) {
            r.memory.version = version;
            r.memory.tasks = new Array();
            var s = r.find(FIND_MY_SPAWNS)[0];
            var sources = r.find(FIND_SOURCES);
            console.log(sources);
            var frSp = 0;
            for(var i = 0; i < sources.length; i++) {
                frSp += roomGeo.emptySpaceNearBy(r, sources[i].pos);
            }
            r.memory.freeSpaceAroundEnergy = frSp;
            
            var newTask = {taskName:'update', taskTarget:r.controller, taskCreep:undefined, priority:100};
            console.log("new task: ", newTask);
            r.memory.tasks.push(newTask);
            newTask = {taskName:'repairRamparts', taskTarget:s, taskCreep:undefined, priority:10};
            console.log("new task: ", newTask.taskName);
            r.memory.tasks.push(newTask);
        } else {
            console.log(Game.time);
        }
    },
    
    placeConstruction: function(r, struc) {
        var cr = false;
        var i = -1;
        while (!cr && i< 1000) {
            i++;
            switch(struc) {
                case(STRUCTURE_ROAD):
                    var p = roomGeo.getLocationRoad(r, i);
                    break;
                case(STRUCTURE_RAMPART):
                    var p = roomGeo.geLocationRampparts(r);
                    i+=998;
                    break;
                default:
                    var p = roomGeo.getLocation(r);
            }
            if (p == -1) return -1;
            // console.log('try' + p[0] + ':' + p[1]);
            var res = r.createConstructionSite( p[0], p[1], struc );
            // console.log('res' + res);
            cr = res == 0; //TODO more results
        }
        console.log('placed!');
        return 0;
    },
    
    roadsPaths: function(sp, r) {
        r.memory.roadPaths = new Array();
        var pathSpCont = r.findPath(sp.pos, r.controller.pos, {ignoreCreeps:true});
        var obj = {i:0, l:pathSpCont.length, path:pathSpCont};
        r.memory.roadPaths.push(obj);
        var sources = r.find(FIND_SOURCES);//todo cut empty ones
        for(var j=0; j<sources.length; j++) {
            var pathSpSource = r.findPath(sp.pos, sources[j].pos, {ignoreCreeps:true});
            var obj = {i:0, l:pathSpSource.length, path:pathSpSource};
            r.memory.roadPaths.push(obj);
        }
        // for(var j=0; j<sources.length; j++) {
        //     var pathSpSource = r.findPath(r.controller.pos, sources[j].pos, {ignoreCreeps:false});
        //     var obj = {i:0, l:pathSpSource.length, path:pathSpSource};
        //     r.memory.roadPaths.push(obj);
        // }
    },
    
    
    constructionPlan: function(r){
        r.memory.locationI = 1;
        var s = r.find(FIND_MY_SPAWNS)[0];
        if (s  != undefined) {
            var targets = r.find(FIND_CONSTRUCTION_SITES);
            if(targets.length == 0) {
                r.memory.constractionPlan = new Array();
                var l = r.controller.level;
                var extCount = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][l]
                var extExCount = util.countStructures(r, STRUCTURE_EXTENSION)
                console.log('extensions ' + extExCount + '/' + extCount);
                if (extExCount<extCount) {
                    gamePlan.placeConstruction(r, STRUCTURE_EXTENSION);
                } else {
                    var towerCount = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][l]
                    var towerExCount = util.countStructures(r, STRUCTURE_TOWER)
                    console.log('towers ' + towerExCount + '/' + towerCount);
                    if (towerExCount<towerCount) {
                        gamePlan.placeConstruction(r, STRUCTURE_TOWER);
                    } else {
                        // console.log('road');
                        gamePlan.roadsPaths(s, r);
                        var st = gamePlan.placeConstruction(r, STRUCTURE_ROAD);
                        if (st <0 ) {
                            console.log('roads done');
                            var st = gamePlan.placeConstruction(r, STRUCTURE_RAMPART);
                            if (st <0 ) {
                                console.log('ramparts done');
                            }
                        }
                    }
                }
	        } else {
                console.log('construction undeway');
	        }
        } else {
            console.log('no spawner');
        }
    },

    plan: function(r) {
        gamePlan.tasks(r);
        var e = r.energyAvailable;
        var emax = r.energyCapacityAvailable;
        r.memory.e = e;
        r.memory.emax = emax;
        r.memory.workerBodayparts = gamePlan.getWorkerCreepBodyparts(emax);
        r.memory.setlerBodayparts = gamePlan.getSetlerCreepBodyparts(emax); //todo count only if enough energy
        var sources = r.find(FIND_SOURCES);//todo cut empty ones - already done?
        sources.sort(function(a,b) {
            var va = a.pos.x + a.pos.y;
            var vb = b.pos.x + b.pos.y;
            return va>vb ? 1 : vb>va ? -1 : 0
        })
        var i = 0;
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            creep.memory.targetSource = sources[i].id; //todo optimaze to have mod operation
            i++;
            if (i >= sources.length) i = 0;
        }
        for(i=0; i<r.memory.tasks.length; i++) {
            var tc = r.memory.tasks[i].taskCreep
            if (r.memory.tasks[i].taskCreep!=undefined) {
                var obj = Game.getObjectById(r.memory.tasks[i].taskCreep.id);
                if (obj === null || obj === undefined || obj.ticksToLive<=0) {
                    console.log('clean task - worker dead');
                    r.memory.tasks[i].taskCreep = undefined;
                }
            }
        }
        gamePlan.constructionPlan(r);
    },

    getWorkerCreepBodyparts: function(energy) {
        var init = [WORK,CARRY,MOVE];
        var e = energy - 200;
        for(; e >= 200; e-=200) {
            init.push(WORK,CARRY,MOVE);
        }
        if(e >= 100) {
            init.push(WORK);
            e-=100;
        }
        if(e >= 50) {
            init.push(MOVE);
            e-=50;
        }
        init.sort();
        return init;
    },

    getSetlerCreepBodyparts: function(energy) {
        var init = [CLAIM,MOVE];
        var e = energy - BODYPART_COST[CLAIM] - BODYPART_COST[MOVE];
        for(; e >= 200; e-=200) {
            init.push(WORK,CARRY,MOVE);
        }
        if(e >= 100) {
            init.push(WORK);
            e-=100;
        }
        if(e >= 50) {
            init.push(MOVE);
            e-=50;
        }
        init.sort();
        return init;
    },

    getCloseCombatCreepBodyparts: function(energy) {
        var init = [ATTACK,MOVE];
        var s = BODYPART_COST[ATTACK] + BODYPART_COST[MOVE]
        var e = energy - s;
        for(; e >= s; e-= s) {
            init.push(ATTACK,MOVE);
        }
        if(e >= BODYPART_COST[MOVE]) {
            init.push(MOVE);
            e-=BODYPART_COST[MOVE];
        }
        for(; e >= BODYPART_COST[TOUGH]; e-= BODYPART_COST[TOUGH]) {
            init.push(TOUGH);
        }
        init.sort();
        return init;
    },

    act: function(r) {
        var st = r.find(FIND_MY_SPAWNS);
        var s = st[0];
        if (s  != undefined) {
            // var p = roomGeo.geLocationRampparts(r);
            // console.log('construction undeway', p);
            
            var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
            var setlers = _.filter(Game.creeps, (creep) => creep.memory.role == 'setler'); //todo count only if enough energy
    
            if(harvesters.length < r.memory.freeSpaceAroundEnergy) {
                var newName = 'Harvester' + Game.time;
                var newSpawn = s.spawnCreep(r.memory.workerBodayparts, newName, 
                {memory: {role: 'harvester'}});
                if (newSpawn == 0) {
                    console.log('Spawning new harvester: ' + newName);   
                }
            }
            if(harvesters.length < 2) {
                var newName = 'Harvester' + Game.time;
                var newSpawn = s.spawnCreep(gamePlan.getWorkerCreepBodyparts(r.energyAvailable), newName, 
                {memory: {role: 'harvester'}});
                if (newSpawn == 0) {
                    console.log('Spawning new harvester: ' + newName);   
                }
            }
    
            if(setlers.length < -1) { //todo count only if enough energy
                var newName = 'Setler' + Game.time;
                var newSpawn = s.spawnCreep(r.memory.setlerBodayparts, newName, 
                {memory: {role: 'setler'}});
                if (newSpawn == 0) {
                    console.log('Spawning new setler: ' + newName);   
                }
            }
        
            if(s.spawning) { 
                var spawningCreep = Game.creeps[s.spawning.name];
                r.visual.text(
                    '???' + spawningCreep.memory.role,
                    s.pos.x + 1, 
                    s.pos.y, 
                    {align: 'left', opacity: 0.8});
            }
        }
	}
};

module.exports = gamePlan;