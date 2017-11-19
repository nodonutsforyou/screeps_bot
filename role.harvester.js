var roomGeo = require('roomGeo');

var roleHarvester = {

    deside: function(creep) {
        var status = creep.memory.status
        switch (status) {
            case 'builder':
                roleHarvester.builder(creep);
                break;
            case 'update':
                roleHarvester.updater(creep);
                break;
            case 'store':
                roleHarvester.store(creep);
                break;
            case 'harvester':
                roleHarvester.harvester(creep);
                break;
            case 'task':
                roleHarvester.doTask(creep);
                break;
            default:
                creep.memory.status = 'harvester';
                break;
        }
    },
    
    freeTasks: function(r) {
        var c = 0;
        for(var i=0; i<r.memory.tasks.length; i++) {
            if (r.memory.tasks[i].taskCreep === undefined) {
                c++
            }
        }
        return c;
    },
    
    chooseMostImportantTask: function(creep) {
        var c = -1;
        var task = undefined
        for(var i=0; i<creep.room.memory.tasks.length; i++) {
            var t = creep.room.memory.tasks[i]
            if (t.taskCreep === undefined && t.priority>c) {
                c = t.priority;
                task = i;
            }
        }
        if (c>=0) {
            creep.memory.task = task;
            creep.room.memory.tasks[task].taskCreep = creep;
            return 0; 
        }
        return -1;
    },
    
    doTask: function(creep) {
        var t = creep.memory.task
        if (t === undefined || creep.room.memory.tasks[t].taskCreep === undefined) {
            roleHarvester.revaluate(creep)
        } else if (creep.room.memory.tasks[t].taskCreep.id != creep.id) {
            console.log("not mathces:", creep.room.memory.tasks[t].taskCreep.id, creep.id);
            roleHarvester.revaluate(creep)
        } else {
            var st = creep.room.memory.tasks[t].taskName
            switch (st) {
                case 'update':
                    roleHarvester.updater(creep);
                    break;
                case 'buildExtensions':
                    roleHarvester.taskBuildExtensions(creep);
                    break;
                default:
                    creep.say('task '+st);
                    break;
            }
        }
    },
    
    cancelMyTask: function(creep) {
        if(creep.memory.task != undefined) {
            console.log('cancel Task');
            if (creep.room.memory.tasks[creep.memory.task].taskCreep != undefined &&
                creep.room.memory.tasks[creep.memory.task].taskCreep.id == creep.id) {
                creep.room.memory.tasks[creep.memory.task].taskCreep = undefined;
            }
            creep.memory.task = undefined;
        }
    },
    
    revaluate: function(creep) {
        roleHarvester.cancelMyTask(creep);
        //1 - harvest
        if(creep.carry.energy < creep.carryCapacity) {
            creep.memory.status = 'harvester'
            creep.say('harvest');
            return;
        }
        //2 - take tasks
        if(roleHarvester.freeTasks(creep.room)>0) {
            if (roleHarvester.chooseMostImportantTask(creep) == 0) {
                creep.memory.status = 'task'
                creep.say('@ task' + creep.memory.task);
                return;
            }
        }
        //3 - build
        if(creep.room.find(FIND_CONSTRUCTION_SITES).length) {
            creep.memory.status = 'builder'
            creep.say('builder');
            return;
        }
        //4 - update
        creep.memory.status = 'update'
        creep.say('update');
        return;
    },
    
    store: function(creep) {
        if(creep.carry.energy == 0) {
            roleHarvester.revaluate(creep);
            return;
        }
        if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
                var tar = creep.pos.findClosestByRange(targets);
                if(creep.transfer(tar, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(tar, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                roleHarvester.updater(creep);
            }
        } else {
            roleHarvester.revaluate(creep);
        }
    },
    
    
    harvester: function(creep) {
	    if(creep.carry.energy < creep.carryCapacity) {
            if (creep.memory.targetSource) {
                var sor = Game.getObjectById(creep.memory.targetSource);
                if(creep.harvest(sor) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sor, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
	            console.log('spoil');
                var sources = creep.room.find(FIND_SOURCES);
                creep.memory.targetSource = sources[0];
            }
        }
        else if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
            creep.memory.status = 'store'
            creep.say('store');
            roleHarvester.store(creep);
        } else {
            roleHarvester.revaluate(creep);
        }
    },
    
    updater: function(creep) {
	    if(creep.carry.energy > 0) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            roleHarvester.revaluate(creep);
        }
    },
    
    taskBuildExtensions: function(creep) {
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
	    if(targets.length == 0) {
	        var cr = false;
	        var i = 1;
	        while (!cr && i< 10) {
	            i++;
	            var p = roomGeo.getLocation();
	            console.log('try' + p[0] + ':' + p[1]);
                var res = creep.room.createConstructionSite( p[0], p[1], STRUCTURE_EXTENSION );
	            console.log('res' + res);
	            if (res == ERR_RCL_NOT_ENOUGH) {
                    res = creep.room.createConstructionSite( p[0], p[1], STRUCTURE_TOWER );
	                console.log('res tower' + res);
	                if (res == ERR_RCL_NOT_ENOUGH) {
                        res = creep.room.createConstructionSite( p[0], p[1], STRUCTURE_ROAD );
	                }
	            }
                cr = res == 0; //TODO more results
	        }
	        console.log('placed!');
	    }
	    roleHarvester.builder(creep);
	},
    
    builder: function(creep) {
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
	    if(creep.carry.energy == 0 || targets.length == 0) {
            roleHarvester.revaluate(creep);
	    } else if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
	},

    /** @param {Creep} creep **/
    run: function(creep) {
        roleHarvester.deside(creep)
	}
};

module.exports = roleHarvester;