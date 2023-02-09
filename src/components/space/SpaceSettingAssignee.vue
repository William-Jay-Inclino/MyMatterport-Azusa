<template>
  <div style="position: relative">
    <div
      class="button is-small is-rounded left-button"
      @click="emit('add-assignee', { action: 'showAddAssigneeModal' })"
    >
      <o-icon pack="mdi" icon="plus" size="small"></o-icon>
    </div>
    <o-table
      :data="data"
      :paginated="true"
      v-model:checked-rows="selectedRows"
      :pagination-simple="true"
      per-page="4"
      checkable
      checkbox-position="right"
      :is-row-checkable="(row:SpaceUnitUser) => isUserEditable(row)"
    >
      <o-table-column v-for="column in columns" v-bind="column" #default="{ row }">
        {{ row[column.field] }}
      </o-table-column>
      <o-table-column field="roles" label="Owned Roles" :width="20" v-slot:default="props">
        <div class="pill-direction-row">
          <div v-for="role in props.row.roles" :style="{ 'background-color': convertToCssRgb(role.color.rgb) }" class="pill">
            <span :class="isBgLight(convertToCssRgb(role.color.rgb)) ? 'has-text-black' : 'has-text-white'">{{ role.name }}</span>
          </div>
        </div>
      </o-table-column>
      <template #bottom-left> <b>Total checked</b>: {{ selectedRows.length }} </template>
    </o-table>
  </div>
  <br />
  <div class="columns">
    <div class="column">
      <o-dropdown
        :scrollable="true"
        :disabled="!selectedRows.length"
        position="top-left"
        max-height="140"
        aria-role="list"
      >
        <template #trigger="{ active }">
          <o-button variant="info" outlined rounded>
            <span>Add role to selected user</span>
            <o-icon icon="account-multiple-plus-outline"></o-icon>
          </o-button>
        </template>

        <o-dropdown-item
          v-for="(role, index) in filteredRoles"
          :key="index"
          :value="role.uuid"
          @click="() => addRole(role)"
          aria-role="listitem"
        >
          <div class="media">
            <div class="media-content">
              <div class="is-tiny"></div>
              <span>{{ role.name }}</span>
            </div>
          </div>
        </o-dropdown-item>
      </o-dropdown>
    </div>
    <div class="column">
      <o-dropdown
        :scrollable="true"
        :disabled="!selectedRows.length"
        position="top-left"
        max-height="140"
        aria-role="list"
      >
        <template #trigger="{ active }">
          <o-button variant="info" outlined rounded>
            <span>Remove role from selected user</span>
            <o-icon icon="account-multiple-minus-outline"></o-icon>
          </o-button>
        </template>

        <o-dropdown-item
          v-for="(role, index) in selectedCurrentRole"
          :key="index"
          :value="role.uuid"
          @click="() => removeRole(role)"
          aria-role="listitem"
        >
          <div class="media">
            <div class="media-content">
              <span>{{ role.name }}</span>
            </div>
          </div>
        </o-dropdown-item>
      </o-dropdown>
    </div>
    <div class="column">
      <o-button
        variant="info"
        rounded
        outlined
        :disabled="!selectedRows.length"
        @click="removeUser"
      >
        <span>Remove selected user</span>
        <o-icon icon="account-minus-outline"></o-icon>
      </o-button>
    </div>
  </div>
  <SpaceSettingAddAssignee @on-import="updateTableData" />
</template>

<script setup lang="ts">
import SpaceSettingAddAssignee from "./SpaceSettingAddAssignee.vue";
import type { User, Role, SpaceUnitUser } from "@/stores/types";
import { useSpaceStore } from "@/stores/space";
import { useUserStore } from "@/stores/user";
import { ref, watch, computed } from "vue";
import { convertToCssRgb, isBgLight } from "@/utils/color";


//Emits
const emit = defineEmits(["add-assignee"]);

const spaceStore = useSpaceStore()
const userStore = useUserStore()
const currentTree = ref(spaceStore.selectedTreeItem)
const data = ref<Array<SpaceUnitUser>>([])
const roles = ref<Array<Role>>([])
// @ts-ignore
data.value = spaceStore.selectedTreeItem?.users

//Get list of available roles
data.value.forEach(user => {
    user.roles
})
data.value.forEach(user => {
  user.roles.forEach(r => {
    roles.value.push(r)
  })
})

const selectedRows = ref<Array<User>>([]); //Selected row of user
const selectedCurrentRole = ref<Array<Role>>([]); //Roles of selected user(s)
const currentUserRoles = ref<Array<string>>([]); //Roles of All
const filteredRoles = ref<Array<Role>>([]);

//Variable used in watcher dependecy array to trigger code to refetch selected row and current user roles
const hasAssignedRolesChange = ref(false);

//Watch for changes if the user has selected or deselected a row
watch([selectedRows, hasAssignedRolesChange], () => {
  currentUserRoles.value = [];
  selectedCurrentRole.value = []
  selectedRows.value.map((row) => {
    return row.roles.map((r) => {
      currentUserRoles.value.push(r.uuid);
      selectedCurrentRole.value.push(r)
    })
  })

  selectedCurrentRole.value = selectedCurrentRole.value.filter((obj, index, arr) => {
        return arr.map(mapObj => mapObj.uuid).indexOf(obj.uuid) === index;
 })
  filteredRoles.value = roles.value.filter((obj, index, arr) => {
        return arr.map(mapObj => mapObj.uuid).indexOf(obj.uuid) === index;
 })
})

const addRole = (val: Role) => {
  selectedRows.value.forEach((row) => {
    row.roles = [...row.roles, val];
  });
  hasAssignedRolesChange.value = !hasAssignedRolesChange.value;
};

const removeRole = (val: Role) => {
  selectedRows.value.forEach((row) => {
    const arr = row.roles.filter((role) => {
      return role.uuid != val.uuid;
    });
    row.roles = [];
    row.roles = arr;
  });
  hasAssignedRolesChange.value = !hasAssignedRolesChange.value;
};

const removeUser = () => {
  const newArr = data.value.filter((item:any) => {
    return !selectedRows.value.find((row) => {
      return item.uuid === row.uuid;
    });
  });
  data.value = [];
  selectedRows.value = [];
  data.value = newArr;
};

const isUserEditable = (user:SpaceUnitUser) => {
  if (user.owner === spaceStore.selectedTreeItem?.uuid) {
    return true
  }
  return false
}

const updateTableData = (newUsers: Array<SpaceUnitUser>) => {
  let importedUsers:Array<SpaceUnitUser>
  importedUsers = [...data.value, ...newUsers]
  //@ts-ignore
  //spaceStore.selectedTreeItem.users = importedUsers
  spaceStore.inheretUsers(spaceStore.selectedTreeItem,importedUsers)
  data.value = importedUsers
}

//Column titles
const columns = ref([
  {
    field: "name",
    label: "First Name",
    width: '10',
  },
  {
    field: "email",
    label: "Mail Address",
    width: '10',
  },
]);
</script>

<style>
.is-info {
  color: black !important;
  border-color: black !important;
}
.left-button {
  position: absolute;
  left: 2px;
  top: 20px;
  z-index: 10;
}

.is-tiny {
  width: 10px;
  height: 10px;
  max-width: 10px;
  max-height: 10px;
  background-color: darksalmon;
  border-radius: 50%;
  display: inline-block;
  margin: 2px 6px;
}

.dark-text {
  color: black;
}
.light-text {
  color: white;
}
</style>
