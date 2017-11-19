var util = {

    countStructures: function(room, structure) {
        var targets = room.find(FIND_STRUCTURES, {
                    filter: (str) => {
                        return (str.structureType == structure);
                    }
            });
        return targets.length;
	}
};

module.exports = util;