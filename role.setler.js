var roleSetler = {

    deside: function(creep) {
        var status = creep.memory.status
        switch (status) {
            case 'gatherEnergy':
                roleSetler.gatherEnergy(creep);
                break;
            case 'settle':
                roleSetler.setle(creep);
                break;
            default:
                creep.memory.status = 'gatherEnergy';
                break;
        }
    },
    
    setle: function(creep) {
        creep.say('settle')
        var exitR = Game.getObjectById('946b07739d98cb7');
        var res = creep.claimController(exitR);
        console.log(exitR, res);
        if(res == ERR_NOT_IN_RANGE) {
            creep.moveTo(exitR, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    },
    
    gatherEnergy: function(creep) {
        creep.say('Gather for settle')
	    if(creep.carry.energy < creep.carryCapacity) {
	        var sources = creep.room.find(FIND_SOURCES);
            var tar = creep.pos.findClosestByPath(sources);
            if(creep.harvest(tar) == ERR_NOT_IN_RANGE) {
                creep.moveTo(tar, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
            creep.memory.status = 'settle';
        }
    },

    run: function(creep) {
        roleSetler.deside(creep)
	}
};

module.exports = roleSetler;