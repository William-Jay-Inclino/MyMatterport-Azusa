<template>
  <div style="position: relative" data-cy="assignee-table-wrapper">
    <div
      class="button is-small is-rounded left-button"
      @click="emit('add-assignee', { action: 'showAddAssigneeModal' })"
      data-cy="show-add-edit-assignee-modal"
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
      <o-table-column field="name" :label="$t('Name')" v-slot:default="props">
        <span data-cy="assingee-table-name-column" :data-cy-id="`assingee-table-name-${props.row.name}`">
          {{ props.row.name ? props.row.name : `${props.row.last_name} ${props.row.first_name}` }}
        </span>
      </o-table-column>
      <o-table-column field="email" :label="$t('Email')" v-slot:default="props">
        <span data-cy="assingee-table-email-column" :data-cy-id="`assingee-table-email-${props.row.email}`">
          {{ props.row.email }}
        </span>
      </o-table-column>
      <o-table-column field="roles" :label="$t('Owned Roles')" v-slot:default="props">
        <div class="pill-direction-row" data-cy="assingee-table-role-column">
            <div v-if="props.row.roles.length !== 0">
              <div  v-for="role in props.row.roles" :style="{ 'background-color': role.color !== undefined ? convertToCssRgb(role.color.rgb) : 'white' }" class="pill">
                <span :class="isBgLight(convertToCssRgb(role.color.rgb)) ? 'has-text-black' : 'has-text-white'">{{ role.name }}</span>
              </div>
            </div>
        </div>
      </o-table-column>
      <template #bottom-left>
        <b>{{ $t("Total checked") }}</b
        >: {{ selectedRows.length }}
      </template>
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
        data-cy="add-role-dropdown"
      >
        <template #trigger="{ active }">
          <o-button variant="info" outlined rounded>
            <span>{{ $t("Add role to selected user") }}</span>
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
        data-cy="remove-role-dropdown"
      >
        <template #trigger="{ active }">
          <o-button variant="info" outlined rounded>
            <span>{{ $t("Remove role from selected user") }}</span>
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
        data-cy="remove-assignee-btn"
      >
        <span>{{ $t("Remove selected user") }}</span>
        <o-icon icon="account-minus-outline"></o-icon>
      </o-button>
    </div>
  </div>
  <SpaceSettingAddAssignee @on-import="updateTableData" />
</template>

<script setup lang="ts">
import SpaceSettingAddAssignee from "./SpaceSettingAddAssignee.vue";
import type { User, Role, SpaceUnitUser, FolderUser } from "@/stores/types";
import { FOLDER_TYPE } from '@/stores/types'
import { useSpaceStore } from "@/stores/space";
import { useUserStore } from "@/stores/user";
import { ref, watch, computed } from "vue";
import { convertToCssRgb, isBgLight } from "@/utils/color";

//Emits
const emit = defineEmits(["add-assignee"]);

const spaceStore = useSpaceStore();
const userStore = useUserStore()

const data = ref<Array<User>>([])
const roles = ref<Array<Role>>([]);

//@ts-ignore
const keys = Object.keys(spaceStore.treeNodes).map(k => {
    return k
  })

//Get list of available roles
roles.value = spaceStore.currentNode?.roles ? spaceStore.currentNode.roles : []
/* if (rawRoles.length !== 0 && data.value.length === 0) {
    roles.value = rawRoles.map((r:Role) => {
      if (typeof r.color === 'string' && r.color !== null) {
          //@ts-ignore
          r.color = JSON.parse(r.color)   
      }
      r.categories = []
      return r
  })
} */

const selectedRows = ref<Array<User>>([]); //Selected row of user
const selectedCurrentRole = ref<Array<Role>>([]); //Roles of selected user(s)
const currentUserRoles = ref<Array<string>>([]); //Roles of All
const filteredRoles = ref<Array<Role>>([]);

//Variable used in watcher dependecy array to trigger code to refetch selected row and current user roles
const hasAssignedRolesChange = ref(false);

//Watch for changes if the user has selected or deselected a row
watch([selectedRows, hasAssignedRolesChange], () => {
  currentUserRoles.value = [];
  selectedCurrentRole.value = [];
  selectedRows.value.map((row) => {
    return row.roles.map((r) => {
      currentUserRoles.value.push(r.uuid);
      selectedCurrentRole.value.push(r);
    });
  });

  selectedCurrentRole.value = selectedCurrentRole.value.filter((obj, index, arr) => {
    return arr.map((mapObj) => mapObj.uuid).indexOf(obj.uuid) === index;
  });
  
  filteredRoles.value = roles.value.filter((obj, index, arr) => {
    return currentUserRoles.value.indexOf(obj.uuid) === -1
  });
});

watch([spaceStore.currentNode], ()=> {
  if (spaceStore.currentNode?.type_ !== FOLDER_TYPE.SPACE) {
    data.value = getFolderUsers()
    console.log("Triggered fetch")
  }
})

const getFolderUsers = () => {
  if (spaceStore.currentNode?.users) {
    const fusers:Array<User> = spaceStore.currentNode.users.map((u) => {
      const user = {} as User
      user.uuid = u.auth_user.uuid
      user.first_name = u.auth_user.first_name
      user.last_name = u.auth_user.last_name
      user.email = u.auth_user.email
      user.folder_uuid = u.folder_users.folder_uuid
      user.mobile = u.auth_user.mobile
      user.roles = []
      return user
    })
    return fusers
  }
  return []
}

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

const removeUser = async () => {
  const newArr = data.value.filter((item: any) => {
    return !selectedRows.value.find((row) => {
      return item.uuid === row.uuid;
    });
  });
  const userIds = selectedRows.value.map(selected => {
    return selected.uuid
  })
  const userEmails = selectedRows.value.map(selected => {
    return selected.email
  })

  const newFusers = spaceStore.currentNode?.users?.filter(user => !userEmails.includes(user.auth_user.email))

  await userStore.bulkDeleteUsers(userIds)
  data.value = [];
  selectedRows.value = [];
  data.value = newArr;
  if (spaceStore.currentNode) {
    spaceStore.currentNode.users = []
    spaceStore.currentNode.users = newFusers
  }
};

const isUserEditable = (user: SpaceUnitUser) => {
 /*  if (user.folder_uuid === spaceStore.currentNode?.id) {
    return true;
  } */
  return true;
};

const updateTableData = (newUsers: Array<User>) => {
  let importedUsers: Array<User>
  let spaceUsers: Array<SpaceUnitUser>
  importedUsers = [...data.value, ...newUsers];

  if(!spaceStore.currentNode){
    console.error('spaceStore.currentNode is undefined')
    return 
  }

  userStore.bulkAddUsers(newUsers)
  spaceUsers = importedUsers.map(usr => {
      const spaceUsr = {} as SpaceUnitUser
      spaceUsr.uuid = usr.uuid
      spaceUsr.name = `${usr.last_name} ${usr.first_name}`
      spaceUsr.email = usr.email
      spaceUsr.owner = spaceStore.currentNode?.id
      spaceUsr.roles = usr.roles
      spaceUsr.password = "temp123"
      return spaceUsr
  })
  //spaceStore.inheretUsers(spaceUsers)
  data.value = importedUsers;
}
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
