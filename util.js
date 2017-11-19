var util = {

    countStructures: function(room, structure) {
        var targets = room.find(FIND_STRUCTURES, {
                    filter: (str) => {
                        return (str.structureType == structure);
                    }
            });
        return targets.length;
	},
	
	drawPath: function(room, path) {
	    for(var i = 1; i<path.length; i++) {
	        room.visual.line(path[i-1]['x'], path[i-1]['y'], path[i]['x'], path[i]['y'])
	    }
	}
};

module.exports = util;