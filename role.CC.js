var roleCC = {

    run: function(creep) {
        var closestHostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            creep.say('atack');
            res = creep.attack(closestHostile);
            switch(res) {
                case (OK):
                    break;
                case (ERR_NOT_IN_RANGE):
                    creep.moveTo(closestHostile, {visualizePathStyle: {stroke: '#ff0000'}});
                    break;
                default:
                    console.log('atack', res);
                    break;
            }
        } else {
            creep.say('no target');
            var closestSpawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
            if(closestSpawn) {
                res = closestSpawn.recycleCreep(creep);
                switch(res) {
                    case (OK):
                        break;
                    case (ERR_NOT_IN_RANGE):
                        creep.moveTo(closestSpawn, {visualizePathStyle: {stroke: '#ffffff'}});
                        break;
                    default:
                        console.log('recycle', res);
                        break;
                }
            }
        }
	}
};

module.exports = roleCC;