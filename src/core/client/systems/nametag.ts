import * as alt from 'alt-client';
import * as native from 'natives';
import { Events_Misc } from '../../shared/enums/events';
import { distance2d } from '../../shared/utility/vector';

const drawDistance = 50;
let interval;

alt.onServer(Events_Misc.StartTicks, handleStart);

function handleStart() {
    interval = alt.setInterval(drawNametags, 0);
}

/**
 * Toggled on through an interval.
 */
function drawNametags() {
    if (alt.Player.local.isMenuOpen) {
        return;
    }

    for (let i = 0, n = alt.Player.all.length; i < n; i++) {
        let player = alt.Player.all[i];
        if (!player.valid) {
            continue;
        }

        if (player.vehicle && alt.Player.local.vehicle !== player.vehicle) {
            continue;
        }

        if (player.scriptID === alt.Player.local.scriptID) {
            continue;
        }

        let name = player.getSyncedMeta('Name');
        if (!name || name === null || name === undefined) {
            continue;
        }

        name = name.replace('_', ' ');

        if (!name) {
            continue;
        }

        if (!native.hasEntityClearLosToEntity(alt.Player.local.scriptID, player.scriptID, 17)) {
            continue;
        }

        let dist = distance2d(player.pos, alt.Player.local.pos);
        if (dist > drawDistance) {
            player.inVisionTime = null;
            continue;
        }

        if (player.inVisionTime === null || (player.inVisionTime === undefined && isNaN(player.inVisionTime))) {
            player.inVisionTime = Date.now() + 5000;
        }

        if (Date.now() < player.inVisionTime) {
            name = '';
        }

        const isChatting = player.getSyncedMeta('Chatting');
        const pos = { ...native.getPedBoneCoords(player.scriptID, 12844, 0, 0, 0) };
        pos.z += 0.75;

        let scale = 1 - (0.8 * dist) / drawDistance;
        let fontSize = 0.6 * scale;

        const entity = player.vehicle ? player.vehicle.scriptID : player.scriptID;
        const vector = native.getEntityVelocity(entity);
        const frameTime = native.getFrameTime();

        // Names
        native.setDrawOrigin(
            pos.x + vector.x * frameTime,
            pos.y + vector.y * frameTime,
            pos.z + vector.z * frameTime,
            0
        );

        const modifiedName = isChatting ? `(${player.id}) ${name}~r~*` : `(${player.id}) ${name}`;

        native.beginTextCommandDisplayText('STRING');
        native.setTextFont(4);
        native.setTextScale(fontSize, fontSize);
        native.setTextProportional(true);
        native.setTextCentre(true);
        native.setTextColour(255, 255, 255, 255);
        native.setTextOutline();
        native.addTextComponentSubstringPlayerName(modifiedName);
        native.endTextCommandDisplayText(0, 0, 0);
        native.clearDrawOrigin();
    }
}
