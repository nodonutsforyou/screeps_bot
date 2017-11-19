var util = require('util');

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
	
	gerNearRoomNames: function(r) {
	    var n = r.name;
	    console.log(n);
	    var regexp = /^([WE])(\d+)([NS])(\d+)$/;
	    var m = regexp.exec(n);
	    var WE = m[1]
	    var NS = m[3]
	    var x = parseInt(m[2]);
	    var y = parseInt(m[4]);
	    return [WE+x+NS+(y+1),
	        WE+(x-1)+NS+y,
	        WE+x+NS+(y-1),
	        WE+(x+1)+NS+y,
	        ];
	},
    
    geLocationRampparts: function(r) {
        var localRooms = roomGeo.gerNearRoomNames(r);
        for (var k=0; k<localRooms.length; k++) {
            var otherRoomPos = new RoomPosition(25,25, localRooms[k]);
            console.log(otherRoomPos);
            var targets = r.find(FIND_STRUCTURES, {filter: (structure) => {return (structure.structureType == STRUCTURE_RAMPART);} });
            var pathSpCont = r.findPath(r.controller.pos, otherRoomPos, {ignoreCreeps:true,
                costCallback: function(roomName, costMatrix) {
                    if(roomName == r.name) {
                        for(var i = 0; i<targets.length; i++) {
                            costMatrix.set(targets[i].pos.x, targets[i].pos.y, 255);
                        }
                    }
                }
            });
            if (pathSpCont[pathSpCont.length-1]['x'] == 0 ||
                pathSpCont[pathSpCont.length-1]['x'] == 49 ||
                pathSpCont[pathSpCont.length-1]['y'] == 0 ||
                pathSpCont[pathSpCont.length-1]['y'] == 49) {
                util.drawPath(r, pathSpCont);
                var goodPos = false;
                for (var i = 5; !goodPos && i < pathSpCont.length; i ++) { //TODO 5 is a magic number
                    var p = [ pathSpCont[pathSpCont.length-i]['x'], pathSpCont[pathSpCont.length-i]['y'] ]
                    if ( p[0] < 48 && p[0] > 1  &&  p[1] < 48  &&  p[1] > 1 ) goodPos = true; //TODO actual reason is not a close rang - it is close arrow
                }
                if (i<pathSpCont.length) {
                    console.log('Ramp xy', p);
                    return p;
                }
            }
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