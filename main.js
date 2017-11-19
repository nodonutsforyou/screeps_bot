var roleHarvester = require('role.harvester');
var roleSetler = require('role.setler');
var roleTower = require('role.tower');
var gamePlan = require('gamePlan');

module.exports.loop = function () {
    // console.log('tic');
    
    for(var name in Game.rooms) {
        var st = Game.rooms[name].find(FIND_MY_SPAWNS);
        var s = st[0];
        if (s) {
            if (Game.time % 10 == 0) {
                gamePlan.plan(Game.rooms[name])
            }
            gamePlan.act(Game.rooms[name])
            var towers = Game.rooms[name].find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER);
                }
            });
            for(var i=0; i < towers.length; i++) {
                var tower = towers[i];
                roleTower.run(tower);
            }
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'setler') {
            roleSetler.run(creep);
        }
    }
}