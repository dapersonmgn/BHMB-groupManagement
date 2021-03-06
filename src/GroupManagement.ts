import { MessageBotExtension } from "@bhmb/bot";
import { GroupManager } from "./Groups/GroupManager";
import { PermissionManager } from "./Permissions/PermissionManager";
import { UserManager } from "./Users/UserManager";
import { UI } from "./UI";

export class GroupManagement {

  groups: GroupManager;

  users: UserManager;

  permissions: PermissionManager;

  extension: MessageBotExtension;

  ui: UI;

  constructor (ex : MessageBotExtension) {
    this.extension = ex;
    this.ui = new UI(this);
    this.permissions = new PermissionManager(this);
    this.groups = new GroupManager(this);
    this.users = new UserManager(this);
  }

  /**
   * Called when the extension is to be uninstalled.
   */
  uninstall () {
    this.permissions.uninstall();
    this.ui.uninstall();
  }

  /**
   * Save the groups and users.
   */
  save () {
    this.groups.save();
    this.users.save();
  }


}