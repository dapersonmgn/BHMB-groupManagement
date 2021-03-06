import { Player } from "@bhmb/bot";
import { GroupManager } from "./GroupManager";
import { Permissions, PermissionsSaveData } from "../Permissions/Permissions";
import { User } from "../Users/User";
import { Permission } from "../Permissions/Permission";

export interface GroupData {
  name: string;
  permissions?: PermissionsSaveData;
  players?: (Player|string)[];
  managed?: boolean;
};

export interface GroupConstructorData extends GroupData {
  id: number;
};

export interface GroupSaveData {
  id: number;
  name: string;
  permissions: PermissionsSaveData
  players: string[],
  managed: boolean
};

export type GroupResolvable = Group|string|number;

export class Group {

  id: number;

  name: string;

  permissions: Permissions;

  players: Set<Player>;

  managed: boolean;

  manager: GroupManager;

  tab?: HTMLDivElement;

  type: "Group";

  constructor (groupData : GroupConstructorData, manager : GroupManager) {
    this.manager = manager;
    this.name = groupData.name;
    this.id = groupData.id;
    this.permissions = new Permissions(this, groupData.permissions);
    this.players = new Set((groupData.players || []).map(playerOrName => typeof playerOrName === "string" ? this.manager.management.extension.world.getPlayer(playerOrName) : playerOrName));
    this.managed = groupData.managed || false;
    this.tab = manager.management.ui.addGroup(this);
    this.type = "Group";

    if (this.manager.management.users) {
      for (const player of this.players) {
        const user = this.manager.management.users.get(player);
        user.groups.push(this);
      }
    }

  }

  /**
   * Rename this group, will return if the operation was successful.
   * @param newName New name
   */
  rename (newName : string) : boolean {
    return this.manager.rename(this, newName);
  }

  /**
   * Add a player to this group. Will return if the operation was successful.
   * @param playerResolvable 
   */
  addPlayer (playerResolvable : Player|User|string) {
    const p = this.manager.management.extension.world.getPlayer(typeof playerResolvable === "string" ? playerResolvable : playerResolvable.name);
    if (this.players.has(p) || this.managed) {
      return false;
    } else {
      this.players.add(p);
      this.save();
      return true;
    }
  }

  /**
   * Remove a player from this group. Will return if the operation was successful.
   * @param playerResolvable 
   */
  removePlayer (playerResolvable : Player|User|string) {
    const p = this.manager.management.extension.world.getPlayer(typeof playerResolvable === "string" ? playerResolvable : playerResolvable.name);
    if (!this.managed && this.players.delete(p)) {
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Change the UI to mark this permission as selected/unselected.
   * @param permission 
   */
  permissionUIAllow (permission : Permission, check : boolean) {
    if (this.tab) {
      const input = this.tab.querySelector(`input[data-permission="${permission.id}"]`) as HTMLInputElement;
      input.checked = check;
    }
  }

  /**
   * Change the UI to mark this permission as disabled/not disabled.
   * @param permission 
   */
  permissionUIDisable (permission : Permission, disable : boolean) {
    if (this.tab) {
      const input = this.tab.querySelector(`input[data-permission="${permission.id}"]`) as HTMLInputElement;
      input.disabled = disable;
    }
  }

  /**
   * Delete this group, will return if the operation was successful.
   */
  delete () : boolean {
    return this.manager.delete(this);
  }

  save () {
    return this.manager.save();
  }

  /**
   * Get data about the group that can be saved in storage.
   */
  get data () : GroupSaveData {
    return {
      id: this.id,
      name: this.name,
      permissions: this.permissions.data,
      players: Array.from(this.players).map(player => player.name),
      managed: this.managed
    };
  }
}