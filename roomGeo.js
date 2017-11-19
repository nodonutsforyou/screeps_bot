var roomGeo = {

    getLocation: function(r) {
        var i = r.memory.locationI;
        var s = r.find(FIND_MY_SPAWNS)[0];
        if (i === undefined) {
            r.memory.locationI = 1;
            i = 1;
        } else {
	       // console.log('i',i);
            i++;
            r.memory.locationI = i;
        }
        if (i>100) {
            i = 1;
            r.memory.locationI = i;
        }
        var k = Math.floor(i / 4)+1;
        var m = i%4;
        switch(m) {
            case 0:
                var x = s.pos.x + k;
                var y = s.pos.y + k;
                break;
            case 1:
                var x = s.pos.x - k;
                var y = s.pos.y + k;
                break;
            case 2:
                var x = s.pos.x + k;
                var y = s.pos.y - k;
                break;
            case 3:
                var x = s.pos.x - k;
                var y = s.pos.y - k;
                break;
        }
        var a = [x,y];
	    console.log('xy',x, y);
        return a;
	},

    getLocationRoad: function(r, i) {
        var sum = 0;
        // console.log('roadPaths:', r.memory.roadPaths);
        for(var j = 0; j < r.memory.roadPaths.length; j++) {
            if(i<sum + r.memory.roadPaths[j]['l']) {
                var a = [r.memory.roadPaths[j]['path'][i-sum]['x'],r.memory.roadPaths[j]['path'][i-sum]['y']];
	           // console.log('i', i, 'is', i-sum, 'j', j, 'len', r.memory.roadPaths[j]['l'], 'xy',a);
                return a;
            }
            sum+=r.memory.roadPaths[j]['l'];
        }
        return -1;
	},
	
	emptySpaceNearBy: function(room, rp) {
	    var free = 0;
	    var local = new Array(8);
	    var nearBy = room.lookForAtArea(LOOK_TERRAIN, rp.y - 1, rp.x - 1, rp.y + 1, rp.x + 1, true)
	    for(var i=0; i<nearBy.length; i++) {
	        if (nearBy[i].terrain == 'plain') free++;
	        if (nearBy[i].terrain == 'swamp') free++;
	    }
	    return free;
	}
};

module.exports = roomGeo;