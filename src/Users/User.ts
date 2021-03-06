import { Player } from "@bhmb/bot";
import { UserManager } from "./UserManager";
import { Permissions, PermissionsSaveData } from "../Permissions/Permissions";
import { Group } from "../Groups/Group";

export type PlayerResolvable = User|Player|string;

export interface UserData {
  player: Player|string;
  permissions?: PermissionsSaveData;
}

export interface UserSaveData {
  player: string;
  permissions: PermissionsSaveData;
}

export class User {

  manager: UserManager;

  player: Player;

  permissions: Permissions;

  type: "User";

  constructor (userData : UserData, manager : UserManager) {
    this.manager = manager;
    if (typeof userData.player === "string") {
      this.player = this.manager.management.extension.world.getPlayer(userData.player);
    } else {
      this.player = userData.player;
    }

    this.permissions = new Permissions(this, userData.permissions);
    this.type = "User";
  }

  /**
   * Delete this user's permissions.
   */
  delete () : boolean {
    return this.manager.delete(this);
  }

  /**
   * Save
   */
  save () {
    return this.manager.save();
  }

  get groups () {
    const groups = Array.from((this.manager.management.groups.get() as Map<number, Group>).values()).filter(group => Array.from(group.players).some(player => player.name === this.name));
    
    if (this.player.isAdmin) {
      groups.push(this.manager.management.groups.get("Administrator") as Group);
    }
    if (this.player.isMod) {
      groups.push(this.manager.management.groups.get("Moderator") as Group);
    }
    groups.push(this.manager.management.groups.get("Anyone") as Group);
    
    return groups;
  }

  /**
   * Get the name of the user.
   */
  get name () {
    return this.player.name;
  }

  /**
   * Get a JSON object that can be saved to storage
   */
  get data () : UserSaveData {
    return {
      player: this.name,
      permissions: this.permissions.data
    };
  }
};