var roleTower = {

    run: function(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            console.log('cloHost', closestHostile)
            res = tower.attack(closestHostile);
            console.log('tower res', res)
        } else {
            var damagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: (creep) => creep.hits < creep.hitsMax
                });
            if (damagedCreep) {
                tower.heal(damagedCreep);
            } else if (tower.energy > tower.energyCapacity/2) {
                var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax && (structure.structureType != STRUCTURE_RAMPART || structure.hits<1000)
                });
                if(closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                }
            }
        }
	}
};

module.exports = roleTower;