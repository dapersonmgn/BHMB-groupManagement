import * as test from "tape";
import { GroupManager } from "../../src/Groups/GroupManager";
import { MessageBot, Storage, World, MessageBotExtension } from "@bhmb/bot";
import { GroupManagement } from "../../src/GroupManagement";
import { Group } from "../../src/Groups/Group";

//Thx bib. @_@
class MockStorage extends Storage {
  storage = new Map<string, any>()
  constructor(private _prefix: string = '') {
      super()
  }

  get<T>(key: string, fallback: T): T {
      return this.storage.get(this._prefix + key) || fallback
  }
  set(key: string, value: any): void {
      this.storage.set(this._prefix + key, value)
  }
  clear(_prefix?: string | undefined): void {
      throw new Error('Not implemented')
  }
  prefix(_prefix: string): Storage {
      return this;
  }
  keys(): string[] {
      throw new Error('Not implemented')
  }
};

const createWorld = () => ({} as World);

const createBot = () : MessageBot => ({
  world: createWorld(),
  storage: new MockStorage()
}) as any;

const createExtension = () => new MessageBotExtension("test", createBot());

const createGroupManagement = () => new GroupManagement(createExtension());

const createGroupManager = () => {
  const GM = createGroupManagement();
  return new GroupManager(GM);
};

test("GroupManager - create group", t => {
  t.plan(1);
  const groupManager = createGroupManager();
  groupManager.add({
    name: "test"
  });
  t.doesNotEqual(groupManager.get("test"), undefined);
});

test("GroupManager - does not create group if group name already exists.", t => {
  t.plan(1);
  const groupManager = createGroupManager();
  groupManager.add({
    name: "test"
  });
  t.equals(groupManager.add({
    name: "test"
  }), undefined);
});

test("GroupManager - deletes group", t => {
  t.plan(3);
  const groupManager = createGroupManager();
  const group = groupManager.add({
    name: "test"
  });
  t.doesNotEqual(group, undefined);
  t.equals(groupManager.delete(group as Group), true);
  t.equals(groupManager.get("test"), undefined);
});

test("GroupManager - renames group", t => {
  t.plan(4);
  const groupManager = createGroupManager();
  const group = groupManager.add({
    name: "test"
  });
  t.equals(groupManager.rename(group as Group, "test2"), true);
  t.equals(groupManager.get("test2"), group);
  t.equals(groupManager.get("test"), undefined);
  t.equal((group as Group).name, "test2");
});

test("GroupManager - does not rename group if group is managed.", t => {
  t.plan(4);
  const groupManager = createGroupManager();
  const group = groupManager.add({
    name: "test",
    managed: true
  });
  t.equals(groupManager.rename(group as Group, "test2"), false);
  t.equals(groupManager.get("test2"), undefined);
  t.equals(groupManager.get("test"), group);
  t.equals((group as Group).name, "test");
});

test("GroupManager - does not rename group if the group name already exists", t => {
  t.plan(4);
  const groupManager = createGroupManager();
  const group = groupManager.add({
    name: "test"
  });
  const group2 = groupManager.add({
    name: "test2"
  });
  t.equals(groupManager.rename(group as Group, "test2"), false);
  t.equals(groupManager.get("test2"), group2);
  t.equals((group as Group).name, "test");
  t.equals(groupManager.get("test"), group);
});

test("GroupManager - retrieves a group", t => {
  t.plan(2);
  const groupManager = createGroupManager();
  const group = groupManager.add({
    name: "test"
  });
  t.equals(groupManager.get((group as Group).name), group);
  t.equals(groupManager.get((group as Group).id), group);
});

test("GroupManager - next ID should increment upon a group being created.", t => {
  t.plan(2);
  const groupManager = createGroupManager();
  t.equals(groupManager.nextID, 1);
  groupManager.add({
    name: "test"
  });
  t.equals(groupManager.nextID, 2);
});