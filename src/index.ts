import { MessageBot, Player } from "@bhmb/bot";
import { GroupManagement } from "./GroupManagement";
import { BlockheadPermissions } from "./Extensions/Blockheads";

export interface ExtensionPermission {
  callback: (player: Player, args: string) => void;
  id: string;
  command: string;
  display: {
    category: string;
    name: string;
  };
  ignore?: {
    admin?: boolean,
    mod?: boolean,
    staff?: boolean
  }
};

const EXTENSION_ID = "dapersonmgn/groupManagementBeta";

MessageBot.registerExtension(EXTENSION_ID, ex => {

  const GM = new GroupManagement(ex);
  for (const permission of BlockheadPermissions) {
    const {id, command, callback, ignore} = permission;
    GM.permissions.add({
      id,
      command,
      callback,
      ignore,
      extension: EXTENSION_ID,
      category: permission.display.category,
      name: permission.display.name
    });
  }

  if (!GM.groups.get("Administrator")) {
    GM.groups.add({
      name: "Administrator",
      permissions: {
        allowed: [],
        disabled: []
      },
      managed: true
    });
  }
  if (!GM.groups.get("Moderator")) {
    GM.groups.add({
      name: "Moderator",
      permissions: {
        allowed: [],
        disabled: []
      },
      managed: true
    });
  }
  if (!GM.groups.get("Anyone")) {
    GM.groups.add({
      name: "Anyone",
      permissions: {
        allowed: [],
        disabled: []
      },
      managed: true
    });
  }
  if (!GM.groups.get("Unmanaged")) {
    GM.groups.add({
      name: "Unmanaged",
      permissions: {
        allowed: [],
        disabled: []
      }
    });
  }

  ex.exports.manager = GM;

  /**
   * Listener for when an extension is registered.
   * @param extension Name of the extension.
   */
  const handleExtensionRegister = (extension : string) => {
    const extensionExports = ex.bot.getExports(extension);
    if (extensionExports && extensionExports.groupManagement) {

      const permissions : ExtensionPermission[] = extensionExports.groupManagement;
      for (const permissionData of permissions) {
        GM.permissions.add({
          extension,
          category: permissionData.display.category,
          name: permissionData.display.name,
          id: permissionData.id,
          command: permissionData.command,
          callback: permissionData.callback,
          ignore: permissionData.ignore
        });
      }

    }
  };

  /**
   * Listener for when an extension is deregistered.
   * @param extension Name of the extension.
   */
  const handleExtensionDeregister = (extension : string) => {
    const permissions = GM.permissions.getExtensionPermissions(extension);
    for (const permission of permissions) {
      permission.delete();
    }
  };

  /**
   * Loads all extensions that were loaded before this extension.
   */
  const handleExistingExtensions = () => {
    const extensions = MessageBot.extensions;
    for (const extension of extensions) {
      handleExtensionRegister(extension);
    }
  };

  ex.remove = () => {
    MessageBot.extensionRegistered.unsub(handleExtensionRegister);
    MessageBot.extensionDeregistered.unsub(handleExtensionDeregister);
    GM.ui.uninstall();
  };

  ex.uninstall = () => {
    GM.uninstall();
    MessageBot.extensionRegistered.unsub(handleExtensionRegister);
    MessageBot.extensionDeregistered.unsub(handleExtensionDeregister);
  };

  MessageBot.extensionRegistered.sub(handleExtensionRegister);
  MessageBot.extensionDeregistered.sub(handleExtensionDeregister);
  handleExistingExtensions();
});