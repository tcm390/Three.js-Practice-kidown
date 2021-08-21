

let all_player_data = [];
let objectsToUpdate = [];

let elapsedTime = 0;
let test_plane_size = 0;

self.addEventListener('message', function (e) {
    if (e.data.type === 'assign_plane') {
        let assign_plane = [];
        all_player_data = e.data.all_player_data;
        objectsToUpdate = e.data.objectsToUpdate;
        elapsedTime = e.data.elapsedTime;
        test_plane_size = e.data.test_plane_size;
        for (let i = 0; i < objectsToUpdate.length; i++) {
            objectsToUpdate[i].positiony = (elapsedTime - objectsToUpdate[i].start_time) * 10 - 22.5;
            if (objectsToUpdate[i].positiony <= 22.5) {
                for (let j = 0; j < all_player_data.length; j++) {

                    if (Math.abs(all_player_data[j].positiony - objectsToUpdate[i].positiony - 1) < 0.4) {
                        if (all_player_data[j].positionx < objectsToUpdate[i].positionx + test_plane_size / 1.8
                            && all_player_data[j].positionx > objectsToUpdate[i].positionx - test_plane_size / 1.8) {

                            assign_plane.push({ player: j, plane: i });
                            //this.console.log(objectsToUpdate[i].positiony);

                        }
                    }
                    if (all_player_data[j].plane_id === objectsToUpdate[i].id
                        && objectsToUpdate[i].positiony - all_player_data[j].positiony >= 3) {
                        assign_plane.push({ player: j, plane: i });
                    }

                }
            }
            else if (objectsToUpdate[i].positiony > 22.5) {
                objectsToUpdate.splice(i, 1);
            }

        }
        const assign_data = {
            type: 'assign_plane',
            data: assign_plane
        }
        self.postMessage(assign_data);
    }



}, false);