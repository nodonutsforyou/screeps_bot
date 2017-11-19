var roleTower = {

    run: function(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            console.log('cloHost', closestHostile)
            res = tower.attack(closestHostile);
            console.log('tower res', res)
        }
        
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax && (structure.structureType != STRUCTURE_RAMPART || structure.hits<1000)
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
	}
};

module.exports = roleTower;